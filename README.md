# 칠 플레이스 (Chill Place)

위치 기반 장소 추천 및 리뷰 서비스

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 주요 기능
- 위치 기반 장소/리뷰 추천
- 소셜 로그인(Google, Kakao)
- 장소/리뷰/투표/광고/온보딩/네비게이션 등 최신 서비스 구조
- PWA 지원(앱 설치, 오프라인, 아이콘)
- Supabase 연동(인증, DB, Storage)
- 반응형 UI, 모바일 최적화, 접근성

## 사용 기술 스택
- Next.js 14/15 (App Router)
- Supabase (DB, 인증, Storage)
- Tailwind CSS, shadcn/ui
- react-kakao-maps-sdk (카카오맵)
- next-pwa (PWA)
- TypeScript, ESLint, dayjs 등

## 폴더 구조
- `src/app` : 페이지/라우트
- `src/components` : UI 컴포넌트
- `src/lib` : Supabase, hooks, 유틸
- `src/types` : 타입 정의
- `public` : 정적 파일, 아이콘, manifest 등

## 환경변수 설정

프로젝트 실행을 위해 `.env.local` 파일을 생성하고 다음 환경변수를 설정해주세요:

```bash
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google/Kakao 공식 SDK 사용 (선택사항, 더 나은 UX)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_app_key

# 카카오맵 API (선택사항)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

## OAuth 소셜 로그인 설정 (선택사항)

Google/Kakao 소셜 로그인을 사용하려면 추가 설정이 필요합니다:

1. **Supabase 대시보드** > Authentication > Providers
2. **Google/Kakao Provider 활성화** 
3. **각 제공자의 개발자 콘솔에서 OAuth 앱 생성**
4. **리다이렉트 URL 설정**: `https://your-project.supabase.co/auth/v1/callback`

### Google OAuth 설정
- [Google Cloud Console](https://console.cloud.google.com/) 접속
- OAuth 2.0 클라이언트 ID 생성
- 승인된 리디렉션 URI에 Supabase 콜백 URL 추가

### Kakao OAuth 설정  
- [Kakao Developers](https://developers.kakao.com/) 접속
- 애플리케이션 등록 및 Redirect URI 설정

**참고**: 소셜 로그인 없이도 이메일/비밀번호 로그인은 정상 작동합니다.

## 실행 방법
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드 및 배포용 실행
npm run build && npm start
```

## 배포 가이드
- Vercel, Netlify 등 Next.js 지원 플랫폼에 바로 배포 가능
- 환경변수는 배포 플랫폼의 환경설정에 입력
- PWA: manifest.json, 서비스워커 자동 적용
- SEO: 메타태그, 접근성, 반응형 지원

## 품질 점검 체크리스트
- [x] 타입/ESLint/실행 에러 없음
- [x] 모바일/PC 반응형, 텍스트 가독성
- [x] PWA(설치, 아이콘, manifest, 서비스워커)
- [x] SEO/접근성/메타태그
- [x] 주요 기능(로그인, 리뷰, 지도, 온보딩, 광고, 네비 등) 정상 동작
- [ ] `<img>` → `<Image />` 변환(추후 개선 권장)

## 문의/기여
- 이 저장소는 최신 Next.js/Supabase 기반 위치기반 리뷰 플랫폼 예시입니다.
- 추가 문의/기여는 PR 또는 이슈로 남겨주세요.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 더미 데이터 관리

### 더미 데이터 생성
```bash
# 모든 더미 데이터 생성 (사용자 50명, 장소 100개, 리뷰 300개, 투표 500개, 즐겨찾기 200개)
npm run seed-data
```

### 더미 데이터 삭제
```bash
# 모든 더미 데이터 삭제
npm run clear-data

# 특정 테이블만 삭제
npm run clear-data -- --table places
npm run clear-data -- --table reviews
```

### 생성되는 더미 데이터

**👥 사용자 (50명)**
- 한국 이름과 랜덤 번호 조합
- 프로필 사진 (Unsplash 이미지)
- 관심 카테고리 1-3개 랜덤 선택

**📍 장소 (100개)**
- 서울 주요 지역 (강남, 홍대, 명동 등) 분산 배치
- 카테고리: 카페, 음식점, 술집, 쇼핑, 문화/여가
- 실제와 유사한 주소, 전화번호, 이미지

**📝 리뷰 (300개)**
- 평점에 따른 리뷰 내용 자동 매칭
- 30% 확률로 리뷰 이미지 포함
- 최근 90일 내 작성일 랜덤 배치

**👍 투표 (500개)**
- 70% 좋아요, 30% 싫어요 비율
- 사용자-장소 중복 방지

**⭐ 즐겨찾기 (200개)**
- 사용자-장소 중복 방지
- 최근 30일 내 생성일 랜덤 배치

## 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # 더미 데이터 스크립트용
```

## 주요 기능

- 🗺️ 위치 기반 장소 추천
- 💫 틴더 스타일 스와이프 UI
- 📱 PWA 지원
- 🌓 다크/라이트 모드
- 📱💻 반응형 디자인 (모바일/PC 최적화)
- 🔐 회원/비회원 권한 관리
- ⭐ 즐겨찾기 및 리뷰 시스템
