import React, { useState } from 'react';

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

const OnboardingBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      title: "주변 핫플 발견하기",
      description: "내 주변 맛집과 카페를 실시간으로 확인해보세요!",
      illustration: (
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      )
    },
    {
      id: 2,
      title: "리뷰 작성하고 투표하기",
      description: "직접 방문한 장소에 리뷰를 남기고 다른 사람들과 의견을 나눠보세요.",
      illustration: (
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-6 0v4"/>
            <rect x="2" y="9" width="20" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="15" r="1"/>
          </svg>
        </div>
      )
    },
    {
      id: 3,
      title: "즐겨찾기로 관리하기",
      description: "마음에 드는 장소를 즐겨찾기에 추가해서 쉽게 찾아보세요.",
      illustration: (
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const hideForToday = () => {
    localStorage.setItem('onboarding_hidden_until', String(Date.now() + 24 * 60 * 60 * 1000));
    setIsVisible(false);
  };

  // 오늘 이미 숨겼는지 확인
  React.useEffect(() => {
    const hiddenUntil = localStorage.getItem('onboarding_hidden_until');
    if (hiddenUntil && Date.now() < Number(hiddenUntil)) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full max-w-md mx-auto mb-4 px-2">
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-[1px] shadow-lg">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 relative">
          {/* 닫기 버튼 */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="배너 닫기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className="flex items-center gap-4">
            {/* 일러스트 */}
            <div className="flex-shrink-0">
              {currentSlideData.illustration}
            </div>

            {/* 컨텐츠 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                {currentSlideData.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>

            {/* 네비게이션 */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="이전"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="다음"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>

          {/* 인디케이터 */}
          <div className="flex justify-center gap-1 mt-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>

          {/* 하단 액션 */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={hideForToday}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              오늘 하루 안보기
            </button>
            <div className="text-xs text-gray-400">
              {currentSlide + 1} / {slides.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingBanner; 