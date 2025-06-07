'use client';

import dynamic from 'next/dynamic';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

// 동적 import로 hydration 오류 방지
const SwipeCardStack = dynamic(() => import('@/components/ui/SwipeCardStack'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">로딩 중...</div>
});

// 더미 장소 데이터
const dummyPlaces = [
  {
    id: '1',
    name: '스타벅스 강남점',
    category: '카페',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    distance: '150m',
    description: '조용한 분위기의 카페입니다.'
  },
  {
    id: '2',
    name: '이디야 역삼점',
    category: '카페',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    distance: '230m',
    description: '합리적인 가격의 커피전문점입니다.'
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  // 회원탈퇴 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 반응형 체크
  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

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
    if (!session) {
      setShowLoginModal(true);
      return false;
    }
    console.log('Dislike:', placeId);
    return true;
  };

  const handleSwipeRight = async (placeId: string) => {
    if (!session) {
      setShowLoginModal(true);
      return false;
    }
    console.log('Like:', placeId);
    return true;
  };

  const handleCardTap = (placeId: string) => {
    console.log('Card tapped:', placeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* 상단 네비게이션 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
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
          <div className="h-screen grid lg:grid-cols-2 gap-8 p-8">
            {/* 왼쪽: 카드 스택 영역 */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  새로운 장소 발견하기
                </h2>
                <SwipeCardStack 
                  places={dummyPlaces}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onCardTap={handleCardTap}
                  isDesktop={true}
                />
              </div>
            </div>

            {/* 오른쪽: 지도 영역 */}
            <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
              {/* 지도 플레이스홀더 */}
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  지도 뷰
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                  주변 장소들의 위치를 지도에서 확인하세요
                </p>
                <button 
                  onClick={() => router.push('/ko/map')}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-xl transition-colors"
                >
                  지도 보기
                </button>
              </div>

              {/* 지도 통계 */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{dummyPlaces.length}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">주변 장소</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">2.5km</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">반경 내</div>
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
              places={dummyPlaces}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onCardTap={handleCardTap}
              isDesktop={false}
            />
          </div>
        )}
      </main>

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
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
                onClick={() => signIn('google')}
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
                onClick={() => signIn('naver')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-[#03C75A] hover:bg-[#02B351] transition-colors"
              >
                <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-[#03C75A] font-bold text-sm">N</span>
                </div>
                <span className="text-white font-medium">네이버로 시작하기</span>
              </button>

              {/* 카카오 로그인 */}
              <button
                onClick={() => signIn('kakao', { 
                  redirect: false,
                  callbackUrl: '/ko'
                })}
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