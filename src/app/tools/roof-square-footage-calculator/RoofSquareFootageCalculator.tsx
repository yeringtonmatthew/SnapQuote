'use client';

import { useState, useMemo } from 'react';

const pitches = [
  { label: 'Flat (0/12)', value: 1.0 },
  { label: '2/12', value: 1.014 },
  { label: '4/12', value: 1.054 },
  { label: '5/12', value: 1.083 },
  { label: '6/12', value: 1.118 },
  { label: '7/12', value: 1.158 },
  { label: '8/12', value: 1.202 },
  { label: '9/12', value: 1.25 },
  { label: '10/12', value: 1.302 },
  { label: '11/12', value: 1.357 },
  { label: '12/12', value: 1.414 },
];

export function RoofSquareFootageCalculator() {
  const [length, setLength] = useState<string>('50');
  const [width, setWidth] = useState<string>('40');
  const [pitch, setPitch] = useState<number>(1.118);

  const result = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const footprint = l * w;
    const surface = footprint * pitch;
    const squares = surface / 100;
    return { footprint: Math.round(footprint), surface: Math.round(surface), squares: squares.toFixed(2) };
  }, [length, width, pitch]);

  return (
    <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="length" className="block text-[13px] font-semibold text-gray-700">House Length (ft)</label>
            <input
              id="length"
              type="number"
              min="0"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="width" className="block text-[13px] font-semibold text-gray-700">House Width (ft)</label>
            <input
              id="width"
              type="number"
              min="0"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="pitch" className="block text-[13px] font-semibold text-gray-700">Roof Pitch</label>
            <select
              id="pitch"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {pitches.map((p) => (
                <option key={p.label} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Results</div>
          <dl className="mt-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Footprint</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.footprint.toLocaleString()} sq ft</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] font-medium text-gray-700">Actual roof surface</dt>
              <dd className="text-2xl font-bold tabular-nums text-blue-600">{result.surface.toLocaleString()} sq ft</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] text-gray-600">Roofing squares</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.squares}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
