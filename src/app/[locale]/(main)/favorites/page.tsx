"use client";
// 이 파일은 즐겨찾기 페이지입니다.
// 내 즐겨찾기 장소 리스트를 Supabase에서 불러와 표시합니다.
import React from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/lib/hooks/useFavorites';
import Snackbar from '@/components/layout/Snackbar';

const FavoritesPage = () => {
  const router = useRouter();
  // 즐겨찾기 훅 사용
  const { favorites, loading, error, remove } = useFavorites();
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-xl font-bold mb-4">즐겨찾기</h1>
      {/* 즐겨찾기 리스트 영역 */}
      <div className="w-full max-w-md">
        {loading && <div>불러오는 중...</div>}
        {error && <div className="text-red-500">에러: {error}</div>}
        {favorites.length === 0 && !loading && <div>아직 즐겨찾기한 장소가 없습니다.</div>}
        {favorites.map((fav) => (
          <div key={fav.id} className="flex items-center justify-between p-3 border-b">
            <div>
              <div className="font-semibold">{fav.places?.name || fav.place_id}</div>
              <div className="text-sm text-gray-500">{fav.places?.category}</div>
            </div>
            <button
              className="text-xs text-red-500 border border-red-300 rounded px-2 py-1 hover:bg-red-50"
              onClick={async () => {
                try {
                  await remove(fav.place_id);
                  setSnackbar({ open: true, message: '즐겨찾기에서 해제되었습니다.', type: 'success' });
                } catch {
                  setSnackbar({ open: true, message: '오류가 발생했습니다.', type: 'error' });
                }
              }}
            >
              즐겨찾기 해제
            </button>
          </div>
        ))}
      </div>
      {/* 하단 네비게이션 */}
      <BottomNav
        current="favorites"
        onNavigate={(tab) => {
          if (tab === 'home') router.push('/ko');
          if (tab === 'map') router.push('/ko/(main)/map');
          if (tab === 'favorites') router.push('/ko/(main)/favorites');
          if (tab === 'profile') router.push('/ko/(main)/profile');
        }}
      />
      {/* 스낵바 알림 */}
      <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(s => ({ ...s, open: false }))} />
    </main>
  );
};

export default FavoritesPage; 