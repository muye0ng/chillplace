// 장소 관련 Supabase 함수 모음입니다.
// 장소 검색, 등록 등 함수 뼈대 제공
import { supabase } from './client';

// 장소 검색 (이름/카테고리 등)
export async function searchPlaces(query: string) {
  // 실제 구현은 supabase.from('places').select() 등 사용
  return supabase.from('places').select('*').ilike('name', `%${query}%`);
}

// 장소 등록
export async function createPlace(data: {
  kakao_place_id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  phone?: string;
}) {
  return supabase.from('places').insert([data]);
}

// 장소 전체 목록 조회 함수
export async function fetchAllPlaces() {
  // Supabase에서 모든 장소를 불러옵니다.
  return supabase.from('places').select('*');
} 