'use client';

import { useEffect, useRef } from 'react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (show && onComplete) {
      timerRef.current = setTimeout(onComplete, 2000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="flex items-center justify-center success-animation-container">
      <div className="success-circle">
        <svg className="success-checkmark" viewBox="0 0 52 52">
          <circle
            className="success-circle-bg"
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
          />
          <path
            className="success-check-path"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 27l7 7 15-15"
          />
        </svg>
      </div>
    </div>
  );
}
