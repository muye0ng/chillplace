// 카카오맵 유틸 함수 모음입니다.
// 좌표 변환, 거리 계산 등 예시 함수 포함

// 두 좌표 간 거리(m) 계산 (Haversine 공식)
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 지구 반지름(m)
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 좌표 → 주소 변환(Reverse Geocoding, 카카오 REST API 사용)
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  if (!REST_API_KEY) throw new Error('카카오 REST API 키가 설정되지 않았습니다.');
  const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
  });
  if (!res.ok) throw new Error('카카오 주소 변환 실패');
  const data = await res.json();
  if (data.documents && data.documents.length > 0) {
    // 도로명주소 > 지번주소 우선 반환
    const doc = data.documents[0];
    return doc.road_address?.address_name || doc.address?.address_name || '';
  }
  return '';
} 