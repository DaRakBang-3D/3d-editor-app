"use client"

import { GROUND_Y, THICKNESS } from "@/components/objects/3d/room-walls"
import { commandManager } from "@/managers/command-manager"
import { UpdateTransformCommand } from "@/managers/commands/update-transform-command"
import { getCollidingIds } from "@/modules/objects/utils/aabb"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import { ThreeEvent } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

const ROTATION_SNAP = Math.PI / 2   // R키: 90° 스냅
const ROTATION_FINE = Math.PI / 12  // 스크롤: 15° 미세 조정

// 그리드 스냅
const GRID_SIZE = 0.5
const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE

// 방 크기 (RoomWalls 기본값과 동기화)
const ROOM_HW = 5         // half-width  (width=10)
const ROOM_HD = 5         // half-depth  (depth=10)
const ROOM_HEIGHT = 4     // 벽 높이
const WALL_SNAP_DIST = 0.8

// 벽 내면까지의 거리 (중앙 기준)
const INNER_X = ROOM_HW - THICKNESS / 2
const INNER_Z = ROOM_HD - THICKNESS / 2

type WallFace = "north" | "south" | "east" | "west"

/**
 * 벽면별 수직 드래그 평면의 위치·회전 설정
 * - north/south: PlaneGeometry 기본(XY 평면, +Z 방향) 그대로, Z 위치만 이동
 * - east/west  : Ry(PI/2)로 YZ 평면으로 변환, X 위치 이동
 */
const WALL_PLANE_CONFIG: Record<WallFace, {
  position: [number, number, number]
  rotation: [number, number, number]
}> = {
  north: { position: [0, ROOM_HEIGHT / 2, -INNER_Z], rotation: [0, 0, 0] },
  south: { position: [0, ROOM_HEIGHT / 2,  INNER_Z], rotation: [0, 0, 0] },
  east:  { position: [ INNER_X, ROOM_HEIGHT / 2, 0], rotation: [0, Math.PI / 2, 0] },
  west:  { position: [-INNER_X, ROOM_HEIGHT / 2, 0], rotation: [0, Math.PI / 2, 0] },
}

/**
 * 벽면 부착 시 오브젝트 자동 회전 Y값 (방 안쪽을 바라보도록)
 * Ry(θ) 적용 시 기본 -Z 방향이 아래 방향으로 회전됨:
 *  - north(z=-5): 방 안쪽 = +Z → rotation.y = PI
 *  - south(z=+5): 방 안쪽 = -Z → rotation.y = 0
 *  - east (x=+5): 방 안쪽 = -X → rotation.y = PI/2
 *  - west (x=-5): 방 안쪽 = +X → rotation.y = -PI/2
 */
const WALL_ROTATION_Y: Record<WallFace, number> = {
  north:  Math.PI,
  south:  0,
  east:   Math.PI / 2,
  west:  -Math.PI / 2,
}

/**
 * 현재 위치(x, z)와 오브젝트의 절반 크기(halfW, halfD)를 기준으로 가장 가까운 벽을 감지
 */
function detectNearestWall(x: number, z: number, halfW: number, halfD: number): WallFace | null {
  const dists: [WallFace, number][] = [
    ["east",  INNER_X - (x + halfW)],
    ["west",  (x - halfW) - (-INNER_X)],
    ["south", INNER_Z - (z + halfD)],
    ["north", (z - halfD) - (-INNER_Z)],
  ]
  const nearest = dists.reduce((a, b) => (a[1] < b[1] ? a : b))
  return nearest[1] <= WALL_SNAP_DIST ? nearest[0] : null
}

/**
 * 바닥 모드 벽면 흡착: 오브젝트 중심이 벽 내면에 딱 맞도록 X/Z를 보정합니다.
 */
function applyWallSnap(x: number, z: number, halfW: number, halfD: number) {
  const inner = THICKNESS / 2
  let rx = x
  let rz = z
  if (x + halfW > ROOM_HW - inner - WALL_SNAP_DIST)  rx = ROOM_HW - inner - halfW
  if (x - halfW < -ROOM_HW + inner + WALL_SNAP_DIST) rx = -ROOM_HW + inner + halfW
  if (z + halfD > ROOM_HD - inner - WALL_SNAP_DIST)  rz = ROOM_HD - inner - halfD
  if (z - halfD < -ROOM_HD + inner + WALL_SNAP_DIST) rz = -ROOM_HD + inner + halfD
  return { x: rx, z: rz }
}

/**
 * 벽면 드래그 시 오브젝트 최종 위치 계산
 * - north/south: e.point.x = 가로 위치, e.point.y = 높이, Z는 벽면에 고정
 * - east/west  : e.point.z = 깊이 위치, e.point.y = 높이, X는 벽면에 고정
 */
