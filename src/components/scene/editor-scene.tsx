"use client"

import { commandManager } from "@/managers/command-manager"
import { PasteObjectCommand } from "@/managers/commands/paste-object-command"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei"
import { EffectComposer, SSAO, Vignette } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import { Canvas } from "@react-three/fiber"
import React, { useEffect, useRef } from "react"
import { RoomWalls } from "../objects/3d"
import { DragHintOverlay } from "../ui/drag-hint-overlay"
import { DragPlane } from "./drag-plane"
import { FootprintProjection } from "./footprint-projection"
import { SceneObject } from "./scene-object"

/**
 * EditorScene 컴포넌트
 * - 3D 에디터의 메인 캔버스 영역을 담당합니다.
 * - 오브젝트 선택, 호버 하이라이트(drei Outlines), 그리드 시스템을 포함합니다.
 */
export const EditorScene = () => {
  const objectIds = useObjectStore(state => state.objectIds)
  const selectedObjectId = useObjectStore(state => state.selectedObjectId)
  const draggingObjectId = useObjectStore(state => state.draggingObjectId)
  const selectObject = useObjectStore(state => state.selectObject)

  // 드래그 vs 클릭 구분: 마우스 이동 거리로 판단
  const pointerStart = useRef({ x: 0, y: 0 })
  const wasDragging = useRef(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY }
    wasDragging.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 0) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    if (Math.sqrt(dx * dx + dy * dy) > 3) {
      wasDragging.current = true
    }
  }

  const handleDeselect = () => {
    if (!wasDragging.current) {
      selectObject(null)
    }
  }

  // Ctrl+C / Ctrl+V 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey

      if (isMod && e.key === "c") {
        const { selectedObjectId: id, copyToClipboard } = useObjectStore.getState()
        if (id) copyToClipboard(id)
      }

      if (isMod && e.key === "v") {
        const { clipboardObject } = useObjectStore.getState()
        if (clipboardObject) {
          commandManager.execute(new PasteObjectCommand(clipboardObject))
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div
      className="w-full h-full relative overflow-hidden bg-muted/5"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <Canvas
        shadows
        camera={{
          position: [8, 8, 8],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        onPointerMissed={handleDeselect}
      >
        {/* 조명 */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />

        {/* 그리드 및 방 구조 (바닥 포함) */}
        {/* <Grid
          args={[20, 20]}
          position={[0, -0.01, 0]}
          cellColor="#666666"
          sectionColor="#888888"
          fadeDistance={30}
        /> */}
        <RoomWalls />

        {/* 실시간 ContactShadows: 바닥면 기준 */}
        <ContactShadows
          position={[0, -0.42, 0]}
          opacity={0.4}
          scale={12}
          blur={1.5}
          far={4}
        />

        {/* 3D 오브젝트 렌더링 */}
        {objectIds.map(id => (
          <SceneObject
            key={id}
            objectId={id}
            isSelected={selectedObjectId === id}
          />
        ))}

        {/* 드래그 풋프린트 투영: 드래그 중에만 활성화 */}
        <FootprintProjection />

        {/* 드래그 평면: 드래그 중에만 활성화 */}
        <DragPlane />

        {/* 카메라 조작: 오브젝트 드래그 중에는 비활성화 */}
        <OrbitControls
          makeDefault
          enabled={!draggingObjectId}
          minDistance={2}
          maxDistance={100}
          maxPolarAngle={Math.PI / 2.1}
        />

        {/* 환경맵: envMapIntensity 재질 프리셋에 반응하도록 */}
        <Environment preset="apartment" />

        {/* Post-processing */}
        <EffectComposer>
          <SSAO
            blendFunction={BlendFunction.MULTIPLY}
            samples={16}
            radius={0.05}
            intensity={10}
          />
          <Vignette
            offset={0.4}
            darkness={0.4}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>

        {/* 배경 */}
        <fog attach="fog" args={["#f0f0f0", 20, 100]} />
        <color attach="background" args={["#f0f0f0"]} />
      </Canvas>

      {/* 드래그 중 키 힌트 오버레이 */}
      <DragHintOverlay />

      {/* 선택된 오브젝트 표시 */}
      {selectedObjectId && (
        <div className="absolute bottom-6 left-6 pointer-events-none">
          <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border shadow-sm text-xs font-medium">
            객체 선택됨: <span className="text-orange-500 font-bold">{selectedObjectId}</span>
          </div>
        </div>
      )}
    </div>
  )
}
