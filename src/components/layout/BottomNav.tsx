// 하단 탭 네비게이션(BottomNav) 컴포넌트입니다.
// 홈, 지도, 즐겨찾기, 프로필 등 주요 메뉴로 이동할 수 있습니다.
import React from 'react';

export interface BottomNavProps {
  current: 'home' | 'map' | 'favorites' | 'profile';
  onNavigate: (tab: 'home' | 'map' | 'favorites' | 'profile') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ current, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-16 bg-white/90 backdrop-blur border-t flex justify-around items-center z-20 shadow-t transition-all">
      <button
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${current === 'home' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`}
        onClick={() => onNavigate('home')}
        aria-label="홈"
      >
        <span className="text-2xl">🏠</span>
      </button>
      <button
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${current === 'map' ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-400'}`}
        onClick={() => onNavigate('map')}
        aria-label="지도"
      >
        <span className="text-2xl">🗺️</span>
      </button>
      <button
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${current === 'favorites' ? 'text-yellow-500 scale-110' : 'text-gray-400 hover:text-yellow-400'}`}
        onClick={() => onNavigate('favorites')}
        aria-label="즐겨찾기"
      >
        <span className="text-2xl">⭐</span>
      </button>
      <button
        className={`flex flex-col items-center justify-center w-16 h-16 transition-colors ${current === 'profile' ? 'text-gray-800 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
        onClick={() => onNavigate('profile')}
        aria-label="프로필"
      >
        <span className="text-2xl">👤</span>
      </button>
    </nav>
  );
};

export default BottomNav; 