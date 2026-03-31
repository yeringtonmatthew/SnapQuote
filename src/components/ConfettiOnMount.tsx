'use client';

import { useEffect, useRef } from 'react';
import { triggerConfetti } from '@/components/ConfettiEffect';

export function ConfettiOnMount() {
  const fired = useRef(false);

  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      // Small delay so the page renders first
      setTimeout(triggerConfetti, 400);
    }
  }, []);

  return null;
}
