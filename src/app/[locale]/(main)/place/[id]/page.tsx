"use client";
// 이 파일은 장소 상세 페이지입니다.
// 장소 정보, 투표, 리뷰 목록 등이 표시됩니다.
import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useReviews } from '@/lib/hooks/useReviews';
import ReviewCard from '@/components/review/ReviewCard';
import ReviewForm from '@/components/review/ReviewForm';
import { createReview, uploadReviewImage, fetchReviewAuthors, addReviewHelpful, removeReviewHelpful, isReviewHelpful } from '@/lib/supabase/reviews';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import KakaoMap from '@/components/map/KakaoMap';
import { fetchAllPlaces } from '@/lib/supabase/places';
import type { Place } from '@/types/database';
import { useFavorites } from '@/lib/hooks/useFavorites';
import Snackbar from '@/components/layout/Snackbar';
import { votePlace } from '@/lib/supabase/votes';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/supabase/auth';
import { createNotification } from '@/lib/supabase/notifications';
dayjs.extend(relativeTime);

const PlaceDetailPage = () => {
  // URL에서 placeId 추출
  const params = useParams();
  const placeId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  // 리뷰 목록 fetch
  const { reviews, loading, error } = useReviews(placeId);
  const [submitting, setSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState<typeof reviews>([]);
  const [authorMap, setAuthorMap] = useState<Record<string, string>>({});
  // Supabase에서 실제 장소 정보 fetch
  const [place, setPlace] = useState<Place | null>(null);
  const { favorites, add, remove } = useFavorites();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });
  // 리뷰별 도움돼요 상태 관리
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});

  // 리뷰 작성자 닉네임 조회
  useEffect(() => {
    if (reviews.length === 0) return;
    const userIds = Array.from(new Set(reviews.map(r => r.user_id)));
    fetchReviewAuthors(userIds).then(({ data }) => {
      if (data) setAuthorMap(data);
    });
  }, [reviews]);

  // 리뷰 등록 핸들러
  const handleSubmit = useCallback(async (content: string, rating: number, image?: File) => {
    setSubmitting(true);
    let imageUrl: string | undefined = undefined;
    try {
      if (image) {
        imageUrl = await uploadReviewImage(image, placeId);
      }
      await createReview(placeId, content, rating, imageUrl);
      // 리뷰 등록 알림 생성 (예시: 장소 주인/관리자에게, 본인 제외)
      const { user } = await getCurrentUser();
      if (place && user && place.id !== user.id) {
        await createNotification(
          place.id, // 실제 서비스에서는 place.owner_id 등으로 수정 필요
          'review',
          `${place.name}에 새로운 리뷰가 등록되었습니다.`,
          `/ko/(main)/place/${place.id}`
        );
      }
      setLocalReviews([
        {
          id: 'temp-' + Date.now(),
          user_id: 'me',
          place_id: placeId,
          content,
          helpful_count: 0,
          rating,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          image_url: imageUrl,
        },
        ...localReviews,
      ]);
      setSnackbar({ open: true, message: '리뷰가 등록되었습니다.', type: 'success' });
    } catch {
      setSnackbar({ open: true, message: '리뷰 등록 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [placeId, localReviews, place]);

  // 실제로 보여줄 리뷰 목록 (localReviews가 있으면 우선 사용)
  const displayReviews = localReviews.length > 0 ? localReviews : reviews;

  // 지도에 표시할 마커 데이터
  const mapPlaces = place
    ? [{ id: place.id, lat: place.latitude, lng: place.longitude, name: place.name }]
    : [];

  // Supabase에서 실제 장소 정보 fetch
  useEffect(() => {
    fetchAllPlaces().then(({ data }) => {
      if (data) {
        const found = data.find((p: Place) => p.id === placeId);
        if (found) setPlace(found);
      }
    });
  }, [placeId]);

  // 리뷰 목록 변경 시, 내가 도움돼요를 누른 리뷰인지 확인
  useEffect(() => {
    async function checkHelpful() {
      const map: Record<string, boolean> = {};
      for (const review of displayReviews) {
        const { isHelpful } = await isReviewHelpful(review.id);
        map[review.id] = isHelpful;
      }
      setHelpfulMap(map);
    }
    checkHelpful();
  }, [displayReviews]);

  // 평균 별점 계산
  const averageRating = displayReviews.length > 0 ? (
    displayReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / displayReviews.length
  ) : 0;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* 상단 대표 이미지 */}
      {place && (
        <div className="relative w-full max-w-md h-56 mb-4 rounded-b-3xl overflow-hidden shadow-lg">
          <Image
            src={place.image_url || '/icons/icon-192.png'}
            alt={place.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <span className="text-white text-xl font-extrabold drop-shadow-lg">{place.name}</span>
          </div>
        </div>
      )}
      {/* 장소 상세 정보 + 즐겨찾기 하트 버튼 */}
      {place && (
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-4 w-full max-w-md flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-lg mb-1 text-gray-900">{place.name}</div>
              <div className="text-xs text-blue-500 mb-1">{place.category}</div>
              <div className="text-xs text-gray-500 mb-1">{place.address}</div>
              {place.phone && <div className="text-xs text-gray-400 mb-1">{place.phone}</div>}
            </div>
            {/* 즐겨찾기 하트 버튼 */}
            <button
              className="text-red-500 hover:scale-110 transition ml-2"
              aria-label={favorites.some(fav => fav.place_id === place.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              onClick={(e) => {
                e.stopPropagation();
                const isFav = favorites.some(fav => fav.place_id === place.id);
                try {
                  if (isFav) {
                    remove(place.id);
                    setSnackbar({ open: true, message: '즐겨찾기에서 해제되었습니다.', type: 'success' });
                  } else {
                    add(place.id);
                    setSnackbar({ open: true, message: '즐겨찾기에 추가되었습니다.', type: 'success' });
                  }
                } catch {
                  setSnackbar({ open: true, message: '오류가 발생했습니다.', type: 'error' });
                }
              }}
            >
              {favorites.some(fav => fav.place_id === place.id) ? (
                <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
            </button>
          </div>
          {/* 평균 별점 표시 */}
          <div className="flex items-center gap-1 mt-2 mb-1">
            {[1,2,3,4,5].map(star => (
              <span key={star} className={`text-lg ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
            ))}
            <span className="ml-2 text-xs text-gray-500">{averageRating.toFixed(1)}점</span>
            <span className="ml-2 text-xs text-gray-400">({displayReviews.length}개 리뷰)</span>
            {displayReviews.length === 0 && <span className="ml-2 text-xs text-gray-300">아직 별점이 없습니다.</span>}
          </div>
          {/* 투표 버튼 */}
          <div className="flex gap-2 mt-2">
            <button
              className="flex-1 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold transition"
              onClick={async () => {
                try {
                  await votePlace(place.id, 'like');
                  setSnackbar({ open: true, message: '좋아요가 반영되었습니다.', type: 'success' });
                } catch {
                  setSnackbar({ open: true, message: '투표 중 오류가 발생했습니다.', type: 'error' });
                }
              }}
            >
              👍 좋아요
            </button>
            <button
              className="flex-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 font-bold transition"
              onClick={async () => {
                try {
                  await votePlace(place.id, 'no');
                  setSnackbar({ open: true, message: '별로예요가 반영되었습니다.', type: 'success' });
                } catch {
                  setSnackbar({ open: true, message: '투표 중 오류가 발생했습니다.', type: 'error' });
                }
              }}
            >
              👎 별로예요
            </button>
          </div>
        </div>
      )}
      {/* 리뷰 작성 폼 */}
      <div className="w-full max-w-md mb-4">
        <ReviewForm placeId={placeId} onSubmit={handleSubmit} timeLimit={30} charLimit={50} />
        {submitting && <div className="text-blue-500">리뷰 등록 중...</div>}
      </div>
      {/* 리뷰 목록 영역 */}
      <div className="w-full max-w-md">
        {loading && <div className="text-blue-400 text-center py-8 animate-pulse">리뷰 로딩 중...</div>}
        {error && <div className="text-red-500 text-center py-8">에러: {error}</div>}
        {displayReviews.length === 0 && !loading && <div className="text-gray-400 text-center py-8">아직 등록된 리뷰가 없습니다.<br/>가장 먼저 리뷰를 남겨보세요!</div>}
        {displayReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={{
              id: review.id,
              content: review.content,
              author: authorMap[review.user_id] || review.user_id,
              timeAgo: dayjs(review.created_at).fromNow(),
              helpfulCount: review.helpful_count,
              imageUrl: review.image_url,
            }}
            onHelpful={async () => {
              try {
                if (helpfulMap[review.id]) {
                  await removeReviewHelpful(review.id);
                  setSnackbar({ open: true, message: '도움돼요가 취소되었습니다.', type: 'success' });
                } else {
                  await addReviewHelpful(review.id);
                  setSnackbar({ open: true, message: '도움돼요가 반영되었습니다.', type: 'success' });
                }
                setHelpfulMap((prev) => ({ ...prev, [review.id]: !prev[review.id] }));
              } catch {
                setSnackbar({ open: true, message: '도움돼요 처리 중 오류가 발생했습니다.', type: 'error' });
              }
            }}
            isHelpful={helpfulMap[review.id]}
          />
        ))}
      </div>
      {/* 지도 영역 */}
      <div className="w-full max-w-md mb-4">
        {place && <KakaoMap center={{ lat: place.latitude, lng: place.longitude }} places={mapPlaces} />}
      </div>
      {/* 스낵바 알림 */}
      <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar(s => ({ ...s, open: false }))} />
    </main>
  );
};

export default PlaceDetailPage; 