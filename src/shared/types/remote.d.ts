// Module Federation - Remote 노출 모듈 타입 선언
// Host 앱에서 이 파일을 복사하여 사용

declare module "remote/EditorPage" {
  import type { FC } from "react"
  const EditorPage: FC
  export default EditorPage
}
