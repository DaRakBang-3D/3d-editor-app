// 오브젝트 배치 가능 표면 타입
// - "floor" : 바닥에만 배치 가능 (기본값)
// - "wall"  : 벽면에만 배치 가능 (수직 드래그 평면 활성화, 자동 회전)
// - "both"  : 바닥/벽면 모두 가능 (위치 기반 자동 전환)
type PlacementType = "floor" | "wall" | "both"

// 3D 객체에 대한 정보를 담는 핵심 인터페이스입니다.
// position, rotation, scale을 클래스 인스턴스가 아닌 순수 객체({x,y,z}) 형태로 정의하여,
// 상태를 직렬화(serialize)하기 쉽고, 상태 관리 로직을 Three.js와 같은 특정 라이브러리로부터 분리합니다.
interface Object3DInfo {
  id: string
  name: string
  type: "box" | "sphere" | "cylinder"
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  visible: boolean
  color: string
  material?: string
  placementType: PlacementType
}

type MaterialPreset = "matte" | "glossy" | "wood" | "fabric" | "metal" | "concrete"

interface ImportedObject3DInfo extends Omit<Object3DInfo, "type"> {
  type: "imported"
  modelUrl: string
  originalFileName: string
  materialPreset: MaterialPreset
}

type SceneObject = Object3DInfo | ImportedObject3DInfo

export type { Object3DInfo, ImportedObject3DInfo, SceneObject, PlacementType, MaterialPreset }
