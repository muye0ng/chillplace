-- 특정 사용자의 모든 데이터 확인
-- 사용자 이메일: chillvibey@gmail.com
-- 사용자 ID: 9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd

-- 1. users 테이블 확인
SELECT 'users' as table_name, count(*) as record_count
FROM public.users 
WHERE email = 'chillvibey@gmail.com';

-- 2. accounts 테이블 확인 (camelCase 컬럼명)
SELECT 'accounts' as table_name, count(*) as record_count
FROM public.accounts 
WHERE "userId" = '9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd';

-- 3. sessions 테이블 확인 (camelCase 컬럼명)
SELECT 'sessions' as table_name, count(*) as record_count
FROM public.sessions 
WHERE "userId" = '9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd';

-- 4. profiles 테이블 확인
SELECT 'profiles' as table_name, count(*) as record_count
FROM public.profiles 
WHERE id = '9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd';

-- 5. 모든 테이블 통합 확인 (camelCase 적용)
SELECT 
  'users' as table_name, 
  id, email, name, "createdAt"::text as created_at
FROM public.users 
WHERE email = 'chillvibey@gmail.com'

UNION ALL

SELECT 
  'accounts' as table_name, 
  "userId" as id, provider as email, "providerAccountId" as name, "createdAt"::text as created_at
FROM public.accounts 
WHERE "userId" = '9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd'

UNION ALL

SELECT 
  'sessions' as table_name, 
  "userId" as id, "sessionToken" as email, expires::text as name, "createdAt"::text as created_at
FROM public.sessions 
WHERE "userId" = '9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd'

UNION ALL

SELECT 
  'profiles' as table_name, 
  id, username as email, full_name as name, created_at::text
FROM public.profiles 
WHERE id = '9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd';

-- 6. 삭제 함수가 존재하는지 확인
SELECT 
  proname as function_name,
  prosrc as function_definition
FROM pg_proc 
WHERE proname IN ('delete_user_completely', 'delete_user_by_email'); 