function computeWallPosition(
  face: WallFace,
  point: THREE.Vector3,
  scale: { x: number; y: number; z: number },
) {
  const halfH = scale.y / 2
  const minY = GROUND_Y + THICKNESS / 2 + halfH  // 벽 메시 바닥 내면 기준
  const maxY = GROUND_Y + ROOM_HEIGHT - halfH     // 벽 메시 상단 기준
  const clampedY = Math.max(minY, Math.min(maxY, snap(point.y)))

  switch (face) {
  case "north": return { x: snap(point.x), y: clampedY, z: -INNER_Z + scale.z / 2 }
  case "south": return { x: snap(point.x), y: clampedY, z:  INNER_Z - scale.z / 2 }
  case "east":  return { x:  INNER_X - scale.z / 2, y: clampedY, z: snap(point.z) }
  case "west":  return { x: -INNER_X + scale.z / 2, y: clampedY, z: snap(point.z) }
  }
}

/**
 * DragPlane 컴포넌트
 *
 * placementType에 따라 두 가지 드래그 평면을 동적으로 전환합니다.
 *
 * [바닥 모드 - "floor" / 초기 상태]
 *   - 수평 XZ 평면 메시
 *   - 파이프라인: 그리드 스냅 → 벽면 흡착(floor 전용) → AABB 충돌 감지
 *   - "wall" / "both" 오브젝트는 WALL_SNAP_DIST 이내 접근 시 벽면 모드로 전환
 *
 * [벽면 모드 - "wall" / "both" + activeWall 설정]
 *   - 해당 벽면에 수직인 수직 평면 메시
 *   - 파이프라인: 그리드 스냅 + Y 클램프 → 벽면 고정 위치 계산 → 자동 Y 회전 → AABB 충돌 감지
 *   - 한 번 벽면 모드 진입 후 pointerUp까지 유지 (재드래그 시 재감지)
 *
 * [Undo/Redo]
 *   - pointerUp 시 위치·회전 변경 여부에 따라 UpdateTransformCommand 등록
 */
