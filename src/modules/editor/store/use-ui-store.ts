import { create } from "zustand"

// 에디터의 UI 상태(패널, 사이드바, 카메라 등)를 전문적으로 관리하는 스토어입니다.
// 3D 씬의 데이터와 UI 상태를 분리하여, 각자의 역할에만 집중하고 서로에게 영향을 주지 않도록 합니다.
// 예를 들어, 사이드바가 열리는 것만으로 3D 객체 컴포넌트가 리렌더링되는 것을 방지할 수 있습니다.
interface UIStoreState {
  // --- State ---
  sidebarOpen: boolean
  activePanel: "objects" | "library" | "properties" | "materials"
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  isEditMode : boolean

  // --- Actions ---
  toggleEditMode:()=>void
  setSidebarOpen: (open: boolean) => void
  setActivePanel: (panel: "objects" | "library" | "properties" | "materials") => void
  setCameraState: (position: [number, number, number], target: [number, number, number]) => void
}

export const useUIStore = create<UIStoreState>()(set => ({
  // --- 초기 상태 ---
  sidebarOpen: true,
  activePanel: "objects",
  cameraPosition: [5, 5, 5],
  cameraTarget: [0, 0, 0],
  isEditMode : true,

  // --- 액션 구현부 ---
  toggleEditMode: ()=>set(state=>({isEditMode:!state.isEditMode})),
  setSidebarOpen: open => set({ sidebarOpen: open }),
  setActivePanel: panel => set({ activePanel: panel }),
  setCameraState: (position, target) =>
    set({
      cameraPosition: position,
      cameraTarget: target,
    }),
}))
