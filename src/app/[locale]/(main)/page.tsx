"use client";
// 이 파일은 메인 피드 페이지입니다.
// 추후 위치 기반 장소 카드 리스트가 표시될 예정입니다.
import React, { useEffect, useState } from 'react';
import { fetchAllPlaces } from '@/lib/supabase/places';
import { fetchVoteCountsByPlaceIds, votePlace } from '@/lib/supabase/votes';
import type { Place } from '@/types/database';
import type { VoteCount } from '@/lib/supabase/votes';
import KakaoMap from '@/components/map/KakaoMap';
import { useRouter } from 'next/navigation';
import AdModal from '@/components/layout/AdModal';
import BottomNav from '@/components/layout/BottomNav';
import { useFavorites } from '@/lib/hooks/useFavorites';
import Snackbar from '@/components/layout/Snackbar';
import PlaceCard from '@/components/place/PlaceCard';
import StoryBar, { StoryItem } from '@/components/ui/StoryBar';
import Header from '@/components/layout/Header';
import ThemeToggle from '@/components/ui/ThemeToggle';
import OnboardingBanner from '@/components/ui/OnboardingBanner';
import useSWR from 'swr';

// SWR fetcher 함수
const fetcher = async () => {
  const { data, error } = await fetchAllPlaces();
  if (error) throw error;
  return data;
};

