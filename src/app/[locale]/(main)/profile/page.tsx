"use client";
// 이 파일은 사용자 프로필(설정) 페이지입니다.
// 추후 프로필 정보 및 설정 기능이 추가될 예정입니다.
import React from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { useRouter } from 'next/navigation';
import { getMyProfile, signOut } from '@/lib/supabase/auth';
import { fetchMyReviews } from '@/lib/supabase/reviews';
import type { Profile, Review } from '@/types/database';
import { useFavorites } from '@/lib/hooks/useFavorites';
import Snackbar from '@/components/layout/Snackbar';
import Image from 'next/image';

const ProfilePage = () => {
  const router = useRouter();
  // 프로필 정보 상태
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [myReviews, setMyReviews] = React.useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = React.useState(true);
  const [reviewsError, setReviewsError] = React.useState<string | null>(null);
  const { favorites, loading: favLoading, error: favError, remove: removeFavorite } = useFavorites();
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  React.useEffect(() => {
    async function fetchProfileAndReviews() {
      setLoading(true);
      setError(null);
      const { profile, error } = await getMyProfile();
      if (error) setError(error.message);
      setProfile(profile);
      setLoading(false);
      // 내 리뷰 불러오기
      if (profile && (profile as Profile)?.id) {
        setReviewsLoading(true);
        setReviewsError(null);
        const { data, error: reviewError } = await fetchMyReviews((profile as Profile).id);
        if (reviewError) setReviewsError(reviewError.message);
        setMyReviews(data || []);
        setReviewsLoading(false);
      }
    }
    fetchProfileAndReviews();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-2xl font-extrabold text-blue-600 dark:text-blue-300 tracking-tight mt-6 mb-4">내 프로필</h1>
      {/* 프로필 정보 영역 */}
      <div className="w-full max-w-md">
        {loading && <div className="text-blue-400 dark:text-blue-300 text-center py-8 animate-pulse">불러오는 중...</div>}
        {error && <div className="text-red-500 dark:text-red-300 text-center py-8">에러: {error}</div>}
        {!loading && !profile && <div className="text-gray-400 dark:text-gray-500 text-center py-8">로그인이 필요합니다.</div>}
        {profile && (
          <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl mb-6 animate-fade-in">
            <div className="relative w-24 h-24 mb-2">
              <Image src={profile.avatar_url || '/icons/icon-192.png'} alt="프로필 이미지" fill className="object-cover rounded-full border-4 border-blue-100 dark:border-gray-700 shadow" />
            </div>
            <div className="font-bold text-xl text-gray-900 dark:text-white">{profile.username}</div>
            <div className="text-sm text-gray-500 dark:text-gray-300">{profile.full_name}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">{profile.id}</div>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-1 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 font-bold text-xs transition" onClick={() => alert('프로필 수정 기능 준비중')}>프로필 수정</button>
              <button className="px-4 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold text-xs transition" onClick={async () => { await signOut(); router.push('/ko/login'); }}>로그아웃</button>
            </div>
            <div className="flex flex-col gap-1 mt-2 w-full">
              <div className="text-xs text-gray-500 dark:text-gray-300">선호 언어: {profile.preferred_language}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">관심 카테고리: {profile.interested_categories?.join(', ')}</div>
            </div>
          </div>
        )}
      </div>
      {/* 내가 쓴 리뷰 목록 */}
      <div className="w-full max-w-md mt-6">
        <div className="font-bold mb-2 text-blue-600 dark:text-blue-300">내가 쓴 리뷰</div>
        {reviewsLoading && <div className="text-blue-400 dark:text-blue-300 text-center py-4 animate-pulse">리뷰 불러오는 중...</div>}
        {reviewsError && <div className="text-red-500 dark:text-red-300 text-center py-4">에러: {reviewsError}</div>}
        {!reviewsLoading && myReviews.length === 0 && <div className="text-gray-400 dark:text-gray-500 text-center py-4">아직 작성한 리뷰가 없습니다.</div>}
        <div className="flex flex-col gap-3">
          {myReviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex flex-col gap-1 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">{review.places?.name || review.place_id}</span>
                {/* 별점 표시 */}
                <span className="flex items-center ml-2">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={`text-base ${star <= (review.rating || 0) ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}>★</span>
                  ))}
                  <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">{review.rating || 0}점</span>
                </span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">{review.content}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(review.created_at).toLocaleString('ko-KR')}</div>
            </div>
          ))}
        </div>
      </div>
      {/* 내 즐겨찾기 목록 */}
      <div className="w-full max-w-md mt-6 mb-24">
        <div className="font-bold mb-2 text-yellow-500 dark:text-yellow-300">내 즐겨찾기</div>
        {favLoading && <div className="text-yellow-400 dark:text-yellow-300 text-center py-4 animate-pulse">불러오는 중...</div>}
        {favError && <div className="text-red-500 dark:text-red-300 text-center py-4">에러: {favError}</div>}
        {favorites.length === 0 && !favLoading && <div className="text-gray-400 dark:text-gray-500 text-center py-4">아직 즐겨찾기한 장소가 없습니다.</div>}
        <div className="flex flex-col gap-3">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 flex items-center justify-between animate-fade-in">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{fav.places?.name || fav.place_id}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{fav.places?.category}</div>
              </div>
              <button
                className="text-xs text-red-500 border border-red-300 dark:border-red-500 rounded px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900 font-bold transition"
                onClick={async () => {
                  try {
                    await removeFavorite(fav.place_id);
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
      </div>
      {/* 하단 네비게이션 */}
      <BottomNav
        current="profile"
        onNavigate={(tab) => {
          if (tab === 'home') router.push('/ko');
          if (tab === 'map') router.push('/ko/map');
          if (tab === 'favorites') router.push('/ko/favorites');
          if (tab === 'profile') router.push('/ko/profile');
        }}
      />
      <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(s => ({ ...s, open: false }))} />
    </main>
  );
};

export default ProfilePage; 