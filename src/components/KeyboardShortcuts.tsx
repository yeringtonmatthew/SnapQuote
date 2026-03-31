'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ShortcutsModal from '@/components/ShortcutsModal';

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const closeModal = useCallback(() => setShowModal(false), []);
  const openModal = useCallback(() => setShowModal(true), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInput = tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
      const mod = e.metaKey || e.ctrlKey;

      // Escape: close any open modal/dropdown (always active)
      if (e.key === 'Escape') {
        setShowModal(false);
        return;
      }

      // Cmd/Ctrl+N: New quote
      if (mod && e.key === 'n') {
        e.preventDefault();
        router.push('/quotes/new');
        return;
      }

      // Cmd/Ctrl+K: Focus search on dashboard
      if (mod && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-shortcut-search]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Cmd/Ctrl+,: Settings
      if (mod && e.key === ',') {
        e.preventDefault();
        router.push('/settings');
        return;
      }

      // Skip remaining shortcuts when user is typing in an input
      if (isInput) return;

      // ?: Show shortcuts modal
      if (e.key === '?' && !mod) {
        e.preventDefault();
        setShowModal((prev) => !prev);
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <>
      <ShortcutsModal open={showModal} onClose={closeModal} />

      {/* Floating "?" button — desktop only */}
      <button
        onClick={openModal}
        aria-label="Keyboard shortcuts"
        className="fixed bottom-6 right-6 z-40 hidden md:flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm font-medium"
      >
        ?
      </button>
    </>
  );
}
