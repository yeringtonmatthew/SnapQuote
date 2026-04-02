'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { triggerConfetti } from '@/components/ConfettiEffect';

export function ConfettiOnMount() {
  const fired = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!fired.current && searchParams.get('new') === '1') {
      fired.current = true;
      setTimeout(triggerConfetti, 400);
    }
  }, [searchParams]);

  return null;
}
