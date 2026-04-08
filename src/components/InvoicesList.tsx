'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { InvoiceStatus } from '@/types/database';

interface InvoiceRow {
  id: string;
  invoice_number: number;
  status: InvoiceStatus;
  amount_due: number;
  amount_paid: number;
  due_date: string | null;
  sent_at: string | null;
  created_at: string;
  customer_name: string | null;
  job_address: string | null;
  quote_number: number | null;
}

type FilterTab = 'all' | 'draft' | 'awaiting' | 'paid' | 'overdue';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'awaiting', label: 'Awaiting Payment' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
];

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
    label: 'Partial',
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

function filterInvoices(invoices: InvoiceRow[], filter: FilterTab): InvoiceRow[] {
  switch (filter) {
    case 'draft':
      return invoices.filter((i) => i.status === 'draft');
    case 'awaiting':
      return invoices.filter((i) => i.status === 'sent' || i.status === 'partially_paid');
    case 'paid':
      return invoices.filter((i) => i.status === 'paid');
    case 'overdue':
      return invoices.filter((i) => i.status === 'overdue');
    default:
      return invoices;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(invoice: InvoiceRow): boolean {
  if (invoice.status === 'paid' || invoice.status === 'void' || invoice.status === 'draft') return false;
  if (!invoice.due_date) return false;
  return new Date(invoice.due_date) < new Date();
}

export default function InvoicesList({ invoices }: { invoices: InvoiceRow[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filtered = filterInvoices(invoices, activeFilter);
  const unpaidCount = invoices.filter(
    (i) => i.status !== 'paid' && i.status !== 'void' && i.status !== 'draft',
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#f2f2f7]/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="px-4 pt-[60px] pb-3 lg:pt-8 lg:px-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Invoices
              </h1>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                {unpaidCount} awaiting payment
              </p>
            </div>
            <button
              disabled
              className="mt-1 flex items-center gap-1.5 rounded-xl bg-gray-200 dark:bg-gray-700 px-3 py-2 text-[13px] font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed"
              title="Create invoices from the job detail page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Invoice
            </button>
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

      {/* Invoice list */}
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-200/60 dark:bg-brand-800/40" />
              <div className="absolute -bottom-1.5 -left-1.5 h-2 w-2 rounded-full bg-brand-300/40 dark:bg-brand-700/30" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
              {activeFilter === 'all' ? 'No invoices yet' : `No ${activeFilter} invoices`}
            </h2>
            <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 max-w-[280px]">
              {activeFilter === 'all'
                ? 'Create invoices from the job detail page to get started.'
                : 'No invoices match this filter right now.'}
            </p>
          </div>
        ) : (
          filtered.map((invoice, idx) => {
            const config = STATUS_CONFIG[isOverdue(invoice) ? 'overdue' : invoice.status] || STATUS_CONFIG.draft;
            const balance = Number(invoice.amount_due) - Number(invoice.amount_paid);
            const initial = invoice.customer_name?.charAt(0)?.toUpperCase() || '?';

            const avatarColors = [
              'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
              'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
              'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
              'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
              'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
              'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
            ];
            let hash = 0;
            const name = invoice.customer_name || '';
            for (let i = 0; i < name.length; i++) {
              hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const avatarClass = avatarColors[Math.abs(hash) % avatarColors.length];

            return (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="block rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] dark:shadow-none ring-1 ring-black/[0.03] dark:ring-white/[0.06] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[0.5px] active:scale-[0.98] animate-card-enter"
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
                          {invoice.customer_name || 'Unknown'}
                        </p>
                        <p className="text-[12px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          INV-{String(invoice.invoice_number).padStart(4, '0')}
                          {invoice.job_address ? ` · ${invoice.job_address}` : ''}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatCurrency(Number(invoice.amount_due))}
                        </p>
                        {Number(invoice.amount_paid) > 0 && balance > 0.01 && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium tabular-nums">
                            {formatCurrency(balance)} due
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status row */}
                    <div className="flex items-center gap-2 mt-2.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.bg} ${config.text}`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.color}`} />
                        {config.label}
                      </span>

                      {invoice.due_date && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                          Due {formatDate(invoice.due_date)}
                        </span>
                      )}

                      <span className="flex-1" />

                      {/* Chevron */}
                      <svg
                        className="h-4 w-4 text-gray-300 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
