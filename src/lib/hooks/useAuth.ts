// NextAuth.js 인증 상태 및 함수 제공 useAuth 훅
// 로그인/로그아웃/회원가입/사용자 정보 등 제공, 모든 주석 한국어
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth';
import { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
  [key: string]: unknown;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 세션 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    loading,
    user: session?.user ?? null,
  };
} 