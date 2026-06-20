"use client"

import { useState } from "react"
import { MaterialPreset, PlacementType } from "@/shared/types"
import { validateModelFile } from "../domain/validate-model-file"
import { uploadModelFile } from "../infrastructure/upload-model"
import { saveImportedObject } from "../infrastructure/save-imported-object"

export type ImportStatus = "idle" | "validating" | "uploading" | "saving" | "done" | "error"

export interface UseImportModelResult {
  status: ImportStatus
  error: string | null
  importModel: (params: {
    file: File
    name: string
    placementType: PlacementType
    materialPreset: MaterialPreset
    color: string
  }) => Promise<{ objectId: number; fileUrl: string } | null>
}

export function useImportModel(): UseImportModelResult {
  const [status, setStatus] = useState<ImportStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const importModel = async ({
    file,
    name,
    placementType,
    materialPreset,
    color,
  }: {
    file: File
    name: string
    placementType: PlacementType
    materialPreset: MaterialPreset
    color: string
  }) => {
    setError(null)

    try {
      setStatus("validating")
      const validation = await validateModelFile(file)
      if (!validation.valid) {
        setError(validation.error ?? "검증 실패")
        setStatus("error")
        return null
      }

      setStatus("uploading")
      const fileUrl = await uploadModelFile(file)

      setStatus("saving")
      const objectId = await saveImportedObject({
        name,
        originalFileName: file.name,
        fileUrl,
        placementType,
        materialPreset,
        color,
      })

      setStatus("done")
      return { objectId, fileUrl }
    } catch (e) {
      const message = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다."
      setError(message)
      setStatus("error")
      return null
    }
  }

  return { status, error, importModel }
}
