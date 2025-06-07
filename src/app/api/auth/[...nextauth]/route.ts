import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// 환경변수 확인
console.log('🔍 NextAuth Environment Check:', {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ 설정됨' : '❌ 없음',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨' : '❌ 없음',
  NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID ? '✅ 설정됨' : '❌ 없음',
  NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ 설정됨' : '❌ 없음', 
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음',
  KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID ? '✅ 설정됨' : '❌ 없음',
  KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET ? '✅ 설정됨' : '❌ 없음',
});

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 