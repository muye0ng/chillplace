// 이 파일은 로그인 페이지입니다.
// 추후 소셜 로그인 버튼 및 인증 로직이 추가될 예정입니다.
import React from 'react';
import { signInWithProvider } from '@/lib/supabase/auth';

const LoginPage = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-4">로그인</h1>
      {/* 소셜 로그인 버튼 영역 */}
      <button
        className="w-full py-2 px-4 bg-black text-white rounded-lg mb-2"
        onClick={() => signInWithProvider('google')}
      >
        Google로 로그인
      </button>
      <button
        className="w-full py-2 px-4 bg-yellow-400 text-black rounded-lg mb-2"
        onClick={() => signInWithProvider('kakao')}
      >
        Kakao로 로그인
      </button>
      <button className="w-full py-2 px-4 bg-green-500 text-white rounded-lg opacity-50 cursor-not-allowed" disabled>
        Naver로 로그인(미지원)
      </button>
    </main>
  );
};

export default LoginPage; 