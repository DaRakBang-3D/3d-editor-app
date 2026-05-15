"use client"

import { useObjectStore } from "@/modules/objects/store/use-object-store"

/**
 * DragHintOverlay 컴포넌트
 *
 * 오브젝트 드래그 중에만 Canvas 위에 표시되는 키 힌트 오버레이입니다.
 * - R키: 90° 스냅 회전
 * - 스크롤: 15° 미세 조정 회전
 */
export const DragHintOverlay = () => {
  const draggingObjectId = useObjectStore(s => s.draggingObjectId)

  if (!draggingObjectId) return null

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-10">
      <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border shadow-sm text-xs font-medium flex items-center gap-3 whitespace-nowrap">
        <span>
          <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-xs">R</kbd>
          {" "}90° 회전
        </span>
        <span className="text-muted-foreground">|</span>
        <span>스크롤 미세 조정</span>
      </div>
    </div>
  )
}
