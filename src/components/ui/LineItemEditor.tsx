'use client';

import { useState } from 'react';
import type { LineItem } from '@/types/database';

interface LineItemEditorProps {
  lineItems: LineItem[];
  onChange: (items: LineItem[]) => void;
}

const UNIT_SUGGESTIONS = ['ea', 'sq ft', 'hr', 'sq', 'ln ft', 'gal'];

export default function LineItemEditor({ lineItems, onChange }: LineItemEditorProps) {
  const [focusedUnitIndex, setFocusedUnitIndex] = useState<number | null>(null);

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = lineItems.map((item, i) => {
      if (i !== index) return item;
      const newItem = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unit_price') {
        newItem.total = Number(newItem.quantity) * Number(newItem.unit_price);
      }
      // When total is edited directly, back-calculate unit_price
      if (field === 'total') {
        const qty = Number(newItem.quantity) || 1;
        newItem.unit_price = Math.round((Number(value) / qty) * 100) / 100;
      }
      return newItem;
    });
    onChange(updated);
  }

  function addItem() {
    onChange([
      ...lineItems,
      { description: '', quantity: 1, unit: 'unit', unit_price: 0, total: 0 },
    ]);
  }

  function removeItem(index: number) {
    onChange(lineItems.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {lineItems.map((item, i) => (
        <div key={i} className="card !p-4">
          {/* Row 1: Description + Delete */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(i, 'description', e.target.value)}
                placeholder="Line item description"
                aria-label={`Line item ${i + 1} description`}
                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(i)}
              aria-label={`Remove line item ${i + 1}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Row 2: Qty, Unit, Price, Total — 2x2 grid on mobile, 4-col on wider */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label htmlFor={`li-qty-${i}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Qty</label>
              <input
                id={`li-qty-${i}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={item.quantity}
                onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                className="mt-0.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[15px] text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
            <div className="relative">
              <label htmlFor={`li-unit-${i}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Unit</label>
              <input
                id={`li-unit-${i}`}
                type="text"
                value={item.unit}
                onChange={(e) => updateItem(i, 'unit', e.target.value)}
                onFocus={() => setFocusedUnitIndex(i)}
                onBlur={() => {
                  // Delay to allow pill button click to register
                  setTimeout(() => setFocusedUnitIndex(prev => prev === i ? null : prev), 150);
                }}
                className="mt-0.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-[15px] text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              />
              {focusedUnitIndex === i && (
                <div className="absolute left-0 top-full z-10 mt-1 flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-lg">
                  {UNIT_SUGGESTIONS.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        updateItem(i, 'unit', unit);
                        setFocusedUnitIndex(null);
                      }}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-brand-100 hover:text-brand-700 transition-colors"
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label htmlFor={`li-price-${i}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Price</label>
              <div className="relative mt-0.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">$</span>
                <input
                  id={`li-price-${i}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-6 pr-2 text-[15px] text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>
            </div>
            <div>
              <label htmlFor={`li-total-${i}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Total</label>
              <div className="relative mt-0.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">$</span>
                <input
                  id={`li-total-${i}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={item.total}
                  onChange={(e) => updateItem(i, 'total', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-6 pr-2 text-[15px] font-semibold text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand-400 hover:text-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Line Item
      </button>
    </div>
  );
}
