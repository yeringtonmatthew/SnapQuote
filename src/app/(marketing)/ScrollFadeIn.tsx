'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Fade-in-on-scroll wrapper.
 *
 * Default: visible. This guarantees content is ALWAYS readable even if
 * JS fails, hydration is delayed, or IntersectionObserver misbehaves.
 *
 * On mount, we check if the element is currently below the fold. If so,
 * we reset to hidden and let the IntersectionObserver fade it in.
 * If it's already in the viewport at mount time, it stays visible.
 */
export default function ScrollFadeIn({ children, className = '', delay = 0 }: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible so SSR + no-JS + early hydration all show content.
  const [isVisible, setIsVisible] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the element is already above or inside the viewport on mount,
    // skip the fade-in entirely — just show it.
    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportH) {
      setIsVisible(true);
      return;
    }

    // Below the fold — opt in to the animated reveal.
    setShouldAnimate(true);
    setIsVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        shouldAnimate
          ? {
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`,
              willChange: 'opacity, transform',
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
