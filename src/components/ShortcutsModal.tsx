'use client';

import { useEffect, useRef } from 'react';

const shortcuts = [
  { keys: ['Cmd', 'N'], description: 'New quote' },
  { keys: ['Cmd', 'K'], description: 'Search quotes' },
  { keys: ['Cmd', ','], description: 'Settings' },
  { keys: ['Esc'], description: 'Close modal / dropdown' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
];

export default function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Keyboard shortcuts"
        className="mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-5 space-y-2">
          {shortcuts.map((s) => (
            <div key={s.description} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-300 shadow-sm"
                  >
                    {key === 'Cmd' ? (typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl') : key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
            Press <kbd className="inline rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-1 text-[11px] font-medium">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
