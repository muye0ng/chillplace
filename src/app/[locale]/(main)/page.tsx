"use client";
// 이 파일은 메인 피드 페이지입니다.
// 권한 관리와 PC/모바일 반응형 레이아웃이 적용된 장소 추천 서비스입니다.
import React, { useEffect, useState } from 'react';
import { fetchAllPlaces } from '@/lib/supabase/places';
import { votePlace } from '@/lib/supabase/votes';
import type { Place } from '@/types/database';
import { useRouter } from 'next/navigation';
import AdModal from '@/components/layout/AdModal';
import BottomNav from '@/components/layout/BottomNav';
import { useFavorites } from '@/lib/hooks/useFavorites';
import Snackbar from '@/components/layout/Snackbar';
import StoryBar, { StoryItem } from '@/components/ui/StoryBar';
import Header from '@/components/layout/Header';
import ThemeToggle from '@/components/ui/ThemeToggle';
import OnboardingBanner from '@/components/ui/OnboardingBanner';
import SwipeCardStack from '@/components/ui/SwipeCardStack';
import ReviewModal from '@/components/ui/ReviewModal';
import HeroSection from '@/components/layout/HeroSection';
import DesktopLayout from '@/components/layout/DesktopLayout';
import SignupPromptModal from '@/components/auth/SignupPromptModal';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { signOut } from '@/lib/supabase/auth';

// SWR fetcher 함수
const fetcher = async () => {
  const { data, error } = await fetchAllPlaces();
  if (error) throw error;
  return data;
};

