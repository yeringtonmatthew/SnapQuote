'use client';

import { useState, useMemo } from 'react';

export function ShingleCalculator() {
  const [surface, setSurface] = useState<string>('2500');
  const [shingleType, setShingleType] = useState<'3tab' | 'architectural' | 'premium'>('architectural');
  const [waste, setWaste] = useState<string>('10');
  const [ridge, setRidge] = useState<string>('60');
  const [eaveRake, setEaveRake] = useState<string>('180');

  const result = useMemo(() => {
    const surf = parseFloat(surface) || 0;
    const w = parseFloat(waste) || 0;
    const squares = surf / 100;
    const squaresWithWaste = squares * (1 + w / 100);
    const bundlesPerSquare = shingleType === '3tab' ? 3 : shingleType === 'architectural' ? 3 : 4;
    const mainBundles = Math.ceil(squaresWithWaste * bundlesPerSquare);
    const starterBundles = Math.ceil((parseFloat(eaveRake) || 0) / 105);
    const ridgeBundles = Math.ceil((parseFloat(ridge) || 0) / 30);
    return {
      squares: squares.toFixed(2),
      squaresWithWaste: squaresWithWaste.toFixed(2),
      mainBundles,
      starterBundles,
      ridgeBundles,
      totalBundles: mainBundles + starterBundles + ridgeBundles,
    };
  }, [surface, shingleType, waste, ridge, eaveRake]);

  return (
    <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="surface" className="block text-[13px] font-semibold text-gray-700">Roof Surface (sq ft)</label>
            <input
              id="surface"
              type="number"
              min="0"
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[12px] text-gray-400">Actual roof surface, after applying pitch multiplier.</p>
          </div>
          <div>
            <label htmlFor="type" className="block text-[13px] font-semibold text-gray-700">Shingle Type</label>
            <select
              id="type"
              value={shingleType}
              onChange={(e) => setShingleType(e.target.value as '3tab' | 'architectural' | 'premium')}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="3tab">3-Tab (3 bundles/square)</option>
              <option value="architectural">Architectural (3 bundles/square)</option>
              <option value="premium">Premium / Heavy (4 bundles/square)</option>
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
          <div>
            <label htmlFor="ridge" className="block text-[13px] font-semibold text-gray-700">Ridge Length (ft)</label>
            <input
              id="ridge"
              type="number"
              min="0"
              value={ridge}
              onChange={(e) => setRidge(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="eave" className="block text-[13px] font-semibold text-gray-700">Eave + Rake Length (ft)</label>
            <input
              id="eave"
              type="number"
              min="0"
              value={eaveRake}
              onChange={(e) => setEaveRake(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[12px] text-gray-400">For starter strip calculation.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Materials Needed</div>
          <dl className="mt-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Squares (raw)</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.squares}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Squares (with waste)</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.squaresWithWaste}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Main field bundles</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.mainBundles}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Starter strip bundles</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.starterBundles}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Ridge cap bundles</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.ridgeBundles}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] font-medium text-gray-700">Total bundles</dt>
              <dd className="text-2xl font-bold tabular-nums text-blue-600">{result.totalBundles}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
