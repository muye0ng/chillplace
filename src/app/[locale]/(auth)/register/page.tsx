// 이 파일은 회원가입 페이지입니다.
// 추후 소셜 회원가입 및 약관 동의 로직이 추가될 예정입니다.
import React from 'react';

const RegisterPage = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md max-w-sm w-full mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">회원가입</h1>
        {/* 소셜 회원가입 버튼 영역 */}
        <button className="w-full py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg mb-2 flex items-center justify-center gap-2 transition font-medium">
          <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
          Google로 회원가입
        </button>
        <button className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-300 dark:bg-yellow-500 dark:hover:bg-yellow-400 text-gray-900 dark:text-gray-800 rounded-lg mb-2 flex items-center justify-center gap-2 transition font-medium">
          <img src="/icons/kakao.svg" alt="Kakao" className="w-5 h-5" />
          Kakao로 회원가입
        </button>
        <button className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition font-medium">
          <img src="/icons/naver.svg" alt="Naver" className="w-5 h-5" />
          Naver로 회원가입
        </button>
      </div>
    </main>
  );
};

export default RegisterPage; 