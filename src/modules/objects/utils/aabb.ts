import { Object3DInfo } from "@/shared/types"

interface AABB {
  min: { x: number; y: number; z: number }
  max: { x: number; y: number; z: number }
}

/** 오브젝트의 바닥 풋프린트 크기 (XZ 평면 기준) 를 반환합니다 */
export function getFootprintSize(obj: Object3DInfo): { width: number; depth: number; height: number } {
  return {
    width: obj.scale.x,
    depth: obj.scale.z,
    height: obj.scale.y,
  }
}

/** 오브젝트의 월드 공간 AABB를 계산합니다 (회전 무시, 보수적 근사) */
function getAABB(obj: Object3DInfo): AABB {
  const { position: p, scale: s } = obj
  return {
    min: { x: p.x - s.x / 2, y: p.y - s.y / 2, z: p.z - s.z / 2 },
    max: { x: p.x + s.x / 2, y: p.y + s.y / 2, z: p.z + s.z / 2 },
  }
}

function aabbOverlap(a: AABB, b: AABB): boolean {
  return (
    a.min.x < b.max.x &&
    a.max.x > b.min.x &&
    a.min.y < b.max.y &&
    a.max.y > b.min.y &&
    a.min.z < b.max.z &&
    a.max.z > b.min.z
  )
}

/**
 * draggingId 오브젝트와 충돌 중인 모든 오브젝트 ID를 반환합니다.
 * 반환값에는 draggingId 자신도 포함됩니다 (시각 피드백용).
 */
export function getCollidingIds(
  draggingId: string,
  objects: Record<string, Object3DInfo>,
): string[] {
  const dragging = objects[draggingId]
  if (!dragging) return []

  const draggingAABB = getAABB(dragging)
  const result: string[] = []

  for (const [id, obj] of Object.entries(objects)) {
    if (id === draggingId) continue
    if (aabbOverlap(draggingAABB, getAABB(obj))) {
      result.push(id)
    }
  }

  if (result.length > 0) {
    result.push(draggingId)
  }

  return result
}
