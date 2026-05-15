# TODO List

- [x] **1순위**:
- [x] 오브젝트 선택시, 오브젝트 색상 전체가 밝아져서 명확한 색상 파악 불가능
  > `@react-three/drei` 의 `<Outlines>` 컴포넌트로 교체 완료 (emissive 방식 제거)
  > 선택: 형광 주황 외곽선 / 호버: 회색 외곽선 / depthTest=false로 가려진 부분도 표시
- [x] 오브젝트 선택후, 카메라 시점 변경 후에 오브젝트 선택이 해제됨.
  > 네이티브 포인터 이벤트로 마우스 이동 거리 측정, 3px 이상 이동 시 드래그로 판단 → 선택 해제 방지
  > `GroundPlane`의 `onClick` 제거 + `raycast={() => null}` 적용으로 바닥 클릭 간섭 제거
- [ ] 빛 위치 조정 기능 필요
  > 1단계: 속성 패널에 Light X/Y/Z 슬라이더 추가
  > 2단계: 라이트 선택 시 뷰포트 TransformControls Gizmo 표시

- [x] **2순위**
- [x] 방의 구조를 띄는 기본공간 오브젝트 설치
  > `RoomWalls` 컴포넌트 구현 완료 (`src/components/objects/3d/room-walls.tsx`)
  > - 4면 벽 (BoxGeometry, 두께 0.15), 천장 없음
  > - `width` / `depth` / `height` props로 수치 조작 가능 (기본값: 10x10x4)
  > - 카메라 향하는 벽 자동 투명화 (dot product + lerp)
  > - 투명화 시 그림자도 함께 제거 (opacity > 0.5 기준)
  > - `raycast={() => null}` 적용, 클릭/호버 인터랙션 없음

- [ ] **2순위 확장** - 창문 오브젝트 도입 (추후)
  > 전제조건 및 구현 방향 정리됨
  > 1. **빛 투광**: 창문 위치에 PointLight 배치로 투광 시뮬레이션
  > 2. **설치 방법**: CSG 없이 프레임+유리 메시 오버레이 방식, `WallConfig`에 `windows[]` 배열 확장
  > 3. **투명도 연동**: 벽과 동일한 outwardNormal 공유 → 같은 dot product 로직 재사용

- [ ] **3순위**
- 3D 오브젝트 데이터 CRUD 방안 고안

- [ ] ViewportManager 구조 개선 및 구현 (2026-01-10)
  - **Camera Preset (시점 관리)**
    - 이중 카메라 전략 도입 (PerspectiveCamera ↔ OrthographicCamera 전환).
    - Top/Front/Side 뷰 (Orthographic) 및 Perspective 뷰 (Perspective) 구현.
    - 카메라 전환 시 부드러운 애니메이션 (GSAP/TWEEN) 고려.
  - **Orbit Controls (조작감)**
    - ViewportManager 내에서 OrbitControls 생명주기 및 설정 캡슐화.
    - 카메라 전환 시 Controls 타겟 동기화 (controls.object 업데이트).
    - Damping 및 Zoom 제한 설정.
  - **Environment (환경 제어)**
    - 배경색(Background), 안개(Fog) 등 Scene 환경 요소 제어 기능 추가.
  - **SceneManager 연동**
    - 활성 카메라(activeCamera)를 통한 렌더링 및 Resize 이벤트 처리 동기화.

---

## 🗺️ 3D 오브젝트 배치 시스템 Roadmap

### Phase 1: 기반 드래그 시스템 (MVP) — 🚧 진행 중

- [x] R3F 기반 기본 Scene 세팅 및 OrbitControls 구성
- [x] Selection 하이라이트 (Outlines), 호버 발광 — 이미 구현 완료
- [x] **1-1** `use-object-store`에 드래그 상태 추가
  - `draggingObjectId: string | null`
  - `dragStartPosition: { x, y, z } | null`
  - `setDragging(id, startPos)` 액션
- [x] **1-2** `SceneObject`에 `onPointerDown` 추가
  - 드래그 시작 시 `setDragging` 호출
  - 오브젝트 선택도 동시에 처리
