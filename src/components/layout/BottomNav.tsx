// 하단 탭 네비게이션(BottomNav) 컴포넌트입니다.
// 홈, 지도, 즐겨찾기, 프로필 등 주요 메뉴로 이동할 수 있습니다.
import React from 'react';

export interface BottomNavProps {
  current: 'home' | 'map' | 'favorites' | 'profile';
  onNavigate: (tab: 'home' | 'map' | 'favorites' | 'profile') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ current, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-around items-center z-20 shadow-sm transition-all">
      <button
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all ${
          current === 'home' 
            ? 'text-blue-600 dark:text-blue-400 scale-105' 
            : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
        }`}
        onClick={() => onNavigate('home')}
        aria-label="홈"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span className="text-xs mt-1">홈</span>
      </button>
      
      <button
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all ${
          current === 'map' 
            ? 'text-blue-600 dark:text-blue-400 scale-105' 
            : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
        }`}
        onClick={() => onNavigate('map')}
        aria-label="지도"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
        <span className="text-xs mt-1">지도</span>
      </button>
      
      <button
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all ${
          current === 'favorites' 
            ? 'text-yellow-500 dark:text-yellow-400 scale-105' 
            : 'text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
        }`}
        onClick={() => onNavigate('favorites')}
        aria-label="즐겨찾기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={current === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <span className="text-xs mt-1">즐겨찾기</span>
      </button>
      
      <button
        className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all ${
          current === 'profile' 
            ? 'text-gray-800 dark:text-gray-200 scale-105' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
        }`}
        onClick={() => onNavigate('profile')}
        aria-label="프로필"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span className="text-xs mt-1">프로필</span>
      </button>
    </nav>
  );
};

export default BottomNav; 