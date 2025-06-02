// 광고 시스템 API 라우트 (기본 구조)
// 실제 구현은 추후 추가 예정
import { NextResponse } from 'next/server';

export async function GET() {
  // 장소 검색
  return NextResponse.json({ message: '장소 검색' });
} 