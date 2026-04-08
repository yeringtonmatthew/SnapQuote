'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ROICalculator() {
  const [quotesPerMonth, setQuotesPerMonth] = useState(20);

  const timeSavedMinutes = quotesPerMonth * 45;
  const timeSavedHours = Math.round(timeSavedMinutes / 60);
  const averageQuoteValue = 8400;
  const closeRateImprovement = 0.4;
  const additionalRevenue = Math.round(quotesPerMonth * closeRateImprovement * averageQuoteValue * 0.1);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100 sm:p-10">
        <label htmlFor="quotes-slider" className="block text-base font-semibold text-gray-900 mb-2">
          How many quotes do you send per month?
        </label>
        <div className="flex items-center gap-4 mb-8">
          <input
            id="quotes-slider"
            type="range"
            min={5}
            max={100}
            step={5}
            value={quotesPerMonth}
            onChange={(e) => setQuotesPerMonth(Number(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none bg-gray-200 accent-brand-600 cursor-pointer"
          />
          <span className="text-3xl font-bold text-brand-600 tabular-nums w-16 text-right">
            {quotesPerMonth}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-brand-50 p-6 text-center">
            <p className="text-4xl font-bold text-brand-600 tabular-nums">{timeSavedHours}</p>
            <p className="text-sm font-medium text-brand-700 mt-1">hours saved per month</p>
            <p className="text-xs text-brand-500 mt-2">
              {quotesPerMonth} quotes x 45 min saved each
            </p>
          </div>
          <div className="rounded-2xl bg-green-50 p-6 text-center">
            <p className="text-4xl font-bold text-green-700 tabular-nums">
              ${additionalRevenue.toLocaleString()}
            </p>
            <p className="text-sm font-medium text-green-800 mt-1">additional revenue per month</p>
            <p className="text-xs text-green-600 mt-2">
              40% higher win rate on avg ${averageQuoteValue.toLocaleString()} quotes
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-lg font-semibold text-gray-900">
            That&apos;s like hiring a full-time assistant for free.
          </p>
          <Link
            href="/auth/signup"
            className="mt-5 inline-block rounded-full bg-brand-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            Start Saving Time
          </Link>
        </div>
      </div>
    </div>
  );
}
