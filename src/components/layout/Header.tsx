// 상단 네비게이션(Header) 컴포넌트입니다.
// 앱 이름, 뒤로가기, 주요 메뉴 등을 표시합니다.
import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@/lib/supabase/auth';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

// NextAuth.js 사용자 타입 정의
interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title = '칠 플레이스', showBack, onBack }) => {
  // 로그인 상태/유저명 표시
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    getCurrentUser().then(({ user }) => setUser(user));
  }, []);

  return (
    <header className="w-full flex items-center h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-2">
        {showBack && (
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
            onClick={onBack} 
            aria-label="뒤로가기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
      </div>
      
      {/* 우측 메뉴/아이콘 영역 */}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <NotificationBell userId={user.id} />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-300 hidden sm:inline">{user.email}</span>
              <button 
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" 
                onClick={() => signOut()}
              >
                로그아웃
              </button>
            </div>
          </>
        ) : (
          <Link href="/ko/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">로그인</Link>
        )}
      </div>
    </header>
  );
};

export default Header; 