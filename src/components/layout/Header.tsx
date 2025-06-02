// 상단 네비게이션(Header) 컴포넌트입니다.
// 앱 이름, 뒤로가기, 주요 메뉴 등을 표시합니다.
import React, { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@/lib/supabase/auth';
import Link from 'next/link';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import NotificationBell from './NotificationBell';

export interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title = '오늘 뭐하지?', showBack, onBack }) => {
  // 로그인 상태/유저명 표시
  const [user, setUser] = useState<SupabaseUser | null>(null);
  useEffect(() => {
    getCurrentUser().then(({ user }) => setUser(user));
  }, []);

  return (
    <header className="w-full flex items-center h-12 px-4 bg-white border-b">
      {showBack && (
        <button className="mr-2" onClick={onBack} aria-label="뒤로가기">
          ←
        </button>
      )}
      <h1 className="text-lg font-bold flex-1 text-center">{title}</h1>
      {/* 우측 메뉴/아이콘 영역 (로그인 상태/유저명) */}
      <div className="w-auto flex items-center gap-2">
        {user ? (
          <>
            <NotificationBell userId={user.id} />
            <span className="text-xs text-gray-700">{user.email}</span>
            <button className="text-xs text-blue-500" onClick={signOut}>로그아웃</button>
          </>
        ) : (
          <Link href="/ko/(auth)/login" className="text-xs text-blue-500">로그인</Link>
        )}
      </div>
    </header>
  );
};

export default Header; 