'use client';

import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'snapquote-install-dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Don't show if previously dismissed
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Only show on mobile-width screens
    if (window.innerWidth > 768) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    setDeferredPrompt(null);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-white p-4 shadow-lg border border-gray-200">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </div>
        <p className="flex-1 text-[13px] leading-snug text-gray-700">
          Add SnapQuote to your home screen for the best experience
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleDismiss}
            className="text-[13px] font-medium text-gray-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="rounded-full bg-brand-600 px-4 py-1.5 text-[13px] font-semibold text-white press-scale focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
