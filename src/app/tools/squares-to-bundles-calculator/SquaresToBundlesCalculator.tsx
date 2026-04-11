'use client';

import { useState, useMemo } from 'react';

export function SquaresToBundlesCalculator() {
  const [squares, setSquares] = useState<string>('25');
  const [type, setType] = useState<'standard' | 'premium'>('standard');
  const [waste, setWaste] = useState<string>('10');

  const result = useMemo(() => {
    const s = parseFloat(squares) || 0;
    const w = parseFloat(waste) || 0;
    const bundlesPerSquare = type === 'premium' ? 4 : 3;
    const rawBundles = s * bundlesPerSquare;
    const withWaste = Math.ceil(rawBundles * (1 + w / 100));
    return { rawBundles: Math.round(rawBundles), withWaste, bundlesPerSquare };
  }, [squares, type, waste]);

  return (
    <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="squares" className="block text-[13px] font-semibold text-gray-700">Squares</label>
            <input
              id="squares"
              type="number"
              min="0"
              value={squares}
              onChange={(e) => setSquares(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-[13px] font-semibold text-gray-700">Shingle Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'standard' | 'premium')}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="standard">Standard (3 bundles/square)</option>
              <option value="premium">Premium (4 bundles/square)</option>
            </select>
          </div>
          <div>
            <label htmlFor="waste" className="block text-[13px] font-semibold text-gray-700">Waste Factor (%)</label>
            <input
              id="waste"
              type="number"
              min="0"
              max="50"
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Bundles Needed</div>
          <dl className="mt-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Bundles per square</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.bundlesPerSquare}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Raw bundles</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.rawBundles}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] font-medium text-gray-700">Bundles with waste</dt>
              <dd className="text-3xl font-bold tabular-nums text-blue-600">{result.withWaste}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