- [x] **1-3** `DragPlane` 컴포넌트 구현 (`src/components/scene/drag-plane.tsx`)
  - 드래그 중에만 렌더링되는 투명한 대형 XZ 평면 메시
  - `onPointerMove` → `e.point`로 교차점 획득 → 그리드 스냅(0.5단위) 적용
  - Y축은 드래그 시작 시점 값 유지 (바닥 관통 방지)
  - `onPointerUp` → `UpdateTransformCommand` 등록 → 드래그 상태 초기화
- [x] **1-4** `EditorScene` 통합
  - `<OrbitControls enabled={!draggingObjectId} />` — 드래그 중 카메라 잠금
  - `<DragPlane />` Canvas 내부에 추가

---

### Phase 2: 고도화된 피드백 시스템 — ✅ 완료

- [x] **2-1** ContactShadows 실시간 그림자 적용
  > 바닥 Y=-0.42 기준, opacity 0.4 / blur 1.5 / far 4
- [x] **2-2** 드래그 중 AABB 충돌 감지
  > `src/modules/objects/utils/aabb.ts` — getCollidingIds()
  > 충돌 중인 오브젝트 전체에 빨간(HDR 3,0,0) 외곽선 표시
  > 우선순위: 충돌 > 선택 > 호버
- [x] **2-3** 벽면 흡착 (Face Snapping)
  > DragPlane 내 applyWallSnap() — 벽 내면 0.8 unit 이내 진입 시 자동 흡착
  > THICKNESS 상수 room-walls.tsx에서 export하여 공유
- [ ] **2-4** 오브젝트 간 정점(Vertex) 스냅 — 추후
- [x] **2-5** 오브젝트 복사/붙여넣기 (Ctrl+C / Ctrl+V)
  > `PasteObjectCommand` — execute/undo로 Undo/Redo 완전 지원
  > 붙여넣기 시 X/Z +0.5 오프셋으로 복제

---

### Phase 3: 오브젝트 배치 타입 시스템 — 🚧 진행 중

#### 3-A. PlacementType 속성 시스템 (2026-04-24)

- [x] **3-A-1** `PlacementType = "floor" | "wall" | "both"` 도메인 모델 추가
  > `src/shared/types/editor-type.ts` — `Object3DInfo.placementType` 필드 추가 (기본값 `"floor"`)
- [x] **3-A-2** `addObject(type, placementType?)` 시그니처 확장
  > `src/modules/objects/store/use-object-store.ts` — 두 번째 인자로 placementType 지정 가능
- [x] **3-A-3** DragPlane 수직/수평 동적 전환 + 자동 회전
  > `src/components/scene/drag-plane.tsx` 전면 리팩터
  > - `"floor"`: 기존 XZ 수평 드래그 + `applyWallSnap()` 유지
  > - `"wall"` / `"both"`: `WALL_SNAP_DIST` 이내 접근 시 수직 드래그 평면으로 자동 전환
  > - 벽면 흡착 시 `outwardNormal` 기반 `rotation.y` 자동 적용 (방 안쪽을 바라봄)
  > - `pointerUp` 시 position + rotation 각각 `UpdateTransformCommand` 등록 (Undo 지원)
  > - 회전 테이블: north→PI, south→0, east→PI/2, west→-PI/2
- [x] **3-A-4** 속성 패널에서 `placementType` 표시 및 변경 UI
  > Properties 탭 내 PlacementType 셀렉터 (floor / wall / both)
  > `src/components/property-panels/panels/basic-properties-panel.tsx` 구현 완료
- [x] **3-A-5** 사이드바 Quick Add에서 wall/both 타입 오브젝트 추가 지원
  > `src/components/sidebar/editor-sidebar.tsx` — PlacementType 토글(바닥/벽/모두) 추가
  > 선택된 타입으로 Box/Sphere/Cylinder 추가 가능

---

#### 3-B. 배치 인터랙션 UX — ⏳ 예정

##### 풋프린트 투영 (Footprint Projection)

- [x] **3-B-1** AABB에서 풋프린트 크기 계산 유틸 추가
  - `src/modules/objects/utils/aabb.ts`에 `getFootprintSize()` 함수 추가
  - width(x), depth(z), height(y) 반환
