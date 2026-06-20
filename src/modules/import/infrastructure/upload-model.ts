"use server"

import { createClient } from "@/shared/lib/supabase"

const BUCKET = "model-files"

async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

export async function uploadModelFile(file: File): Promise<string> {
  const hash = await computeFileHash(file)
  const path = `${hash}.glb`

  const supabase = await createClient()

  const { data: existing } = await supabase.storage.from(BUCKET).list("", {
    search: path,
  })

  if (existing && existing.length > 0) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: "model/gltf-binary",
    upsert: false,
  })

  if (error) throw new Error(`파일 업로드 실패: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
