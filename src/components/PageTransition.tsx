'use client';

import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Optional: override animation class */
  className?: string;
}

/**
 * Wraps page content with a smooth fade + micro-slide animation.
 * Uses will-change and transform3d to promote the layer and avoid
 * layout shift during the transition.
 */
export default function PageTransition({ children, className }: PageTransitionProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Let the browser paint once before triggering the animation
    // This avoids the flash-of-no-content on slower devices
    requestAnimationFrame(() => {
      setReady(true);
    });
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? 'translate3d(0,0,0)' : 'translate3d(0,6px,0)',
        transition: 'opacity 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
