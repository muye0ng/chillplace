// 투표 API 라우트 (기본 구조)
// 실제 구현은 추후 추가 예정
import { NextResponse } from 'next/server';

export async function POST() {
  // 투표 등록
  return NextResponse.json({ message: '투표 등록' });
} 