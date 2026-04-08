'use client';

import type { Payment } from '@/types/database';

interface PaymentHistoryProps {
  payments: Payment[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const METHOD_LABELS: Record<string, { label: string; icon: string }> = {
  cash: { label: 'Cash', icon: '\uD83D\uDCB5' },
  check: { label: 'Check', icon: '\uD83D\uDCDD' },
  card: { label: 'Card', icon: '\uD83D\uDCB3' },
  stripe: { label: 'Stripe', icon: '\uD83D\uDCB3' },
};

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  balance: 'Balance',
  full: 'Full Payment',
  partial: 'Partial Payment',
};

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (!payments || payments.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Payment History
        </h3>
        <p className="text-[13px] text-gray-400 dark:text-gray-500">
          No payments recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] p-4">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Payment History
      </h3>
      <div className="space-y-0">
        {payments.map((payment, idx) => {
          const method = METHOD_LABELS[payment.payment_method] || {
            label: payment.payment_method,
            icon: '\uD83D\uDCB0',
          };
          const typeLabel = TYPE_LABELS[payment.payment_type] || payment.payment_type;
          const isLast = idx === payments.length - 1;

          return (
            <div key={payment.id} className="relative flex gap-3">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-100 dark:bg-gray-800" />
              )}

              {/* Timeline dot */}
              <div className="relative z-10 mt-1 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30 text-sm">
                {method.icon}
              </div>

              {/* Content */}
              <div className={`flex-1 ${isLast ? '' : 'pb-4'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(Number(payment.amount))}
                    </p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {typeLabel} via {method.label}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium shrink-0 tabular-nums">
                    {formatDateTime(payment.recorded_at)}
                  </p>
                </div>
                {payment.payment_note && (
                  <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1 italic">
                    {payment.payment_note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
