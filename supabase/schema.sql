-- NextAuth.js 호환 테이블들 (public 스키마)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" BIGINT,
  "token_type" TEXT,
  scope TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- 사용자 프로필 (users 확장)
CREATE TABLE profiles (
  id UUID REFERENCES users PRIMARY KEY, -- NextAuth.js users와 연동
  username TEXT UNIQUE, -- 닉네임
  full_name TEXT, -- 전체 이름
  avatar_url TEXT, -- 프로필 이미지
  preferred_language TEXT DEFAULT 'ko', -- 선호 언어
  interested_categories TEXT[] DEFAULT '{}', -- 관심 카테고리
  location_radius INTEGER DEFAULT 10000, -- 위치 반경 (미터)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 수정일
);

-- 장소 정보 (카카오 API 연동)
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- 장소 ID
  kakao_place_id TEXT UNIQUE NOT NULL, -- 카카오 장소 고유 ID
  name TEXT NOT NULL, -- 장소명
  category TEXT NOT NULL, -- 카카오 카테고리
  address TEXT NOT NULL, -- 주소
  phone TEXT, -- 전화번호
  latitude DECIMAL(10, 8) NOT NULL, -- 위도
  longitude DECIMAL(11, 8) NOT NULL, -- 경도
  image_url TEXT, -- 대표 이미지
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 수정일
);

-- 리뷰 테이블
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- 리뷰 ID
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- 작성자
  place_id UUID REFERENCES places(id) ON DELETE CASCADE, -- 장소
  content TEXT NOT NULL CHECK (char_length(content) <= 50), -- 50자 제한
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1~5점 별점
  image_url TEXT, -- 선택적 이미지
  helpful_count INTEGER DEFAULT 0, -- 도움됨 수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 수정일
);

-- 투표 시스템 (Like/No)
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- 투표 ID
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- 투표자
  place_id UUID REFERENCES places(id) ON DELETE CASCADE, -- 장소
  vote_type TEXT CHECK (vote_type IN ('like', 'no')) NOT NULL, -- 투표 타입
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  UNIQUE(user_id, place_id) -- 한 사용자당 한 장소에 하나의 투표
);

-- 리뷰 도움됨 투표
CREATE TABLE review_helpful (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- 도움됨 투표 ID
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- 투표자
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE, -- 리뷰
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  UNIQUE(user_id, review_id)
);

-- 즐겨찾기
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- 즐겨찾기 ID
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- 사용자
  place_id UUID REFERENCES places(id) ON DELETE CASCADE, -- 장소
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  UNIQUE(user_id, place_id)
);

-- 광고 시스템
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- 광고 ID
  title TEXT NOT NULL, -- 광고 제목
  content TEXT NOT NULL, -- 광고 내용
  image_url TEXT, -- 광고 이미지
  target_url TEXT, -- 광고 클릭 시 이동 URL
  category TEXT, -- 타겟 카테고리
  location_radius INTEGER, -- 타겟 지역 반경
  is_active BOOLEAN DEFAULT true, -- 활성화 여부
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  expires_at TIMESTAMP WITH TIME ZONE -- 만료일
);

-- 광고 노출 로그
CREATE TABLE ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- 노출 로그 ID
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE, -- 광고
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- 사용자
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 노출 시각
);

-- RLS(행 수준 보안) 정책
-- 프로필 보안 (NextAuth.js 세션 기반으로 수정 필요)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT TO authenticated;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id::text = current_setting('request.jwt.claims')::json->>'sub');

-- 리뷰 보안
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT TO authenticated;
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (user_id::text = current_setting('request.jwt.claims')::json->>'sub');
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (user_id::text = current_setting('request.jwt.claims')::json->>'sub');
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (user_id::text = current_setting('request.jwt.claims')::json->>'sub');

-- 투표 보안
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own votes" ON votes FOR ALL USING (user_id::text = current_setting('request.jwt.claims')::json->>'sub');

-- 즐겨찾기 보안
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (user_id::text = current_setting('request.jwt.claims')::json->>'sub');

-- NextAuth.js 사용자 생성 시 프로필 자동 생성 트리거 함수
CREATE OR REPLACE FUNCTION handle_nextauth_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.name, split_part(NEW.email, '@', 1)),
    COALESCE(NEW.name, NEW.email),
    COALESCE(NEW.image, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(NEW.name, split_part(NEW.email, '@', 1)),
    full_name = COALESCE(NEW.name, NEW.email),
    avatar_url = COALESCE(NEW.image, ''),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NextAuth.js 사용자 생성 시 자동으로 프로필 생성하는 트리거
DROP TRIGGER IF EXISTS on_nextauth_user_created ON users;
CREATE TRIGGER on_nextauth_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE PROCEDURE handle_nextauth_user(); 