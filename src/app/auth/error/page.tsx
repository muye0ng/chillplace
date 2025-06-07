'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'NextAuth.js 설정에 문제가 있습니다.';
      case 'AccessDenied':
        return '접근이 거부되었습니다.';
      case 'Verification':
        return '토큰 검증에 실패했습니다.';
      case 'Default':
        return '인증 중 알 수 없는 오류가 발생했습니다.';
      case 'Callback':
        return 'OAuth 콜백 처리 중 오류가 발생했습니다. 네이버 개발자센터 설정을 확인해주세요.';
      default:
        return error ? `오류: ${error}` : '알 수 없는 인증 오류가 발생했습니다.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            로그인 오류
          </h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            {getErrorMessage(error)}
          </p>

          {/* 디버깅 정보 */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">디버깅 정보:</h3>
            <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {JSON.stringify({ 
                error,
                url: window.location.href,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/ko"
              className="w-full inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              메인페이지로 돌아가기
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 