"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import Image from 'next/image';

interface Place {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  distance: string;
  description?: string;
}

interface SwipeCardProps {
  place: Place;
  onSwipe: (direction: 'left' | 'right', placeId: string) => Promise<boolean>;
  onTap?: (placeId: string) => void;
  isTopCard?: boolean;
  zIndex: number;
  isDesktop?: boolean; // PC 환경인지 확인
}

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  place, 
  onSwipe, 
  onTap, 
  isTopCard = false, 
  zIndex,
  isDesktop = false 
}) => {
  const [exitX, setExitX] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 이미지 URL 유효성 검사 함수
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.length < 4) return false;
    try {
      // 절대 경로이거나 상대 경로로 시작하는지 확인
      return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const getImageSrc = () => {
    return isValidImageUrl(place.imageUrl) ? place.imageUrl : '/icons/icon-192x192.png';
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // 색상 변화: 왼쪽으로 갈수록 빨간색, 오른쪽으로 갈수록 초록색
  const backgroundColor = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    [
      'rgba(239, 68, 68, 0.1)', // red-500 with opacity
      'rgba(0, 0, 0, 0)',
      'rgba(0, 0, 0, 0)',
      'rgba(0, 0, 0, 0)',
      'rgba(34, 197, 94, 0.1)'  // green-500 with opacity
    ]
  );

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      
      try {
        // 권한 체크를 먼저 수행
        const result = onSwipe(direction, place.id);
        const success = result instanceof Promise ? await result : result;
        
        // 성공했을 때만 애니메이션 실행
        if (success) {
          setExitX(info.offset.x > 0 ? 300 : -300);
          setIsExiting(true);
        }
        // 실패시에는 애니메이션 없이 원래 위치로 복귀
      } catch (error) {
        console.error('드래그 처리 중 오류:', error);
        // 오류 발생시에도 원래 위치로 복귀
      }
    }
    
    // 드래그 완료 후 잠시 기다렸다가 드래그 상태 해제 (탭 이벤트 방지)
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  // PC에서 X/하트 클릭 핸들러
  const handlePassClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDesktop && isTopCard) {
      // 스와이프 로직을 부모 컴포넌트에 위임 (권한 체크 포함)
      onSwipe('left', place.id);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDesktop && isTopCard) {
      // 스와이프 로직을 부모 컴포넌트에 위임 (권한 체크 포함)
      onSwipe('right', place.id);
    }
  };

  // 키보드 지원
  useEffect(() => {
    if (!isTopCard) return;
    
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        try {
          const result = onSwipe('left', place.id);
          const success = result instanceof Promise ? await result : result;
          if (success) {
            setExitX(-300);
            setIsExiting(true);
          }
        } catch (error) {
          console.error('키보드 이벤트 처리 중 오류:', error);
        }
      } else if (e.key === 'ArrowRight') {
        try {
          const result = onSwipe('right', place.id);
          const success = result instanceof Promise ? await result : result;
          if (success) {
            setExitX(300);
            setIsExiting(true);
          }
        } catch (error) {
          console.error('키보드 이벤트 처리 중 오류:', error);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTopCard, place.id, onSwipe]);

  // 이미지 로드 에러 핸들러
  const handleImageError = () => {
    setExitX(0);
    setIsExiting(false);
    setIsDragging(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`absolute inset-0 cursor-grab active:cursor-grabbing select-none ${
        !isTopCard ? 'pointer-events-none' : ''
      }`}
      style={{ 
        x,
        rotate,
        opacity,
        zIndex,
        backgroundColor,
        scale: isTopCard ? 1 : 0.95 - (2 - zIndex) * 0.05,
        y: isTopCard ? 0 : (3 - zIndex) * 8,
      }}
      drag={isTopCard ? "x" : false} // PC/모바일 모두 드래그 가능
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={!isDragging ? { 
        x: isExiting ? exitX : 0,
        opacity: isExiting ? 0 : 1,
        rotate: isExiting ? (exitX > 0 ? 30 : -30) : 0,
      } : {}}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: isExiting ? 0.3 : 0.1
      }}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.95, opacity: 0, y: 50 }}
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      onClick={!isDragging && !isExiting ? () => onTap?.(place.id) : undefined}
    >
      <div 
        className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        {/* 상단 이미지 영역 */}
        <div className="relative h-[60%] overflow-hidden">
          <Image
            src={getImageSrc()}
            alt={place.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={isTopCard}
            onError={handleImageError}
          />
          
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* 거리 배지 */}
          <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-3 py-1 border border-gray-200/50 dark:border-gray-600/50">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {place.distance}
            </span>
          </div>
          
          {/* 카테고리 배지 */}
          <div className="absolute top-4 left-4 bg-blue-500/95 dark:bg-blue-600/95 backdrop-blur-sm rounded-full px-3 py-1 border border-blue-400/50 dark:border-blue-500/50">
            <span className="text-sm font-medium text-white">
              {place.category}
            </span>
          </div>
        </div>

        {/* 하단 정보 영역 */}
        <div className="h-[40%] p-6 flex flex-col justify-between bg-white dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {place.name}
            </h2>
            {place.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                {place.description}
              </p>
            )}
          </div>
          
          {/* 스와이프 힌트 (최상단 카드에만 표시) */}
          {isTopCard && (
            <div className="flex justify-center items-center gap-4 mt-4">
              {/* Pass 영역 - 확장된 클릭 영역과 호버 효과 */}
              <motion.div 
                className={`flex items-center gap-2 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isDesktop ? 'cursor-pointer hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/15 dark:hover:from-red-400/10 dark:hover:to-red-500/15 hover:shadow-lg hover:scale-105' : ''
                }`}
                onClick={handlePassClick}
                whileHover={isDesktop ? { scale: 1.02 } : {}}
                whileTap={isDesktop ? { scale: 0.98 } : {}}
              >
                <motion.div
                  animate={!isDesktop ? { x: [-5, 5, -5] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-8 h-8 rounded-full bg-red-500/20 dark:bg-red-400/20 flex items-center justify-center border border-red-500/30 dark:border-red-400/30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </motion.div>
                <span className="text-sm font-medium">Pass</span>
              </motion.div>
              
              {/* Like 영역 - 확장된 클릭 영역과 호버 효과 */}
              <motion.div 
                className={`flex items-center gap-2 text-green-500 dark:text-green-400 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isDesktop ? 'cursor-pointer hover:bg-gradient-to-r hover:from-green-500/10 hover:to-green-600/15 dark:hover:from-green-400/10 dark:hover:to-green-500/15 hover:shadow-lg hover:scale-105' : ''
                }`}
                onClick={handleLikeClick}
                whileHover={isDesktop ? { scale: 1.02 } : {}}
                whileTap={isDesktop ? { scale: 0.98 } : {}}
              >
                <span className="text-sm font-medium">Like</span>
                <motion.div
                  animate={!isDesktop ? { x: [5, -5, 5] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-8 h-8 rounded-full bg-green-500/20 dark:bg-green-400/20 flex items-center justify-center border border-green-500/30 dark:border-green-400/30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      
      {/* 스와이프 인디케이터 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: useTransform(x, [-100, -50, 50, 100], [1, 0, 0, 1]) }}
      >
        <motion.div
          className="px-6 py-3 rounded-full font-bold text-2xl border-4"
          style={{
            borderColor: useTransform(x, [-100, 0, 100], ['#ef4444', '#ef4444', '#22c55e']),
            color: useTransform(x, [-100, 0, 100], ['#ef4444', '#ef4444', '#22c55e']),
            rotate: useTransform(x, [-100, 0, 100], [-20, 0, 20])
          }}
        >
          <motion.span
            style={{
              opacity: useTransform(x, [-100, -50, 0], [1, 1, 0])
            }}
          >
            PASS
          </motion.span>
          <motion.span
            style={{
              opacity: useTransform(x, [0, 50, 100], [0, 1, 1])
            }}
          >
            LIKE
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SwipeCard; 