import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';

interface Place {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  distance: string;
  description?: string;
}

interface SwipeCardStackProps {
  places: Place[];
  onSwipeLeft: (placeId: string) => Promise<boolean> | boolean;
  onSwipeRight: (placeId: string) => Promise<boolean> | boolean;
  onCardTap?: (placeId: string) => void;
  maxVisible?: number;
  isDesktop?: boolean;
}

const SwipeCardStack: React.FC<SwipeCardStackProps> = ({
  places,
  onSwipeLeft,
  onSwipeRight,
  onCardTap,
  maxVisible = 3,
  isDesktop = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [removedCards, setRemovedCards] = useState<Set<string>>(new Set());

  const visiblePlaces = places
    .filter(place => !removedCards.has(place.id))
    .slice(currentIndex, currentIndex + maxVisible);

  const handleSwipe = useCallback(async (direction: 'left' | 'right', placeId: string) => {
    let success = false;
    
    try {
      // 권한 체크 및 실제 액션 수행
      if (direction === 'left') {
        const result = onSwipeLeft(placeId);
        success = result instanceof Promise ? await result : result;
      } else {
        const result = onSwipeRight(placeId);
        success = result instanceof Promise ? await result : result;
      }
    } catch (error) {
      console.error('스와이프 처리 중 오류:', error);
      success = false;
    }
    
    // 성공했을 때만 카드 제거 및 다음 카드로 이동
    if (success) {
      setRemovedCards(prev => new Set(prev).add(placeId));
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 100);
    }
    // 실패시에는 카드가 그대로 유지됨
  }, [onSwipeLeft, onSwipeRight]);

  const handleCardTap = useCallback((placeId: string) => {
    onCardTap?.(placeId);
  }, [onCardTap]);

  // 모든 카드가 스와이프되었을 때
  if (visiblePlaces.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            모든 장소를 확인했습니다!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            새로운 장소가 추가되면 알려드릴게요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto h-[600px]">
      <AnimatePresence>
        {visiblePlaces.map((place, index) => (
          <SwipeCard
            key={place.id}
            place={place}
            onSwipe={handleSwipe}
            onTap={handleCardTap}
            isTopCard={index === 0}
            zIndex={maxVisible - index}
            isDesktop={isDesktop}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SwipeCardStack; 