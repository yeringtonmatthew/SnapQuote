'use client';

import { useState, useRef, useCallback } from 'react';
import type { LineItem } from '@/types/database';

interface LineItemEditorProps {
  lineItems: LineItem[];
  onChange: (items: LineItem[]) => void;
}

const UNIT_SUGGESTIONS = ['ea', 'sq ft', 'hr', 'sq', 'ln ft', 'gal'];

function SwipeableLineItem({
  item,
  index,
  onUpdate,
  onRemove,
  focusedUnitIndex,
  onUnitFocus,
  onUnitBlur,
}: {
  item: LineItem;
  index: number;
  onUpdate: (index: number, field: keyof LineItem, value: string | number) => void;
  onRemove: (index: number) => void;
  focusedUnitIndex: number | null;
  onUnitFocus: (index: number) => void;
  onUnitBlur: (index: number) => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const DELETE_THRESHOLD = -80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Only swipe left, and only if horizontal movement > vertical
    if (!isSwiping.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      isSwiping.current = true;
    }

    if (isSwiping.current && dx < 0) {
      setSwipeX(Math.max(dx, -120));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (swipeX < DELETE_THRESHOLD) {
      setIsRemoving(true);
      setTimeout(() => onRemove(index), 300);
    } else {
      setSwipeX(0);
    }
    isSwiping.current = false;
  }, [swipeX, onRemove, index]);

  if (isRemoving) {
    return <div className="slide-out-left overflow-hidden" />;
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl">
      {/* Delete reveal behind the card */}
      {swipeX < -10 && (
        <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-red-500 px-6">
          <div className="flex flex-col items-center text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span className="mt-0.5 text-[11px] font-semibold">Delete</span>
          </div>
        </div>
      )}

      <div
        className="card relative !p-4 transition-transform"
        style={{
          transform: swipeX !== 0 ? `translateX(${swipeX}px)` : undefined,
          transition: isSwiping.current ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Row 1: Description + Delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={item.description}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              placeholder="Line item description"
              aria-label={`Line item ${index + 1} description`}
              className="w-full border-0 bg-transparent p-0 text-[16px] font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0"
            />
          </div>
          {/* Desktop delete button -- 44px touch target */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove line item ${index + 1}`}
            className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Row 2: Qty, Unit, Price, Total -- 2x2 grid on mobile, 4-col on wider */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label htmlFor={`li-qty-${index}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Qty</label>
            <input
              id={`li-qty-${index}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={item.quantity}
              onChange={(e) => onUpdate(index, 'quantity', parseFloat(e.target.value) || 0)}
              className="mt-0.5 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-[16px] text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
            />
          </div>
          <div className="relative">
            <label htmlFor={`li-unit-${index}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Unit</label>
            <input
              id={`li-unit-${index}`}
              type="text"
              value={item.unit}
              onChange={(e) => onUpdate(index, 'unit', e.target.value)}
              onFocus={() => onUnitFocus(index)}
              onBlur={() => {
                setTimeout(() => onUnitBlur(index), 150);
              }}
              className="mt-0.5 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-[16px] text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
            />
            {focusedUnitIndex === index && (
              <div className="absolute left-0 top-full z-10 mt-1 flex flex-wrap gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1.5 shadow-lg">
                {UNIT_SUGGESTIONS.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onUpdate(index, 'unit', unit);
                      onUnitBlur(index);
                    }}
                    className="rounded-md bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 hover:text-brand-700 dark:hover:text-brand-300 transition-colors min-h-[32px]"
                  >
                    {unit}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label htmlFor={`li-price-${index}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Price</label>
            <div className="relative mt-0.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">$</span>
              <input
                id={`li-price-${index}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => onUpdate(index, 'unit_price', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-6 pr-2 text-[16px] text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div>
            <label htmlFor={`li-total-${index}`} className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total</label>
            <div className="relative mt-0.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-400">$</span>
              <input
                id={`li-total-${index}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={item.total}
                onChange={(e) => onUpdate(index, 'total', parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-2.5 pl-6 pr-2 text-[16px] font-semibold text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {/* Swipe hint for mobile (on first item only) */}
        {index === 0 && (
          <p className="mt-2 text-[11px] text-gray-400 sm:hidden">Swipe left to delete</p>
        )}
      </div>
    </div>
  );
}

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

  // Running total
  const runningTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-3">
      {lineItems.map((item, i) => (
        <SwipeableLineItem
          key={i}
          item={item}
          index={i}
          onUpdate={updateItem}
          onRemove={removeItem}
          focusedUnitIndex={focusedUnitIndex}
          onUnitFocus={setFocusedUnitIndex}
          onUnitBlur={(idx) => setFocusedUnitIndex(prev => prev === idx ? null : prev)}
        />
      ))}

      {/* Add item button -- prominent */}
      <button
        type="button"
        onClick={addItem}
        className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 py-3 text-[15px] font-semibold text-gray-500 dark:text-gray-400 transition-colors hover:border-brand-400 hover:text-brand-500 active:bg-brand-50 dark:active:bg-brand-950/30 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Line Item
      </button>

      {/* Inline running total */}
      {lineItems.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
          <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
          <span className="text-[16px] font-bold text-gray-900 dark:text-gray-100">
            ${runningTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}
