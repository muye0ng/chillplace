-- 🧹 next_auth 스키마 수동 정리 스크립트
-- 사용자가 확인한 남은 계정 ID들: 087b158a-062e-41c6-924c-67fcd58b5aca, 8555d7db-195d-4f63-8477-70ea0d20a49a, b5c680b3-8632-4eef-a42e-590265663635

-- 1. 현재 상태 확인
SELECT '=== next_auth.accounts 현재 상태 ===' as info;
SELECT id, "userId", provider, "providerAccountId" FROM next_auth.accounts;

SELECT '=== next_auth.users 현재 상태 ===' as info;
SELECT id, email, name FROM next_auth.users;

SELECT '=== next_auth.sessions 현재 상태 ===' as info;
SELECT id, "userId" FROM next_auth.sessions;

-- 2. 문제 사용자 (390b31f1-ab2f-499b-a00c-7a3ec24b11d3) 관련 데이터 삭제
SELECT '=== 문제 사용자 데이터 삭제 시작 ===' as info;

-- sessions 삭제
DELETE FROM next_auth.sessions 
WHERE "userId" = '390b31f1-ab2f-499b-a00c-7a3ec24b11d3';

-- accounts 삭제  
DELETE FROM next_auth.accounts 
WHERE "userId" = '390b31f1-ab2f-499b-a00c-7a3ec24b11d3';

-- users 삭제
DELETE FROM next_auth.users 
WHERE id = '390b31f1-ab2f-499b-a00c-7a3ec24b11d3';

-- 3. 모든 남은 고아 데이터 삭제 (선택사항)
SELECT '=== 모든 next_auth 데이터 정리 (필요시) ===' as info;

-- 모든 sessions 삭제
-- DELETE FROM next_auth.sessions;

-- 모든 accounts 삭제  
-- DELETE FROM next_auth.accounts;

-- 모든 users 삭제
-- DELETE FROM next_auth.users;

-- 4. 정리 후 상태 확인
SELECT '=== 정리 후 상태 확인 ===' as info;

SELECT 'accounts 남은 개수: ' || COUNT(*) as result FROM next_auth.accounts;
SELECT 'users 남은 개수: ' || COUNT(*) as result FROM next_auth.users;  
SELECT 'sessions 남은 개수: ' || COUNT(*) as result FROM next_auth.sessions;

-- 5. 남은 데이터 확인
SELECT '=== 남은 accounts ===' as info;
SELECT id, "userId", provider FROM next_auth.accounts;

SELECT '=== 남은 users ===' as info;
SELECT id, email FROM next_auth.users;

SELECT '✅ next_auth 스키마 수동 정리 완료!' as result; 