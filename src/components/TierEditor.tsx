'use client';

import { useState, useCallback } from 'react';
import type { LineItem, QuoteOption } from '@/types/database';

interface TierEditorProps {
  baseLineItems: LineItem[];
  existingOptions?: QuoteOption[] | null;
  onChange: (options: QuoteOption[] | null) => void;
}

const DEFAULT_TIERS: { name: string; description: string; multiplier: number; recommended: boolean }[] = [
  { name: 'Good', description: 'Essential coverage', multiplier: 0.75, recommended: false },
  { name: 'Better', description: 'Our most popular option', multiplier: 1.0, recommended: true },
  { name: 'Best', description: 'Premium full-service', multiplier: 1.25, recommended: false },
];

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function scaleLineItems(items: LineItem[], multiplier: number): LineItem[] {
  return items.map(item => {
    const newPrice = Math.round(Number(item.unit_price) * multiplier * 100) / 100;
    const newTotal = Math.round(newPrice * Number(item.quantity) * 100) / 100;
    return { ...item, unit_price: newPrice, total: newTotal };
  });
}

function tierTotal(items: LineItem[]) {
  return items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
}

export function TierEditor({ baseLineItems, existingOptions, onChange }: TierEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<QuoteOption[]>(() => {
    if (existingOptions && existingOptions.length > 0) return existingOptions;
    return DEFAULT_TIERS.map(t => ({
      name: t.name,
      description: t.description,
      line_items: scaleLineItems(baseLineItems, t.multiplier),
      recommended: t.recommended,
    }));
  });
  const [editingTier, setEditingTier] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<{ tier: number; item: number } | null>(null);

  const handleEnable = useCallback(() => {
    const initial = DEFAULT_TIERS.map(t => ({
      name: t.name,
      description: t.description,
      line_items: scaleLineItems(baseLineItems, t.multiplier),
      recommended: t.recommended,
    }));
    setOptions(initial);
    setIsOpen(true);
  }, [baseLineItems]);

  const handleSave = useCallback(() => {
    onChange(options);
    setIsOpen(false);
  }, [options, onChange]);

  const handleRemove = useCallback(() => {
    onChange(null);
    setIsOpen(false);
  }, [onChange]);

  const updateOption = useCallback((index: number, updates: Partial<QuoteOption>) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, ...updates } : opt));
  }, []);

  const updateLineItem = useCallback((tierIndex: number, itemIndex: number, updates: Partial<LineItem>) => {
    setOptions(prev => prev.map((opt, i) => {
      if (i !== tierIndex) return opt;
      const newItems = opt.line_items.map((item, j) => {
        if (j !== itemIndex) return item;
        const updated = { ...item, ...updates };
        if ('unit_price' in updates || 'quantity' in updates) {
          updated.total = Math.round(Number(updated.unit_price) * Number(updated.quantity) * 100) / 100;
        }
        return updated;
      });
      return { ...opt, line_items: newItems };
    }));
  }, []);

  const addLineItem = useCallback((tierIndex: number) => {
    setOptions(prev => prev.map((opt, i) => {
      if (i !== tierIndex) return opt;
      return { ...opt, line_items: [...opt.line_items, { description: '', quantity: 1, unit: 'ea', unit_price: 0, total: 0 }] };
    }));
  }, []);

  const removeLineItem = useCallback((tierIndex: number, itemIndex: number) => {
    setOptions(prev => prev.map((opt, i) => {
      if (i !== tierIndex) return opt;
      return { ...opt, line_items: opt.line_items.filter((_, j) => j !== itemIndex) };
    }));
  }, []);

  const setRecommended = useCallback((tierIndex: number) => {
    setOptions(prev => prev.map((opt, i) => ({ ...opt, recommended: i === tierIndex })));
  }, []);

  const hasOptions = existingOptions && existingOptions.length > 0;

  if (!isOpen) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-lg">
              🏆
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Good / Better / Best Pricing</p>
              <p className="text-xs text-gray-500">
                {hasOptions ? `${existingOptions.length} tiers configured` : 'Offer multiple pricing options to increase close rate'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={hasOptions ? () => setIsOpen(true) : handleEnable}
            className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
          >
            {hasOptions ? 'Edit Tiers' : 'Add Tiers'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-center bg-black/40 backdrop-blur-sm sm:p-4 sm:pt-[10vh] overflow-y-auto" onClick={() => setIsOpen(false)}>
      <div className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl max-h-[90dvh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Configure Package Options</h2>
            <p className="text-xs text-gray-500 mt-0.5">Customers will choose from these options</p>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-2 hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tiers */}
        <div className="px-4 sm:px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {options.map((option, tierIdx) => (
            <div key={tierIdx} className={`rounded-xl border ${option.recommended ? 'border-brand-300 bg-brand-50/30' : 'border-gray-200'} overflow-hidden`}>
              {/* Tier header */}
              <div className="px-4 py-3 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="text"
                    value={option.name}
                    onChange={e => updateOption(tierIdx, { name: e.target.value })}
                    className="text-sm font-bold text-gray-900 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none w-24"
                    placeholder="Tier name"
                  />
                  <input
                    type="text"
                    value={option.description}
                    onChange={e => updateOption(tierIdx, { description: e.target.value })}
                    className="text-xs text-gray-500 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none flex-1 min-w-0"
                    placeholder="Description"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRecommended(tierIdx)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                      option.recommended ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {option.recommended ? '★ Recommended' : 'Set Recommended'}
                  </button>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">{fmt(tierTotal(option.line_items))}</span>
                </div>
              </div>

              {/* Line items */}
              <div className="px-4 py-2">
                {option.line_items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateLineItem(tierIdx, itemIdx, { description: e.target.value })}
                      className="flex-1 min-w-0 text-xs text-gray-700 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      min={0}
                      onChange={e => updateLineItem(tierIdx, itemIdx, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-12 text-xs text-gray-600 text-center bg-gray-50 rounded border border-gray-200 p-0.5 focus:ring-1 focus:ring-brand-500"
                    />
                    <span className="text-[10px] text-gray-400 w-8 text-center">{item.unit}</span>
                    <div className="flex items-center">
                      <span className="text-[10px] text-gray-400">$</span>
                      <input
                        type="number"
                        value={item.unit_price}
                        min={0}
                        step="0.01"
                        onChange={e => updateLineItem(tierIdx, itemIdx, { unit_price: parseFloat(e.target.value) || 0 })}
                        className="w-16 text-xs text-gray-700 text-right bg-gray-50 rounded border border-gray-200 p-0.5 focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 tabular-nums w-16 text-right">{fmt(Number(item.total))}</span>
                    <button
                      type="button"
                      onClick={() => removeLineItem(tierIdx, itemIdx)}
                      className="p-0.5 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addLineItem(tierIdx)}
                  className="mt-1 text-[11px] font-medium text-brand-600 hover:text-brand-700"
                >
                  + Add item
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-medium text-red-500 hover:text-red-700"
          >
            Remove Tiers
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Save Tiers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
