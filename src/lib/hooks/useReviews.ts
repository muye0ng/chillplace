// 리뷰 데이터 관련 커스텀 훅입니다.
// 리뷰 목록 fetch, 로딩/에러 상태 관리
import { useState, useEffect } from 'react';
import { fetchReviews } from '../supabase/reviews';
import type { Review } from '@/types/database';

export function useReviews(placeId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchReviews(placeId)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setReviews(data || []);
      })
      .finally(() => setLoading(false));
  }, [placeId]);

  return { reviews, loading, error };
} 