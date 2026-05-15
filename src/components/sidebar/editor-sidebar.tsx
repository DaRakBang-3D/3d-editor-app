"use client"
import { useUIStore } from "@/modules/editor/store/use-ui-store"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import { PlacementType } from "@/shared/types"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/"
import {
  Box,
  Circle,
  Cylinder,
  Layers,
  Lock,
  PanelBottom,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Settings,
  Unlock,
} from "lucide-react"
import { useState } from "react"
import { PropertyPanel } from "../property-panels/property-panel"
import { ObjectsList } from "./object-list"

const PLACEMENT_OPTIONS: { type: PlacementType; label: string; icon: React.ReactNode }[] = [
  { type: "floor", label: "바닥", icon: <PanelBottom className="w-3 h-3" /> },
  { type: "wall",  label: "벽",   icon: <PanelLeft className="w-3 h-3" /> },
  { type: "both",  label: "모두", icon: <Box className="w-3 h-3" /> },
]

export function EditorSidebar() {
  const { addObject, objectIds } = useObjectStore()
  const [quickAddPlacementType, setQuickAddPlacementType] = useState<PlacementType>("floor")
  const {
    setSidebarOpen,
    isEditMode,
    toggleEditMode,
    activePanel,
    setActivePanel,
  } = useUIStore()

  return (
    <Card className="w-full h-full rounded-none border-l border-t-0 border-r-0 border-b-0 flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Editor Panel</span>
          </span>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={toggleEditMode} className="h-8 w-8 p-0">
                    {isEditMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isEditMode ? "Lock (Disable Edit Mode)" : "Unlock (Enable Edit Mode)"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="h-8 w-8 p-0">
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {/* min-h-0: flex 자식이 콘텐츠 크기로 무한 확장되는 것을 방지 */}
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <Tabs
          value={activePanel}
          onValueChange={v => setActivePanel(v as "objects" | "properties" | "materials")}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-4 pb-3 shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="objects" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Objects</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {objectIds.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Properties</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* overflow-hidden: 자식의 h-full이 올바른 높이 기준점을 갖도록 제한 */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="objects" className="h-full m-0 overflow-y-auto">
              <div className="px-4 pb-4">
                <Card className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Quick Add</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {/* PlacementType 토글 */}
                    <div className="flex gap-1">
                      {PLACEMENT_OPTIONS.map(({ type, label, icon }) => (
                        <button
                          key={type}
                          onClick={() => setQuickAddPlacementType(type)}
                          disabled={!isEditMode}
                          className={[
                            "flex-1 flex items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
                            quickAddPlacementType === type
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground hover:bg-muted border-input",
                            !isEditMode ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                          ].join(" ")}
                        >
                          {icon}
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                    {/* 오브젝트 추가 버튼 */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => addObject("box", quickAddPlacementType)}
                        size="sm"
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1 min-w-[60px]"
                        disabled={!isEditMode}
                      >
                        <Box className="w-4 h-4" />
                        <span className="hidden sm:inline">Box</span>
                      </Button>
                      <Button
                        onClick={() => addObject("sphere", quickAddPlacementType)}
                        size="sm"
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1 min-w-[60px]"
                        disabled={!isEditMode}
                      >
                        <Circle className="w-4 h-4" />
                        <span className="hidden sm:inline">Sphere</span>
                      </Button>
                      <Button
                        onClick={() => addObject("cylinder", quickAddPlacementType)}
                        size="sm"
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1 min-w-[60px]"
                        disabled={!isEditMode}
                      >
                        <Cylinder className="w-4 h-4" />
                        <span className="hidden sm:inline">Cylinder</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <ObjectsList />
            </TabsContent>

            <TabsContent value="properties" className="h-full m-0">
              <PropertyPanel />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
