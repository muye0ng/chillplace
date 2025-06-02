// 리뷰 관련 Supabase 함수 모음입니다.
// 리뷰 생성, 조회 등 함수 뼈대 제공
import { supabase } from './client';

// 리뷰 목록 조회
export async function fetchReviews(placeId: string) {
  // 실제 구현은 supabase.from('reviews').select() 등 사용
  return supabase.from('reviews').select('*').eq('place_id', placeId);
}

// 리뷰 생성
export async function createReview(placeId: string, content: string, rating: number, imageUrl?: string) {
  // 실제 구현은 supabase.from('reviews').insert() 등 사용
  return supabase.from('reviews').insert([{ place_id: placeId, content, rating, image_url: imageUrl }]);
}

// 리뷰 이미지 업로드 함수 (Supabase Storage 사용)
export async function uploadReviewImage(file: File, placeId: string) {
  // 파일명을 고유하게 생성 (예: placeId-timestamp)
  const fileName = `${placeId}-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('review-images').upload(fileName, file);
  if (error) throw error;
  // publicUrl 반환
  const { publicUrl } = supabase.storage.from('review-images').getPublicUrl(fileName).data;
  return publicUrl;
}

// 여러 user_id에 대한 username을 한 번에 조회하는 함수
export async function fetchReviewAuthors(userIds: string[]) {
  // Supabase profiles 테이블에서 id in userIds로 username 조회
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', userIds);
  // 결과를 id: username 형태의 맵으로 변환
  const map: Record<string, string> = {};
  if (data) {
    data.forEach((row: { id: string; username: string }) => {
      map[row.id] = row.username;
    });
  }
  return { data: map, error };
}

// 리뷰 도움돼요(Helpful) 투표 추가
export async function addReviewHelpful(reviewId: string) {
  // 현재 로그인 유저가 해당 리뷰에 도움돼요 투표 추가
  return supabase.from('review_helpful').insert([{ review_id: reviewId }]);
}

// 리뷰 도움돼요(Helpful) 투표 해제
export async function removeReviewHelpful(reviewId: string) {
  // 현재 로그인 유저가 해당 리뷰에 도움돼요 투표 해제
  return supabase.from('review_helpful').delete().eq('review_id', reviewId);
}

// 내가 해당 리뷰에 도움돼요 투표했는지 확인
export async function isReviewHelpful(reviewId: string) {
  const { data, error } = await supabase.from('review_helpful').select('*').eq('review_id', reviewId).single();
  return { isHelpful: !!data, error };
}

// 내가 쓴 리뷰 전체 조회
export async function fetchMyReviews(userId: string) {
  // 내 user_id로 리뷰 전체 조회, place 정보 조인
  return supabase.from('reviews').select('*, places(*)').eq('user_id', userId).order('created_at', { ascending: false });
} 