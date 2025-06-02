// 이 파일은 회원가입 페이지입니다.
// 추후 소셜 회원가입 및 약관 동의 로직이 추가될 예정입니다.
import React from 'react';

const RegisterPage = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-4">회원가입</h1>
      {/* 소셜 회원가입 버튼 영역 */}
      <button className="w-full py-2 px-4 bg-black text-white rounded-lg mb-2">Google로 회원가입</button>
      <button className="w-full py-2 px-4 bg-yellow-400 text-black rounded-lg mb-2">Kakao로 회원가입</button>
      <button className="w-full py-2 px-4 bg-green-500 text-white rounded-lg">Naver로 회원가입</button>
    </main>
  );
};

export default RegisterPage; 