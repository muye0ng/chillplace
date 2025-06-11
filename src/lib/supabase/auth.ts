// NextAuth.js 인증 관련 함수 모음입니다.
// 소셜 로그인, 로그아웃 등 함수를 NextAuth.js로 대체
import { signIn, signOut as nextAuthSignOut, getSession } from 'next-auth/react';
import { supabase } from './client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

// 소셜 로그인 (Google, Kakao, Naver)
export async function signInWithProvider(provider: 'google' | 'kakao' | 'naver') {
  return signIn(provider);
}

// 로그아웃 - 다른 파일에서 signOut으로 import할 수 있도록 export
export const signOut = nextAuthSignOut;

// 로그아웃 (기존 함수명 유지)
export async function signOutUser() {
  return nextAuthSignOut();
}

// 사용자 타입 정의
export interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  preferred_language: string;
  interested_categories: string[];
  location_radius: number;
  created_at: string;
  updated_at: string;
}

// 현재 사용자 정보 가져오기 (서버 사이드)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    // 1. 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .schema('next_auth')
      .from('users')
      .select('id, email, name, image')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      console.error('사용자 정보 조회 실패:', userError);
      return null;
    }

    // 2. 프로필 정보 조회
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (profileError) {
      console.error('프로필 정보 조회 실패:', profileError);
      return null;
    }

    return {
      ...userData,
      ...profileData
    };
  } catch (error) {
    console.error('getCurrentUser 오류:', error);
    return null;
  }
}

// 현재 사용자 프로필 가져오기
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;
    return data as Profile;
  } catch (error) {
    console.error('getCurrentProfile 오류:', error);
    return null;
  }
}

// 프로필 업데이트
export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return !error;
  } catch (error) {
    console.error('updateProfile 오류:', error);
    return false;
  }
}

// 사용자 삭제 (회원탈퇴)
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    // profiles, accounts, sessions 등은 CASCADE로 자동 삭제됨
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    return !error;
  } catch (error) {
    console.error('deleteUser 오류:', error);
    return false;
  }
}

// 클라이언트 사이드에서 사용할 훅들
export function useCurrentUser() {
  // 클라이언트에서는 NextAuth useSession 사용
  // 서버 데이터는 별도 SWR/React Query로 관리
}

// 데이터베이스 연결 테스트
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tables?: string[];
}> {
  try {
    // public 스키마의 테이블 목록 확인
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        message: `데이터베이스 연결 실패: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'public 스키마 연결 성공!',
      tables: ['users', 'accounts', 'sessions', 'profiles', 'places', 'reviews', 'votes', 'favorites']
    };
  } catch (error) {
    return {
      success: false,
      message: `연결 테스트 오류: ${error}`
    };
  }
}

// 내 프로필 조회 (실제 구현)
export async function getMyProfile() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return null;
    }

    const response = await fetch('/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('프로필 조회 실패:', response.status);
      return null;
    }

    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('프로필 조회 중 오류:', error);
    return null;
  }
} 