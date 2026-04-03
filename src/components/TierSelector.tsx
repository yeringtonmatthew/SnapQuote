'use client';

import { useState } from 'react';

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

interface TierOption {
  name: string;
  description: string;
  line_items: LineItem[];
  recommended?: boolean;
}

interface TierSelectorProps {
  options: TierOption[];
  taxRate: number | null;
  discountAmount: number | null;
  discountPercent: number | null;
  depositPercent: number;
  brandColor: string;
  onSelect: (index: number) => void;
  selectedIndex: number | null;
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtDetail = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calcTotal(items: LineItem[], taxRate: number | null, discountAmount: number | null, discountPercent: number | null) {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const rounded = Math.round(subtotal * 100) / 100;
  let discount = 0;
  if (discountAmount != null && discountAmount > 0) {
    discount = Math.min(discountAmount, rounded);
  } else if (discountPercent != null && discountPercent > 0) {
    discount = Math.round(rounded * (discountPercent / 100) * 100) / 100;
  }
  const afterDiscount = Math.round((rounded - discount) * 100) / 100;
  const tax = taxRate != null && taxRate > 0 ? Math.round(afterDiscount * (taxRate / 100) * 100) / 100 : 0;
  return Math.round((afterDiscount + tax) * 100) / 100;
}

const tierIcons: Record<string, string> = {
  good: '🛡️',
  better: '⭐',
  best: '🏆',
};

function getTierIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower in tierIcons) return tierIcons[lower];
  return '📋';
}

export function TierSelector({ options, taxRate, discountAmount, discountPercent, depositPercent, brandColor, onSelect, selectedIndex }: TierSelectorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1 px-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Choose Your Package</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Select the option that fits your needs</p>
        </div>
      </div>

      {options.map((option, i) => {
        const total = calcTotal(option.line_items, taxRate, discountAmount, discountPercent);
        const deposit = Math.round((total * depositPercent) / 100 * 100) / 100;
        const isSelected = selectedIndex === i;
        const isExpanded = expandedIndex === i;
        const isRecommended = option.recommended;

        return (
          <div key={i} className="relative">
            {isRecommended && (
              <div
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: brandColor }}
              >
                Most Popular
              </div>
            )}
            <button
              onClick={() => onSelect(i)}
              className={`w-full text-left rounded-2xl overflow-hidden transition-all ${
                isSelected
                  ? 'ring-2 shadow-lg'
                  : 'ring-1 ring-black/[0.06] shadow-sm hover:ring-black/[0.12]'
              } ${isRecommended && !isSelected ? 'ring-2' : ''}`}
              style={{
                ...(isSelected ? { ['--tw-ring-color' as string]: brandColor } : {}),
                ...(isRecommended && !isSelected ? { ['--tw-ring-color' as string]: brandColor + '60' } : {}),
              } as React.CSSProperties}
            >
              <div className={`bg-white ${isRecommended ? 'pt-4' : ''}`}>
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Selection indicator */}
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          isSelected ? 'border-transparent' : 'border-gray-300'
                        }`}
                        style={isSelected ? { backgroundColor: brandColor } : {}}
                      >
                        {isSelected && (
                          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTierIcon(option.name)}</span>
                          <p className="text-[16px] font-bold text-gray-900">{option.name}</p>
                        </div>
                        {option.description && (
                          <p className="text-[13px] text-gray-500 mt-0.5">{option.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[22px] font-extrabold text-gray-900 tabular-nums">{fmt(total)}</p>
                      {deposit > 0 && (
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: brandColor }}>
                          {fmt(deposit)} deposit
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand/collapse line items */}
                <div className="border-t border-gray-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedIndex(isExpanded ? null : i);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isExpanded ? 'Hide details' : `${option.line_items.length} items included`}
                    <svg
                      className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-1">
                      {option.line_items.map((item, j) => (
                        <div key={j} className="flex items-start justify-between py-1.5">
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-[13px] text-gray-700">{item.description}</p>
                            {(Number(item.quantity) > 1 || (item.unit && item.unit.trim() !== '')) && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {item.quantity} {item.unit} x {fmtDetail(Number(item.unit_price))}
                              </p>
                            )}
                          </div>
                          <p className="shrink-0 text-[13px] font-medium text-gray-700 tabular-nums">
                            {fmtDetail(Number(item.total))}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
