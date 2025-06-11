'use client';

import dynamic from 'next/dynamic';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import SignupRedirectButton from '@/components/SignupRedirectButton';

// 동적 import로 hydration 오류 방지
const SwipeCardStack = dynamic(() => import('@/components/ui/SwipeCardStack'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">로딩 중...</div>
});

const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">지도 로딩 중...</div>
});

// 더미 장소 데이터
const dummyPlaces = [
  {
    id: '1',
    name: '스타벅스 강남점',
    category: '카페',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    distance: '150m',
    description: '조용한 분위기의 카페입니다.',
    lat: 37.498004,
    lng: 127.02762
  },
  {
    id: '2',
    name: '이디야 역삼점',
    category: '카페',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    distance: '230m',
    description: '합리적인 가격의 커피전문점입니다.',
    lat: 37.500350,
    lng: 127.031450
  },
  {
    id: '3',
    name: '도서관 카페',
    category: '카페',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    distance: '310m',
    description: '조용히 독서할 수 있는 공간입니다.',
    lat: 37.502100,
    lng: 127.029800
  },
  {
    id: '4',
    name: '맛집 삼계탕',
    category: '음식점',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    distance: '420m',
    description: '전통 삼계탕 전문점입니다.',
    lat: 37.496500,
    lng: 127.025400
  },
  {
    id: '5',
    name: '강남 CGV',
    category: '문화',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    distance: '280m',
    description: '최신 영화를 볼 수 있는 멀티플렉스입니다.',
    lat: 37.499200,
    lng: 127.026800
  },
  {
    id: '6',
    name: '현대백화점',
    category: '쇼핑',
    imageUrl: 'https://picsum.photos/400/300?random=6',
    distance: '320m',
    description: '프리미엄 쇼핑몰입니다.',
    lat: 37.497800,
    lng: 127.027500
  },
  {
    id: '7',
    name: '피트니스센터',
    category: '스포츠',
    imageUrl: 'https://picsum.photos/400/300?random=7',
    distance: '180m',
    description: '24시간 운영되는 헬스장입니다.',
    lat: 37.501500,
    lng: 127.030200
  },
  {
    id: '8',
    name: '강남세브란스병원',
    category: '병원',
    imageUrl: 'https://picsum.photos/400/300?random=8',
    distance: '450m',
    description: '종합병원입니다.',
    lat: 37.494800,
    lng: 127.023600
  },
  {
    id: '9',
    name: '파스타 레스토랑',
    category: '음식점',
    imageUrl: 'https://picsum.photos/400/300?random=9',
    distance: '200m',
    description: '정통 이탈리안 파스타 전문점입니다.',
    lat: 37.503200,
    lng: 127.028900
  },
  {
    id: '10',
    name: '올리브영',
    category: '쇼핑',
    imageUrl: 'https://picsum.photos/400/300?random=10',
    distance: '120m',
    description: '화장품과 생활용품 매장입니다.',
    lat: 37.499800,
    lng: 127.025800
  }
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false); // 로그인 유도 팝업
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>(dummyPlaces[0]?.id);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  // 회원탈퇴 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 카테고리별 필터링된 장소 목록
  const filteredPlaces = selectedCategory === '전체' 
    ? dummyPlaces 
    : dummyPlaces.filter(place => place.category === selectedCategory);

  // 카테고리 변경 시 첫 번째 장소로 선택 초기화
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const filtered = category === '전체' ? dummyPlaces : dummyPlaces.filter(place => place.category === category);
    setSelectedPlaceId(filtered[0]?.id);
  };

  // 반응형 체크
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 로그인 모달 상태 추적
  useEffect(() => {
    console.log('Login modal state changed:', showLoginModal);
  }, [showLoginModal]);

  // 로그아웃 처리
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ 
        redirect: false
      });
      window.location.href = '/ko';
    } catch (error) {
      console.error('로그아웃 오류:', error);
      setIsLoggingOut(false);
    }
  };

  // 회원탈퇴 처리
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '회원탈퇴') {
      alert('"회원탈퇴"를 정확히 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText: '회원탈퇴' })
      });

      const result = await response.json();

      if (result.success) {
        await signOut({ redirect: false });
        window.location.href = '/ko';
      } else {
        alert(`회원탈퇴 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      alert('회원탈퇴 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  // 로그인 모달 표시
  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  // 지도 페이지로 이동 (모바일용)
  const goToMap = () => {
    router.push('/ko/map');
  };

  // 권한이 필요한 액션들
  const handleSwipeLeft = async (placeId: string) => {
    console.log('Swipe left triggered, session:', session);
    if (!session) {
      console.log('No session, showing auth prompt');
      setShowAuthPrompt(true);
      return false;
    }
    console.log('Dislike:', placeId);
    return true;
  };

  const handleSwipeRight = async (placeId: string) => {
    console.log('Swipe right triggered, session:', session);
    if (!session) {
      console.log('No session, showing auth prompt');
      setShowAuthPrompt(true);
      return false;
    }
    console.log('Like:', placeId);
    return true;
  };

  const handleCardTap = (placeId: string) => {
    console.log('Card tapped:', placeId);
    setSelectedPlaceId(placeId);
  };

  const handleMarkerClick = (placeId: string) => {
    console.log('Marker clicked:', placeId);
    setSelectedPlaceId(placeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* 테스트 버튼 - 맨 위에 표시 */}
      <SignupRedirectButton />
      
      {/* 상단 네비게이션 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                칠 플레이스
              </h1>
            </div>

            {/* 우측 메뉴 */}
            <div className="flex items-center space-x-4">
              {/* 모바일에서만 지도 버튼 */}
              {!isDesktop && (
                <button
                  onClick={goToMap}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  지도
                </button>
              )}

              {/* 로그인 상태에 따른 표시 */}
              {session ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                  </button>
                  {/* 회원탈퇴 버튼 */}
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 hover:border-red-400 rounded transition-colors"
                  >
                    회원탈퇴
                  </button>
                </div>
              ) : (
                status !== 'loading' && (
                  <button
                    onClick={handleLoginClick}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    로그인
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1">
        {isDesktop ? (
          // PC 레이아웃: 카드 + 지도 분할 화면
          <div className="h-[calc(100vh-4rem)] flex gap-8 p-8">
            {/* 왼쪽: 카드 스택 영역 (62%) */}
            <div className="flex-[1.618] flex flex-col">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 h-full">
                <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
                  {/* 헤더 */}
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      새로운 장소 발견하기
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      주변의 특별한 장소들을 찾아보세요
                    </p>
                  </div>
                  
                  {/* 심플한 카테고리 필터 */}
                  <div className="mb-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        { name: '전체', color: 'from-purple-500 to-pink-500' },
                        { name: '카페', color: 'from-amber-500 to-orange-500' },
                        { name: '음식점', color: 'from-red-500 to-rose-500' },
                        { name: '쇼핑', color: 'from-green-500 to-emerald-500' },
                        { name: '문화', color: 'from-indigo-500 to-purple-500' },
                        { name: '스포츠', color: 'from-blue-500 to-cyan-500' },
                        { name: '병원', color: 'from-teal-500 to-green-500' }
                      ].map((category) => (
                        <button
                          key={category.name}
                          onClick={() => handleCategoryChange(category.name)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                            selectedCategory === category.name
                              ? `bg-gradient-to-r ${category.color} text-white shadow-md border-transparent`
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 카드 스택 영역 */}
                  <div className="flex-1 flex items-center justify-center">
                    <SwipeCardStack 
                      places={filteredPlaces}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onCardTap={handleCardTap}
                      isDesktop={true}
                      selectedPlaceId={selectedPlaceId}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 지도 영역 (38%) */}
            <div className="flex-1 flex flex-col">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 h-full flex flex-col overflow-hidden">
                {/* 지도 헤더 */}
                <div className="p-6 border-b border-white/20">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="text-2xl mr-3">🗺️</span>
                    주변 지도
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {filteredPlaces.length}개의 장소가 있습니다
                  </p>
                </div>
                
                {/* 지도 */}
                <div className="flex-1 relative">
                  <InteractiveMap 
                    places={filteredPlaces}
                    selectedPlaceId={selectedPlaceId}
                    onMarkerClick={handleMarkerClick}
                    className="w-full h-full"
                  />
                </div>
                
                {/* 지도 통계 */}
                <div className="p-6 border-t border-white/20">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="text-lg mr-2">📍</span>
                    주변 정보
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {filteredPlaces.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">장소</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl">
                      <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        2.5km
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">반경</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 모바일 레이아웃: 카드만
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            <SwipeCardStack 
              places={filteredPlaces}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onCardTap={handleCardTap}
              isDesktop={false}
              selectedPlaceId={selectedPlaceId}
            />
          </div>
        )}
      </main>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9998] p-4">
          {/* 배경 블러 */}
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md" />
          {/* 컨텐츠 */}
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-md border border-white/20 dark:border-gray-700/30">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                간편 로그인
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                소셜 계정으로 빠르게 시작하세요
              </p>
            </div>

            <div className="space-y-3">
              {/* Google 로그인 */}
              <button
                onClick={() => signIn('google', { callbackUrl: '/ko' })}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 시작하기
              </button>

              {/* 네이버 로그인 */}
              <button
                onClick={() => signIn('naver', { callbackUrl: '/ko' })}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#03C75A] hover:bg-[#02B351] transition-colors"
              >
                <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-[#03C75A] font-bold text-sm">N</span>
                </div>
                <span className="text-white font-medium">네이버로 시작하기</span>
              </button>

              {/* 카카오 로그인 */}
              <button
                onClick={() => signIn('kakao', { callbackUrl: '/ko' })}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#FEE500] hover:bg-[#FCDC00] transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#000000">
                  <path d="M12 3C7.03 3 3 6.14 3 10.1c0 2.53 1.63 4.76 4.08 6.09l-.98 3.65c-.07.26.16.49.41.34l4.24-2.81c.75.06 1.52.06 2.25 0l4.24 2.81c.25.15.48-.08.41-.34l-.98-3.65C18.37 14.86 21 12.63 21 10.1 21 6.14 16.97 3 12 3z"/>
                </svg>
                <span className="text-black font-medium">카카오로 시작하기</span>
              </button>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="w-full mt-4 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 로그인 유도 팝업 */}
      {showAuthPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          {/* 배경 블러 */}
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md" />
          {/* 컨텐츠 */}
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/20 dark:border-gray-700/30">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                로그인이 필요해요
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                장소에 좋아요를 표시하려면<br />로그인이 필요합니다
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowAuthPrompt(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors"
                >
                  로그인하기
                </button>
                <button
                  onClick={() => setShowAuthPrompt(false)}
                  className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  나중에
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
              ⚠️ 회원탈퇴 확인
            </h3>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2">정말로 회원탈퇴를 하시겠습니까?</p>
              <p className="mb-2 text-red-600 dark:text-red-400 font-medium">
                • 모든 데이터가 영구적으로 삭제됩니다
              </p>
              <p className="mb-2 text-red-600 dark:text-red-400 font-medium">
                • 복구가 불가능합니다
              </p>
              <p className="mb-4">
                계속하려면 아래에 <strong>&quot;회원탈퇴&quot;</strong>를 정확히 입력해주세요:
              </p>
            </div>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="회원탈퇴"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== '회원탈퇴'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? '탈퇴 중...' : '회원탈퇴'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 