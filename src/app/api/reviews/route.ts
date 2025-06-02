// 리뷰 CRUD API 라우트 (기본 구조)
// 실제 구현은 추후 추가 예정
import { NextResponse } from 'next/server';

export async function GET() {
  // 리뷰 목록 조회
  return NextResponse.json({ message: '리뷰 목록' });
}

export async function POST() {
  // 리뷰 등록
  return NextResponse.json({ message: '리뷰 등록' });
} 