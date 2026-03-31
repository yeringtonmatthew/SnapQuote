'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [visible, setVisible] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = images.length;

  // Fade in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Preload adjacent images
  useEffect(() => {
    const preload = (idx: number) => {
      if (idx >= 0 && idx < total) {
        const img = new Image();
        img.src = images[idx];
      }
    };
    preload(currentIndex - 1);
    preload(currentIndex + 1);
  }, [currentIndex, images, total]);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= total || transitioning) return;
    setTransitioning(true);
    setCurrentIndex(idx);
    setTimeout(() => setTransitioning(false), 200);
  }, [total, transitioning]);

  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, goPrev, goNext]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const delta = e.touches[0].clientX - touchStartX;
    setTouchDeltaX(delta);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    const threshold = 50;
    if (touchDeltaX > threshold) {
      goPrev();
    } else if (touchDeltaX < -threshold) {
      goNext();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  // Backdrop click to close (only if clicking the backdrop itself)
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      handleClose();
    }
  };

  const swipeTranslate = touchStartX !== null ? touchDeltaX : 0;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)' }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Close lightbox"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image counter */}
      {total > 1 && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur-sm tabular-nums">
          {currentIndex + 1} / {total}
        </div>
      )}

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:left-4 sm:h-12 sm:w-12"
          aria-label="Previous image"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Next button */}
      {currentIndex < total - 1 && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-4 sm:h-12 sm:w-12"
          aria-label="Next image"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Image area */}
      <div
        ref={containerRef}
        className="flex h-full w-full items-center justify-center px-12 py-16 sm:px-20"
        onClick={handleBackdropClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`Photo ${currentIndex + 1} of ${total}`}
          className="max-h-full max-w-full select-none rounded-lg object-contain transition-transform duration-200"
          style={{
            transform: `translateX(${swipeTranslate}px)`,
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}
