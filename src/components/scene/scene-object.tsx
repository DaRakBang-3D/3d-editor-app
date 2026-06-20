"use client"
import { useObjectById } from "@/modules/objects/store/use-object-by-id"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import { useUIStore } from "@/modules/editor/store/use-ui-store"
import { ThreeEvent } from "@react-three/fiber"
import React from "react"
import { Box, Sphere, Cylinder } from "../objects/3d"

interface SceneObjectProps {
  objectId: string
  isSelected: boolean
}

export const SceneObject = ({ objectId, isSelected }: SceneObjectProps): React.ReactNode => {
  const objectInfo = useObjectById(objectId)
  const selectObject = useObjectStore(state => state.selectObject)
  const hoveredObjectId = useObjectStore(state => state.hoveredObjectId)
  const setHoveredObjectId = useObjectStore(state => state.setHoveredObjectId)
  const setDragging = useObjectStore(state => state.setDragging)
  const collidingObjectIds = useObjectStore(state => state.collidingObjectIds)
  const setActivePanel = useUIStore(state => state.setActivePanel)

  if (!objectInfo) {
    return null
  }

  const isHovered = hoveredObjectId === objectId
  const isColliding = collidingObjectIds.includes(objectId)

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    selectObject(objectInfo.id)
    setActivePanel("properties")
    setDragging(objectInfo.id, { ...objectInfo.position })
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHoveredObjectId(objectId)
  }

  const handlePointerOut = () => {
    setHoveredObjectId(null)
  }

  const sharedProps = {
    isSelected,
    isHovered,
    isColliding,
    onPointerDown: handlePointerDown,
    onClick: handleClick,
    onPointerOver: handlePointerOver,
    onPointerOut: handlePointerOut,
  }

  switch (objectInfo.type) {
  case "box":
    return <Box {...sharedProps} objectInfo={objectInfo} />
  case "sphere":
    return <Sphere {...sharedProps} objectInfo={objectInfo} />
  case "cylinder":
    return <Cylinder {...sharedProps} objectInfo={objectInfo} />
  case "imported":
    // TODO: ImportedObject 렌더 컴포넌트 (Step 6에서 구현)
    return null
  default:
    return null
  }
}
