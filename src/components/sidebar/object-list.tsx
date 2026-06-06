"use client"

import { useUIStore } from "@/modules/editor/store/use-ui-store"
import { useObjectById } from "@/modules/objects/store/use-object-by-id"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import { Button } from "@/shared/ui/button"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Box, Circle, Cylinder, Eye, EyeOff, Trash2 } from "lucide-react"
import React from "react"

const ObjectListItem = React.memo(({ objectId }: { objectId: string }) => {
  const object = useObjectById(objectId)
  const { selectedObjectId, selectObject, toggleObjectVisibility, deleteObject } = useObjectStore()
  const setActivePanel = useUIStore(state => state.setActivePanel)

  if (!object) {
    return null
  }

  const getObjectIcon = (type: string) => {
    switch (type) {
    case "box":
      return <Box className="w-4 h-4" />
    case "sphere":
      return <Circle className="w-4 h-4" />
    case "cylinder":
      return <Cylinder className="w-4 h-4" />
    default:
      return <Box className="w-4 h-4" />
    }
  }

  const handleSelect = () => {
    selectObject(object.id)
    setActivePanel("properties")
  }

  return (
    <div
      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
        selectedObjectId === object.id
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/50"
      }`}
      onClick={handleSelect}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getObjectIcon(object.type)}
        <div
          className="w-3 h-3 rounded-full border"
          style={{ backgroundColor: object.color }}
        />
        <span className="text-sm truncate">{object.name}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation()
            toggleObjectVisibility(object.id)
          }}
          className="h-6 w-6 p-0"
        >
          {object.visible ? (
            <Eye className="w-3 h-3 text-green-600" />
          ) : (
            <EyeOff className="w-3 h-3 text-red-500" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation()
            deleteObject(object.id)
          }}
          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
})
ObjectListItem.displayName = "ObjectListItem"

export const ObjectsList = () => {
  const objectIds = useObjectStore(state => state.objectIds)

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-3">Objects ({objectIds.length})</h3>

      <ScrollArea className="h-[400px]">
        {objectIds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No objects in scene</p>
          </div>
        ) : (
          <div className="space-y-1">
            {objectIds.map(id => (
              <ObjectListItem key={id} objectId={id} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
