// Supabase 인증 상태 및 함수 제공 useAuth 훅
// 로그인/로그아웃/회원가입/사용자 정보 등 제공, 모든 주석 한국어
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  email: string | null;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 인증 상태 구독 및 초기화
  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      setUser(data.user ? { ...data.user, email: data.user.email ?? null } : null);
      setLoading(false);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 로그인 함수
  const login = useCallback(async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  // 회원가입 함수
  const signup = useCallback(async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  }, []);

  // 로그아웃 함수
  const logout = useCallback(async () => {
    return supabase.auth.signOut();
  }, []);

  return { user, loading, login, signup, logout };
} 