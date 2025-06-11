"use client";
// 이 파일은 장소 상세 페이지입니다.
// 장소 정보, 투표, 리뷰 목록 등이 표시됩니다.
import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useReviews } from '@/lib/hooks/useReviews';
import ReviewCard from '@/components/review/ReviewCard';
import ReviewForm from '@/components/review/ReviewForm';
import { createReview, uploadReviewImage, fetchReviewAuthors, addReviewHelpful, removeReviewHelpful, isReviewHelpful, createTestReviews, checkReviewsTableStructure, checkSupabaseConnection } from '@/lib/supabase/reviews';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import KakaoMap from '@/components/map/KakaoMap';
import { fetchAllPlaces, deletePlace, updatePlace } from '@/lib/supabase/places';
import type { Place } from '@/types/database';
import { useFavorites } from '@/lib/hooks/useFavorites';
import Snackbar from '@/components/layout/Snackbar';
import { votePlace } from '@/lib/supabase/votes';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/supabase/auth';
import { createNotification } from '@/lib/supabase/notifications';
import { useSWRConfig } from 'swr';
import SignupPromptModal from '@/components/auth/SignupPromptModal';
import { useAuthGuard } from '@/lib/hooks/useAuthGuard';
dayjs.extend(relativeTime);

const PlaceDetailPage = () => {
  // URL에서 placeId 추출
  const params = useParams();
  const placeId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  // 리뷰 목록 fetch
  const { reviews, loading, error, mutate: mutateReviews } = useReviews(placeId);
  const [submitting, setSubmitting] = useState(false);
  const [authorMap, setAuthorMap] = useState<Record<string, string>>({});
  // Supabase에서 실제 장소 정보 fetch
  const [place, setPlace] = useState<Place | null>(null);
  const { favorites, add, remove } = useFavorites();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });
  // 리뷰별 도움돼요 상태 관리
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});
  const { mutate } = useSWRConfig();
  // 장소 수정 모달 상태
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  // 별점별 필터 상태 추가
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // 권한 관리 추가
  const { 
    isAuthenticated, 
    showSignupModal, 
    setShowSignupModal 
  } = useAuthGuard();

  // 리뷰 작성자 닉네임 조회
  useEffect(() => {
    if (reviews.length === 0) return;
    const userIds = Array.from(new Set(reviews.map(r => r.user_id)));
    fetchReviewAuthors(userIds).then(({ data }) => {
      if (data) setAuthorMap(data);
    });
  }, [reviews]);



  // 실제로 보여줄 리뷰 목록 (SWR 데이터만 사용)
  const displayReviews = reviews;

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
    if (displayReviews.length === 0) return;
    let isMounted = true;
    async function checkHelpful() {
      const map: Record<string, boolean> = {};
      for (const review of displayReviews) {
        const { isHelpful } = await isReviewHelpful(review.id);
        map[review.id] = isHelpful;
      }
      if (isMounted) setHelpfulMap(map);
    }
    checkHelpful();
    return () => { isMounted = false; };
  }, [displayReviews]);

  // 평균 별점 계산
  const averageRating = displayReviews.length > 0 ? (
    displayReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / displayReviews.length
  ) : 0;

  // 별점별 리뷰 개수 계산
  const ratingCounts = [1,2,3,4,5].map(star => displayReviews.filter(r => r.rating === star).length);

  // 필터 적용된 리뷰 목록
  const filteredReviews = ratingFilter ? displayReviews.filter(r => r.rating === ratingFilter) : displayReviews;

  // 장소 삭제 핸들러
  const handleDelete = async () => {
    if (!place) return;
    if (!window.confirm('정말로 이 장소를 삭제하시겠습니까?')) return;
    const { error } = await deletePlace(place.id);
    if (error) {
      setSnackbar({ open: true, message: '삭제 중 오류가 발생했습니다.', type: 'error' });
    } else {
      setSnackbar({ open: true, message: '장소가 삭제되었습니다.', type: 'success' });
      mutate('places');
      setTimeout(() => {
        window.location.href = '/ko';
      }, 1200);
    }
  };

  // 수정 버튼 클릭 시 기존 값 세팅
  const openEdit = () => {
    if (!place) return;
    setEditName(place.name);
    setEditCategory(place.category);
    setEditAddress(place.address);
    setEditLat(place.latitude.toString());
    setEditLng(place.longitude.toString());
    setEditOpen(true);
  };

  // 수정 폼 제출
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!place) return;
    const { error } = await updatePlace(place.id, {
      name: editName,
      category: editCategory,
      address: editAddress,
      latitude: parseFloat(editLat),
      longitude: parseFloat(editLng),
    });
    if (error) {
      setSnackbar({ open: true, message: '수정 중 오류가 발생했습니다.', type: 'error' });
    } else {
      setSnackbar({ open: true, message: '장소 정보가 수정되었습니다.', type: 'success' });
      mutate('places');
      setEditOpen(false);
      // 상세 정보도 즉시 갱신
      fetchAllPlaces().then(({ data }) => {
        if (data) {
          const found = data.find((p: Place) => p.id === placeId);
          if (found) setPlace(found);
        }
      });
    }
  };

  // 이미지 URL 유효성 검사 함수 추가
  function isValidImageUrl(url: string): boolean {
    if (!url) return false;
    if (url.includes('File not found')) return false;
    if (url.startsWith('data:')) return true;
    if (url.startsWith('/')) return true;
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 테스트 리뷰 생성 핸들러 (개발용)
  const handleCreateTestReviews = async () => {
    try {
      await createTestReviews(placeId);
      await mutateReviews(); // SWR 데이터 즉시 갱신
      setSnackbar({ open: true, message: '테스트 리뷰가 생성되었습니다!', type: 'success' });
    } catch {
      setSnackbar({ open: true, message: '테스트 리뷰 생성 중 오류가 발생했습니다.', type: 'error' });
    }
  };

  // 테이블 구조 확인 핸들러 (개발용)
  const handleCheckTableStructure = async () => {
    await checkReviewsTableStructure();
  };

  // Supabase 연결 테스트 핸들러 (개발용)
  const handleCheckConnection = async () => {
    await checkSupabaseConnection();
  };

  // 투표 핸들러 수정
  const handleVote = async (voteType: 'like' | 'no') => {
    // 비회원 체크
    if (!isAuthenticated) {
      setShowSignupModal(true);
      return;
    }
    
    try {
      await votePlace(place!.id, voteType);
      setSnackbar({ 
        open: true, 
        message: voteType === 'like' ? '좋아요가 반영되었습니다.' : '별로예요가 반영되었습니다.', 
        type: 'success' 
      });
    } catch {
      setSnackbar({ 
        open: true, 
        message: '투표 중 오류가 발생했습니다.', 
        type: 'error' 
      });
    }
  };

  // 리뷰 작성 체크 함수 수정
  const handleReviewSubmit = useCallback(async (content: string, rating: number, imageFile?: File) => {
    // 비회원 체크
    if (!isAuthenticated) {
      setShowSignupModal(true);
      return;
    }
    
    if (!content || content.length < 10) {
      setSnackbar({ open: true, message: '리뷰는 최소 10자 이상 작성해주세요.', type: 'error' });
      return;
    }

    setSubmitting(true);
    let imageUrl: string | undefined = undefined;
    try {
      if (imageFile) {
        imageUrl = await uploadReviewImage(imageFile, placeId);
      }
      await createReview(placeId, content, rating, imageUrl);
      // 리뷰 등록 알림 생성 (예시: 장소 주인/관리자에게, 본인 제외)
      const currentUser = await getCurrentUser();
      if (place && currentUser && place.id !== currentUser.id) {
        await createNotification(
          place.id, // 실제 서비스에서는 place.owner_id 등으로 수정 필요
          'review',
          `${place.name}에 새로운 리뷰가 등록되었습니다.`,
          `/ko/place/${place.id}`
        );
      }
      await mutateReviews(); // SWR 데이터 즉시 갱신
      setSnackbar({ open: true, message: '리뷰가 등록되었습니다.', type: 'success' });
    } catch {
      setSnackbar({ open: true, message: '리뷰 등록 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [placeId, place, mutateReviews, isAuthenticated]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* 상단 대표 이미지 */}
      {place && (
        <div className="relative w-full max-w-md h-56 mb-4 rounded-b-3xl overflow-hidden shadow-lg">
          {/* 이미지 URL 오류 수정 및 fallback 추가 */}
          {place.image_url && isValidImageUrl(place.image_url) ? (
            <Image
              src={place.image_url}
              alt={place.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{place.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <span className="text-white text-xl font-extrabold drop-shadow-lg">{place.name}</span>
          </div>
        </div>
      )}
      {/* 장소 상세 정보 + 즐겨찾기 하트 버튼 */}
      {place && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-4 w-full max-w-md flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-lg mb-1 text-gray-900 dark:text-white">{place.name}</div>
              <div className="text-xs text-blue-500 dark:text-blue-400 mb-1">{place.category}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{place.address}</div>
              {place.phone && <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">{place.phone}</div>}
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
            {/* 장소 삭제 버튼 */}
            <button
              className="ml-2 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold transition"
              onClick={handleDelete}
              title="장소 삭제"
            >
              삭제
            </button>
            {/* 장소 수정 버튼 */}
            <button
              className="ml-2 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-xs font-bold transition"
              onClick={openEdit}
              title="장소 수정"
            >
              수정
            </button>
          </div>
          {/* 평균 별점 표시 (애니메이션, 강조) */}
          <div className="flex items-center gap-1 mt-2 mb-1">
            {[1,2,3,4,5].map(star => (
              <span
                key={star}
                className={`text-lg transition-all duration-300 ${star <= Math.round(averageRating) ? 'text-yellow-400 scale-125 drop-shadow' : 'text-gray-200'} animate-fade-in`}
              >★</span>
            ))}
            <span className="ml-2 text-base font-bold text-yellow-500 animate-bounce">{averageRating.toFixed(1)}점</span>
            <span className="ml-2 text-xs text-gray-400">({displayReviews.length}개 리뷰)</span>
            {displayReviews.length === 0 && <span className="ml-2 text-xs text-gray-300">아직 별점이 없습니다.</span>}
          </div>
          {/* 별점별 필터 버튼 및 개수 시각화 */}
          <div className="flex gap-2 mb-2">
            {[5,4,3,2,1].map(star => (
              <button
                key={star}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold transition-all duration-150
                  ${ratingFilter === star ? 'bg-yellow-400 text-white border-yellow-400 scale-105 shadow' : 'bg-gray-50 text-yellow-500 border-gray-200 hover:bg-yellow-100'}`}
                onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
              >
                <span className="text-base">★</span> {star}점
                <span className="ml-1 text-gray-500 font-mono">{ratingCounts[star-1]}</span>
              </button>
            ))}
            {ratingFilter && (
              <button className="ml-2 px-2 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-bold" onClick={() => setRatingFilter(null)}>
                전체 보기
              </button>
            )}
          </div>
          {/* 투표 버튼 */}
          <div className="flex gap-2 mt-2">
            <button
              className="flex-1 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold transition"
              onClick={() => handleVote('like')}
            >
              👍 좋아요
            </button>
            <button
              className="flex-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 font-bold transition"
              onClick={() => handleVote('no')}
            >
              👎 별로예요
            </button>
          </div>
        </div>
      )}
      {/* 상단 지도 + 위치 정보 */}
      {place && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-4 w-full max-w-md">
          <div className="h-48 w-full relative rounded-lg overflow-hidden mb-2">
            <KakaoMap 
              center={{ lat: place.latitude, lng: place.longitude }} 
              places={mapPlaces} 
            />
          </div>
        </div>
      )}

      {/* 리뷰 섹션 */}
      <div className="w-full max-w-md">
        {/* 평점 필터링 컨트롤 */}
        {place && reviews.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-4">
            <div className="text-center mb-3">
              <div className="flex items-center justify-center mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="20" height="20" fill={star <= Math.round(averageRating) ? "gold" : "none"} stroke="gold" strokeWidth="2" viewBox="0 0 24 24" className="inline-block">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-bold">{averageRating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{displayReviews.length}개의 리뷰</p>
            </div>

            {/* 별점별 필터 버튼 */}
            <div className="flex items-center justify-between px-1 mt-4">
              {[5, 4, 3, 2, 1].map(star => (
                <button
                  key={star}
                  className={`text-sm flex items-center px-2 py-1 rounded-full ${
                    ratingFilter === star
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                >
                  <svg width="16" height="16" fill={star <= 5 ? "gold" : "none"} stroke="gold" strokeWidth="2" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="ml-1">{ratingCounts[star-1]}</span>
                </button>
              ))}
            </div>
            
            {ratingFilter && (
              <div className="text-center mt-2">
                <button 
                  className="text-xs text-blue-500 dark:text-blue-400 underline" 
                  onClick={() => setRatingFilter(null)}
                >
                  필터 초기화
                </button>
              </div>
            )}
          </div>
        )}

        {/* 리뷰 작성 폼 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-4">
          <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200">리뷰 작성</h3>
          <ReviewForm 
            placeId={placeId} 
            onSubmit={handleReviewSubmit} 
            timeLimit={30} 
            charLimit={50} 
          />
          {submitting && <div className="text-blue-500 dark:text-blue-400 text-sm mt-2">리뷰 등록 중...</div>}
        </div>

        {/* 리뷰 목록 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 mb-4 rounded-lg">
            <p>오류가 발생했습니다: {error}</p>
          </div>
        )}
        
        {filteredReviews.length > 0 ? (
          <div className="space-y-4 mb-16">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={{
                  id: review.id,
                  content: review.content,
                  author: authorMap[review.user_id] || '익명',
                  timeAgo: dayjs(review.created_at).fromNow(),
                  helpfulCount: review.helpful_count || 0,
                  imageUrl: review.image_url,
                  rating: review.rating
                }}
                onHelpful={async () => {
                  const isHelpfulNow = helpfulMap[review.id];
                  try {
                    if (isHelpfulNow) {
                      await removeReviewHelpful(review.id);
                    } else {
                      await addReviewHelpful(review.id);
                    }
                    setHelpfulMap(prev => ({ ...prev, [review.id]: !isHelpfulNow }));
                  } catch (error) {
                    console.error("Error toggling helpful:", error);
                  }
                }}
                isHelpful={helpfulMap[review.id]}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 text-center mb-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {loading ? '리뷰를 불러오는 중...' : (ratingFilter ? `${ratingFilter}점 리뷰가 없습니다.` : '아직 리뷰가 없습니다.')}
            </p>
            {/* 개발용 테스트 리뷰 생성 버튼 */}
            {!loading && !ratingFilter && displayReviews.length === 0 && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTestReviews}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                  >
                    📝 테스트 리뷰 생성하기
                  </button>
                  <button
                    onClick={handleCheckTableStructure}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    🔍 테이블 구조 확인
                  </button>
                </div>
                <button
                  onClick={handleCheckConnection}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                >
                  🔗 Supabase 연결 테스트
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 스낵바 알림 */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />

      {/* 수정 모달 */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">장소 정보 수정</h3>
            <form onSubmit={handleEdit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">장소명</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리</label>
                <input 
                  type="text" 
                  value={editCategory} 
                  onChange={e => setEditCategory(e.target.value)} 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">주소</label>
                <input 
                  type="text" 
                  value={editAddress} 
                  onChange={e => setEditAddress(e.target.value)} 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">위도</label>
                  <input 
                    type="text" 
                    value={editLat} 
                    onChange={e => setEditLat(e.target.value)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">경도</label>
                  <input 
                    type="text" 
                    value={editLng} 
                    onChange={e => setEditLng(e.target.value)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setEditOpen(false)}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 회원가입 유도 모달 */}
      <SignupPromptModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        action="투표 및 리뷰 작성"
      />
    </main>
  );
};

export default PlaceDetailPage; 