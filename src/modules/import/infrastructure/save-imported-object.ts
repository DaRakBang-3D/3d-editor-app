"use server"

import { createClient } from "@/shared/lib/supabase"
import { MaterialPreset, PlacementType } from "@/shared/types"

export interface SaveImportedObjectParams {
  name: string
  originalFileName: string
  fileUrl: string
  placementType: PlacementType
  materialPreset: MaterialPreset
  color: string
}

export async function saveImportedObject(params: SaveImportedObjectParams): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("objects")
    .insert({
      name: params.name,
      type: "imported",
      category: params.placementType,
      file_url: params.fileUrl,
      data: {
        originalFileName: params.originalFileName,
        materialPreset: params.materialPreset,
        color: params.color,
      },
      status: "pending",
    })
    .select("id")
    .single()

  if (error) throw new Error(`오브젝트 저장 실패: ${error.message}`)

  return data.id
}
