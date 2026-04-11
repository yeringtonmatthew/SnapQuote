'use client';

import { useState, useMemo } from 'react';

const materials = [
  { key: '3tab', label: '3-Tab Asphalt', low: 3.5, high: 5.5 },
  { key: 'arch', label: 'Architectural Asphalt', low: 4.5, high: 7.0 },
  { key: 'metal', label: 'Metal (Standing Seam)', low: 10, high: 16 },
  { key: 'cedar', label: 'Cedar Shake', low: 9, high: 14 },
  { key: 'tile', label: 'Tile (Clay/Concrete)', low: 10, high: 18 },
  { key: 'slate', label: 'Slate', low: 15, high: 30 },
];

const pitches = [
  { label: 'Flat / Low slope (0–2/12)', factor: 1.0, laborBump: 0 },
  { label: 'Standard (4/12 – 6/12)', factor: 1.118, laborBump: 0 },
  { label: 'Moderate (7/12 – 9/12)', factor: 1.25, laborBump: 0.1 },
  { label: 'Steep (10/12 – 12/12)', factor: 1.414, laborBump: 0.25 },
  { label: 'Very steep (12/12+)', factor: 1.5, laborBump: 0.4 },
];

export function RoofReplacementCostCalculator() {
  const [sqft, setSqft] = useState<string>('2000');
  const [materialKey, setMaterialKey] = useState<string>('arch');
  const [pitchIdx, setPitchIdx] = useState<number>(1);
  const [layers, setLayers] = useState<string>('1');

  const result = useMemo(() => {
    const footprint = parseFloat(sqft) || 0;
    const mat = materials.find((m) => m.key === materialKey) ?? materials[0];
    const pitch = pitches[pitchIdx];
    const layerCount = parseFloat(layers) || 1;

    const actualSurface = footprint * pitch.factor;
    const teardownBump = layerCount > 1 ? (layerCount - 1) * 0.1 : 0;
    const totalBump = 1 + pitch.laborBump + teardownBump;

    const low = Math.round(actualSurface * mat.low * totalBump);
    const high = Math.round(actualSurface * mat.high * totalBump);

    return {
      actualSurface: Math.round(actualSurface),
      low,
      high,
      midpoint: Math.round((low + high) / 2),
    };
  }, [sqft, materialKey, pitchIdx, layers]);

  const format = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="sqft" className="block text-[13px] font-semibold text-gray-700">
              Home Footprint (sq ft)
            </label>
            <input
              id="sqft"
              type="number"
              inputMode="decimal"
              min="0"
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[12px] text-gray-400">Your home&apos;s square footage — not the roof surface.</p>
          </div>

          <div>
            <label htmlFor="material" className="block text-[13px] font-semibold text-gray-700">
              Roofing Material
            </label>
            <select
              id="material"
              value={materialKey}
              onChange={(e) => setMaterialKey(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {materials.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label} (${m.low}-${m.high}/sq ft)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pitch" className="block text-[13px] font-semibold text-gray-700">
              Roof Pitch
            </label>
            <select
              id="pitch"
              value={pitchIdx}
              onChange={(e) => setPitchIdx(parseInt(e.target.value, 10))}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {pitches.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="layers" className="block text-[13px] font-semibold text-gray-700">
              Existing Layers to Tear Off
            </label>
            <select
              id="layers"
              value={layers}
              onChange={(e) => setLayers(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="1">1 layer</option>
              <option value="2">2 layers (+10%)</option>
              <option value="3">3 layers (+20%)</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Estimated Cost</div>

          <div className="mt-5">
            <div className="text-[13px] text-gray-600">Ballpark range</div>
            <div className="mt-1 text-3xl font-bold tabular-nums text-blue-600">
              {format(result.low)} – {format(result.high)}
            </div>
          </div>

          <dl className="mt-6 space-y-3 border-t border-blue-100/60 pt-4">
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] text-gray-600">Actual roof surface</dt>
              <dd className="text-[14px] font-semibold tabular-nums text-gray-900">
                {result.actualSurface.toLocaleString()} sq ft
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] text-gray-600">Midpoint estimate</dt>
              <dd className="text-[14px] font-semibold tabular-nums text-gray-900">{format(result.midpoint)}</dd>
            </div>
          </dl>

          <p className="mt-6 rounded-xl bg-white/60 p-3 text-[12px] text-gray-500">
            These are ballpark estimates based on typical US installed pricing. Regional labor rates, deck
            repair, and special conditions can shift the final number. Get at least 3 quotes from local licensed
            roofers.
          </p>
        </div>
      </div>
    </section>
  );
}
