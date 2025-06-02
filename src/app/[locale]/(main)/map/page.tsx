"use client";
// 이 파일은 지도 검색 페이지입니다.
// 추후 카카오맵 연동 및 장소 검색 기능이 추가될 예정입니다.
import React from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { useRouter } from 'next/navigation';

const MapPage = () => {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-xl font-bold mb-4">지도에서 찾기</h1>
      {/* 카카오맵 컴포넌트 영역 */}
      <div className="w-full max-w-md h-80 bg-gray-200 rounded-lg flex items-center justify-center">카카오맵 영역</div>
      {/* 하단 네비게이션 */}
      <BottomNav
        current="map"
        onNavigate={(tab) => {
          if (tab === 'home') router.push('/ko');
          if (tab === 'map') router.push('/ko/(main)/map');
          if (tab === 'favorites') router.push('/ko/(main)/favorites');
          if (tab === 'profile') router.push('/ko/(main)/profile');
        }}
      />
    </main>
  );
};

export default MapPage; 