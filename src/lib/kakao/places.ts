// 카카오 장소 검색 함수입니다.
// 카카오 REST API를 fetch로 호출 (실제 서비스키 필요)

export interface KakaoPlaceSearch {
  query: string;
  x?: number;
  y?: number;
  radius?: number;
  category_group_code?: string;
}

export async function searchKakaoPlaces(/* params: KakaoPlaceSearch */) {
  // TODO: 실제 REST API 호출 구현 (API 키 필요)
  // 예시: https://dapi.kakao.com/v2/local/search/keyword.json
  // fetch 사용, Authorization: KakaoAK {REST_API_KEY}
  return [];
} 