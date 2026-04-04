'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import type { LineItem } from '@/types/database';

interface DuplicateQuoteButtonProps {
  quote: {
    line_items: LineItem[];
    notes: string | null;
    scope_of_work: string | null;
    ai_description: string | null;
    deposit_percent: number;
    photos: string[];
    subtotal: number;
    deposit_amount: number;
  };
}

export function DuplicateQuoteButton({ quote }: DuplicateQuoteButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [duplicating, setDuplicating] = useState(false);

  async function handleDuplicate() {
    setDuplicating(true);
    try {
      const res = await fetch('/api/quotes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: '',
          customer_phone: null,
          customer_email: null,
          line_items: quote.line_items,
          notes: quote.notes,
          scope_of_work: quote.scope_of_work,
          ai_description: quote.ai_description,
          deposit_percent: quote.deposit_percent,
          photos: quote.photos,
          subtotal: quote.subtotal,
          deposit_amount: quote.deposit_amount,
          status: 'draft',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({ message: data.error || 'Failed to duplicate quote', type: 'error' });
        return;
      }

      const newQuote = await res.json();
      router.push(`/quotes/${newQuote.id}`);
    } catch {
      toast({ message: 'Something went wrong', type: 'error' });
    } finally {
      setDuplicating(false);
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={duplicating}
      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 press-scale"
    >
      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
      </svg>
      {duplicating ? 'Duplicating...' : 'Duplicate'}
    </button>
  );
}
