import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: string) => void;
  placeName: string;
  placeImage: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  placeName,
  placeImage
}) => {
  const [review, setReview] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxLength = 50;
  const remainingChars = maxLength - review.length;

  const handleClose = useCallback(() => {
    setReview('');
    setTimeLeft(30);
    setIsActive(false);
    setHasStarted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (review.trim()) {
      onSubmit(review.trim());
    }
    handleClose();
  }, [review, onSubmit, handleClose]);

  // 타이머 관리
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, handleSubmit]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleClose, handleSubmit]);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      // 모달이 열리면 3초 후 자동 시작
      const startTimer = setTimeout(() => {
        setHasStarted(true);
        setIsActive(true);
        textareaRef.current?.focus();
      }, 3000);

      return () => clearTimeout(startTimer);
    }
  }, [isOpen, hasStarted]);

  const handleSkip = () => {
    handleClose();
  };

  const startReview = () => {
    setHasStarted(true);
    setIsActive(true);
    textareaRef.current?.focus();
  };

  const getTimerColor = () => {
    if (timeLeft > 20) return 'text-green-500';
    if (timeLeft > 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = () => {
    if (timeLeft > 20) return '#22c55e'; // green-500
    if (timeLeft > 10) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  const circumference = 2 * Math.PI * 45; // radius = 45
  const progress = ((30 - timeLeft) / 30) * circumference;

  // 이미지 URL 유효성 검사 함수
  const isValidImageUrl = (url: string): boolean => {
    if (!url || url.length < 4) return false;
    try {
      return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const getImageSrc = () => {
    return isValidImageUrl(placeImage) ? placeImage : '/icons/icon-192x192.png';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* 배경 블러 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* 모달 컨텐츠 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="relative h-32 overflow-hidden">
              <Image
                src={getImageSrc()}
                alt={placeName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-white font-bold text-lg line-clamp-1">
                  {placeName}에 대한 솔직한 리뷰
                </h2>
              </div>
            </div>

            <div className="p-6">
              {!hasStarted ? (
                /* 시작 전 화면 */
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    30초 리뷰 챌린지!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                    이 장소에 대한 솔직한 후기를 30초 안에 50자 이내로 작성해주세요.<br/>
                    간단하고 핵심적인 내용으로!
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSkip}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                    >
                      건너뛰기
                    </button>
                    <button
                      onClick={startReview}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-colors"
                    >
                      시작하기
                    </button>
                  </div>
                </div>
              ) : (
                /* 리뷰 작성 화면 */
                <div className="space-y-4">
                  {/* 타이머 */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg width="100" height="100" className="transform -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke={getProgressColor()}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - progress}
                          className="transition-all duration-1000 ease-linear"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${getTimerColor()}`}>
                          {timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 텍스트 입력 */}
                  <div className="space-y-2">
                    <textarea
                      ref={textareaRef}
                      value={review}
                      onChange={(e) => {
                        if (e.target.value.length <= maxLength) {
                          setReview(e.target.value);
                        }
                      }}
                      placeholder="이 장소는..."
                      maxLength={maxLength}
                      rows={3}
                      className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={!isActive}
                    />
                    
                    {/* 글자 수 표시 */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        솔직하고 간단하게 작성해주세요
                      </span>
                      <span className={`font-medium ${
                        remainingChars < 10 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {remainingChars}/50
                      </span>
                    </div>
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSkip}
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                    >
                      건너뛰기
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!review.trim() || !isActive}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                    >
                      제출하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal; 