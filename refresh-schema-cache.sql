-- PostgREST 스키마 캐시 강제 새로고침

-- 1. 더미 테이블 생성 및 삭제 (PostgREST 스키마 캐시 갱신 트리거)
CREATE TABLE IF NOT EXISTS temp_schema_refresh (id INTEGER);
DROP TABLE IF EXISTS temp_schema_refresh;

-- 2. NOTIFY를 사용한 PostgREST 리로드 시그널
NOTIFY pgrst, 'reload schema';

-- 3. accounts 테이블 스키마 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'accounts' 
AND table_schema = 'public'
AND column_name LIKE '%refresh%'
ORDER BY ordinal_position;

-- 4. 컬럼 존재 확인
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'accounts' 
      AND column_name = 'refresh_token_expires_in'
    ) 
    THEN '✅ refresh_token_expires_in 컬럼 존재함'
    ELSE '❌ refresh_token_expires_in 컬럼 없음'
  END as result;

-- 완료 메시지
SELECT 'PostgREST 스키마 캐시 새로고침 완료!' as message; 