import { useAuth } from './useAuth';
import { useState, useCallback } from 'react';

export interface AuthGuardConfig {
  allowedActions: {
    viewMap: boolean;
    viewPlaceDetails: boolean;
    likePlace: boolean;
    writeReview: boolean;
    addFavorite: boolean;
    createPlace: boolean;
  };
}

export function useAuthGuard() {
  const { user, loading } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);

  // 비회원 허용 액션
  const guestAllowedActions = {
    viewMap: true,
    viewPlaceDetails: true,
    likePlace: false,
    writeReview: false,
    addFavorite: false,
    createPlace: false,
  };

  // 권한 체크 함수
  const checkPermission = useCallback((action: keyof AuthGuardConfig['allowedActions']): boolean => {
    if (loading) return false;
    
    if (user) {
      // 로그인된 사용자는 모든 액션 허용
      return true;
    } else {
      // 비회원은 제한된 액션만 허용
      return guestAllowedActions[action];
    }
  }, [user, loading]);

  // 권한이 필요한 액션을 실행하려 할 때 호출
  const requireAuth = useCallback((action: keyof AuthGuardConfig['allowedActions'], callback?: () => void): boolean => {
    if (checkPermission(action)) {
      callback?.();
      return true;
    } else {
      // 권한이 없으면 회원가입 모달 표시
      setShowSignupModal(true);
      return false;
    }
  }, [checkPermission]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    checkPermission,
    requireAuth,
    showSignupModal,
    setShowSignupModal,
  };
} 