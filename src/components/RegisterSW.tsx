'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for SW updates every 30 minutes
        setInterval(() => registration.update(), 30 * 60 * 1000);
      })
      .catch(() => {
        // Service worker registration failed — non-critical, ignore.
      });

    // When coming back online, tell the SW to replay queued requests
    const handleOnline = () => {
      navigator.serviceWorker.controller?.postMessage({ type: 'ONLINE' });
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return null;
}
