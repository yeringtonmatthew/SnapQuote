import { Metadata } from 'next';
import { CalculatorPageShell } from '@/components/CalculatorPageShell';
import { RoofingMaterialsCalculator } from './RoofingMaterialsCalculator';

export const metadata: Metadata = {
  title: 'Roofing Materials Calculator — Shingles, Underlayment, Nails | SnapQuote',
  description:
    'Free roofing materials calculator. Calculate shingles, underlayment, ice and water shield, nails, drip edge, and starter strip for any roof job.',
  keywords: ['roofing materials calculator', 'roof materials list', 'roofing material estimator', 'underlayment calculator'],
  alternates: { canonical: 'https://snapquote.dev/tools/roofing-materials-calculator' },
};

export default function Page() {
  return (
    <CalculatorPageShell
      eyebrow="Roofing Materials Calculator"
      title="Roofing Materials Calculator"
      description="Calculate every material you need for a roof job — shingles, underlayment, ice and water shield, nails, drip edge, and starter strip — from one simple input."
      urlPath="/tools/roofing-materials-calculator"
      educational={
        <>
          <h2 className="text-2xl font-bold text-gray-900 !mb-4">The Complete Roofing Materials List</h2>
          <p className="text-gray-600 leading-relaxed">
            Every roof replacement needs more than just shingles. Here&apos;s what a typical asphalt shingle roof
            job includes:
          </p>
          <ul className="text-gray-600 leading-relaxed">
            <li><strong>Shingles:</strong> 3 bundles per square (100 sq ft), plus waste</li>
            <li><strong>Synthetic underlayment:</strong> 1 roll covers roughly 10 squares</li>
            <li><strong>Ice and water shield:</strong> Covers eaves, valleys, penetrations (1 roll covers ~200 linear feet of eave)</li>
            <li><strong>Roofing nails:</strong> ~320 nails per square for standard 4-nail pattern</li>
            <li><strong>Drip edge:</strong> Linear feet of eave + rake</li>
            <li><strong>Starter strip:</strong> 1 bundle per ~105 linear feet of eave and rake</li>
            <li><strong>Ridge cap:</strong> 1 bundle per ~30 linear feet of ridge</li>
          </ul>
          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Material Coverage Notes</h2>
          <p className="text-gray-600 leading-relaxed">
            Coverage varies by manufacturer. Always check the wrapper before ordering. Architectural shingles
            are typically 3 bundles per square, but some premium lines are 4 bundles per square. Ice and
            water shield should cover at least 6 feet up from the eave per building code in most cold-climate
            regions.
          </p>
        </>
      }
    >
      <RoofingMaterialsCalculator />
    </CalculatorPageShell>
  );
}
