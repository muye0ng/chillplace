// 즐겨찾기 데이터 관련 커스텀 훅입니다.
// 내 즐겨찾기 목록 fetch, 추가/삭제, 로딩/에러 상태 관리
import { useState, useEffect, useCallback } from 'react';
import { fetchMyFavorites, addFavorite, removeFavorite, isFavorite } from '../supabase/favorites';
import type { Favorite } from '@/types/database';

// 내 즐겨찾기 전체 목록을 관리하는 훅
export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 즐겨찾기 목록 불러오기
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await fetchMyFavorites();
    if (error) setError(error.message);
    else setFavorites(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // 즐겨찾기 추가
  const add = useCallback(async (placeId: string) => {
    await addFavorite(placeId);
    fetchFavorites();
  }, [fetchFavorites]);

  // 즐겨찾기 삭제
  const remove = useCallback(async (placeId: string) => {
    await removeFavorite(placeId);
    fetchFavorites();
  }, [fetchFavorites]);

  // 특정 장소가 즐겨찾기인지 확인
  const check = useCallback(async (placeId: string) => {
    const { isFavorite: fav } = await isFavorite(placeId);
    return fav;
  }, []);

  return { favorites, loading, error, add, remove, check, refetch: fetchFavorites };
} 