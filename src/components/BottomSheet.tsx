'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Sheet title (centered on mobile, left on desktop) */
  title?: string;
  /** Content to render inside the sheet */
  children: React.ReactNode;
  /** Max width on desktop (default: 'sm:max-w-lg') */
  maxWidth?: string;
}

/**
 * iOS-style bottom sheet that slides up from the bottom on mobile
 * and appears as a centered modal on desktop.
 *
 * Features:
 * - Drag handle on mobile
 * - Body scroll lock
 * - Focus trap
 * - Escape to close
 * - Backdrop click to close
 * - Smooth spring animations
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm:max-w-lg',
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.setProperty('--scroll-lock-top', `-${scrollY}px`);
    document.body.classList.add('scroll-locked');
    return () => {
      document.body.classList.remove('scroll-locked');
      document.body.style.removeProperty('--scroll-lock-top');
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px] animate-modal-backdrop"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`relative w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[85vh] animate-sheet-up`}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 tab-press"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-[17px] font-bold text-gray-900 dark:text-gray-100 absolute left-1/2 -translate-x-1/2">
              {title}
            </h2>
            <div className="w-7" />
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain flex-1 min-h-0">
          {children}
        </div>

        {/* Safe area spacer */}
        <div className="sm:hidden shrink-0" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </div>,
    document.body,
  );
}
