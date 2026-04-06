'use client';

import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content with a smooth fade animation.
 * IMPORTANT: No CSS transform used — transforms create a new containing
 * block that breaks position:fixed on child elements (like BottomNav).
 * Uses opacity-only animation to avoid this.
 */
export default function PageTransition({ children, className }: PageTransitionProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setReady(true);
    });
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
      }}
    >
      {children}
    </div>
  );
}
