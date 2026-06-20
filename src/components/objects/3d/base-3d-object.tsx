"use client"
import { Outlines } from "@react-three/drei"
import { pointToArray } from "@/modules/objects/utils/transform-convert"
import { Object3DInfo } from "@/shared/types"
import React from "react"
import * as THREE from "three"

interface BaseObjectProps extends React.ComponentProps<"group"> {
  objectInfo: Object3DInfo
  isSelected: boolean
  isHovered?: boolean
  isColliding?: boolean
  children: React.ReactNode // geometry만 받음
}

const SELECTED_COLOR = new THREE.Color(2.5, 0.5, 0)   // 형광 주황
const COLLISION_COLOR = new THREE.Color(3.0, 0.0, 0.0) // 충돌 경고 빨강

export const BaseObject = React.forwardRef<THREE.Group, BaseObjectProps>(
  ({ objectInfo, isSelected, isHovered = false, isColliding = false, children, ...props }, ref) => {
    const { position, rotation, scale } = objectInfo

    return (
      <group
        ref={ref}
        position={pointToArray(position)}
        rotation={pointToArray(rotation)}
        scale={pointToArray(scale)}
        {...props}
      >
        <mesh castShadow receiveShadow>
          {children}
          <meshStandardMaterial
            color={objectInfo.color || "#ffffff"}
            roughness={0.75}
            metalness={0.05}
            envMapIntensity={0.4}
          />
          {isColliding && <Outlines thickness={5} color={COLLISION_COLOR} />}
          {!isColliding && isSelected && <Outlines thickness={4} color={SELECTED_COLOR} />}
          {!isColliding && !isSelected && isHovered && <Outlines thickness={2} color="#aaaaaa" />}
        </mesh>
      </group>
    )
  },
)

BaseObject.displayName = "BaseObject"
