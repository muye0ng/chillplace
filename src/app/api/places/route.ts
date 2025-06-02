// 장소 검색/등록 API 라우트 (기본 구조)
// 실제 구현은 추후 추가 예정
import { NextResponse } from 'next/server';

export async function GET() {
  // 장소 검색
  return NextResponse.json({ message: '장소 검색' });
}

export async function POST() {
  // 장소 등록
  return NextResponse.json({ message: '장소 등록' });
} 