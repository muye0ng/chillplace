import { createClient } from '@supabase/supabase-js';
import { generateUsername } from '@/lib/utils';

// Supabase 클라이언트 생성
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 소셜 로그인 함수들
export const auth = {
  // Google 로그인
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    return { data, error };
  },

  // Kakao 로그인
  async signInWithKakao() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          scope: 'profile_nickname profile_image account_email',
        },
      }
    });
    return { data, error };
  },

  // Naver 로그인 (직접 구현)
  async signInWithNaver() {
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/auth/naver/callback&state=${generateState()}`;
    window.location.href = naverAuthUrl;
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 세션 가져오기
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // 프로필 완성 여부 확인
  async checkProfileCompletion() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { isCompleted: false, error: sessionError };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_completed')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      return { isCompleted: false, error: profileError };
    }

    return { isCompleted: profile?.is_completed || false };
  }
};

// 상태 토큰 생성 함수
function generateState() {
  return Math.random().toString(36).substring(2, 15);
} 