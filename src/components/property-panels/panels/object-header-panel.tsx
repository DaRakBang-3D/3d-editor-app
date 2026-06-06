"use client"

import { useUIStore } from "@/modules/editor/store/use-ui-store"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import { useSelectedObject } from "@/modules/objects/store/use-selected-object"
import { PlacementType } from "@/shared/types"
import { Button, Card, CardContent, CardHeader, CardTitle, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui"
import { Box, Eye, PanelBottom, PanelLeft, Trash2 } from "lucide-react"

const PLACEMENT_ICON: Record<PlacementType, React.ReactNode> = {
  floor: <PanelBottom className="w-3 h-3" />,
  wall:  <PanelLeft  className="w-3 h-3" />,
  both:  <Box        className="w-3 h-3" />,
}

const PLACEMENT_LABEL: Record<PlacementType, string> = {
  floor: "바닥 전용 (바오)",
  wall:  "벽 전용 (벽오)",
  both:  "바닥+벽 모두",
}

export const ObjectHeaderPanel = () => {
  const selectedObject = useSelectedObject()
  const { toggleObjectVisibility, deleteObject } = useObjectStore()
  const { isEditMode } = useUIStore()

  if (!selectedObject) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-lg border-2 border-muted-foreground/30"
              style={{ backgroundColor: selectedObject.color }}
            />
            <div className="min-w-0">
              <div className="font-medium truncate">{selectedObject.name}</div>
              <div className="text-xs text-muted-foreground capitalize flex items-center gap-1.5">
                <span>{`${selectedObject.type} Object`}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground/60 cursor-default">
                        {PLACEMENT_ICON[selectedObject.placementType]}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{PLACEMENT_LABEL[selectedObject.placementType]}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleObjectVisibility(selectedObject.id)}
            className="flex-1"
            disabled={!isEditMode}
          >
            <Eye className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">
              {selectedObject.visible ? "Visible" : "Hidden"}
            </span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteObject(selectedObject.id)}
            disabled={!isEditMode}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
