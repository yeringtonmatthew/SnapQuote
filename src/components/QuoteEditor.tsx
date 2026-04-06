'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_TERMS } from '@/lib/defaultTerms';
import { useToast } from '@/components/ui/Toast';
import { getUserMessage } from '@/lib/error-messages';
import PhoneInput from '@/components/ui/PhoneInput';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';
import { TierEditor } from '@/components/TierEditor';
import type { QuoteOption } from '@/types/database';

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

interface QuoteData {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  job_address: string | null;
  scope_of_work: string | null;
  line_items: LineItem[];
  deposit_percent: number;
  tax_rate: number | null;
  discount_amount: number | null;
  discount_percent: number | null;
  notes: string | null;
  status: string;
  quote_options: QuoteOption[] | null;
}

interface QuoteEditorProps {
  quote: QuoteData;
}

export function QuoteEditor({ quote }: QuoteEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResendPrompt, setShowResendPrompt] = useState(false);
  const [resending, setResending] = useState(false);

  // Editable state
  const [customerName, setCustomerName] = useState(quote.customer_name || '');
  const [customerPhone, setCustomerPhone] = useState(quote.customer_phone || '');
  const [jobAddress, setJobAddress] = useState(quote.job_address || '');
  const [scopeOfWork, setScopeOfWork] = useState(quote.scope_of_work || '');
  const [lineItems, setLineItems] = useState<LineItem[]>(quote.line_items || []);
  const [depositPercent, setDepositPercent] = useState(quote.deposit_percent ?? 0);
  const [taxRate, setTaxRate] = useState(String(quote.tax_rate ?? ''));
  const [discountType, setDiscountType] = useState<'none' | 'amount' | 'percent'>(
    quote.discount_amount != null && Number(quote.discount_amount) > 0
      ? 'amount'
      : quote.discount_percent != null && Number(quote.discount_percent) > 0
        ? 'percent'
        : 'none'
  );
  const [discountValue, setDiscountValue] = useState(
    quote.discount_amount != null && Number(quote.discount_amount) > 0
      ? String(quote.discount_amount)
      : quote.discount_percent != null && Number(quote.discount_percent) > 0
        ? String(quote.discount_percent)
        : ''
  );
  const [notes, setNotes] = useState(quote.notes || DEFAULT_TERMS);
  const [quoteOptions, setQuoteOptions] = useState<QuoteOption[] | null>(quote.quote_options || null);

  const canEdit = quote.status === 'draft' || quote.status === 'sent';
  const wasSent = quote.status === 'sent';

  const subtotal = (lineItems || []).reduce((sum, item) => sum + Number(item.total), 0);

  const parsedDiscountValue = parseFloat(discountValue) || 0;
  const discountAmount = discountType === 'amount'
    ? Math.round(Math.min(parsedDiscountValue, subtotal) * 100) / 100
    : discountType === 'percent'
      ? Math.round(subtotal * (Math.min(parsedDiscountValue, 100) / 100) * 100) / 100
      : 0;
  const afterDiscount = Math.round((subtotal - discountAmount) * 100) / 100;
  const parsedTaxRate = parseFloat(taxRate) || 0;
  const taxAmount = Math.round(afterDiscount * (parsedTaxRate / 100) * 100) / 100;
  const total = Math.round((afterDiscount + taxAmount) * 100) / 100;
  const depositAmount = Math.round((total * depositPercent) / 100 * 100) / 100;
  const balance = total - depositAmount;

  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        item.total = Math.round(Number(item.quantity) * Number(item.unit_price) * 100) / 100;
      }
      updated[index] = item;
      return updated;
    });
  }

  function addItem() {
    setLineItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unit: 'ea', unit_price: 0, total: 0 },
    ]);
  }

  function removeItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function cancelEdit() {
    setCustomerName(quote.customer_name || '');
    setCustomerPhone(quote.customer_phone || '');
    setJobAddress(quote.job_address || '');
    setScopeOfWork(quote.scope_of_work || '');
    setLineItems(quote.line_items || []);
    setDepositPercent(quote.deposit_percent ?? 0);
    setTaxRate(String(quote.tax_rate ?? ''));
    setDiscountType(
      quote.discount_amount != null && Number(quote.discount_amount) > 0
        ? 'amount'
        : quote.discount_percent != null && Number(quote.discount_percent) > 0
          ? 'percent'
          : 'none'
    );
    setDiscountValue(
      quote.discount_amount != null && Number(quote.discount_amount) > 0
        ? String(quote.discount_amount)
        : quote.discount_percent != null && Number(quote.discount_percent) > 0
          ? String(quote.discount_percent)
          : ''
    );
    setNotes(quote.notes || '');
    setEditing(false);
  }

  async function handleSave() {
    if (!customerName.trim()) {
      toast({ message: 'Customer name is required', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          job_address: jobAddress,
          scope_of_work: scopeOfWork,
          line_items: lineItems,
          deposit_percent: depositPercent,
          tax_rate: parsedTaxRate > 0 ? parsedTaxRate : null,
          discount_amount: discountType === 'amount' ? discountAmount : null,
          discount_percent: discountType === 'percent' ? parsedDiscountValue : null,
          notes,
          quote_options: quoteOptions,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ message: getUserMessage(data.error || 'Save failed'), type: 'error' });
        return;
      }
      setEditing(false);

      // If the quote was already sent, offer to resend
      if (wasSent) {
        setShowResendPrompt(true);
      }

      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/send`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        toast({ message: getUserMessage(data.error || 'Failed to resend'), type: 'error' });
        return;
      }
      setShowResendPrompt(false);
      router.refresh();
    } finally {
      setResending(false);
    }
  }

  // Don't render anything for non-editable statuses
  if (!canEdit) return null;

  // Resend prompt after saving a sent quote
  if (showResendPrompt) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center animate-modal-backdrop">
        <div className="w-full max-w-sm rounded-t-2xl bg-white dark:bg-gray-900 p-6 shadow-xl sm:rounded-2xl animate-modal-content">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30">
            <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Quote Updated</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This quote was already sent to the customer. Would you like to resend it so they see the updated version?
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setShowResendPrompt(false)}
              className="btn-secondary flex-1"
            >
              Not Now
            </button>
            <button
              onClick={handleResend}
              disabled={resending}
              className="btn-primary flex-1"
            >
              {resending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Resend to Customer
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 press-scale"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
        </svg>
        Edit
      </button>
    );
  }

  // ── EDIT MODE ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 dark:bg-gray-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button onClick={cancelEdit} className="text-sm font-medium text-gray-500 dark:text-gray-400 min-h-[44px] flex items-center">
            Cancel
          </button>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Edit Quote</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60 press-scale"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">

        {/* Customer */}
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Customer</p>
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <PhoneInput
              value={customerPhone}
              onChange={setCustomerPhone}
              placeholder="(555) 000-0000"
            />
          </div>
          <div>
            <label className="label">Job Address</label>
            <div className="relative">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <AddressAutocomplete
                value={jobAddress}
                onChange={setJobAddress}
                placeholder="123 Main St, Indianapolis, IN"
                className="input-field pl-9"
              />
            </div>
          </div>
        </div>

        {/* Scope */}
        <div className="card">
          <label className="label mb-2 block">Scope of Work</label>
          <textarea
            value={scopeOfWork}
            onChange={(e) => setScopeOfWork(e.target.value)}
            rows={4}
            className="input-field resize-none"
            placeholder="Describe the work to be done..."
          />
        </div>

        {/* Line Items */}
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Line Items</p>

          {lineItems.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3.5 space-y-2.5 transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700">
              <div className="flex items-start gap-2">
                {/* Drag handle hint + line number */}
                <span className="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold text-gray-300 dark:text-gray-600 tabular-nums">
                  {i + 1}
                </span>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  rows={2}
                  className="input-field flex-1 resize-none text-sm !rounded-lg !py-2.5"
                  placeholder="Description"
                />
                <button
                  onClick={() => removeItem(i)}
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 pl-7">
                <div>
                  <label className="label text-[10px] !mb-1">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                    className="input-field text-sm !rounded-lg !py-2"
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="label text-[10px] !mb-1">Unit</label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(i, 'unit', e.target.value)}
                    className="input-field text-sm !rounded-lg !py-2"
                    placeholder="ea"
                  />
                </div>
                <div>
                  <label className="label text-[10px] !mb-1">Unit Price</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-gray-400">$</span>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="input-field pl-6 text-sm !rounded-lg !py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end pl-7 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">{fmt(Number(item.total))}</span>
              </div>
            </div>
          ))}

          <button
            onClick={addItem}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-brand-400 hover:text-brand-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Line Item
          </button>
        </div>

        {/* Pricing */}
        <div className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pricing</p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fmt(subtotal)}</span>
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Discount</span>
              <div className="flex items-center gap-1.5">
                {(['none', 'amount', 'percent'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setDiscountType(type); if (type === 'none') setDiscountValue(''); }}
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      discountType === type
                        ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type === 'none' ? 'None' : type === 'amount' ? '$ Amt' : '% Pct'}
                  </button>
                ))}
              </div>
            </div>
            {discountType !== 'none' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 px-2">
                  {discountType === 'amount' && <span className="text-xs text-gray-400 mr-1">$</span>}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={discountType === 'percent' ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                    className="w-20 border-0 bg-transparent p-1 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0"
                  />
                  {discountType === 'percent' && <span className="text-xs text-gray-400 ml-1">%</span>}
                </div>
                {discountAmount > 0 && (
                  <span className="text-sm font-medium text-red-500">-{fmt(discountAmount)}</span>
                )}
              </div>
            )}
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tax</span>
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 px-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="0"
                  className="w-12 border-0 bg-transparent p-1 text-center text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-0"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{fmt(taxAmount)}</span>
          </div>

          {/* Total – editable to proportionally scale line items */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total</span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-sm font-bold text-gray-900 dark:text-gray-100">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={total || ''}
                onChange={(e) => {
                  const newTotal = parseFloat(e.target.value);
                  if (!newTotal || newTotal <= 0 || subtotal <= 0) return;
                  // Back-calculate what the new subtotal needs to be
                  // total = (subtotal - discount + tax), we scale subtotal (line items)
                  const ratio = newTotal / total;
                  setLineItems(prev => prev.map(item => ({
                    ...item,
                    unit_price: Math.round(Number(item.unit_price) * ratio * 100) / 100,
                    total: Math.round(Number(item.total) * ratio * 100) / 100,
                  })));
                }}
                className="w-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent pl-6 pr-2 py-1.5 text-right text-base font-bold text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Deposit */}
          <div>
            <label className="label">Deposit %</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={depositPercent}
                onChange={(e) => setDepositPercent(parseInt(e.target.value))}
                className="flex-1 accent-brand-600"
              />
              <span className="w-12 text-right text-sm font-bold text-brand-600">{depositPercent}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-brand-50 dark:bg-brand-950/30 px-4 py-3">
            <span className="text-sm font-semibold text-brand-900 dark:text-brand-200">Deposit Due</span>
            <span className="text-base font-bold text-brand-600">{fmt(depositAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Balance on completion</span>
            <span className="text-sm font-medium text-gray-500">{fmt(balance)}</span>
          </div>
        </div>

        {/* Good / Better / Best Tiers */}
        <TierEditor
          baseLineItems={lineItems}
          existingOptions={quoteOptions}
          onChange={setQuoteOptions}
        />

        {/* Notes */}
        <div className="card">
          <label className="label mb-2 block">Terms & Conditions</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Payment terms, warranty, exclusions..."
          />
        </div>

        <div className="flex gap-3 pb-8">
          <button onClick={cancelEdit} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
