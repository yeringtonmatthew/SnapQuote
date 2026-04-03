'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { haptic } from '@/lib/haptic';

interface ArchiveQuoteButtonProps {
  quoteId: string;
  isArchived?: boolean;
}

export function ArchiveQuoteButton({ quoteId, isArchived = false }: ArchiveQuoteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleArchive() {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: [quoteId],
          action: isArchived ? 'unarchive' : 'archive',
        }),
      });
      if (res.ok) {
        haptic('medium');
        router.push('/quotes');
        router.refresh();
      }
    } catch {
      // Archive/unarchive failed silently — user can retry
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          {isArchived ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          )}
        </svg>
        {isArchived ? 'Unarchive' : 'Archive'}
      </button>

      <ConfirmDialog
        open={showConfirm}
        onConfirm={handleArchive}
        onCancel={() => setShowConfirm(false)}
        title={isArchived ? 'Unarchive this quote?' : 'Archive this quote?'}
        message={
          isArchived
            ? "It'll be moved back to your main quote list."
            : "It'll be hidden from your main list but you can unarchive it later."
        }
        confirmLabel={loading ? (isArchived ? 'Unarchiving...' : 'Archiving...') : (isArchived ? 'Unarchive' : 'Archive')}
        confirmVariant="primary"
        loading={loading}
      />
    </>
  );
}
