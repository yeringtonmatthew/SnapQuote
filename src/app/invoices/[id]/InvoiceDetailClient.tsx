'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { haptic } from '@/lib/haptic';
import AddressActionButton from '@/components/ui/AddressActionButton';
import CopyableLink from '@/components/ui/CopyableLink';
import PaymentHistory from '@/components/PaymentHistory';
import type { Payment, InvoiceStatus } from '@/types/database';

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

interface InvoiceData {
  id: string;
  quote_id: string;
  invoice_number: number;
  status: InvoiceStatus;
  amount_due: number;
  amount_paid: number;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  job_address: string | null;
  quote_number: number | null;
  total: number;
  line_items: LineItem[];
  scope_of_work: string | null;
  quote_notes: string | null;
}

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bg: string; text: string }
> = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
  },
  sent: {
    label: 'Sent',
    color: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
  },
  paid: {
    label: 'Paid',
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  partially_paid: {
    label: 'Partially Paid',
    color: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
  },
  void: {
    label: 'Void',
    color: 'bg-gray-300',
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-400 dark:text-gray-500',
  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function InvoiceDetailClient({
  invoice,
  payments,
}: {
  invoice: InvoiceData;
  payments: Payment[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingSaving, setPayingSaving] = useState(false);
  const [payMethod, setPayMethod] = useState<'cash' | 'check' | 'card'>('cash');
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');

  const balance = Number(invoice.amount_due) - Number(invoice.amount_paid);
  const config = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
  const isPaid = invoice.status === 'paid';
  const isVoid = invoice.status === 'void';

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast({ message: data.error || 'Failed to send invoice', type: 'error' });
        return;
      }
      haptic('heavy');
      toast({ message: 'Invoice sent!', type: 'success' });
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  async function handleRecordPayment() {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      toast({ message: 'Enter a valid amount', type: 'error' });
      return;
    }
    if (amount > balance + 0.01) {
      toast({ message: 'Amount exceeds remaining balance', type: 'error' });
      return;
    }

    setPayingSaving(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: payMethod,
          payment_note: payNote || null,
          amount,
          payment_type: amount >= balance - 0.01 ? 'balance' : 'partial',
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast({ message: d.error || 'Failed to record payment', type: 'error' });
        return;
      }
      haptic('heavy');
      toast({ message: 'Payment recorded!', type: 'success' });
      setShowPayModal(false);
      setPayAmount('');
      setPayNote('');
      router.refresh();
    } finally {
      setPayingSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#f2f2f7]/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="px-4 pt-[60px] pb-3 lg:pt-8 lg:px-8">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/invoices"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] press-scale"
            >
              <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-gray-100 truncate">
                  INV-{String(invoice.invoice_number).padStart(4, '0')}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.bg} ${config.text}`}
                >
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.color}`} />
                  {config.label}
                </span>
              </div>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                {invoice.customer_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 space-y-3 pt-1">
        {/* Amount Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Total
              </p>
              <p className="text-[20px] font-bold text-gray-900 dark:text-gray-100 tabular-nums mt-0.5">
                {fmt(Number(invoice.amount_due))}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                Paid
              </p>
              <p className="text-[20px] font-bold text-green-600 dark:text-green-400 tabular-nums mt-0.5">
                {fmt(Number(invoice.amount_paid))}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Remaining
              </p>
              <p
                className={`text-[20px] font-bold tabular-nums mt-0.5 ${
                  balance <= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {fmt(Math.max(0, balance))}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {Number(invoice.amount_due) > 0 && (
            <div className="mt-4">
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isPaid ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (Number(invoice.amount_paid) / Number(invoice.amount_due)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {invoice.due_date && !isPaid && !isVoid && (
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-3 text-center">
              Due {formatDate(invoice.due_date)}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {!isPaid && !isVoid && (
          <div className="flex gap-2">
            {invoice.status === 'draft' && (
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-[15px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60 press-scale"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                {sending ? 'Sending...' : 'Send Invoice'}
              </button>
            )}
            {balance > 0 && (
              <button
                onClick={() => {
                  setPayAmount(balance.toFixed(2));
                  setShowPayModal(true);
                }}
                className={`${invoice.status === 'draft' ? '' : 'flex-1'} flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3.5 px-5 text-[15px] font-semibold text-white hover:bg-green-700 press-scale`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                </svg>
                Record Payment
              </button>
            )}
          </div>
        )}

        {/* Payment History */}
        <PaymentHistory payments={payments} />

        {/* Customer Info */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-4">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Customer
          </h3>
          <div className="space-y-2">
            {invoice.customer_name && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <p className="text-[14px] text-gray-900 dark:text-gray-100">{invoice.customer_name}</p>
              </div>
            )}
            {invoice.customer_phone && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <CopyableLink
                  href={`tel:${invoice.customer_phone}`}
                  value={invoice.customer_phone}
                  copiedMessage="Phone copied"
                  className="text-[14px] text-blue-600 dark:text-blue-400"
                >
                  {invoice.customer_phone}
                </CopyableLink>
              </div>
            )}
            {invoice.customer_email && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <CopyableLink
                  href={`mailto:${invoice.customer_email}`}
                  value={invoice.customer_email}
                  copiedMessage="Email copied"
                  className="text-[14px] text-blue-600 dark:text-blue-400"
                >
                  {invoice.customer_email}
                </CopyableLink>
              </div>
            )}
            {invoice.job_address && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <AddressActionButton
                  address={invoice.job_address}
                  className="text-[14px] text-left text-gray-900 dark:text-gray-100"
                  copiedMessage="Address copied"
                  sheetTitle="Open Address"
                >
                  {invoice.job_address}
                </AddressActionButton>
              </div>
            )}
          </div>
        </div>

        {/* Line Items */}
        {invoice.line_items.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-4">
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Line Items
            </h3>
            <div className="space-y-2">
              {invoice.line_items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-gray-900 dark:text-gray-100">
                      {item.description}
                    </p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 tabular-nums">
                      {item.quantity} {item.unit} x {fmt(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums shrink-0">
                    {fmt(item.total)}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                  Total
                </p>
                <p className="text-[16px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {fmt(Number(invoice.amount_due))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-4">
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Notes
            </h3>
            <p className="text-[14px] text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-modal-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 p-6 space-y-5 max-h-[90dvh] overflow-y-auto animate-modal-content">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 dark:text-gray-100">
                Record Payment
              </h2>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">
                {fmt(Number(invoice.amount_paid))} already collected · {fmt(balance)} remaining
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[15px]">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-7 pr-4 py-3 text-[16px] font-semibold text-gray-900 dark:text-gray-100 tabular-nums focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={() => setPayAmount(balance.toFixed(2))}
                className="mt-1.5 text-[12px] text-blue-600 dark:text-blue-400 font-medium"
              >
                Pay full balance ({fmt(balance)})
              </button>
            </div>

            {/* Payment method */}
            <div>
              <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'cash' as const, label: 'Cash', icon: '\uD83D\uDCB5' },
                  { key: 'check' as const, label: 'Check', icon: '\uD83D\uDCDD' },
                  { key: 'card' as const, label: 'Card', icon: '\uD83D\uDCB3' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { haptic('light'); setPayMethod(m.key); }}
                    className={`rounded-xl border-2 px-3 py-3 text-center transition-colors ${
                      payMethod === m.key
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/30'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <p className="text-2xl">{m.icon}</p>
                    <p
                      className={`text-[13px] font-semibold mt-1 ${
                        payMethod === m.key
                          ? 'text-brand-700 dark:text-brand-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {m.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Note (optional)
              </label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder="e.g. Check #1042"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            {/* Summary */}
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">Recording payment of</p>
                <p className="text-[22px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {fmt(parseFloat(payAmount) || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-gray-400">via</p>
                <p className="text-[15px] font-semibold text-gray-700 dark:text-gray-300 capitalize">
                  {payMethod}
                </p>
              </div>
            </div>

            <button
              onClick={handleRecordPayment}
              disabled={payingSaving}
              className="w-full rounded-2xl bg-green-600 py-3.5 text-[15px] font-semibold text-white hover:bg-green-700 disabled:opacity-60 press-scale"
            >
              {payingSaving
                ? 'Recording...'
                : `Confirm ${fmt(parseFloat(payAmount) || 0)} ${payMethod.charAt(0).toUpperCase() + payMethod.slice(1)} Payment`}
            </button>

            <button
              onClick={() => setShowPayModal(false)}
              className="w-full py-2 text-[14px] text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