const MainFeedPage = () => {
  // 장소 목록 상태 (SWR)
  const { data: places = [], error, isLoading } = useSWR('places', fetcher, { refreshInterval: 5000 });
  const [voteCounts, setVoteCounts] = useState<Record<string, { like: number; no: number }>>({});
  const router = useRouter();
  // 광고 모달 상태 및 숨김 로직
  const [showAd, setShowAd] = useState(false);
  const { favorites, add, remove } = useFavorites();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  // 컴포넌트 마운트 시 Supabase에서 장소 목록 + 투표수 불러오기
  useEffect(() => {
    async function fetchData() {
      try {
        // 장소 ID 목록 추출
        const placeIds = (places || []).map((p: Place) => p.id);
        // 투표수 집계 fetch
        const { data: voteData, error: voteError } = await fetchVoteCountsByPlaceIds(placeIds);
        if (voteError) throw new Error(voteError.message);
        // 투표수 집계 결과를 placeId별로 정리
        const counts: Record<string, { like: number; no: number }> = {};
        if (Array.isArray(voteData)) {
          (voteData as VoteCount[]).forEach((row) => {
            if (!counts[row.place_id]) counts[row.place_id] = { like: 0, no: 0 };
            if (row.vote_type === 'like') counts[row.place_id].like = row.count;
            if (row.vote_type === 'no') counts[row.place_id].no = row.count;
          });
        }
        setVoteCounts(counts);
      } catch (e) {
        console.error('에러:', e instanceof Error ? e.message : String(e));
      }
    }
    fetchData();
  }, [places]);

  // 지도 중심 좌표(임시: 첫 번째 장소, 없으면 서울)
  const mapCenter = places.length > 0 ? { lat: places[0].latitude, lng: places[0].longitude } : { lat: 37.5665, lng: 126.9780 };
  // 지도에 표시할 장소 마커 데이터
  const mapPlaces = places.map((place) => ({
    id: place.id,
    lat: place.latitude,
    lng: place.longitude,
    name: place.name,
  }));

  // 광고 숨김 여부(localStorage) 확인
  useEffect(() => {
    const hideUntil = localStorage.getItem('ad_hide_until');
    if (!hideUntil || Date.now() > Number(hideUntil)) {
      setShowAd(true);
    }
  }, []);

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
      id: 'onboarding', 
      label: '가이드', 
      colorFrom: 'blue-400', 
      colorTo: 'green-400', 
      onClick: () => {
        localStorage.removeItem('onboarding_hidden_until');
        window.location.reload();
      }
    },
    { 
      id: 'notice', 
      label: '공지', 
      colorFrom: 'purple-400', 
      colorTo: 'pink-400', 
      onClick: () => {
        setSnackbar({ 
          open: true, 
          message: '📢 새로운 리뷰 시스템이 업데이트되었습니다!', 
          type: 'success' 
        });
      }
    },
  ];

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 상단바 */}
      <Header title="칠 플레이스" />
      
      {/* 온보딩 배너 */}
      <OnboardingBanner />
      
      {/* 스토리/이벤트 영역 */}
      <StoryBar stories={stories} />
      {/* 피드(카드형) */}
      <div className="w-full max-w-md flex flex-col gap-4 px-2 pb-32">
        {isLoading && <div className="text-blue-500 dark:text-blue-300 text-center py-8">로딩 중...</div>}
        {error && <div className="text-red-500 dark:text-red-300 text-center py-8">에러: {error instanceof Error ? error.message : String(error)}</div>}
        {!isLoading && places.length === 0 && <div className="text-gray-400 dark:text-gray-500 text-center py-8">주변에 등록된 장소가 없습니다.<br/>첫 리뷰의 주인공이 되어보세요!</div>}
        {places.map((place) => {
          const isFavorite = favorites.some((fav) => fav.place_id === place.id);
          return (
            <PlaceCard
              key={place.id}
              place={{
                id: place.id,
                name: place.name,
                category: place.category,
                imageUrl: place.image_url || '/icons/icon-192.png',
                likeCount: voteCounts[place.id]?.like || 0,
                noCount: voteCounts[place.id]?.no || 0,
                distance: '0.0km', // TODO: 실제 거리 계산 적용
              }}
              isFavorite={isFavorite}
              onToggleFavorite={async () => {
                try {
                  if (isFavorite) {
                    await remove(place.id);
                    setSnackbar({ open: true, message: '즐겨찾기에서 해제되었습니다.', type: 'success' });
                  } else {
                    await add(place.id);
                    setSnackbar({ open: true, message: '즐겨찾기에 추가되었습니다.', type: 'success' });
                  }
                } catch {
                  setSnackbar({ open: true, message: '오류가 발생했습니다.', type: 'error' });
                }
              }}
              onVote={async (type) => {
                try {
                  await votePlace(place.id, type);
                  setSnackbar({ open: true, message: type === 'like' ? '좋아요가 반영되었습니다.' : '별로예요가 반영되었습니다.', type: 'success' });
                } catch {
                  setSnackbar({ open: true, message: '투표 중 오류가 발생했습니다.', type: 'error' });
                }
              }}
              onClick={() => router.push(`/ko/place/${place.id}`)}
            />
          );
        })}
      </div>
      {/* 플로팅 장소 등록 버튼 (우측 상단) */}
      <button
        className="fixed top-20 right-6 bg-gradient-to-tr from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 dark:from-blue-800 dark:to-blue-700 dark:hover:from-blue-900 dark:hover:to-blue-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl z-50 transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200"
        onClick={() => router.push('/ko/place/new')}
        aria-label="장소 등록"
        title="장소 등록"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      {/* 테마 토글 버튼 (우측 하단) */}
      <div className="fixed bottom-24 right-6 z-50">
        <ThemeToggle />
      </div>
      {/* 지도 영역 */}
      <div className="w-full max-w-md mb-4">
        <KakaoMap
          center={mapCenter}
          places={mapPlaces}
          onMarkerClick={(id) => {
            router.push(`/ko/place/${id}`);
          }}
        />
      </div>
      {/* 광고 모달 */}
      {showAd && <AdModal ad={ad} onClose={() => setShowAd(false)} onHideFor={handleHideAd} />}
      {/* 하단 네비게이션 */}
      <BottomNav
        current="home"
        onNavigate={(tab) => {
          if (tab === 'home') router.push('/ko');
          if (tab === 'map') router.push('/ko/map');
          if (tab === 'favorites') router.push('/ko/favorites');
          if (tab === 'profile') router.push('/ko/profile');
        }}
      />
      {/* 스낵바 알림 */}
      <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(s => ({ ...s, open: false }))} />
    </main>
  );
};

export default MainFeedPage; 