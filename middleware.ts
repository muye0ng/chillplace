// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const allowedLocales = ['ko', 'en'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 루트(/) 접근 시 /ko로 리다이렉트
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/ko', request.url));
  }

  // /ko, /en 등 허용된 locale만 통과, 나머지는 /ko로 리다이렉트
  const match = pathname.match(/^\/([^/]+)/);
  if (match && !allowedLocales.includes(match[1])) {
    return NextResponse.redirect(new URL('/ko', request.url));
  }

  return NextResponse.next();
}