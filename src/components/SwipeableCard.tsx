'use client';

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useSwipeContext } from './SwipeContext';

export type SwipeAction = {
  label: string;
  color: string;
  icon?: ReactNode;
  onClick: () => void;
};

type SwipeableCardProps = {
  id: string;
  children: ReactNode;
  actions: SwipeAction[];
  onSwipeOpen?: () => void;
};

const ACTION_BUTTON_WIDTH = 72; // px per action button
const SNAP_THRESHOLD = 0.4; // snap open if swiped > 40% of action width

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export default function SwipeableCard({ id, children, actions, onSwipeOpen }: SwipeableCardProps) {
  const { openCardId, setOpenCardId } = useSwipeContext();
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasTouchSupport, setHasTouchSupport] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const directionLocked = useRef<'horizontal' | 'vertical' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const maxSwipe = actions.length * ACTION_BUTTON_WIDTH;
  const isOpen = openCardId === id;

  // Check for touch support on mount
  useEffect(() => {
    setHasTouchSupport(isTouchDevice());
  }, []);

  // When another card opens, close this one
  useEffect(() => {
    if (openCardId !== id && translateX !== 0) {
      setIsAnimating(true);
      setTranslateX(0);
    }
  }, [openCardId, id, translateX]);

  const snapOpen = useCallback(() => {
    setIsAnimating(true);
    setTranslateX(-maxSwipe);
    setOpenCardId(id);
    onSwipeOpen?.();
  }, [maxSwipe, setOpenCardId, id, onSwipeOpen]);

  const snapClosed = useCallback(() => {
    setIsAnimating(true);
    setTranslateX(0);
    if (openCardId === id) {
      setOpenCardId(null);
    }
  }, [openCardId, id, setOpenCardId]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    currentX.current = translateX;
    isDragging.current = false;
    directionLocked.current = null;
    setIsAnimating(false);
  }, [translateX]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Determine direction if not yet locked
    if (!directionLocked.current) {
      const absDx = Math.abs(deltaX);
      const absDy = Math.abs(deltaY);
      if (absDx < 5 && absDy < 5) return; // Dead zone
      directionLocked.current = absDx > absDy ? 'horizontal' : 'vertical';
    }

    // If vertical scroll, bail out
    if (directionLocked.current === 'vertical') return;

    // Prevent vertical scroll while swiping horizontally
    e.preventDefault();
    isDragging.current = true;

    let newX = currentX.current + deltaX;
    // Clamp: no swiping right past 0, no swiping left past maxSwipe
    newX = Math.min(0, Math.max(-maxSwipe, newX));
    setTranslateX(newX);
  }, [maxSwipe]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) {
      // It was a tap, not a swipe
      if (isOpen) {
        // Tapping on an open card closes it
        snapClosed();
      }
      return;
    }

    const swipedDistance = Math.abs(translateX);
    const threshold = maxSwipe * SNAP_THRESHOLD;

    if (swipedDistance > threshold) {
      snapOpen();
    } else {
      snapClosed();
    }
  }, [translateX, maxSwipe, isOpen, snapOpen, snapClosed]);

  // If no touch support, just render children without swipe
  if (!hasTouchSupport) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      data-swipe-card={id}
      ref={cardRef}
    >
      {/* Action buttons revealed behind the card */}
      <div
        className="absolute inset-y-0 right-0 flex"
        data-swipe-actions
        style={{ width: maxSwipe }}
      >
        {actions.map((action, i) => {
          const isLast = i === actions.length - 1;
          return (
            <button
              key={action.label}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                action.onClick();
                snapClosed();
              }}
              className={`flex flex-col items-center justify-center gap-1 text-white font-semibold text-[11px] ${
                isLast ? 'rounded-r-2xl' : ''
              }`}
              style={{
                width: ACTION_BUTTON_WIDTH,
                backgroundColor: action.color,
              }}
            >
              {action.icon}
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Sliding card content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative z-10 ${isOpen ? 'shadow-md' : ''}`}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isAnimating ? 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
        }}
        onTransitionEnd={() => setIsAnimating(false)}
      >
        {children}
      </div>
    </div>
  );
}
