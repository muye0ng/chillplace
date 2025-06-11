// 공통 유틸리티 함수 모음 파일입니다.
// 예시: 거리(m)를 km 단위로 변환하는 함수

import { customAlphabet } from 'nanoid';

export function meterToKm(meter: number): string {
  // 1000m 이상이면 km로 변환, 아니면 m로 표시
  if (meter >= 1000) {
    return `${(meter / 1000).toFixed(1)}km`;
  }
  return `${meter}m`;
}

// 사용자명 생성을 위한 함수
export const generateUsername = () => {
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);
  return `user_${nanoid()}`;
}; 