// 리뷰 관련 타입 정의 파일입니다.
// ReviewCardProps 등 컴포넌트에서 사용

export interface ReviewCardType {
  id: string;
  content: string; // 50자 제한
  author: string;
  timeAgo: string;
  helpfulCount: number;
  imageUrl?: string;
  rating: number; // 1~5점
}

export interface ReviewFormType {
  placeId: string;
  content: string;
  rating: number;
  image?: File;
}

export interface ReplyCardType {
  id: string;
  reviewId: string;
  author: string;
  content: string;
  timeAgo: string;
}

export interface ReplyFormType {
  reviewId: string;
  content: string;
} 