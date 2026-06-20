import { useObjectStore } from "./use-object-store"
import { SceneObject } from "@/shared/types"

/**
 * 현재 선택된 객체의 정보를 가져오는 selector 훅입니다.
 *
 * @returns 선택된 객체의 정보(SceneObject) 또는 선택된 객체가 없을 경우 undefined.
 */
export const useSelectedObject = (): SceneObject | undefined => {
  const selectedId = useObjectStore(state => state.selectedObjectId)
  // Zustand의 기본 비교(strict equality)로 우선 동작하도록 하여 타입 안정성을 확보합니다.
  // 최적화(shallow)는 전체 타입 문제가 해결된 후 다시 안전하게 적용할 수 있습니다.
  return useObjectStore(state => (selectedId ? state.objects[selectedId] : undefined))
}
