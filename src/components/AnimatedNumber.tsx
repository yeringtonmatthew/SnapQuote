'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 1000,
  decimals = 0,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;

    function animate(timestamp: number) {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }

      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = eased * value;

      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span>
      {prefix}{formatted}{suffix}
    </span>
  );
}
