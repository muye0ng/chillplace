"use client";
// 이 파일은 지도 검색 페이지입니다.
// 비회원도 접근 가능하며, PC/모바일 반응형 레이아웃이 적용됩니다.
import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import KakaoMap from '@/components/map/KakaoMap';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import SignupPromptModal from '@/components/auth/SignupPromptModal';
import ThemeToggle from '@/components/ui/ThemeToggle';
import useSWR from 'swr';
import { fetchAllPlaces } from '@/lib/supabase/places';
import { signOut } from '@/lib/supabase/auth';

// SWR fetcher 함수
const fetcher = async () => {
  const { data, error } = await fetchAllPlaces();
  if (error) throw error;
  return data;
};

// 지도 페이지 - 비회원도 접근 가능, 상세보기는 모든 사용자 허용
export default function MapPage() {
  const router = useRouter();
  const { isAuthenticated, requireAuth, showSignupModal, setShowSignupModal, user } = useAuthGuard();
  const [currentAction, setCurrentAction] = useState<string>('');
  const [isDesktop, setIsDesktop] = useState(false);

  // 반응형 체크
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 장소 데이터 SWR로 실시간 fetch
  const { data: places = [] } = useSWR('places', fetcher, { refreshInterval: 5000 });
  
  // 지도 중심 좌표(장소 있으면 첫 번째, 없으면 서울시청)
  const center = places.length > 0 ? { lat: places[0].lat, lng: places[0].lng } : { lat: 37.5665, lng: 126.9780 };

  const handleMarkerClick = (id: string) => {
    // 상세보기는 비회원도 허용
    router.push(`/ko/place/${id}`);
  };

  const handlePlaceCreate = () => {
    setCurrentAction('새로운 장소 등록');
    requireAuth('createPlace', () => {
      router.push('/ko/place/new');
    });
  };

  return (
    <main className={`flex flex-col min-h-screen bg-white dark:bg-gray-900`}>
      {/* PC: 상단 네비게이션, 모바일: 기존 헤더 */}
      {isDesktop ? (
        <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                칠 플레이스 지도
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push('/ko')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                홈
              </button>
              <button 
                onClick={() => router.push('/ko/favorites')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                즐겨찾기
              </button>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => router.push('/ko/profile')}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    프로필
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</span>
                    <button 
                      onClick={() => {
                        signOut();
                        router.push('/ko');
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors text-sm"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => router.push('/ko/login')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  로그인
                </button>
              )}
              <ThemeToggle variant="desktop" />
            </div>
          </div>
        </nav>
      ) : (
        <Header title="지도" showBack onBack={() => router.back()} />
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        <div className={`h-full ${isDesktop ? 'p-8' : 'p-4'}`}>
          <div className={`${isDesktop ? 'max-w-7xl mx-auto' : 'w-full'} h-full`}>
            {/* 지도 정보 헤더 */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                주변 장소 지도
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                총 {places.length}개의 장소가 등록되어 있습니다
              </p>
            </div>

            {/* 카카오맵 */}
            <div className={`w-full ${isDesktop ? 'h-[600px]' : 'h-[400px]'} rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700`}>
              <KakaoMap
                center={center}
                places={places}
                onMarkerClick={handleMarkerClick}
              />
            </div>

            {/* 지도 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{places.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">등록된 장소</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">2.5km</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">검색 반경</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Live</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">실시간 업데이트</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">FREE</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">무료 이용</div>
              </div>
            </div>

            {/* 장소 등록 유도 */}
            {places.length === 0 && (
              <div className="mt-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-400">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  주변에 등록된 장소가 없습니다
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  첫 번째 장소를 등록하여 지도를 채워보세요!
                </p>
                <button
                  onClick={handlePlaceCreate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-colors"
                >
                  장소 등록하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 플로팅 장소 등록 버튼 (모바일에서만) */}
      {!isDesktop && places.length > 0 && (
        <button
          onClick={handlePlaceCreate}
          className="fixed bottom-24 right-6 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl z-50 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      {/* 회원가입 유도 모달 */}
      <SignupPromptModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        action={currentAction}
      />

      {/* 하단 네비게이션 (모바일에서만) */}
      {!isDesktop && (
        <BottomNav
          current="map"
          onNavigate={(tab) => {
            if (tab === 'home') router.push('/ko');
            if (tab === 'map') router.push('/ko/map');
            if (tab === 'favorites') router.push('/ko/favorites');
            if (tab === 'profile') router.push('/ko/profile');
          }}
        />
      )}
    </main>
  );
} 