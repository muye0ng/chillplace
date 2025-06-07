// NextAuth.js 인증 관련 함수 모음입니다.
// 소셜 로그인, 로그아웃 등 함수를 NextAuth.js로 대체
import { signIn, signOut, getSession } from 'next-auth/react';

// 소셜 로그인 (Google, Kakao, Naver)
export async function signInWithProvider(provider: 'google' | 'kakao' | 'naver') {
  return signIn(provider);
}

// 로그아웃
export async function signOutUser() {
  return signOut();
}

// 현재 로그인한 유저 정보 반환 함수 (NextAuth.js 세션 기반)
export async function getCurrentUser() {
  try {
    const session = await getSession();
    return { 
      user: session?.user ? {
        id: (session.user as { id?: string }).id || '',
        email: session.user.email || null,
        name: session.user.name || null,
        image: session.user.image || null
      } : null, 
      error: null 
    };
  } catch (error) {
    return { user: null, error };
  }
}

// 내 프로필 정보 조회 (Supabase 데이터베이스는 계속 사용)
export async function getMyProfile() {
  // 이 함수는 별도로 구현하거나 다른 곳에서 처리
  console.log('getMyProfile은 별도 구현이 필요합니다.');
  return { profile: null, error: new Error('별도 구현 필요') };
} 