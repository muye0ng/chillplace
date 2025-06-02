// 카카오 API 관련 타입 정의 파일입니다.
// 장소 검색 결과 등

export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  address_name: string;
  phone?: string;
  x: string; // 경도 (문자열)
  y: string; // 위도 (문자열)
  place_url?: string;
  distance?: string;
  category_group_code?: string;
  category_group_name?: string;
  road_address_name?: string;
}

export interface KakaoPlaceSearchResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
} 