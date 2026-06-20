"use client"

import { Badge, Button, ScrollArea, Skeleton } from "@/shared/ui"
import { Box, CheckCircle, Clock, Upload, XCircle } from "lucide-react"

type ObjectStatus = "pending" | "approved" | "rejected"

interface LibraryItem {
  id: number
  name: string
  status: ObjectStatus
  category: string
}

const STATUS_CONFIG: Record<ObjectStatus, { label: string; icon: React.ReactNode; variant: "secondary" | "default" | "destructive" }> = {
  pending:  { label: "검토 중",  icon: <Clock className="w-3 h-3" />,       variant: "secondary" },
  approved: { label: "승인됨",   icon: <CheckCircle className="w-3 h-3" />, variant: "default" },
  rejected: { label: "반려됨",   icon: <XCircle className="w-3 h-3" />,     variant: "destructive" },
}

interface LibraryPanelProps {
  onImportClick: () => void
}

// TODO: 실제 데이터는 기능 구현 단계에서 연결
const MOCK_ITEMS: LibraryItem[] = []

export function LibraryPanel({ onImportClick }: LibraryPanelProps) {
  const isLoading = false

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-3 shrink-0">
        <Button
          onClick={onImportClick}
          size="sm"
          className="w-full flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          오브젝트 가져오기
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : MOCK_ITEMS.length === 0 ? (
            <EmptyState onImportClick={onImportClick} />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {MOCK_ITEMS.map(item => (
                <LibraryItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function LibraryItemCard({ item }: { item: LibraryItem }) {
  const { label, icon, variant } = STATUS_CONFIG[item.status]

  return (
    <button className="group flex flex-col rounded-lg border bg-card hover:bg-muted/40 transition-colors overflow-hidden text-left">
      {/* 썸네일 영역 */}
      <div className="flex items-center justify-center h-20 bg-muted/30 w-full">
        <Box className="w-8 h-8 text-muted-foreground/40" />
      </div>

      <div className="p-2 space-y-1">
        <p className="text-xs font-medium truncate">{item.name}</p>
        <Badge variant={variant} className="flex items-center gap-1 w-fit text-[10px] px-1.5 py-0">
          {icon}
          {label}
        </Badge>
      </div>
    </button>
  )
}

function EmptyState({ onImportClick }: { onImportClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Box className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">라이브러리가 비어 있어요</p>
        <p className="text-xs text-muted-foreground mt-0.5">GLB 파일을 가져와서 나만의 라이브러리를 만들어보세요</p>
      </div>
      <Button variant="outline" size="sm" onClick={onImportClick} className="flex items-center gap-2">
        <Upload className="w-3.5 h-3.5" />
        첫 오브젝트 가져오기
      </Button>
    </div>
  )
}
