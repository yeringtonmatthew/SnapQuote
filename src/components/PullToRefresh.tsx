'use client';

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const THRESHOLD = 80;
const MAX_PULL = 120;

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const isTouchDevice = useRef(false);

  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isRefreshingRef.current) return;
    if (!isTouchDevice.current) return;

    // Only activate when scrolled to top
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 0) return;

    startYRef.current = e.touches[0].clientY;
    pullDistanceRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isRefreshingRef.current) return;
    if (!startYRef.current) return;

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop > 0) {
      // User scrolled away from top, cancel pull
      startYRef.current = 0;
      pullDistanceRef.current = 0;
      setPullDistance(0);
      setVisible(false);
      return;
    }

    const currentY = e.touches[0].clientY;
    const delta = currentY - startYRef.current;

    if (delta <= 0) {
      // Pulling up, not down
      pullDistanceRef.current = 0;
      setPullDistance(0);
      setVisible(false);
      return;
    }

    // Apply resistance: diminishing returns past threshold
    const resisted = delta < THRESHOLD
      ? delta
      : THRESHOLD + (delta - THRESHOLD) * 0.3;
    const clamped = Math.min(resisted, MAX_PULL);

    pullDistanceRef.current = clamped;

    // Prevent native scroll when pulling
    if (delta > 5) {
      e.preventDefault();
    }

    requestAnimationFrame(() => {
      setPullDistance(clamped);
      if (!visible && clamped > 5) setVisible(true);
    });
  }, [visible]);

  const handleTouchEnd = useCallback(async () => {
    if (isRefreshingRef.current) return;
    if (!startYRef.current) return;

    const distance = pullDistanceRef.current;
    startYRef.current = 0;

    if (distance >= THRESHOLD) {
      // Trigger refresh
      isRefreshingRef.current = true;
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.6); // Settle to a smaller offset while refreshing

      try {
        await onRefresh();
      } catch {
        // Silently handle refresh errors
      }

      isRefreshingRef.current = false;
      setRefreshing(false);
    }

    // Animate back
    setPullDistance(0);
    setTimeout(() => setVisible(false), 300);
  }, [onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const pastThreshold = pullDistance >= THRESHOLD;

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className="pointer-events-none absolute left-0 right-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-200"
        style={{
          height: pullDistance,
          opacity: visible ? 1 : 0,
          transition: pullDistance === 0 ? 'height 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s' : 'opacity 0.2s',
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            transform: `scale(${0.5 + progress * 0.5})`,
            opacity: Math.min(progress * 1.5, 1),
          }}
        >
          {refreshing ? (
            // Spinning indicator
            <svg
              className="h-6 w-6 text-brand-600 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="50 20"
              />
            </svg>
          ) : (
            // Circular arrow that rotates with pull progress
            <svg
              className="h-6 w-6 text-gray-400 transition-colors duration-150"
              style={{
                transform: `rotate(${progress * 180}deg)`,
                color: pastThreshold ? 'var(--color-brand-600, #4f46e5)' : undefined,
              }}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Circular arrow path */}
              <path
                d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${progress * 44} 60`}
              />
              {/* Arrow head */}
              <path
                d="M20 4v4h-4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  opacity: progress > 0.3 ? 1 : 0,
                }}
              />
            </svg>
          )}
        </div>
      </div>

      {/* Content with pull-down transform */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          transition: pullDistance === 0 ? 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
