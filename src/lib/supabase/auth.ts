// Supabase 인증 관련 함수 모음입니다.
// 소셜 로그인, 로그아웃 등 함수 뼈대 제공
import { supabase } from './client';

// 소셜 로그인 (Google, Kakao)
export async function signInWithProvider(provider: 'google' | 'kakao') {
  // 실제 구현은 supabase.auth.signInWithOAuth 사용
  return supabase.auth.signInWithOAuth({ provider });
}

// 로그아웃
export async function signOut() {
  return supabase.auth.signOut();
}

// 현재 로그인한 유저 정보 반환 함수
export async function getCurrentUser() {
  // Supabase에서 현재 인증된 유저 정보 반환
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
}

// 내 프로필 정보 조회
export async function getMyProfile() {
  const { user, error: userError } = await getCurrentUser();
  if (!user || userError) return { profile: null, error: userError };
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { profile: data, error };
} 