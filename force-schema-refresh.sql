-- PostgREST 스키마 캐시 강제 새로고침
-- Supabase SQL Editor에서 실행하세요

-- 1. PostgREST 설정 확인
SELECT * FROM pg_settings WHERE name LIKE '%pgrst%';

-- 2. 스키마 캐시 새로고침 (여러 방법 시도)
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 3. accounts 테이블 구조 확인 (psql \d+ 대신 SQL 사용)
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'accounts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. 테이블을 약간 수정했다가 되돌리기 (스키마 캐시 강제 갱신)
ALTER TABLE accounts ADD COLUMN temp_col TEXT;
ALTER TABLE accounts DROP COLUMN temp_col;

-- 5. 다시 한번 스키마 새로고침
NOTIFY pgrst, 'reload schema'; 