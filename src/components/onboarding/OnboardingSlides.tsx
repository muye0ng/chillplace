// 온보딩 슬라이드 컴포넌트입니다.
// 여러 장의 온보딩 슬라이드를 좌우로 넘길 수 있습니다.
import React, { useState } from 'react';

export interface OnboardingSlidesProps {
  slides: Array<{ title: string; description: string; imageUrl?: string }>;
  onFinish: () => void;
}

const OnboardingSlides: React.FC<OnboardingSlidesProps> = ({ slides, onFinish }) => {
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index < slides.length - 1) setIndex(index + 1);
    else onFinish();
  };
  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const slide = slides[index];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center p-4">
      {slide.imageUrl && <img src={slide.imageUrl} alt={slide.title} className="w-full h-40 object-cover rounded mb-4" />}
      <h2 className="text-xl font-bold mb-2">{slide.title}</h2>
      <p className="text-sm text-gray-700 mb-4 text-center">{slide.description}</p>
      <div className="flex justify-between w-full">
        <button onClick={prev} disabled={index === 0} className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50">이전</button>
        <button onClick={next} className="px-4 py-2 rounded bg-blue-500 text-white">{index === slides.length - 1 ? '시작하기' : '다음'}</button>
      </div>
      <div className="flex gap-1 mt-3">
        {slides.map((_, i) => (
          <span key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
        ))}
      </div>
    </div>
  );
};

export default OnboardingSlides; 