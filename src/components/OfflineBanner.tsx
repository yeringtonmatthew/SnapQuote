'use client';

import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Check initial state after mount (navigator.onLine can be stale on SSR)
    setOffline(!navigator.onLine);

    const goOffline = () => setOffline(true);
    const goOnline = () => {
      setOffline(false);
      // Tell the service worker to replay any queued requests
      navigator.serviceWorker?.controller?.postMessage({ type: 'ONLINE' });
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    // Also listen for Capacitor network events via data attribute
    const observer = new MutationObserver(() => {
      setOffline(document.body.hasAttribute('data-offline'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-offline'] });

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      observer.disconnect();
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2 bg-amber-400 dark:bg-amber-500 text-amber-950 text-sm font-medium px-4 py-2 shadow-md animate-in slide-in-from-top duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      You&apos;re offline. Changes will sync when you reconnect.
    </div>
  );
}
