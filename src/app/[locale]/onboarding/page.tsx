"use client";
// 온보딩 페이지: 첫 방문/신규 유저를 위한 서비스 소개 슬라이드
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const slides = [
  {
    title: '오늘 뭐하지?에 오신 걸 환영합니다!',
    desc: '위치 기반으로 주변의 핫플, 리뷰, 이벤트를 한눈에!\n실시간 피드와 트렌디한 UI를 경험해보세요.',
    image: '/onboarding/slide1.png',
  },
  {
    title: '리뷰, 투표, 즐겨찾기, 도움돼요',
    desc: '장소별 리뷰와 투표, 즐겨찾기, 도움돼요 등\n실제 사용자들의 생생한 피드백을 확인하세요.',
    image: '/onboarding/slide2.png',
  },
  {
    title: '지도와 위치 권한 안내',
    desc: '정확한 추천을 위해 위치 권한이 필요합니다.\n권한 허용 후, 내 주변의 새로운 장소를 발견하세요!',
    image: '/onboarding/slide3.png',
  },
];

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const router = useRouter();

  // 이미 온보딩 완료한 경우 자동 이동
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('onboarding_done') === 'true') {
      router.replace('/ko');
    }
  }, [router]);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboarding_done', 'true');
      router.replace('/ko');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 animate-fade-in">
        <img src={slides[step].image} alt="온보딩 이미지" className="w-40 h-40 object-contain mb-2" />
        <h2 className="text-2xl font-extrabold text-blue-600 mb-2 text-center">{slides[step].title}</h2>
        <p className="text-gray-500 text-center whitespace-pre-line">{slides[step].desc}</p>
        <div className="flex gap-2 mt-4">
          {slides.map((_, idx) => (
            <span key={idx} className={`w-3 h-3 rounded-full ${idx === step ? 'bg-blue-500' : 'bg-gray-200'} transition`}></span>
          ))}
        </div>
        <button
          className="mt-6 w-full bg-gradient-to-tr from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white rounded-full py-3 font-bold text-lg shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200"
          onClick={handleNext}
        >
          {step < slides.length - 1 ? '다음' : '시작하기'}
        </button>
      </div>
    </main>
  );
};

export default OnboardingPage; 