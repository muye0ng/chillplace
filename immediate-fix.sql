-- 🚨 즉시 수정 스크립트: 현재 새로 생성된 사용자 삭제 + 함수 업데이트

-- 1. 현재 새로 생성된 사용자 삭제 (78d6b297-11de-489e-abf4-a41b2bd63cd2)
SELECT '=== 현재 새 사용자 삭제 시작 ===' as info;

-- next_auth 스키마에서 삭제
DELETE FROM next_auth.sessions WHERE "userId" = '78d6b297-11de-489e-abf4-a41b2bd63cd2';
DELETE FROM next_auth.accounts WHERE "userId" = '78d6b297-11de-489e-abf4-a41b2bd63cd2';
DELETE FROM next_auth.users WHERE id = '78d6b297-11de-489e-abf4-a41b2bd63cd2';

-- public 스키마에서도 삭제 (있다면)
DELETE FROM public.sessions WHERE "userId" = '78d6b297-11de-489e-abf4-a41b2bd63cd2';
DELETE FROM public.accounts WHERE "userId" = '78d6b297-11de-489e-abf4-a41b2bd63cd2';
DELETE FROM public.users WHERE id = '78d6b297-11de-489e-abf4-a41b2bd63cd2';
DELETE FROM public.profiles WHERE id = '78d6b297-11de-489e-abf4-a41b2bd63cd2';

SELECT '✅ 현재 사용자 삭제 완료' as result;

-- 2. 회원탈퇴 함수 업데이트 (fix-delete-function.sql 내용)
CREATE OR REPLACE FUNCTION delete_user_completely(user_id_input UUID)
RETURNS TEXT AS $$
DECLARE
    deleted_records INTEGER := 0;
BEGIN
    -- 사용자 존재 확인 (public 또는 next_auth에서)
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id_input) 
       AND NOT EXISTS (SELECT 1 FROM next_auth.users WHERE id = user_id_input) THEN
        RETURN '❌ 사용자를 찾을 수 없습니다: ' || user_id_input::TEXT;
    END IF;
    
    -- 1. public 스키마 관련 데이터 삭제
    DELETE FROM public.ad_impressions WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.ad_impressions: % 건 삭제', deleted_records;
    
    DELETE FROM public.review_helpful WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.review_helpful: % 건 삭제', deleted_records;
    
    DELETE FROM public.favorites WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.favorites: % 건 삭제', deleted_records;
    
    DELETE FROM public.votes WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.votes: % 건 삭제', deleted_records;
    
    DELETE FROM public.reviews WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.reviews: % 건 삭제', deleted_records;
    
    DELETE FROM public.profiles WHERE id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.profiles: % 건 삭제', deleted_records;
    
    -- 2. public 스키마의 NextAuth 테이블 삭제 (있는 경우)
    DELETE FROM public.sessions WHERE "userId" = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.sessions: % 건 삭제', deleted_records;
    
    DELETE FROM public.accounts WHERE "userId" = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.accounts: % 건 삭제', deleted_records;
    
    -- 3. next_auth 스키마의 NextAuth 테이블 삭제 (핵심!)
    BEGIN
        DELETE FROM next_auth.sessions WHERE "userId" = user_id_input;
        GET DIAGNOSTICS deleted_records = ROW_COUNT;
        RAISE NOTICE '🗑️ next_auth.sessions: % 건 삭제', deleted_records;
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '⚠️ next_auth.sessions 삭제 오류 (테이블이 없을 수 있음): %', SQLERRM;
    END;
    
    BEGIN
        DELETE FROM next_auth.accounts WHERE "userId" = user_id_input;
        GET DIAGNOSTICS deleted_records = ROW_COUNT;
        RAISE NOTICE '🗑️ next_auth.accounts: % 건 삭제', deleted_records;
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '⚠️ next_auth.accounts 삭제 오류 (테이블이 없을 수 있음): %', SQLERRM;
    END;
    
    -- 4. 메인 사용자 테이블 삭제 (public과 next_auth 둘 다)
    DELETE FROM public.users WHERE id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ public.users: % 건 삭제', deleted_records;
    
    BEGIN
        DELETE FROM next_auth.users WHERE id = user_id_input;
        GET DIAGNOSTICS deleted_records = ROW_COUNT;
        RAISE NOTICE '🗑️ next_auth.users: % 건 삭제', deleted_records;
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '⚠️ next_auth.users 삭제 오류 (테이블이 없을 수 있음): %', SQLERRM;
    END;
    
    RETURN '✅ 사용자 완전 삭제 완료 (public + next_auth 스키마): ' || user_id_input::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN '❌ 삭제 중 오류 발생: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이메일로 삭제하는 함수도 업데이트
CREATE OR REPLACE FUNCTION delete_user_by_email(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id_found UUID;
BEGIN
    -- public 스키마에서 사용자 ID 찾기
    SELECT id INTO user_id_found 
    FROM public.users 
    WHERE email = user_email;
    
    -- public에 없으면 next_auth 스키마에서 찾기
    IF user_id_found IS NULL THEN
        BEGIN
            SELECT id INTO user_id_found 
            FROM next_auth.users 
            WHERE email = user_email;
        EXCEPTION
            WHEN others THEN
                -- next_auth 스키마가 없거나 접근 불가
                NULL;
        END;
    END IF;
    
    IF user_id_found IS NULL THEN
        RETURN '❌ 해당 이메일의 사용자를 찾을 수 없습니다: ' || user_email;
    END IF;
    
    -- 완전 삭제 실행
    RETURN delete_user_completely(user_id_found);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ 회원탈퇴 함수 업데이트 완료! 이제 next_auth 스키마까지 완전 삭제됩니다.' as result; 