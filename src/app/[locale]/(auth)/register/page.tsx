// 이 파일은 회원가입 페이지입니다.
// 추후 소셜 회원가입 및 약관 동의 로직이 추가될 예정입니다.
import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    // 회원가입 성공 시 메인 페이지로 이동
    router.push('/ko');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">회원가입</h1>
      <AuthForm defaultMode="signup" onAuthSuccess={handleAuthSuccess} />
    </main>
  );
} 