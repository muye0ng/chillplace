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

// 장소 이미지 업로드 (Supabase Storage)
export async function uploadPlaceImage(file: File, placeName: string) {
  // 파일명을 고유하게 생성 (예: placeName-timestamp)
  const fileExt = file.name.split('.').pop();
  const filePath = `places/${placeName}-${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('place-images').upload(filePath, file);
  if (error) throw error;
  // public URL 반환
  const { data: urlData } = supabase.storage.from('place-images').getPublicUrl(filePath);
  return urlData.publicUrl;
}

// 장소 수정
export async function updatePlace(id: string, data: Partial<{
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  phone?: string;
}>) {
  return supabase.from('places').update(data).eq('id', id);
}

// 장소 삭제
export async function deletePlace(id: string) {
  return supabase.from('places').delete().eq('id', id);
} 