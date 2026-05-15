"use client"

import { GROUND_Y, THICKNESS } from "@/components/objects/3d/room-walls"
import { getFootprintSize } from "@/modules/objects/utils/aabb"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import * as THREE from "three"

// drag-plane.tsx와 동기화
const ROOM_HW = 5
const ROOM_HD = 5
const INNER_X = ROOM_HW - THICKNESS / 2
const INNER_Z = ROOM_HD - THICKNESS / 2
const WALL_EPSILON = 0.3

type WallFace = "north" | "south" | "east" | "west"

/** 오브젝트 위치로부터 현재 붙어있는 벽면을 감지합니다 */
function detectWallFromPosition(pos: { x: number; y: number; z: number }): WallFace | null {
  if (Math.abs(pos.z + INNER_Z) < WALL_EPSILON) return "north"
  if (Math.abs(pos.z - INNER_Z) < WALL_EPSILON) return "south"
  if (Math.abs(pos.x - INNER_X) < WALL_EPSILON) return "east"
  if (Math.abs(pos.x + INNER_X) < WALL_EPSILON) return "west"
  return null
}

/**
 * FootprintProjection 컴포넌트
 *
 * 드래그 중인 오브젝트의 풋프린트(점유 면적)를 바닥 또는 벽면에 투영합니다.
 * - 충돌 없음 → 초록(#00ff88), 충돌 있음 → 빨간(#ff3333)
 * - floor 타입: XZ 바닥면에 수평 투영
 * - wall 타입: 흡착된 벽면에 수직 투영
 */
export const FootprintProjection = () => {
  const draggingObjectId = useObjectStore(s => s.draggingObjectId)
  const obj = useObjectStore(s => (draggingObjectId ? s.objects[draggingObjectId] : null))
  const isColliding = useObjectStore(s =>
    draggingObjectId ? s.collidingObjectIds.includes(draggingObjectId) : false,
  )

  if (!draggingObjectId || !obj) return null

  const color = isColliding ? "#ff3333" : "#00ff88"
  const { width, depth, height } = getFootprintSize(obj)
  const isWallCapable = obj.placementType === "wall" || obj.placementType === "both"

  // 벽면 투영 (3-B-4)
  if (isWallCapable) {
    const wall = detectWallFromPosition(obj.position)
    if (wall) {
      const p = obj.position
      let pos: [number, number, number]
      let rot: [number, number, number]
      let size: [number, number]

      switch (wall) {
      case "north":
        pos = [p.x, p.y, -INNER_Z + 0.01]
        rot = [0, 0, 0]
        size = [width, height]
        break
      case "south":
        pos = [p.x, p.y, INNER_Z - 0.01]
        rot = [0, Math.PI, 0]
        size = [width, height]
        break
      case "east":
        pos = [INNER_X - 0.01, p.y, p.z]
        rot = [0, -Math.PI / 2, 0]
        size = [depth, height]
        break
      case "west":
        pos = [-INNER_X + 0.01, p.y, p.z]
        rot = [0, Math.PI / 2, 0]
        size = [depth, height]
        break
      }

      return (
        <mesh position={pos} rotation={rot}>
          <planeGeometry args={size} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )
    }
  }

  // 바닥 풋프린트 투영 (3-B-2, 3-B-3)
  const floorY = GROUND_Y + THICKNESS / 2 + 0.01
  return (
    <mesh
      position={[obj.position.x, floorY, obj.position.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
