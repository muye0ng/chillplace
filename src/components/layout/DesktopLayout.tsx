import React from 'react';
import { motion } from 'framer-motion';
import SwipeCardStack from '@/components/ui/SwipeCardStack';

interface DesktopLayoutProps {
  places: Array<{
    id: string;
    name: string;
    category: string;
    imageUrl: string;
    distance: string;
    description?: string;
  }>;
  onSwipeLeft: (placeId: string) => Promise<boolean> | boolean;
  onSwipeRight: (placeId: string) => Promise<boolean> | boolean;
  onCardTap: (placeId: string) => void;
  loading: boolean;
  error: Error | string | null;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  places,
  onSwipeLeft,
  onSwipeRight,
  onCardTap,
  loading,
  error
}) => {
  return (
    <div className="grid lg:grid-cols-2 gap-8 h-full min-h-[600px]">
      {/* 왼쪽: 카드 스택 영역 */}
      <div className="flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            새로운 장소 발견하기
          </h2>
          
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <p className="text-blue-500 dark:text-blue-300 font-medium">새로운 장소를 찾고 있어요...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p className="text-red-500 dark:text-red-300 font-medium">에러: {error instanceof Error ? error.message : String(error)}</p>
            </motion.div>
          )}

          {!loading && places.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-400">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12h8"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                주변에 등록된 장소가 없습니다
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                첫 리뷰의 주인공이 되어보세요!
              </p>
            </motion.div>
          )}

          {!loading && places.length > 0 && (
            <SwipeCardStack
              places={places}
              onSwipeLeft={onSwipeLeft}
              onSwipeRight={onSwipeRight}
              onCardTap={onCardTap}
              isDesktop={true}
            />
          )}
        </motion.div>
      </div>

      {/* 오른쪽: 지도 영역 */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg min-h-[500px]"
      >
        {/* 지도 플레이스홀더 */}
        <div className="h-full flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            지도 뷰
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            주변 장소들의 위치를 지도에서 확인하세요
          </p>
          <button 
            onClick={() => window.location.href = '/ko/map'}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            지도 보기
          </button>
        </div>

        {/* 지도 통계 */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{places.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">주변 장소</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">2.5km</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">반경 내</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DesktopLayout; 