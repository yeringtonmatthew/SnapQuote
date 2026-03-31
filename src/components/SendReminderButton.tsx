'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

interface SendReminderButtonProps {
  quoteId: string;
  status: string;
  hasEmail: boolean;
  reminderSentAt: string | null;
}

export function SendReminderButton({ quoteId, status, hasEmail, reminderSentAt }: SendReminderButtonProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(!!reminderSentAt);

  if (status !== 'sent' || !hasEmail) return null;

  async function handleSendReminder() {
    setSending(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/remind`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast({ message: data.error || 'Failed to send reminder', type: 'error' });
        return;
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      onClick={handleSendReminder}
      disabled={sending || sent}
      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50 press-scale"
    >
      {sending ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      )}
      {sent ? 'Reminder Sent' : sending ? 'Sending...' : 'Send Reminder'}
    </button>
  );
}
