import { MaterialPreset } from "@/shared/types"

interface MaterialParams {
  roughness: number
  metalness: number
  envMapIntensity: number
  label: string
}

export const MATERIAL_PRESETS: Record<MaterialPreset, MaterialParams> = {
  matte:    { roughness: 0.9, metalness: 0.0, envMapIntensity: 0.2, label: "무광" },
  glossy:   { roughness: 0.1, metalness: 0.0, envMapIntensity: 0.8, label: "유광" },
  wood:     { roughness: 0.8, metalness: 0.0, envMapIntensity: 0.3, label: "목재" },
  fabric:   { roughness: 1.0, metalness: 0.0, envMapIntensity: 0.1, label: "패브릭" },
  metal:    { roughness: 0.3, metalness: 0.9, envMapIntensity: 1.0, label: "금속" },
  concrete: { roughness: 0.95, metalness: 0.0, envMapIntensity: 0.1, label: "콘크리트" },
}

export function getMaterialParams(preset: MaterialPreset): MaterialParams {
  return MATERIAL_PRESETS[preset]
}
