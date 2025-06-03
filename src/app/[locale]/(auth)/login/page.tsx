// (auth) 로그인 페이지 템플릿
// AuthForm 컴포넌트 사용, 추후 소셜 로그인/회원가입 연동 예정
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">로그인</h1>
      <AuthForm />
    </main>
  );
} 