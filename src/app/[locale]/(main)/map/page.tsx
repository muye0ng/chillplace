"use client";
// 이 파일은 지도 검색 페이지입니다.
// 추후 카카오맵 연동 및 장소 검색 기능이 추가될 예정입니다.
import React from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { useRouter } from 'next/navigation';
import KakaoMap from '@/components/map/KakaoMap';
import useSWR from 'swr';
import { fetchAllPlaces } from '@/lib/supabase/places';

// SWR fetcher 함수
const fetcher = async () => {
  const { data, error } = await fetchAllPlaces();
  if (error) throw error;
  return data;
};

// (main) 지도 페이지 템플릿
// 추후 카카오맵, 장소 마커, 내 위치 등 실제 기능 추가 예정
export default function MapPage() {
  const router = useRouter();

  // 장소 데이터 SWR로 실시간 fetch
  const { data: places = [] } = useSWR('places', fetcher, { refreshInterval: 5000 });
  // 지도 중심 좌표(장소 있으면 첫 번째, 없으면 서울시청)
  const center = places.length > 0 ? { lat: places[0].lat, lng: places[0].lng } : { lat: 37.5665, lng: 126.9780 };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">지도 페이지</h1>
      {/* 카카오맵 및 장소 마커 */}
      <div className="w-full max-w-md mb-4">
        <KakaoMap
          center={center}
          places={places}
          onMarkerClick={(id) => {
            router.push(`/ko/place/${id}`);
          }}
        />
      </div>
      {/* 하단 네비게이션 */}
      <BottomNav
        current="map"
        onNavigate={(tab) => {
          if (tab === 'home') router.push('/ko');
          if (tab === 'map') router.push('/ko/map');
          if (tab === 'favorites') router.push('/ko/favorites');
          if (tab === 'profile') router.push('/ko/profile');
        }}
      />
    </main>
  );
} 