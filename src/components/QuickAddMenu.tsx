'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ClientCreateSheet from './ClientCreateSheet';

export default function QuickAddMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showClientSheet, setShowClientSheet] = useState(false);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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
      key: 'client',
      label: 'New Client',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      key: 'quote',
      label: 'New Quote',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40',
    },
    {
      key: 'schedule',
      label: 'New Event',
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
      {/* FAB Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Quick add menu"
        className="flex flex-col items-center gap-1 -mt-5 rounded-full press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
            open
              ? 'bg-gray-900 dark:bg-gray-100 shadow-gray-500/20 rotate-45'
              : 'bg-brand-600 shadow-brand-500/30'
          }`}
        >
          <svg
            className={`h-6 w-6 transition-colors duration-200 ${open ? 'text-white dark:text-gray-900' : 'text-white'}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <span className={`text-[10px] font-semibold ${open ? 'text-brand-600' : 'text-gray-500'}`}>
          New
        </span>
      </button>

      {/* Menu Popover */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Menu */}
          <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-50 animate-sheet-up">
            <div className="flex flex-col gap-2 rounded-2xl bg-white dark:bg-gray-900 p-2 shadow-2xl ring-1 ring-black/[0.06] dark:ring-white/[0.08] min-w-[200px]">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleOption(opt.key)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 press-scale"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${opt.color}`}>
                    {opt.icon}
                  </div>
                  <span className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            {/* Arrow pointing down */}
            <div className="flex justify-center -mt-1">
              <div className="h-3 w-3 rotate-45 bg-white dark:bg-gray-900 ring-1 ring-black/[0.06] dark:ring-white/[0.08]" style={{ clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)' }} />
            </div>
          </div>
        </>
      )}

      {/* Client Create Sheet */}
      <ClientCreateSheet
        open={showClientSheet}
        onClose={() => setShowClientSheet(false)}
      />
    </>
  );
}
