# 오늘 뭐하지? 리뷰 플랫폼

동네 체험/장소를 30초 리뷰로 공유하는 위치기반 플랫폼

---

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

## 환경 변수(.env.local 예시)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

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
