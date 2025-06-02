// Supabase DB 테이블 타입 정의 파일입니다.
// 주요 테이블: profiles, places, reviews, votes 등

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  preferred_language: string;
  interested_categories: string[];
  location_radius: number;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: string;
  kakao_place_id: string;
  name: string;
  category: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  place_id: string;
  content: string;
  image_url?: string;
  helpful_count: number;
  rating: number; // 1~5점
  created_at: string;
  updated_at: string;
  places?: Place | null; // Supabase 조인 결과용
}

export interface Vote {
  id: string;
  user_id: string;
  place_id: string;
  vote_type: 'like' | 'no';
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  place_id: string;
  created_at: string;
  places?: Place | null; // Supabase 조인 결과용
}

export interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string; // 예: 'review', 'reply', 'helpful', 'favorite'
  message: string;
  url?: string;
  is_read: boolean;
  created_at: string;
} 