const MainFeedPage = () => {
  // 권한 관리
  const { 
    isAuthenticated, 
    requireAuth, 
    showSignupModal, 
    setShowSignupModal,
    user
  } = useAuthGuard();

  // 장소 목록 상태 (SWR)
  const { data: places = [], error, isLoading } = useSWR('places', fetcher, { refreshInterval: 5000 });
  const router = useRouter();
  
  // 상태 관리
  const [showAd, setShowAd] = useState(false);
  const [showHero, setShowHero] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const { add: addFavorite } = useFavorites();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ 
    open: false, message: '', type: 'success' 
  });

  // 리뷰 모달 상태
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    place: Place | null;
  }>({ isOpen: false, place: null });

  // 이미지 URL 유효성 검사 함수
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url || url.length < 4) return false;
    try {
      return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  // 카드 데이터 준비
  const swipeCards = places.map((place: Place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    imageUrl: isValidImageUrl(place.image_url) ? place.image_url! : '/icons/icon-192x192.png',
    distance: '0.0km', // TODO: 실제 거리 계산
    description: `${place.category} • 새로운 경험을 찾고 있다면 이곳을 추천해요!`
  }));

  // 반응형 체크 - PC인지 모바일인지 확인
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // PC에서 첫 방문 시 히어로 섹션 표시
  useEffect(() => {
    if (isDesktop && !localStorage.getItem('hero_seen')) {
      setShowHero(true);
    }
  }, [isDesktop]);

  // 광고 숨김 여부(localStorage) 확인
  useEffect(() => {
    if (!isDesktop) {
      const hideUntil = localStorage.getItem('ad_hide_until');
      if (!hideUntil || Date.now() > Number(hideUntil)) {
        setShowAd(true);
      }
    }
  }, [isDesktop]);

  const handleHideAd = (duration: '1hour' | '1day' | 'never') => {
    let ms = 0;
    if (duration === '1hour') ms = 60 * 60 * 1000;
    if (duration === '1day') ms = 24 * 60 * 60 * 1000;
    if (duration === 'never') ms = 100 * 365 * 24 * 60 * 60 * 1000; // 100년
    localStorage.setItem('ad_hide_until', String(Date.now() + ms));
    setShowAd(false);
  };

  const ad = {
    title: '칠 플레이스 오픈 이벤트',
    content: '지금 가입하면 추첨을 통해 커피 기프티콘 증정!',
    imageUrl: '/ad/event.png',
    targetUrl: 'https://event.example.com',
  };

  // 스토리/이벤트/온보딩/공지 등 예시 데이터
  const stories: StoryItem[] = [
    { 
      id: 'event', 
      label: '이벤트', 
      colorFrom: 'pink-400', 
      colorTo: 'yellow-400', 
      onClick: () => {
        setSnackbar({ 
          open: true, 
          message: '🎉 칠 플레이스 오픈 이벤트! 지금 가입하면 커피 기프티콘 증정!', 
          type: 'success' 
        });
      }
    },
    { 
      id: 'guide', 
      label: '이용가이드', 
      colorFrom: 'blue-400', 
      colorTo: 'green-400', 
      onClick: () => {
        setSnackbar({ 
          open: true, 
          message: '📖 틴더 스타일로 스와이프하여 취향에 맞는 장소를 찾아보세요!', 
          type: 'success' 
        });
      }
    },
    { 
      id: 'community', 
      label: '커뮤니티', 
      colorFrom: 'purple-400', 
      colorTo: 'pink-400', 
      onClick: () => {
        setSnackbar({ 
          open: true, 
          message: '👥 다른 사용자들의 리뷰와 추천을 확인해보세요!', 
          type: 'success' 
        });
      }
    },
  ];

  // 스와이프 핸들러 (권한 체크 포함)
  const handleSwipeLeft = async (placeId: string) => {
    console.log('🔍 스와이프 왼쪽 시도 - 로그인 상태:', isAuthenticated, 'User:', user);
    setCurrentAction('장소에 대한 평가');
    
    // 권한 체크 먼저 수행
    if (!isAuthenticated) {
      setShowSignupModal(true);
      return false; // 권한 없음
    }
    
    // 권한이 있을 때만 실제 로직 실행
    try {
      await votePlace(placeId, 'no');
      setSnackbar({ 
        open: true, 
        message: '👋 다음 장소를 확인해보세요!', 
        type: 'success' 
      });
      return true; // 성공
    } catch {
      setSnackbar({ 
        open: true, 
        message: '오류가 발생했습니다.', 
        type: 'error' 
      });
      return false; // 실패
    }
  };

  const handleSwipeRight = async (placeId: string) => {
    console.log('❤️ 스와이프 오른쪽 시도 - 로그인 상태:', isAuthenticated, 'User:', user);
    setCurrentAction('장소 좋아요 및 리뷰 작성');
    
    // 권한 체크 먼저 수행
    if (!isAuthenticated) {
      setShowSignupModal(true);
      return false; // 권한 없음
    }
    
    // 권한이 있을 때만 실제 로직 실행
    try {
      const place = places.find((p: Place) => p.id === placeId);
      if (place) {
        // 좋아요 투표
        await votePlace(placeId, 'like');
        // 즐겨찾기 추가
        await addFavorite(placeId);
        // 리뷰 모달 열기
        setReviewModal({ isOpen: true, place });
      }
      return true; // 성공
    } catch {
      setSnackbar({ 
        open: true, 
        message: '오류가 발생했습니다.', 
        type: 'error' 
      });
      return false; // 실패
    }
  };

  const handleCardTap = (placeId: string) => {
    // 상세보기는 비회원도 허용
    router.push(`/ko/place/${placeId}`);
  };

  const handleReviewSubmit = async (review: string) => {
    try {
      // TODO: 리뷰 저장 로직 구현
      console.log('리뷰 저장:', review, reviewModal.place?.name);
      setSnackbar({ 
        open: true, 
        message: '✨ 리뷰가 등록되었습니다!', 
        type: 'success' 
      });
    } catch {
      setSnackbar({ 
        open: true, 
        message: '리뷰 등록 중 오류가 발생했습니다.', 
        type: 'error' 
      });
    }
  };

  const handlePlaceCreate = () => {
    setCurrentAction('새로운 장소 등록');
    requireAuth('createPlace', () => {
      router.push('/ko/place/new');
    });
  };

  const handleGetStarted = () => {
    localStorage.setItem('hero_seen', 'true');
    setShowHero(false);
  };

  // 히어로 섹션 표시 중일 때
  if (showHero && isDesktop) {
    return (
      <>
        <HeroSection onGetStarted={handleGetStarted} />
        <SignupPromptModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          action={currentAction}
        />
      </>
    );
  }

  return (
    <main className={`flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
      {/* PC: 상단 네비게이션, 모바일: 기존 헤더 */}
      {isDesktop ? (
        <nav className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                칠 플레이스
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => router.push('/ko/map')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                지도
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white font-medium rounded-lg transition-colors shadow-lg"
                >
                  로그인
                </button>
              )}
              <ThemeToggle variant="desktop" />
            </div>
          </div>
        </nav>
      ) : (
        <Header title="칠 플레이스" />
      )}
      
      {/* 모바일에서만 온보딩 배너와 스토리바 표시 */}
      {!isDesktop && (
        <>
          <OnboardingBanner />
          <StoryBar stories={stories} />
        </>
      )}

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {isDesktop ? (
          // PC 레이아웃
          <div className="h-full p-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto h-full">
              <DesktopLayout
                places={swipeCards}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onCardTap={handleCardTap}
                loading={isLoading}
                error={error}
              />
            </div>
          </div>
        ) : (
          // 모바일 레이아웃 (기존)
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-900">
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <p className="text-blue-500 dark:text-blue-300 font-medium">새로운 장소를 찾고 있어요...</p>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <p className="text-red-500 dark:text-red-300 font-medium">에러: {error instanceof Error ? error.message : String(error)}</p>
              </motion.div>
            )}

            {!isLoading && places.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-400">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12h8"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  주변에 등록된 장소가 없습니다
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  첫 리뷰의 주인공이 되어보세요!
                </p>
                <button
                  onClick={handlePlaceCreate}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-colors"
                >
                  장소 등록하기
                </button>
              </motion.div>
            )}

            {!isLoading && places.length > 0 && (
              <SwipeCardStack
                places={swipeCards}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onCardTap={handleCardTap}
              />
            )}
          </div>
        )}
      </div>

      {/* 플로팅 장소 등록 버튼 (모바일에서만) */}
      {!isDesktop && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.5 }}
          className="fixed top-20 right-6 bg-gradient-to-tr from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 dark:from-blue-800 dark:to-blue-700 dark:hover:from-blue-900 dark:hover:to-blue-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl z-50 transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200"
          onClick={handlePlaceCreate}
          aria-label="장소 등록"
          title="장소 등록"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.button>
      )}
      
      {/* 테마 토글 버튼 (모바일에서만) */}
      {!isDesktop && (
        <div className="fixed bottom-24 right-6 z-50">
          <ThemeToggle />
        </div>
      )}

      {/* 광고 모달 (모바일에서만) */}
      {!isDesktop && showAd && (
        <AdModal ad={ad} onClose={() => setShowAd(false)} onHideFor={handleHideAd} />
      )}

      {/* 리뷰 모달 */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, place: null })}
        onSubmit={handleReviewSubmit}
        placeName={reviewModal.place?.name || ''}
        placeImage={reviewModal.place?.image_url || '/icons/icon-192x192.png'}
      />

      {/* 회원가입 유도 모달 */}
      <SignupPromptModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        action={currentAction}
      />

      {/* 하단 네비게이션 (모바일에서만) */}
      {!isDesktop && (
        <BottomNav
          current="home"
          onNavigate={(tab) => {
            if (tab === 'home') router.push('/ko');
            if (tab === 'map') router.push('/ko/map');
            if (tab === 'favorites') router.push('/ko/favorites');
            if (tab === 'profile') router.push('/ko/profile');
          }}
        />
      )}

      {/* 스낵바 알림 */}
      <Snackbar 
        open={snackbar.open} 
        message={snackbar.message} 
        type={snackbar.type} 
        onClose={() => setSnackbar(s => ({ ...s, open: false }))} 
      />
    </main>
  );
};

export default MainFeedPage; 