export const DragPlane = () => {
  // ── Store 구독 ──────────────────────────────────────────────
  const draggingObjectId = useObjectStore(s => s.draggingObjectId)
  const dragStartPosition = useObjectStore(s => s.dragStartPosition)
  const updateObjectTransform = useObjectStore(s => s.updateObjectTransform)
  const setDragging = useObjectStore(s => s.setDragging)
  const setCollidingObjectIds = useObjectStore(s => s.setCollidingObjectIds)

  // ── 드래그 세션 로컬 상태 ───────────────────────────────────
  const [activeWall, setActiveWall] = useState<WallFace | null>(null)
  // 드래그 시작 시점의 회전값 (벽면 자동 회전 전 → Undo용)
  const dragStartRotationRef = useRef<{ x: number; y: number; z: number } | null>(null)

  // 드래그 시작/종료 시 초기 회전 캡처 및 상태 정리
  useEffect(() => {
    if (draggingObjectId) {
      const obj = useObjectStore.getState().objects[draggingObjectId]
      if (obj) dragStartRotationRef.current = { ...obj.rotation }
    } else {
      dragStartRotationRef.current = null
    }
  }, [draggingObjectId])

  // 3-B-7: R키(90° 스냅) / 스크롤(15° 미세) 회전 이벤트 — 드래그 중에만 활성화
  useEffect(() => {
    if (!draggingObjectId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "r") return
      const store = useObjectStore.getState()
      const obj = store.objects[draggingObjectId]
      if (!obj) return
      const newRotY = obj.rotation.y + ROTATION_SNAP
      store.setDragRotationY(store.dragRotationY + ROTATION_SNAP)
      store.updateObjectTransform(draggingObjectId, {
        rotation: { ...obj.rotation, y: newRotY },
      })
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const store = useObjectStore.getState()
      const obj = store.objects[draggingObjectId]
      if (!obj) return
      const delta = e.deltaY > 0 ? ROTATION_FINE : -ROTATION_FINE
      store.setDragRotationY(store.dragRotationY + delta)
      store.updateObjectTransform(draggingObjectId, {
        rotation: { ...obj.rotation, y: obj.rotation.y + delta },
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("wheel", handleWheel)
    }
  }, [draggingObjectId])

  // 모든 hook 호출 이후에 early return
  if (!draggingObjectId) return null

  const obj = useObjectStore.getState().objects[draggingObjectId]
  if (!obj) return null

  const isWallCapable = obj.placementType === "wall" || obj.placementType === "both"

  // ── 바닥 드래그 핸들러 ──────────────────────────────────────
  const handleFloorPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()

    const store = useObjectStore.getState()
    const current = store.objects[draggingObjectId]
    if (!current) return

    let newX = snap(e.point.x)
    let newZ = snap(e.point.z)

    // wall / both: 가장 가까운 벽 감지 → 벽면 모드 전환
    if (isWallCapable) {
      const nearWall = detectNearestWall(newX, newZ, current.scale.x / 2, current.scale.z / 2)
      if (nearWall) {
        setActiveWall(nearWall)
        return // 다음 프레임부터 wall 핸들러가 처리
      }
    }

    // floor / both(벽 미감지): 바닥 벽면 흡착 적용
    if (current.placementType !== "wall") {
      const snapped = applyWallSnap(newX, newZ, current.scale.x / 2, current.scale.z / 2)
      newX = snapped.x
      newZ = snapped.z
    }

    const baseY = GROUND_Y + THICKNESS / 2
    const newPos = { x: newX, y: baseY + current.scale.y / 2, z: newZ }
    updateObjectTransform(draggingObjectId, { position: newPos })

    const updated = { ...store.objects, [draggingObjectId]: { ...current, position: newPos } }
    setCollidingObjectIds(getCollidingIds(draggingObjectId, updated))
  }

  // ── 벽면 드래그 핸들러 ──────────────────────────────────────
  const handleWallPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!activeWall) return

    const store = useObjectStore.getState()
    const current = store.objects[draggingObjectId]
    if (!current) return

    const newPos = computeWallPosition(activeWall, e.point, current.scale)

    // Check if moving to another wall
    // when calculating against the adjacent wall, rotation effectively swaps dimensions, but here we can just use the object's base scale loosely, or use scale.z/scale.x appropriately.
    // To be precise, since it's already rotated on the current wall, its bounds depend on activeWall.
    // Actually, detectNearestWall accepts halfW and halfD which are unrotated scales.
    let effHalfW = current.scale.x / 2
    let effHalfD = current.scale.z / 2
    if (activeWall === "east" || activeWall === "west") {
      effHalfW = current.scale.z / 2
      effHalfD = current.scale.x / 2
    }
    const nearWall = detectNearestWall(newPos.x, newPos.z, effHalfW, effHalfD)
    if (nearWall && nearWall !== activeWall) {
      setActiveWall(nearWall)
      return
    }

    const newRot = { ...current.rotation, y: WALL_ROTATION_Y[activeWall] }

    updateObjectTransform(draggingObjectId, { position: newPos, rotation: newRot })

    const updated = { ...store.objects, [draggingObjectId]: { ...current, position: newPos, rotation: newRot } }
    setCollidingObjectIds(getCollidingIds(draggingObjectId, updated))
  }

  // ── 드래그 종료 핸들러 ──────────────────────────────────────
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (!dragStartPosition) return

    const finalObj = useObjectStore.getState().objects[draggingObjectId]
    if (!finalObj) return

    const finalPos = { ...finalObj.position }
    const posChanged =
      finalPos.x !== dragStartPosition.x ||
      finalPos.y !== dragStartPosition.y ||
      finalPos.z !== dragStartPosition.z

    if (posChanged) {
      commandManager.execute(
        new UpdateTransformCommand(draggingObjectId, "position", dragStartPosition, finalPos),
      )
    }

    // 벽면 자동 회전이 적용된 경우 rotation도 커맨드로 등록 (Undo 지원)
    const startRot = dragStartRotationRef.current
    if (startRot) {
      const finalRot = { ...finalObj.rotation }
      const rotChanged =
        finalRot.x !== startRot.x ||
        finalRot.y !== startRot.y ||
        finalRot.z !== startRot.z
      if (rotChanged) {
        commandManager.execute(
          new UpdateTransformCommand(draggingObjectId, "rotation", startRot, finalRot),
        )
      }
    }

    setCollidingObjectIds([])
    setActiveWall(null)
    setDragging(null, null)
  }

  // ── 렌더링 ──────────────────────────────────────────────────

  // 벽면 모드: 해당 벽에 수직인 대형 수직 평면
  if (isWallCapable && activeWall) {
    const config = WALL_PLANE_CONFIG[activeWall]
    return (
      <mesh
        position={config.position}
        rotation={config.rotation}
        onPointerMove={handleWallPointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    )
  }

  // 바닥 모드: 수평 XZ 평면 (기존 동작)
  const baseY = GROUND_Y + THICKNESS / 2
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, baseY + 0.001, 0]}
      onPointerMove={handleFloorPointerMove}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}
