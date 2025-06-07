'use client';
// NextAuth.js 통합 소셜 로그인 (Google, Kakao, Naver)
// Supabase OAuth 제거, NextAuth.js로 완전 통일

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

interface AuthFormProps {
  onAuthSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 통합 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`${provider} 로그인 시도 중...`);
      
      const result = await signIn(provider, { 
        redirect: false,
        callbackUrl: '/ko'
      });
      
      console.log(`${provider} 로그인 결과:`, result);
      
      if (result?.error) {
        let errorMessage = `${provider} 로그인 오류: ${result.error}`;
        
        // 카카오 로그인 특정 오류 처리
        if (provider === 'kakao') {
          if (result.error.includes('access_denied')) {
            errorMessage = '카카오 로그인이 취소되었습니다.';
          } else if (result.error.includes('server_error')) {
            errorMessage = '카카오 서버 오류입니다. 잠시 후 다시 시도해주세요.';
          } else if (result.error.includes('invalid_client')) {
            errorMessage = '카카오 앱 설정 오류입니다. 관리자에게 문의하세요.';
          }
        }
        
        setError(errorMessage);
        console.error(`${provider} OAuth 오류:`, result.error);
      } else if (result?.ok) {
        console.log(`${provider} 로그인 성공!`);
        onAuthSuccess?.();
        // 수동 리다이렉트 (redirect: false이므로)
        window.location.href = '/ko';
      }
    } catch (err) {
      console.error(`${provider} 로그인 예외:`, err);
      setError(`${provider} 로그인 중 예기치 않은 오류가 발생했습니다.`);
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          간편 로그인
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          소셜 계정으로 빠르게 시작하세요
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Google 로그인 버튼 */}
        <button
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-gray-700 dark:text-gray-200 font-medium">
            Google로 시작하기
          </span>
        </button>

        {/* 네이버 로그인 버튼 */}
        <button
          onClick={() => handleSocialLogin('naver')}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#03C75A] hover:bg-[#02B351] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
            <span className="text-[#03C75A] font-bold text-sm">N</span>
          </div>
          <span className="text-white font-medium">
            네이버로 시작하기
          </span>
        </button>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={() => handleSocialLogin('kakao')}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#FEE500] hover:bg-[#FCDC00] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#000000">
            <path d="M12 3C7.03 3 3 6.14 3 10.1c0 2.53 1.63 4.76 4.08 6.09l-.98 3.65c-.07.26.16.49.41.34l4.24-2.81c.75.06 1.52.06 2.25 0l4.24 2.81c.25.15.48-.08.41-.34l-.98-3.65C18.37 14.86 21 12.63 21 10.1 21 6.14 16.97 3 12 3z"/>
          </svg>
          <span className="text-black font-medium">
            카카오로 시작하기
          </span>
        </button>
      </div>

      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            로그인 중...
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
};

export default AuthForm; 