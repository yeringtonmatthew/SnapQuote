'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { haptic } from '@/lib/haptic';

interface CollectPaymentButtonProps {
  quoteId: string;
  depositAmount: number;
  balanceAmount: number;
  currentStatus: string;
  paymentMethod?: string | null;
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function CollectPaymentButton({
  quoteId,
  depositAmount,
  balanceAmount,
  currentStatus,
  paymentMethod,
}: CollectPaymentButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<'cash' | 'check' | 'card'>('cash');
  const [paymentType, setPaymentType] = useState<'deposit' | 'balance' | 'full'>('deposit');
  const [checkNumber, setCheckNumber] = useState('');

  const alreadyPaid = currentStatus === 'deposit_paid';
  const canCollect = currentStatus === 'sent' || currentStatus === 'approved';

  const amountMap = {
    deposit: depositAmount,
    balance: balanceAmount,
    full: depositAmount + balanceAmount,
  };
  const amount = amountMap[paymentType];

  async function handleConfirm() {
    setSaving(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: method,
          payment_note: method === 'check' && checkNumber ? `Check #${checkNumber}` : null,
          amount,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast({ message: d.error || 'Failed to record payment', type: 'error' });
        return;
      }
      haptic('heavy');
      setShowModal(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (alreadyPaid) {
    return (
      <a
        href={`/receipt/${quoteId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 shadow-sm hover:bg-green-100 press-scale"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Paid · Receipt
      </a>
    );
  }

  if (!canCollect) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 press-scale"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
        </svg>
        Collect
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-modal-backdrop">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 space-y-5 max-h-[90dvh] overflow-y-auto animate-modal-content">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">Collect Payment</h2>
              <p className="text-[14px] text-gray-500 mt-0.5">Record a cash or check payment</p>
            </div>

            {/* Payment type */}
            <div>
              <p className="label mb-2">What are you collecting?</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'deposit', label: 'Deposit', amount: depositAmount },
                  { key: 'balance', label: 'Balance', amount: balanceAmount },
                  { key: 'full', label: 'Full Amount', amount: depositAmount + balanceAmount },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { haptic('light'); setPaymentType(opt.key as any); }}
                    className={`rounded-xl border-2 px-3 py-2.5 text-center transition-colors ${
                      paymentType === opt.key
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${paymentType === opt.key ? 'text-brand-600' : 'text-gray-400'}`}>
                      {opt.label}
                    </p>
                    <p className={`text-[15px] font-bold mt-0.5 ${paymentType === opt.key ? 'text-brand-700' : 'text-gray-900'}`}>
                      {fmt(opt.amount)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="label mb-2">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'cash', label: 'Cash', icon: '💵' },
                  { key: 'check', label: 'Check', icon: '📝' },
                  { key: 'card', label: 'Card', icon: '💳' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => { haptic('light'); setMethod(m.key as any); }}
                    className={`rounded-xl border-2 px-3 py-3 text-center transition-colors ${
                      method === m.key
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <p className="text-2xl">{m.icon}</p>
                    <p className={`text-[13px] font-semibold mt-1 ${method === m.key ? 'text-brand-700' : 'text-gray-700'}`}>
                      {m.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Check number */}
            {method === 'check' && (
              <div>
                <label className="label">Check Number (optional)</label>
                <input
                  type="text"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  placeholder="e.g. 1042"
                  className="input-field"
                />
              </div>
            )}

            {/* Summary */}
            <div className="rounded-2xl bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] text-gray-500">Recording payment of</p>
                <p className="text-[22px] font-bold text-gray-900">{fmt(amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-gray-400">via</p>
                <p className="text-[15px] font-semibold text-gray-700 capitalize">{method}</p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={saving}
              className="w-full rounded-2xl bg-green-600 py-3.5 text-[15px] font-semibold text-white hover:bg-green-700 disabled:opacity-60 press-scale"
            >
              {saving ? 'Recording…' : `Confirm ${fmt(amount)} ${method.charAt(0).toUpperCase() + method.slice(1)} Payment`}
            </button>

            <button onClick={() => setShowModal(false)} className="w-full py-2 text-[14px] text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
