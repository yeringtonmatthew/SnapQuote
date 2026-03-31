'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

type SwipeContextType = {
  openCardId: string | null;
  setOpenCardId: (id: string | null) => void;
  closeAll: () => void;
};

const SwipeContext = createContext<SwipeContextType>({
  openCardId: null,
  setOpenCardId: () => {},
  closeAll: () => {},
});

export function SwipeProvider({ children }: { children: ReactNode }) {
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const closeAll = useCallback(() => {
    setOpenCardId(null);
  }, []);

  // Close open card when tapping outside
  useEffect(() => {
    if (!openCardId) return;

    function handleTouch(e: TouchEvent) {
      const target = e.target as HTMLElement;
      // If the tap is inside a swipeable card's action area, don't close
      if (target.closest('[data-swipe-actions]') || target.closest('[data-swipe-card]')) {
        return;
      }
      setOpenCardId(null);
    }

    document.addEventListener('touchstart', handleTouch, { passive: true });
    return () => document.removeEventListener('touchstart', handleTouch);
  }, [openCardId]);

  return (
    <SwipeContext.Provider value={{ openCardId, setOpenCardId, closeAll }}>
      {children}
    </SwipeContext.Provider>
  );
}

export function useSwipeContext() {
  return useContext(SwipeContext);
}
