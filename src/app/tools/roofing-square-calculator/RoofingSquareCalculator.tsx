'use client';

import { useState, useMemo } from 'react';

const pitchOptions = [
  { label: 'Flat', value: 1.0 },
  { label: '2/12', value: 1.014 },
  { label: '3/12', value: 1.031 },
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

export function RoofingSquareCalculator() {
  const [length, setLength] = useState<string>('40');
  const [width, setWidth] = useState<string>('30');
  const [pitchMultiplier, setPitchMultiplier] = useState<number>(1.118);
  const [wastePercent, setWastePercent] = useState<string>('10');
  const [bundlesPerSquare, setBundlesPerSquare] = useState<number>(3);

  const result = useMemo(() => {
    const lengthNum = parseFloat(length) || 0;
    const widthNum = parseFloat(width) || 0;
    const waste = parseFloat(wastePercent) || 0;

    const footprint = lengthNum * widthNum;
    const actualSurface = footprint * pitchMultiplier;
    const rawSquares = actualSurface / 100;
    const squaresWithWaste = rawSquares * (1 + waste / 100);
    const bundles = Math.ceil(squaresWithWaste * bundlesPerSquare);

    return {
      footprint: Math.round(footprint),
      actualSurface: Math.round(actualSurface),
      rawSquares: rawSquares.toFixed(2),
      squaresWithWaste: squaresWithWaste.toFixed(2),
      bundles,
    };
  }, [length, width, pitchMultiplier, wastePercent, bundlesPerSquare]);

  return (
    <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 sm:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label htmlFor="length" className="block text-[13px] font-semibold text-gray-700">
              Roof Length (ft)
            </label>
            <input
              id="length"
              type="number"
              inputMode="decimal"
              min="0"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="width" className="block text-[13px] font-semibold text-gray-700">
              Roof Width (ft)
            </label>
            <input
              id="width"
              type="number"
              inputMode="decimal"
              min="0"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="pitch" className="block text-[13px] font-semibold text-gray-700">
              Roof Pitch
            </label>
            <select
              id="pitch"
              value={pitchMultiplier}
              onChange={(e) => setPitchMultiplier(parseFloat(e.target.value))}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {pitchOptions.map((p) => (
                <option key={p.label} value={p.value}>
                  {p.label} (×{p.value.toFixed(3)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="waste" className="block text-[13px] font-semibold text-gray-700">
              Waste Factor (%)
            </label>
            <input
              id="waste"
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              value={wastePercent}
              onChange={(e) => setWastePercent(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[12px] text-gray-400">Simple roofs: 10%. Complex (dormers, valleys): 15-20%.</p>
          </div>

          <div>
            <label htmlFor="bundles" className="block text-[13px] font-semibold text-gray-700">
              Bundles per Square
            </label>
            <select
              id="bundles"
              value={bundlesPerSquare}
              onChange={(e) => setBundlesPerSquare(parseInt(e.target.value, 10))}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value={3}>3 (standard 3-tab)</option>
              <option value={4}>4 (heavy architectural)</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Results</div>

          <dl className="mt-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Footprint</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.footprint.toLocaleString()} sq ft</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Actual roof surface</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.actualSurface.toLocaleString()} sq ft</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Roofing squares (raw)</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.rawSquares}</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] font-medium text-gray-700">Squares (with waste)</dt>
              <dd className="text-2xl font-bold tabular-nums text-blue-600">{result.squaresWithWaste}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] font-medium text-gray-700">Shingle bundles needed</dt>
              <dd className="text-2xl font-bold tabular-nums text-blue-600">{result.bundles}</dd>
            </div>
          </dl>

          <p className="mt-6 rounded-xl bg-white/60 p-3 text-[12px] text-gray-500">
            These are estimates. Always measure on-site and verify package sizes on the shingle wrapper. Complex
            roofs with dormers and valleys need higher waste factors.
          </p>
        </div>
      </div>
    </section>
  );
}
