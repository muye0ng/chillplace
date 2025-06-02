// 즐겨찾기(Favorites) 관련 Supabase 함수 모음입니다.
// 즐겨찾기 추가, 삭제, 조회 등 함수 뼈대 제공
import { supabase } from './client';

// 즐겨찾기 추가
export async function addFavorite(placeId: string) {
  // 현재 로그인 유저의 즐겨찾기 추가
  return supabase.from('favorites').insert([{ place_id: placeId }]);
}

// 즐겨찾기 삭제
export async function removeFavorite(placeId: string) {
  // 현재 로그인 유저의 즐겨찾기 삭제
  return supabase.from('favorites').delete().eq('place_id', placeId);
}

// 내 즐겨찾기 전체 조회
export async function fetchMyFavorites() {
  // 현재 로그인 유저의 즐겨찾기 목록 조회
  return supabase.from('favorites').select('*, places(*)').order('created_at', { ascending: false });
}

// 특정 장소가 즐겨찾기인지 확인
export async function isFavorite(placeId: string) {
  // 현재 로그인 유저의 즐겨찾기 여부 확인
  const { data, error } = await supabase.from('favorites').select('*').eq('place_id', placeId).single();
  return { isFavorite: !!data, error };
} 