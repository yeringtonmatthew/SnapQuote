'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import ClientCreateSheet from './ClientCreateSheet';

export default function QuickAddMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showClientSheet, setShowClientSheet] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.setProperty('--scroll-lock-top', `-${scrollY}px`);
      document.body.classList.add('scroll-locked');
      return () => {
        document.body.classList.remove('scroll-locked');
        document.body.style.removeProperty('--scroll-lock-top');
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  const handleOption = useCallback(
    (action: string) => {
      setOpen(false);
      switch (action) {
        case 'client':
          setShowClientSheet(true);
          break;
        case 'quote':
          router.push('/quotes/new');
          break;
        case 'schedule':
          router.push('/schedule?create=true');
          break;
      }
    },
    [router],
  );

  const options = [
    {
      key: 'quote',
      label: 'New Quote',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: 'text-brand-600 bg-brand-50 dark:bg-brand-950/40',
    },
    {
      key: 'client',
      label: 'Add Client',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      key: 'schedule',
      label: 'Schedule Job',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  return (
    <>
      {/* FAB Button — centered in tab bar */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Quick add menu"
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex flex-col items-center gap-0.5 -mt-4 tab-press focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-full"
      >
        <div
          className={`flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-lg ring-4 ring-white dark:ring-gray-900 transition-all duration-300 ${
            open
              ? 'bg-gray-800 dark:bg-gray-200 rotate-45 shadow-gray-400/20'
              : 'bg-brand-600 shadow-brand-500/30'
          }`}
        >
          <svg
            className={`h-6 w-6 transition-colors duration-200 ${open ? 'text-white dark:text-gray-800' : 'text-white'}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      </button>

      {/* Menu Popover -- portaled to body */}
      {open && mounted && createPortal(
        <>
          {/* Backdrop with dim */}
          <div
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] animate-quick-add-backdrop"
            onClick={() => setOpen(false)}
          />

          {/* Bottom action sheet */}
          <div
            ref={menuRef}
            role="dialog"
            aria-label="Quick add options"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-50 animate-quick-add-spring"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
          >
            <div className="mx-3 mb-20 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] overflow-hidden">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Options */}
              <div className="p-2">
                {options.map((opt, index) => (
                  <button
                    key={opt.key}
                    onClick={() => handleOption(opt.key)}
                    className="flex w-full items-center gap-3.5 px-3 py-3 rounded-xl text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 tab-press animate-quick-add-item"
                    style={{ '--stagger-delay': `${index * 50}ms` } as React.CSSProperties}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${opt.color}`}>
                      {opt.icon}
                    </div>
                    <div>
                      <span className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">
                        {opt.label}
                      </span>
                    </div>
                    <svg className="ml-auto h-4 w-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Client Create Sheet */}
      <ClientCreateSheet
        open={showClientSheet}
        onClose={() => setShowClientSheet(false)}
      />
    </>
  );
}