- [x] **3-B-2** `FootprintProjection` 컴포넌트 구현 (`src/components/scene/footprint-projection.tsx`)
  - `draggingObjectId` 있을 때만 렌더링
  - `PlaneGeometry`로 AABB width/depth 기반 평면 생성
  - Y=0.01 (z-fighting 방지), `depthWrite: false`
  - 머티리얼: `MeshBasicMaterial`, `transparent: true`, `opacity: 0.3`
- [x] **3-B-3** 배치 유효성 기반 색상 연동
  - 충돌 없음 → 초록(`#00ff88`), 충돌 있음 → 빨간(`#ff3333`)
  - 기존 `getCollidingIds()` 결과와 연동
- [x] **3-B-4** 벽면 오브젝트 풋프린트 처리
  - `placementType === "wall"` 시 바닥 대신 흡착된 벽면에 투영
  - 오브젝트 위치 기반 wall face 자동 감지 후 평면 회전 적용
- [x] **3-B-5** `EditorScene`에 `<FootprintProjection />` 통합

---

##### 배치 중 회전 (Rotation During Placement)

- [x] **3-B-6** `use-object-store` 드래그 상태에 회전값 추가
  - `dragRotationY: number` 필드 추가 (기본값 `0`)
  - `setDragRotationY(angle: number)` 액션 추가
  - `setDragging()` 호출 시 `dragRotationY` 자동 초기화
- [x] **3-B-7** `DragPlane`에 R키 / 스크롤 이벤트 핸들러 추가
  - `keydown` → `R` 키 → `dragRotationY += Math.PI / 2` (90° 스냅 회전)
  - 스크롤휠 → `dragRotationY += ±Math.PI / 12` (15° 미세 조정)
  - 드래그 중(`draggingObjectId !== null`)에만 이벤트 활성화
- [x] **3-B-8** 드래그 중 오브젝트에 회전값 실시간 반영
  - `updateObjectTransform`으로 store 즉시 반영 → `SceneObject` 자동 렌더링
- [x] **3-B-9** 드롭 시 회전값을 커맨드에 포함
  - 기존 `dragStartRotationRef` 메커니즘이 수동 회전 변화도 감지하여 `UpdateTransformCommand` 자동 등록
- [x] **3-B-10** 키 힌트 UI 오버레이 (`src/components/ui/drag-hint-overlay.tsx`)
  - 드래그 중에만 Canvas 위에 `"R: 90° 회전 | 스크롤: 미세 조정"` 힌트 표시
  - 드래그 종료 시 자동 숨김

---

#### 3-C. 오브젝트 마켓플레이스 — ⏳ 예정

- [ ] **3-C-1** 공통 `MarketplaceObject` 인터페이스 정의
  - `id`, `name`, `category`, `placementType`, `thumbnail`, `asset(url/type)`, `defaultTransform`, `createdBy`
  - GLB/GLTF 파일은 파일 스토리지 URL로 참조, geometry 직렬화 방식 결정
- [ ] **3-C-2** 오브젝트 스토어(마켓) 기능 설계
  - 저장된 오브젝트 카탈로그 UI (썸네일, 이름, placementType 표시)
  - 사이드바에서 드래그앤드롭으로 씬에 배치
  - 드롭 위치 기반 placementType 자동 판단 (바닥 근처 → floor, 벽 근처 → wall)
- [ ] **3-C-3** 오브젝트 CRUD API 연동 — placementType 포함 직렬화/역직렬화

---

#### 3-D. 지능형 공간 구성 및 최적화 — ⏳ 예정

- [ ] **3-D-1** rapier (wasm 기반) 물리 엔진 연동
  - AABB 충돌 정밀화 → 물리적 밀어내기
- [ ] **3-D-2** 인테리어 원칙 시각화
  - 삼분할 가이드라인을 그리드에 오버레이
- [ ] **3-D-3** InstancedMesh 최적화
  - 동일 타입 오브젝트 50개 이상 시 자동 전환
  - 60FPS 유지 목표
