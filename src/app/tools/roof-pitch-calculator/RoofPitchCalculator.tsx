'use client';

import { useState, useMemo } from 'react';

export function RoofPitchCalculator() {
  const [rise, setRise] = useState<string>('6');
  const [run, setRun] = useState<string>('12');

  const result = useMemo(() => {
    const r = parseFloat(rise) || 0;
    const u = parseFloat(run) || 12;
    if (u === 0) return { degrees: '0.00', percentage: '0.00', multiplier: '1.000', category: '—' };
    const degrees = (Math.atan(r / u) * 180) / Math.PI;
    const percentage = (r / u) * 100;
    const multiplier = Math.sqrt(r * r + u * u) / u;
    let category = 'Standard';
    if (r === 0) category = 'Flat';
    else if (r / u <= 2 / 12) category = 'Low slope';
    else if (r / u >= 12 / 12) category = 'Very steep';
    else if (r / u >= 8 / 12) category = 'Steep';
    else if (r / u >= 4 / 12) category = 'Standard residential';
    else category = 'Low slope';

    return {
      degrees: degrees.toFixed(2),
      percentage: percentage.toFixed(2),
      multiplier: multiplier.toFixed(4),
      category,
    };
  }, [rise, run]);

  return (
    <section className="mt-12 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 shadow-sm">
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label htmlFor="rise" className="block text-[13px] font-semibold text-gray-700">
              Rise (inches)
            </label>
            <input
              id="rise"
              type="number"
              inputMode="decimal"
              min="0"
              value={rise}
              onChange={(e) => setRise(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[12px] text-gray-400">How much the roof rises vertically.</p>
          </div>

          <div>
            <label htmlFor="run" className="block text-[13px] font-semibold text-gray-700">
              Run (inches)
            </label>
            <input
              id="run"
              type="number"
              inputMode="decimal"
              min="1"
              value={run}
              onChange={(e) => setRun(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] tabular-nums text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-[12px] text-gray-400">Horizontal distance. Standard is 12.</p>
          </div>

          <p className="rounded-xl bg-gray-50 p-3 text-[12px] text-gray-500">
            Tip: if you measured a 6-inch rise across a 2-foot level, that&apos;s 6/24 — divide by 2 to get 3/12.
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Results</div>

          <dl className="mt-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Pitch</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">
                {rise}/{run}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Angle</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.degrees}°</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] text-gray-600">Percentage</dt>
              <dd className="text-lg font-semibold tabular-nums text-gray-900">{result.percentage}%</dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-blue-100/60 pb-3">
              <dt className="text-[13px] font-medium text-gray-700">Surface multiplier</dt>
              <dd className="text-2xl font-bold tabular-nums text-blue-600">×{result.multiplier}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-[13px] text-gray-600">Category</dt>
              <dd className="text-[14px] font-medium text-gray-900">{result.category}</dd>
            </div>
          </dl>

          <p className="mt-6 rounded-xl bg-white/60 p-3 text-[12px] text-gray-500">
            Multiply your roof footprint by the surface multiplier to get the actual roof surface area in
            square feet.
          </p>
        </div>
      </div>
    </section>
  );
}
