'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Trap focus within the dialog
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (!open) return;

    // Focus the cancel button on open (safer default)
    cancelBtnRef.current?.focus();

    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const confirmClasses =
    confirmVariant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150 p-4"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl animate-in zoom-in-95 fade-in duration-150"
      >
        <h2 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-gray-600 dark:text-gray-400">
          {message}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-[14px] font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl px-4 py-2.5 text-[14px] font-semibold shadow-sm transition-colors disabled:opacity-50 press-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${confirmClasses}`}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
