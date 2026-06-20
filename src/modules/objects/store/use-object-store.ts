import { Object3DInfo, ImportedObject3DInfo, SceneObject, PlacementType } from "@/shared/types"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { Vector3Like } from "three"

interface ObjectStoreState {
  objects: Record<string, SceneObject>
  objectIds: string[]
  selectedObjectId: string | null
  hoveredObjectId: string | null
  // --- 드래그 상태 ---
  draggingObjectId: string | null
  dragStartPosition: { x: number; y: number; z: number } | null
  dragRotationY: number
  // --- 충돌 상태 ---
  collidingObjectIds: string[]
  // --- 클립보드 ---
  clipboardObject: SceneObject | null

  // --- Actions ---
  addObject: (type: "box" | "sphere" | "cylinder", placementType?: PlacementType) => void
  addImportedObject: (info: Omit<ImportedObject3DInfo, "id">) => string
  addClonedObject: (source: SceneObject) => string
  selectObject: (id: string | null) => void
  setHoveredObjectId: (id: string | null) => void
  setDragging: (id: string | null, startPos: { x: number; y: number; z: number } | null) => void
  setDragRotationY: (angle: number) => void
  setCollidingObjectIds: (ids: string[]) => void
  copyToClipboard: (id: string) => void
  updateObjectProperty: (id: string, property: keyof SceneObject, value: unknown) => void
  updateObjectTransform: (
    id: string,
    transform: Partial<{ position: Vector3Like; rotation: Vector3Like; scale: Vector3Like }>,
  ) => void
  toggleObjectVisibility: (id: string) => void
  deleteObject: (id: string) => void
}

export const useObjectStore = create<ObjectStoreState>()(
  subscribeWithSelector((set, get) => ({
    objects: {},
    objectIds: [],
    selectedObjectId: null,
    hoveredObjectId: null,
    draggingObjectId: null,
    dragStartPosition: null,
    dragRotationY: 0,
    collidingObjectIds: [],
    clipboardObject: null,

    addObject: (type, placementType = "both") => {
      const id = `${type}_${Date.now()}`
      const newObject: Object3DInfo = {
        id,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${Object.keys(get().objects).length + 1}`,
        type,
        position: { x: (Math.random() - 0.5) * 4, y: 0.5, z: (Math.random() - 0.5) * 4 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        visible: true,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
        placementType,
      }
      set(state => ({
        objects: { ...state.objects, [id]: newObject },
        objectIds: [...state.objectIds, id],
        selectedObjectId: newObject.id,
      }))
    },

    addImportedObject: info => {
      const id = `imported_${Date.now()}`
      const newObject: ImportedObject3DInfo = { ...info, id }
      set(state => ({
        objects: { ...state.objects, [id]: newObject },
        objectIds: [...state.objectIds, id],
        selectedObjectId: id,
      }))
      return id
    },

    addClonedObject: source => {
      const id = `${source.type}_${Date.now()}`
      const cloned: SceneObject = {
        ...source,
        id,
        name: `${source.name} (복사)`,
        position: {
          x: source.position.x + 0.5,
          y: source.position.y,
          z: source.position.z + 0.5,
        },
      }
      set(state => ({
        objects: { ...state.objects, [id]: cloned },
        objectIds: [...state.objectIds, id],
        selectedObjectId: id,
      }))
      return id
    },

    selectObject: id => {
      set({ selectedObjectId: id })
    },

    setHoveredObjectId: id => {
      set({ hoveredObjectId: id })
    },

    setDragging: (id, startPos) => {
      set({ draggingObjectId: id, dragStartPosition: startPos, dragRotationY: 0 })
    },

    setDragRotationY: angle => {
      set({ dragRotationY: angle })
    },

    setCollidingObjectIds: ids => {
      set({ collidingObjectIds: ids })
    },

    copyToClipboard: id => {
      const obj = get().objects[id]
      if (obj) set({ clipboardObject: obj })
    },

    updateObjectProperty: (id, property, value) => {
      set(state => ({
        objects: {
          ...state.objects,
          [id]: { ...state.objects[id], [property]: value },
        },
      }))
    },

    updateObjectTransform: (id, transform) => {
      set(state => ({
        objects: {
          ...state.objects,
          [id]: { ...state.objects[id], ...transform },
        },
      }))
    },

    toggleObjectVisibility: id => {
      set(state => ({
        objects: {
          ...state.objects,
          [id]: { ...state.objects[id], visible: !state.objects[id].visible },
        },
      }))
    },

    deleteObject: id => {
      const state = get()
      const newObjects = { ...state.objects }
      delete newObjects[id]
      const newObjectIds = state.objectIds.filter(objectId => objectId !== id)
      set({
        objects: newObjects,
        objectIds: newObjectIds,
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
        hoveredObjectId: state.hoveredObjectId === id ? null : state.hoveredObjectId,
        collidingObjectIds: state.collidingObjectIds.filter(cid => cid !== id),
      })
    },
  })),
)
