// NextAuth.js 인증 상태 및 함수 제공 useAuth 훅
// 로그인/로그아웃/회원가입/사용자 정보 등 제공, 모든 주석 한국어
import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
  [key: string]: unknown;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const user: AuthUser | null = session?.user 
    ? { 
        id: (session.user as { id?: string }).id || '',
        email: session.user.email || null,
        name: session.user.name || null,
        image: session.user.image || null
      } 
    : null;

  // 소셜 로그인 함수 (Google, Kakao, Naver)
  const login = useCallback(async (provider: 'google' | 'kakao' | 'naver') => {
    return signIn(provider);
  }, []);

  // 이메일/비밀번호 로그인 (NextAuth.js에서는 credentials provider 필요)
  const loginWithPassword = useCallback(async (email: string, password: string) => {
    return signIn('credentials', { email, password });
  }, []);

  // 회원가입 (NextAuth.js에서는 별도 API 엔드포인트 필요)
  const signup = useCallback(async () => {
    // 실제 구현은 별도 API 엔드포인트에서 처리
    throw new Error('회원가입은 별도 API를 통해 구현해야 합니다.');
  }, []);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    return signOut();
  }, []);

  return { 
    user, 
    loading, 
    login, 
    loginWithPassword,
    signup, 
    logout,
    isAuthenticated: !!user 
  };
} 