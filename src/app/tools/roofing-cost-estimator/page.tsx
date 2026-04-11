import { Metadata } from 'next';
import { CalculatorPageShell } from '@/components/CalculatorPageShell';
import { RoofingCostEstimator } from './RoofingCostEstimator';

export const metadata: Metadata = {
  title: 'Roofing Cost Estimator — Free Online Tool | SnapQuote',
  description:
    'Free roofing cost estimator. Enter your roof size and get an instant cost estimate per square, by material, and total job price. Built for homeowners and contractors.',
  keywords: [
    'roofing cost estimator',
    'roof cost estimator',
    'roofing price calculator',
    'roofing quote calculator',
    'roof cost per square',
  ],
  alternates: { canonical: 'https://snapquote.dev/tools/roofing-cost-estimator' },
};

export default function Page() {
  return (
    <CalculatorPageShell
      eyebrow="Roofing Cost Estimator"
      title="Roofing Cost Estimator"
      description="Get an instant estimate of what a roofing job should cost. Enter squares, material, and local labor rate to see per-square and total pricing."
      urlPath="/tools/roofing-cost-estimator"
      educational={
        <>
          <h2 className="text-2xl font-bold text-gray-900 !mb-4">How Roofers Build a Cost Estimate</h2>
          <p className="text-gray-600 leading-relaxed">
            A real roofing cost estimate has four components: materials, labor, overhead, and profit. Missing
            any one of them means you either lose money on the job or leave money on the table. This tool shows
            you a simplified per-square estimate based on typical US pricing.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Typical Price per Square</h2>
          <ul className="text-gray-600 leading-relaxed">
            <li>3-tab asphalt: $350–$550 per square installed</li>
            <li>Architectural asphalt: $450–$700 per square installed</li>
            <li>Metal standing seam: $1,000–$1,600 per square installed</li>
            <li>Tile: $1,000–$1,800 per square installed</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            A "square" in roofing equals 100 square feet. A 25-square roof (2,500 sq ft of actual surface) at
            $500 per square is about $12,500 installed.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Why This Estimator Is a Ballpark</h2>
          <p className="text-gray-600 leading-relaxed">
            Real costs vary with regional labor rates, deck repair needs, pitch, waste factor, tear-off layers,
            supplier costs, and contractor overhead. Use this tool as a starting point, then get 3 quotes from
            licensed local roofers to confirm.
          </p>
        </>
      }
    >
      <RoofingCostEstimator />
    </CalculatorPageShell>
  );
}
