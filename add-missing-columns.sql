-- accounts 테이블에 누락된 컬럼 추가

ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS "refresh_token_expires_in" BIGINT;

-- 컬럼 추가 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'accounts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 완료 메시지
SELECT 'accounts 테이블 컬럼 추가 완료!' as result; 