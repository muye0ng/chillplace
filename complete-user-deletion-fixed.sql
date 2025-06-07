-- NextAuth.js Supabase Adapter용 완전한 회원 삭제 시스템 (camelCase 컬럼명)

-- ============================================
-- 1. CASCADE 삭제 설정 수정
-- ============================================

-- profiles 테이블의 foreign key를 CASCADE로 변경
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ============================================
-- 2. 완전한 사용자 삭제 함수 (camelCase 적용)
-- ============================================

CREATE OR REPLACE FUNCTION delete_user_completely(user_id_input UUID)
RETURNS TEXT AS $$
DECLARE
    deleted_records INTEGER := 0;
BEGIN
    -- 사용자 존재 확인
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id_input) THEN
        RETURN '❌ 사용자를 찾을 수 없습니다: ' || user_id_input::TEXT;
    END IF;
    
    -- 1. 관련 데이터 삭제 (순서 중요)
    DELETE FROM public.ad_impressions WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ ad_impressions: % 건 삭제', deleted_records;
    
    DELETE FROM public.review_helpful WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ review_helpful: % 건 삭제', deleted_records;
    
    DELETE FROM public.favorites WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ favorites: % 건 삭제', deleted_records;
    
    DELETE FROM public.votes WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ votes: % 건 삭제', deleted_records;
    
    DELETE FROM public.reviews WHERE user_id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ reviews: % 건 삭제', deleted_records;
    
    DELETE FROM public.profiles WHERE id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ profiles: % 건 삭제', deleted_records;
    
    -- 2. NextAuth 관련 데이터 삭제 (camelCase 컬럼명 사용)
    DELETE FROM public.sessions WHERE "userId" = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ sessions: % 건 삭제', deleted_records;
    
    DELETE FROM public.accounts WHERE "userId" = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ accounts: % 건 삭제', deleted_records;
    
    -- 3. 메인 사용자 테이블 삭제
    DELETE FROM public.users WHERE id = user_id_input;
    GET DIAGNOSTICS deleted_records = ROW_COUNT;
    RAISE NOTICE '🗑️ users: % 건 삭제', deleted_records;
    
    RETURN '✅ 사용자 완전 삭제 완료: ' || user_id_input::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN '❌ 삭제 중 오류 발생: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. 이메일로 삭제하는 편의 함수
-- ============================================

CREATE OR REPLACE FUNCTION delete_user_by_email(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id_found UUID;
BEGIN
    -- 이메일로 사용자 ID 찾기
    SELECT id INTO user_id_found 
    FROM public.users 
    WHERE email = user_email;
    
    IF user_id_found IS NULL THEN
        RETURN '❌ 해당 이메일의 사용자를 찾을 수 없습니다: ' || user_email;
    END IF;
    
    -- 완전 삭제 실행
    RETURN delete_user_completely(user_id_found);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. 사용 예시
-- ============================================

-- UUID로 삭제:
-- SELECT delete_user_completely('9a88ed8d-f9b1-48e6-9e0d-32b97e5456dd');

-- 이메일로 삭제:
-- SELECT delete_user_by_email('chillvibey@gmail.com');

SELECT '✅ NextAuth.js Adapter용 완전한 회원 삭제 시스템 설정 완료!' as result; 