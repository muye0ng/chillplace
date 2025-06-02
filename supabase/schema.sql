-- 사용자 프로필 (auth.users 확장)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY, -- 사용자 ID (auth.users와 연동)
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
-- 프로필 보안
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 리뷰 보안
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT TO authenticated;
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- 투표 보안
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own votes" ON votes FOR ALL USING (auth.uid() = user_id);

-- 즐겨찾기 보안
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id); 