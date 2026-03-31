'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { haptic } from '@/lib/haptic';

export function CancelQuoteButton({ quoteId, currentStatus }: { quoteId: string; currentStatus: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (currentStatus !== 'draft' && currentStatus !== 'sent') return null;

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/cancel`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        toast({ message: data.error || 'Failed to cancel quote', type: 'error' });
        return;
      }
      router.refresh();
    } catch {
      toast({ message: 'Something went wrong', type: 'error' });
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          haptic('light');
          setConfirming(true);
        }}
        className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-[14px] font-medium text-red-600 shadow-sm press-scale transition-colors hover:bg-red-50"
      >
        Cancel Quote
      </button>

      <ConfirmDialog
        open={confirming}
        onConfirm={handleCancel}
        onCancel={() => setConfirming(false)}
        title="Cancel this quote?"
        message="This can't be undone. The customer will no longer be able to view or approve it."
        confirmLabel={cancelling ? 'Cancelling...' : 'Yes, Cancel Quote'}
        confirmVariant="danger"
        loading={cancelling}
      />
    </>
  );
}
