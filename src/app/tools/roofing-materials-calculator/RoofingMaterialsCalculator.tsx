'use client';

import { useState, useMemo } from 'react';

export function RoofingMaterialsCalculator() {
  const [squares, setSquares] = useState<string>('25');
  const [waste, setWaste] = useState<string>('10');
  const [ridge, setRidge] = useState<string>('60');
  const [eaveRake, setEaveRake] = useState<string>('180');

  const result = useMemo(() => {
    const s = parseFloat(squares) || 0;
    const w = parseFloat(waste) || 0;
    const r = parseFloat(ridge) || 0;
    const er = parseFloat(eaveRake) || 0;
    const sqsW = s * (1 + w / 100);

    return {
      shingleBundles: Math.ceil(sqsW * 3),
      underlaymentRolls: Math.ceil(sqsW / 10),
      iceShieldRolls: Math.ceil(er / 200),
      nailsLbs: Math.ceil((sqsW * 320) / 140), // ~140 nails/lb for 1.25" roofing nails
      dripEdgePieces: Math.ceil(er / 10), // 10-foot pieces
      starterBundles: Math.ceil(er / 105),
      ridgeBundles: Math.ceil(r / 30),
    };
  }, [squares, waste, ridge, eaveRake]);

  return (
    <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="squares" className="block text-[13px] font-semibold text-gray-700">Roofing Squares</label>
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
            <label htmlFor="eave" className="block text-[13px] font-semibold text-gray-700">Eave + Rake (ft)</label>
            <input
              id="eave"
              type="number"
              min="0"
              value={eaveRake}
              onChange={(e) => setEaveRake(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Material List</div>
          <dl className="mt-5 space-y-3">
            {[
              ['Shingle bundles', result.shingleBundles],
              ['Underlayment rolls', result.underlaymentRolls],
              ['Ice & water shield rolls', result.iceShieldRolls],
              ['Roofing nails (lbs)', result.nailsLbs],
              ['Drip edge (10ft pieces)', result.dripEdgePieces],
              ['Starter strip bundles', result.starterBundles],
              ['Ridge cap bundles', result.ridgeBundles],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between border-b border-blue-100/60 pb-2">
                <dt className="text-[13px] text-gray-600">{label}</dt>
                <dd className="text-[15px] font-semibold tabular-nums text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 rounded-xl bg-white/60 p-3 text-[12px] text-gray-500">
            Always verify coverage on the actual product wrapper. Quantities may vary by manufacturer.
          </p>
        </div>
      </div>
    </section>
  );
}
