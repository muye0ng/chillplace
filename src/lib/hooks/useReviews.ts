// 리뷰 데이터 관련 커스텀 훅입니다.
// SWR 기반 리뷰 목록 fetch, 로딩/에러/실시간 반영 지원
import useSWR from 'swr';
import { fetchReviews } from '../supabase/reviews';
// import type { Review } from '@/types/database'; // 사용하지 않으므로 주석 처리 또는 삭제

const fetcher = async (placeId: string) => {
  const { data, error } = await fetchReviews(placeId);
  if (error) throw error;
  return data;
};

export function useReviews(placeId: string) {
  const { data: reviews = [], error, isLoading, mutate } = useSWR(['reviews', placeId], () => fetcher(placeId), {
    refreshInterval: 5000,
  });
  return { reviews, loading: isLoading, error, mutate };
} 