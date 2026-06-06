"use client"

import { useUIStore } from "@/modules/editor/store/use-ui-store"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import { useSelectedObject } from "@/modules/objects/store/use-selected-object"
import { Object3DInfo, PlacementType } from "@/shared/types"
import { Button, Input, Label, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui"
import { Box, Palette, PanelBottom, PanelLeft, Settings } from "lucide-react"
import { BasePanel } from "./base-panel"

const PLACEMENT_OPTIONS: { type: PlacementType; icon: React.ReactNode; label: string }[] = [
  { type: "floor", icon: <PanelBottom className="w-4 h-4" />, label: "바닥" },
  { type: "wall",  icon: <PanelLeft   className="w-4 h-4" />, label: "벽"  },
  { type: "both",  icon: <Box         className="w-4 h-4" />, label: "바닥+벽" },
]

export const BasicPropertiesPanel = () => {
  const selectedObject = useSelectedObject()
  const { updateObjectProperty } = useObjectStore()
  const { isEditMode } = useUIStore()

  if (!selectedObject) return null

  const handlePropertyChange = <K extends keyof Omit<Object3DInfo, "id">>(
    property: K,
    value: Omit<Object3DInfo, "id">[K],
  ) => {
    updateObjectProperty(selectedObject.id, property, value)
  }

  return (
    <BasePanel
      title={
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Basic Properties</span>
        </div>
      }
      content={
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Object Name
            </Label>
            <Input
              id="name"
              value={selectedObject.name}
              onChange={(e) => handlePropertyChange("name", e.target.value)}
              className="mt-1"
              placeholder="Enter object name..."
              disabled={!isEditMode}
            />
          </div>
          <div>
            <Label
              htmlFor="color"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Color
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="color"
                type="color"
                value={selectedObject.color}
                onChange={(e) => handlePropertyChange("color", e.target.value)}
                className="w-16 h-10 p-1"
                disabled={!isEditMode}
              />
              <Input
                type="text"
                value={selectedObject.color}
                onChange={(e) => handlePropertyChange("color", e.target.value)}
                className="flex-1"
                placeholder="#ffffff"
                disabled={!isEditMode}
              />
            </div>
          </div>

          {/* Placement Type */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Box className="w-4 h-4" />
              Placement
            </Label>
            <div className="flex gap-1 mt-1">
              {PLACEMENT_OPTIONS.map(({ type, icon, label }) => (
                <TooltipProvider key={type}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectedObject.placementType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePropertyChange("placementType", type)}
                        className="flex-1"
                        disabled={!isEditMode}
                      >
                        {icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      }
    />
  )
}
