// 스낵바(토스트) 알림 컴포넌트입니다.
// 메시지, 성공/실패 색상, 자동 닫기 지원
import React, { useEffect } from 'react';

export interface SnackbarProps {
  open: boolean;
  message: string;
  type?: 'success' | 'error';
  duration?: number; // ms
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ open, message, type = 'success', duration = 2000, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 text-white text-sm transition-all
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
      role="alert"
    >
      {message}
    </div>
  );
};

export default Snackbar; 