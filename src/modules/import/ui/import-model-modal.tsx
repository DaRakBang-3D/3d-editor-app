"use client"

import { MATERIAL_PRESETS } from "@/modules/import/domain/material-preset"
import { MaterialPreset, PlacementType } from "@/shared/types"
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
} from "@/shared/ui"
import { Upload } from "lucide-react"
import { useRef, useState } from "react"

const PLACEMENT_OPTIONS: { type: PlacementType; label: string }[] = [
  { type: "floor", label: "바닥" },
  { type: "wall",  label: "벽" },
  { type: "both",  label: "모두" },
]

const COLOR_PALETTE = [
  "#f5f5f0", "#e8ddd0", "#d4c5b0", "#c4a882",
  "#8b7355", "#5c4a3a", "#2d2d2d", "#1a1a1a",
  "#e8e4dc", "#d0cfc8", "#b8b4ac", "#9c9890",
]

interface ImportModelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportModelModal({ open, onOpenChange }: ImportModelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [placementType, setPlacementType] = useState<PlacementType>("floor")
  const [materialPreset, setMaterialPreset] = useState<MaterialPreset>("matte")
  const [color, setColor] = useState("#e8ddd0")

  const handleFile = (file: File) => {
    setSelectedFile(file)
    if (!name) setName(file.name.replace(".glb", ""))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleSubmit = () => {
    // TODO: useImportModel 훅 연결 (기능 구현 단계)
    console.log({ selectedFile, name, placementType, materialPreset, color })
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedFile(null)
      setName("")
      setPlacementType("floor")
      setMaterialPreset("matte")
      setColor("#e8ddd0")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>오브젝트 가져오기</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* 파일 드롭존 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            className={[
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
              isDragOver
                ? "border-primary bg-primary/5"
                : selectedFile
                  ? "border-green-500 bg-green-500/5"
                  : "border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/40",
            ].join(" ")}
          >
            <Upload className={["w-8 h-8", selectedFile ? "text-green-500" : "text-muted-foreground"].join(" ")} />
            {selectedFile ? (
              <>
                <p className="text-sm font-medium text-green-600">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">GLB 파일을 드래그하거나 클릭하여 선택</p>
                <p className="text-xs text-muted-foreground">최대 50MB · GLB 형식만 지원</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          <Separator />

          {/* 이름 */}
          <div className="space-y-1.5">
            <Label>이름</Label>
            <Input
              placeholder="오브젝트 이름을 입력하세요"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* 배치 위치 */}
          <div className="space-y-1.5">
            <Label>배치 위치</Label>
            <div className="flex gap-2">
              {PLACEMENT_OPTIONS.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setPlacementType(type)}
                  className={[
                    "flex-1 rounded-md border px-3 py-1.5 text-sm transition-colors",
                    placementType === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground hover:bg-muted border-input",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 재질 프리셋 */}
          <div className="space-y-1.5">
            <Label>재질</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(MATERIAL_PRESETS) as [MaterialPreset, { label: string }][]).map(
                ([preset, { label }]) => (
                  <button
                    key={preset}
                    onClick={() => setMaterialPreset(preset)}
                    className={[
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      materialPreset === preset
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground hover:bg-muted border-input",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* 색상 */}
          <div className="space-y-1.5">
            <Label>색상</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={[
                    "w-7 h-7 rounded-full border-2 transition-transform hover:scale-110",
                    color === c ? "border-primary scale-110" : "border-transparent",
                  ].join(" ")}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border-2 border-muted-foreground/30 p-0.5"
                title="직접 선택"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFile || !name}>
            가져오기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
