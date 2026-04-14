'use client';

import { useState } from 'react';
import { formatQuoteNumber } from '@/lib/format-quote-number';

interface PaymentRow {
  id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_note: string | null;
  recorded_at: string;
  customer_name: string | null;
  job_address: string | null;
  quote_number: number | null;
  quote_total: number | null;
}

type FilterTab = 'all' | 'cash' | 'check' | 'card';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cash', label: 'Cash' },
  { key: 'check', label: 'Check' },
  { key: 'card', label: 'Card' },
];

const METHOD_ICON: Record<string, string> = {
  cash: '\uD83D\uDCB5',
  check: '\uD83D\uDCDD',
  card: '\uD83D\uDCB3',
  stripe: '\uD83D\uDCB3',
};

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  deposit: {
    label: 'Deposit',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
  },
  balance: {
    label: 'Balance',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  full: {
    label: 'Full Payment',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-400',
  },
  partial: {
    label: 'Partial',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
  },
};

const capitalize = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

function filterPayments(payments: PaymentRow[], filter: FilterTab): PaymentRow[] {
  if (filter === 'all') return payments;
  if (filter === 'card') return payments.filter((p) => p.payment_method === 'card' || p.payment_method === 'stripe');
  return payments.filter((p) => p.payment_method === filter);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function PaymentsList({ payments }: { payments: PaymentRow[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filtered = filterPayments(payments, activeFilter);
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#f2f2f7]/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="px-4 pt-[60px] pb-3 lg:pt-8 lg:px-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Payments
              </h1>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                {payments.length} payment{payments.length !== 1 ? 's' : ''} &middot; {formatCurrency(totalCollected)} collected
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 lg:px-8 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors press-scale ${
                  activeFilter === tab.key
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment list */}
      <div className="px-4 lg:px-8 space-y-2 pt-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 pt-20 text-center">
            <div className="relative mx-auto mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/40 dark:to-brand-900/30">
                <svg
                  className="h-10 w-10 text-brand-500/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-200/60 dark:bg-brand-800/40" />
              <div className="absolute -bottom-1.5 -left-1.5 h-2 w-2 rounded-full bg-brand-300/40 dark:bg-brand-700/30" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
              {activeFilter === 'all' ? 'No payments yet' : `No ${activeFilter} payments`}
            </h2>
            <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 max-w-[280px]">
              {activeFilter === 'all'
                ? 'Payments will appear here once you start collecting from jobs.'
                : 'No payments match this filter right now.'}
            </p>
          </div>
        ) : (
          filtered.map((payment, idx) => {
            const typeConfig = TYPE_CONFIG[payment.payment_type] || TYPE_CONFIG.full;
            const methodIcon = METHOD_ICON[payment.payment_method] || '\uD83D\uDCB5';
            const initial = payment.customer_name?.charAt(0)?.toUpperCase() || '?';

            const avatarColors = [
              'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
              'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
              'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
              'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
              'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
              'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
            ];
            let hash = 0;
            const name = payment.customer_name || '';
            for (let i = 0; i < name.length; i++) {
              hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const avatarClass = avatarColors[Math.abs(hash) % avatarColors.length];

            return (
              <div
                key={payment.id}
                className="block rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none ring-1 ring-black/[0.03] dark:ring-white/[0.06] animate-card-enter"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="flex items-start gap-3.5">
                  {/* Avatar */}
                  <div
                    className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-[14px] font-bold ${avatarClass}`}
                  >
                    {initial}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
                          {payment.customer_name ? capitalize(payment.customer_name) : 'Unknown'}
                        </p>
                        <p className="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {payment.quote_number ? formatQuoteNumber(payment.quote_number) : 'Payment'}
                          {payment.job_address ? ` \u00B7 ${payment.job_address}` : ''}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatCurrency(Number(payment.amount))}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          {relativeTime(payment.recorded_at)}
                        </p>
                      </div>
                    </div>

                    {/* Status row */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${typeConfig.bg} ${typeConfig.text}`}
                      >
                        {typeConfig.label}
                      </span>

                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
                        <span>{methodIcon}</span>
                        <span className="capitalize">{payment.payment_method}</span>
                      </span>

                      <span className="flex-1" />

                      {payment.payment_note && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                          {payment.payment_note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
