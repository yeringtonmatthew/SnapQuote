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

const ACTION_WIDTH = 72;
const SNAP_THRESHOLD = 0.3;
const VELOCITY_THRESHOLD = 0.3; // px/ms — fast flick snaps open regardless of distance

export default function SwipeableCard({ id, children, actions, onSwipeOpen }: SwipeableCardProps) {
  const { openCardId, setOpenCardId } = useSwipeContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startTranslate = useRef(0);
  const currentTranslate = useRef(0);
  const isDragging = useRef(false);
  const direction = useRef<'h' | 'v' | null>(null);
  const startTime = useRef(0);
  const rafId = useRef<number>(0);

  const maxSwipe = actions.length * ACTION_WIDTH;
  const isOpen = openCardId === id;

  // Animate to target position
  const animateTo = useCallback((target: number) => {
    if (!contentRef.current) return;
    contentRef.current.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
    contentRef.current.style.transform = `translateX(${target}px)`;
    currentTranslate.current = target;
  }, []);

  // Set position without animation (during drag)
  const setPosition = useCallback((x: number) => {
    if (!contentRef.current) return;
    contentRef.current.style.transition = 'none';
    contentRef.current.style.transform = `translateX(${x}px)`;
    currentTranslate.current = x;
  }, []);

  const snapOpen = useCallback(() => {
    animateTo(-maxSwipe);
    setOpenCardId(id);
    onSwipeOpen?.();
  }, [maxSwipe, setOpenCardId, id, onSwipeOpen, animateTo]);

  const snapClosed = useCallback(() => {
    animateTo(0);
    if (openCardId === id) setOpenCardId(null);
  }, [openCardId, id, setOpenCardId, animateTo]);

  // Close when another card opens
  useEffect(() => {
    if (openCardId !== id && currentTranslate.current !== 0) {
      animateTo(0);
    }
  }, [openCardId, id, animateTo]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTranslate.current = currentTranslate.current;
    isDragging.current = false;
    direction.current = null;
    startTime.current = Date.now();

    // Kill any existing transition
    if (contentRef.current) {
      const computed = getComputedStyle(contentRef.current);
      const matrix = new DOMMatrix(computed.transform);
      currentTranslate.current = matrix.m41;
      startTranslate.current = matrix.m41;
      contentRef.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    if (!direction.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      direction.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }

    if (direction.current === 'v') return;

    isDragging.current = true;

    let newX = startTranslate.current + dx;

    // Rubber-band effect past bounds
    if (newX > 0) {
      newX = newX * 0.2; // resist swiping right past origin
    } else if (newX < -maxSwipe) {
      const over = newX + maxSwipe;
      newX = -maxSwipe + over * 0.2; // resist swiping too far left
    }

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => setPosition(newX));
  }, [maxSwipe, setPosition]);

  const handleTouchEnd = useCallback(() => {
    cancelAnimationFrame(rafId.current);

    if (!isDragging.current) {
      if (isOpen) snapClosed();
      return;
    }

    const elapsed = Date.now() - startTime.current;
    const distance = currentTranslate.current - startTranslate.current;
    const velocity = Math.abs(distance) / Math.max(elapsed, 1);

    // Fast flick in the right direction
    if (velocity > VELOCITY_THRESHOLD) {
      if (distance < 0) {
        snapOpen();
      } else {
        snapClosed();
      }
      return;
    }

    // Slow drag — snap based on position
    if (Math.abs(currentTranslate.current) > maxSwipe * SNAP_THRESHOLD) {
      snapOpen();
    } else {
      snapClosed();
    }
  }, [isOpen, maxSwipe, snapOpen, snapClosed]);

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl" data-swipe-card={id}>
      {/* Action buttons behind */}
      <div
        className="absolute inset-y-0 right-0 flex"
        data-swipe-actions
        style={{ width: maxSwipe }}
      >
        {actions.map((action, i) => (
          <button
            key={action.label}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              action.onClick();
              snapClosed();
            }}
            className={`flex flex-col items-center justify-center gap-1 text-white font-semibold text-[11px] active:brightness-90 transition-[filter] ${
              i === actions.length - 1 ? 'rounded-r-2xl' : ''
            }`}
            style={{ width: ACTION_WIDTH, backgroundColor: action.color }}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Sliding content */}
      <div
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 will-change-transform"
        style={{ transform: 'translateX(0px)' }}
      >
        {children}
      </div>
    </div>
  );
}
