import React from 'react';
import PlaceCard from './PlaceCard';

export default {
  title: '컴포넌트/장소카드',
  component: PlaceCard,
};

const mockPlace = {
  id: '1',
  name: '카페 오늘',
  category: '카페',
  imageUrl: '/icons/icon-192x192.png',
  likeCount: 12,
  noCount: 2,
  distance: '0.3km',
};

export const 기본 = () => (
  <PlaceCard
    place={mockPlace}
    onVote={() => {}}
    isFavorite={false}
    onToggleFavorite={() => {}}
    onClick={() => {}}
  />
);

export const 즐겨찾기 = () => (
  <PlaceCard
    place={mockPlace}
    onVote={() => {}}
    isFavorite={true}
    onToggleFavorite={() => {}}
    onClick={() => {}}
  />
);

export const 이미지없음 = () => (
  <PlaceCard
    place={{ ...mockPlace, imageUrl: '' }}
    onVote={() => {}}
    isFavorite={false}
    onToggleFavorite={() => {}}
    onClick={() => {}}
  />
); 