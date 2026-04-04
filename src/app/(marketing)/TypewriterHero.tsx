'use client';

import { useEffect, useState } from 'react';

const words = [
  { text: 'Seconds', strikethrough: false },
  { text: 'Minutes', strikethrough: true },
  { text: 'Hours', strikethrough: true },
];

export default function TypewriterHero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(words[0].text.length);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    const current = words[wordIndex];
    const fullLen = current.text.length;

    if (isPaused) {
      const pauseTime = wordIndex === 0 && !isDeleting ? 2000 : 1200;
      const timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(timeout);
    }

    if (isDeleting) {
      if (charIndex > 0) {
        const timeout = setTimeout(() => setCharIndex((c) => c - 1), 40);
        return () => clearTimeout(timeout);
      }
      // Done deleting, move to next word
      const nextIndex = (wordIndex + 1) % words.length;
      setWordIndex(nextIndex);
      setIsDeleting(false);
      setCharIndex(0);
      return;
    }

    // Typing
    if (charIndex < fullLen) {
      const timeout = setTimeout(() => setCharIndex((c) => c + 1), 60);
      return () => clearTimeout(timeout);
    }

    // Done typing, pause
    setIsPaused(true);
  }, [wordIndex, charIndex, isDeleting, isPaused]);

  const current = words[wordIndex];
  const displayText = current.text.slice(0, charIndex);
  const isStrikethrough = current.strikethrough && charIndex === current.text.length && isPaused;

  return (
    <span className="relative inline-block">
      <span
        className={`transition-all duration-300 ${
          isStrikethrough ? 'text-gray-400 line-through decoration-red-400 decoration-[3px]' : 'text-brand-600'
        }`}
      >
        {displayText}
      </span>
      <span className="animate-blink ml-0.5 inline-block w-[3px] h-[1em] bg-brand-600 align-text-bottom" />
    </span>
  );
}
