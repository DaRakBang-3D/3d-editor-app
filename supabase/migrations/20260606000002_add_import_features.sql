-- Add import object feature columns

-- objects: 파일 URL, 업로더, 운영자 승인 상태
ALTER TABLE public.objects
  ADD COLUMN IF NOT EXISTS file_url  text,
  ADD COLUMN IF NOT EXISTS user_id   text,
  ADD COLUMN IF NOT EXISTS status    text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected'));

-- rooms: 씬 스키마 버전 (마이그레이션 대응)
ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS version   integer not null default 1;
