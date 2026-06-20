-- model-files Storage 버킷 생성
-- 비공개(public=false): 승인된 파일만 URL을 통해 접근 가능하도록 RLS로 제어
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'model-files',
  'model-files',
  false,
  52428800,                        -- 50MB
  ARRAY['model/gltf-binary']
)
ON CONFLICT (id) DO NOTHING;
