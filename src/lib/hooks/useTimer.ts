// 30초 타이머용 커스텀 훅입니다.
// 타이머 시작, 초기화, 종료 기능 제공
import { useState, useRef, useCallback } from 'react';

export function useTimer(initial: number) {
  const [time, setTime] = useState(initial);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTime(initial);
    timerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initial]);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTime(initial);
  }, [initial]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return { time, start, reset, stop };
} 