import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SignupPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string; // 사용자가 시도한 액션 설명
}

const SignupPromptModal: React.FC<SignupPromptModalProps> = ({
  isOpen,
  onClose,
  action = '이 기능'
}) => {
  const router = useRouter();

  const handleSignup = () => {
    onClose();
    router.push('/ko/register');
  };

  const handleLogin = () => {
    onClose();
    router.push('/ko/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* 배경 블러 - 글라스모피즘 */}
          <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md" />
          
          {/* 모달 컨텐츠 - 글라스모피즘 적용 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 - 그라디언트 글라스모피즘 */}
            <div className="relative bg-gradient-to-br from-blue-500/90 to-purple-600/90 dark:from-blue-600/80 dark:to-purple-700/80 backdrop-blur-sm p-8 text-white text-center">
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  회원가입이 필요해요!
                </h2>
                <p className="text-white/90 text-sm">
                  {action}을 사용하려면 회원가입을 해주세요
                </p>
              </div>
            </div>

            <div className="p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              {/* 혜택 소개 - 카드 스타일 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                  회원가입 혜택
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm p-3 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">장소 좋아요 및 자동 즐겨찾기</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm p-3 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">30초 리뷰 작성 및 공유</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm p-3 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">새로운 장소 등록하기</span>
                  </div>
                </div>
              </div>

              {/* 버튼 영역 - 글라스모피즘 버튼 */}
              <div className="space-y-3">
                <button
                  onClick={handleSignup}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  회원가입하기
                </button>
                <button
                  onClick={handleLogin}
                  className="w-full py-3 px-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-600/80 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50"
                >
                  이미 계정이 있어요
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 px-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
                >
                  나중에 할게요
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupPromptModal; 