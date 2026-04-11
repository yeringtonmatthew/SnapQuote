'use client';

import { useState, useMemo } from 'react';

const materials = [
  { key: '3tab', label: '3-Tab Asphalt', low: 350, high: 550 },
  { key: 'arch', label: 'Architectural Asphalt', low: 450, high: 700 },
  { key: 'metal', label: 'Metal Standing Seam', low: 1000, high: 1600 },
  { key: 'tile', label: 'Tile', low: 1000, high: 1800 },
  { key: 'cedar', label: 'Cedar Shake', low: 900, high: 1400 },
];

export function RoofingCostEstimator() {
  const [squares, setSquares] = useState<string>('25');
  const [materialKey, setMaterialKey] = useState<string>('arch');
  const [overhead, setOverhead] = useState<string>('15');

  const result = useMemo(() => {
    const sqs = parseFloat(squares) || 0;
    const mat = materials.find((m) => m.key === materialKey) ?? materials[0];
    const overheadPct = parseFloat(overhead) || 0;
    const baseLow = sqs * mat.low;
    const baseHigh = sqs * mat.high;
    const withOverheadLow = Math.round(baseLow * (1 + overheadPct / 100));
    const withOverheadHigh = Math.round(baseHigh * (1 + overheadPct / 100));
    return { low: withOverheadLow, high: withOverheadHigh, perSquareLow: mat.low, perSquareHigh: mat.high };
  }, [squares, materialKey, overhead]);

  const format = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="squares" className="block text-[13px] font-semibold text-gray-700">
              Roofing Squares
            </label>
            <input
              id="squares"
              type="number"
              min="0"
              value={squares}
              onChange={(e) => setSquares(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[12px] text-gray-400">1 square = 100 sq ft of roof surface.</p>
          </div>
          <div>
            <label htmlFor="material" className="block text-[13px] font-semibold text-gray-700">Material</label>
            <select
              id="material"
              value={materialKey}
              onChange={(e) => setMaterialKey(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {materials.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="overhead" className="block text-[13px] font-semibold text-gray-700">Overhead & Profit (%)</label>
            <input
              id="overhead"
              type="number"
              min="0"
              max="100"
              value={overhead}
              onChange={(e) => setOverhead(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[12px] text-gray-400">Standard contractor markup 10-25%.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Estimated Total</div>
          <div className="mt-3 text-3xl font-bold tabular-nums text-blue-600">
            {format(result.low)} – {format(result.high)}
          </div>
          <dl className="mt-6 space-y-3 border-t border-blue-100/60 pt-4">
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] text-gray-600">Cost per square</dt>
              <dd className="text-[14px] font-semibold tabular-nums text-gray-900">${result.perSquareLow}–${result.perSquareHigh}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] text-gray-600">Total squares</dt>
              <dd className="text-[14px] font-semibold tabular-nums text-gray-900">{squares}</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-xl bg-white/60 p-3 text-[12px] text-gray-500">
            Ballpark estimate using typical US installed pricing. Actual quotes vary by region and job conditions.
          </p>
        </div>
      </div>
    </section>
  );
}
