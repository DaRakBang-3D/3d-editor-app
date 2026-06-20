import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export interface ValidationResult {
  valid: boolean
  error?: string
}

const MAX_FILE_SIZE = 52_428_800   // 50MB
const MAX_POLYGON_COUNT = 500_000  // 50만 삼각형
const GLB_MAGIC = 0x676c5446      // "glTF" in ASCII

export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `파일 크기는 50MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)` }
  }
  return { valid: true }
}

export function validateMimeType(file: File): ValidationResult {
  const allowed = ["model/gltf-binary", "application/octet-stream"]
  if (!allowed.includes(file.type) && !file.name.endsWith(".glb")) {
    return { valid: false, error: "GLB 파일만 업로드할 수 있습니다." }
  }
  return { valid: true }
}

export async function validateGlbMagicBytes(file: File): Promise<ValidationResult> {
  const buffer = await file.slice(0, 4).arrayBuffer()
  const view = new DataView(buffer)
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    return { valid: false, error: "유효하지 않은 GLB 파일입니다." }
  }
  return { valid: true }
}

export async function validatePolygonCount(file: File): Promise<ValidationResult> {
  const buffer = await file.arrayBuffer()
  const loader = new GLTFLoader()

  return new Promise(resolve => {
    loader.parse(
      buffer,
      "",
      gltf => {
        let triangleCount = 0
        gltf.scene.traverse(node => {
          if ((node as THREE.Mesh).isMesh) {
            const geo = (node as THREE.Mesh).geometry
            if (geo.index) {
              triangleCount += geo.index.count / 3
            } else {
              triangleCount += geo.attributes.position.count / 3
            }
          }
        })

        if (triangleCount > MAX_POLYGON_COUNT) {
          resolve({
            valid: false,
            error: `폴리곤 수가 너무 많습니다. (현재: ${triangleCount.toLocaleString()}개, 최대: ${MAX_POLYGON_COUNT.toLocaleString()}개)`,
          })
        } else {
          resolve({ valid: true })
        }
      },
      error => {
        resolve({ valid: false, error: `파일 파싱 실패: ${error.message}` })
      },
    )
  })
}

export async function validateModelFile(file: File): Promise<ValidationResult> {
  const checks = [
    validateFileSize(file),
    validateMimeType(file),
    await validateGlbMagicBytes(file),
    await validatePolygonCount(file),
  ]

  const failed = checks.find(r => !r.valid)
  return failed ?? { valid: true }
}
