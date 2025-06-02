// 공통 유틸리티 함수 모음 파일입니다.
// 예시: 거리(m)를 km 단위로 변환하는 함수

export function meterToKm(meter: number): string {
  // 1000m 이상이면 km로 변환, 아니면 m로 표시
  if (meter >= 1000) {
    return `${(meter / 1000).toFixed(1)}km`;
  }
  return `${meter}m`;
} 