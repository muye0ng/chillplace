// 인증 폼 컴포넌트 (이메일/비밀번호, Google, Kakao 소셜 로그인)
// Tailwind, shadcn/ui 스타일 적용, 모든 주석 한국어
'use client';
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface AuthFormProps {
  onAuthSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이메일/비밀번호 로그인
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else onAuthSuccess?.();
  };

  // Google 로그인
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) setError(error.message);
  };

  // Kakao 로그인
  const handleKakaoLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'kakao' });
    setLoading(false);
    if (error) setError(error.message);
  };

  return (
    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-md max-w-sm w-full mx-auto animate-fade-in">
      <h2 className="text-xl font-bold text-center mb-2">로그인 / 회원가입</h2>
      <input
        type="email"
        className="border border-gray-200 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
        placeholder="이메일"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="border border-gray-200 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200"
        placeholder="비밀번호"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition" disabled={loading}>
        {loading ? '로딩 중...' : '이메일로 로그인'}
      </button>
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition" disabled={loading}>
        <img src="/icons/google.svg" alt="Google" className="w-5 h-5" /> Google로 로그인
      </button>
      <button type="button" onClick={handleKakaoLogin} className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition" disabled={loading}>
        <img src="/icons/kakao.svg" alt="Kakao" className="w-5 h-5" /> 카카오로 로그인
      </button>
      {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
    </form>
  );
};

export default AuthForm; 