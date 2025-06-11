-- PostgREST 스키마 캐시 강제 새로고침
-- migrate-to-public.sql 실행 후 이것도 실행하세요

-- 1. PostgREST 스키마 캐시 새로고침 (Supabase 전용)
NOTIFY pgrst, 'reload schema';

-- 2. 현재 스키마 상태 확인
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- 3. public 스키마의 NextAuth 테이블 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'accounts', 'sessions', 'verification_tokens')
ORDER BY table_name;

-- 4. 외래키 관계 확인
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (tc.table_name = 'accounts' OR tc.table_name = 'sessions');

SELECT '스키마 캐시 새로고침 완료!' as result; 