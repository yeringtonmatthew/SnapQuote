import { Metadata } from 'next';
import { CalculatorPageShell } from '@/components/CalculatorPageShell';
import { SquaresToBundlesCalculator } from './SquaresToBundlesCalculator';

export const metadata: Metadata = {
  title: 'Squares to Bundles Calculator — Shingle Conversion Tool | SnapQuote',
  description:
    'Free squares to bundles calculator. Convert roofing squares to shingle bundles instantly. Works with 3-tab, architectural, and premium shingles.',
  keywords: ['squares to bundles', 'bundles per square', 'shingle bundles calculator', 'roofing conversion'],
  alternates: { canonical: 'https://snapquote.dev/tools/squares-to-bundles-calculator' },
};

export default function Page() {
  return (
    <CalculatorPageShell
      eyebrow="Squares to Bundles"
      title="Squares to Bundles Calculator"
      description="Convert roofing squares to shingle bundles instantly. Works with 3-tab, architectural, and heavy premium shingles."
      urlPath="/tools/squares-to-bundles-calculator"
      educational={
        <>
          <h2 className="text-2xl font-bold text-gray-900 !mb-4">How Bundles Per Square Works</h2>
          <p className="text-gray-600 leading-relaxed">
            Most asphalt shingles are packaged so that 3 bundles cover 1 roofing square (100 sq ft). This is
            the standard for both 3-tab and most architectural shingles. Heavier premium lines may be packaged
            at 4 bundles per square — always check the wrapper before ordering.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Quick Conversion Reference</h2>
          <ul className="text-gray-600 leading-relaxed">
            <li>1 square = 100 sq ft of roof surface</li>
            <li>3-tab shingles: 3 bundles per square</li>
            <li>Architectural: 3 bundles per square (most lines)</li>
            <li>Premium / heavyweight: 4 bundles per square</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            A 2,500 sq ft roof = 25 squares = 75 bundles of standard shingles, before waste factor.
          </p>
        </>
      }
    >
      <SquaresToBundlesCalculator />
    </CalculatorPageShell>
  );
}
