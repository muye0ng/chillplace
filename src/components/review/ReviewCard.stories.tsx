import React from 'react';
import ReviewCard from './ReviewCard';

export default {
  title: '컴포넌트/리뷰카드',
  component: ReviewCard,
};

const mockReview = {
  id: 'r1',
  content: '분위기 좋은 카페에서 커피 한잔 했어요! 추천합니다 ☕️',
  author: '홍길동',
  timeAgo: '2시간 전',
  helpfulCount: 3,
  imageUrl: '/icons/icon-192x192.png',
  rating: 5,
};

export const 기본 = () => (
  <ReviewCard
    review={mockReview}
    onHelpful={() => {}}
    isHelpful={false}
  />
);

export const 도움돼요 = () => (
  <ReviewCard
    review={mockReview}
    onHelpful={() => {}}
    isHelpful={true}
  />
);

export const 이미지없음 = () => (
  <ReviewCard
    review={{ ...mockReview, imageUrl: '' }}
    onHelpful={() => {}}
    isHelpful={false}
  />
); 