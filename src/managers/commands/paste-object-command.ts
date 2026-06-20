import { SceneObject } from "@/shared/types"
import { useObjectStore } from "@/modules/objects/store/use-object-store"
import { ICommand } from "../command-manager"

/**
 * 오브젝트 붙여넣기 커맨드
 * - execute: 클립보드 오브젝트를 +0.5 오프셋으로 복제 추가
 * - undo: 생성된 오브젝트 삭제
 */
export class PasteObjectCommand implements ICommand {
  private newId: string = ""

  constructor(private source: SceneObject) {}

  execute() {
    this.newId = useObjectStore.getState().addClonedObject(this.source)
  }

  undo() {
    if (this.newId) {
      useObjectStore.getState().deleteObject(this.newId)
    }
  }
}
