'use client';

import { useState } from 'react';
import { TierSelector } from './TierSelector';
import { AcceptQuoteButton } from './AcceptQuoteButton';

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

interface TieredQuoteViewProps {
  quoteId: string;
  options: TierOption[];
  taxRate: number | null;
  discountAmount: number | null;
  discountPercent: number | null;
  depositPercent: number;
  currentStatus: string;
  stripeEnabled: boolean;
  brandColor: string;
  isExpired: boolean;
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calcTierTotal(items: LineItem[], taxRate: number | null, discountAmount: number | null, discountPercent: number | null) {
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

export function TieredQuoteView({
  quoteId,
  options,
  taxRate,
  discountAmount,
  discountPercent,
  depositPercent,
  currentStatus,
  stripeEnabled,
  brandColor,
  isExpired,
}: TieredQuoteViewProps) {
  // Default to the recommended tier, or the middle one
  const defaultIndex = options.findIndex(o => o.recommended);
  const [selectedIndex, setSelectedIndex] = useState<number>(
    defaultIndex >= 0 ? defaultIndex : Math.min(1, options.length - 1)
  );

  const selectedOption = options[selectedIndex];
  const total = calcTierTotal(selectedOption.line_items, taxRate, discountAmount, discountPercent);
  const deposit = Math.round((total * depositPercent) / 100 * 100) / 100;

  return (
    <div className="space-y-4">
      {/* Tier selector cards */}
      <TierSelector
        options={options}
        taxRate={taxRate}
        discountAmount={discountAmount}
        discountPercent={discountPercent}
        depositPercent={depositPercent}
        brandColor={brandColor}
        onSelect={setSelectedIndex}
        selectedIndex={selectedIndex}
      />

      {/* Sticky CTA for selected tier */}
      {!isExpired && (
        <div className="sticky bottom-0 z-20 -mx-4 px-4 py-3 bg-[#f7f7f8]/80 backdrop-blur-xl border-t border-black/5" data-no-print>
          <div className="mx-auto max-w-lg">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[13px] font-semibold text-gray-700">
                {selectedOption.name} Package
              </span>
              <span className="text-[15px] font-bold text-gray-900 tabular-nums">{fmt(total)}</span>
            </div>
            <AcceptQuoteButton
              quoteId={quoteId}
              depositAmount={deposit}
              currentStatus={currentStatus}
              stripeEnabled={stripeEnabled}
              brandColor={brandColor}
              selectedOption={selectedIndex}
            />
          </div>
        </div>
      )}
    </div>
  );
}
