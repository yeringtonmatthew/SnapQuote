import { Metadata } from 'next';
import { CalculatorPageShell } from '@/components/CalculatorPageShell';
import { ShingleCalculator } from './ShingleCalculator';

export const metadata: Metadata = {
  title: 'Shingle Calculator — How Many Bundles Do You Need? | SnapQuote',
  description:
    'Free shingle calculator. Calculate exactly how many bundles and squares of shingles you need for your roof. Includes waste factor and starter strip.',
  keywords: ['shingle calculator', 'how many bundles of shingles', 'bundles of shingles calculator', 'shingle coverage calculator'],
  alternates: { canonical: 'https://snapquote.dev/tools/shingle-calculator' },
};

export default function Page() {
  return (
    <CalculatorPageShell
      eyebrow="Shingle Calculator"
      title="Shingle Calculator"
      description="Calculate exactly how many bundles and squares of shingles you need. Enter your roof square footage and we'll handle pitch, waste, and starter strip."
      urlPath="/tools/shingle-calculator"
      educational={
        <>
          <h2 className="text-2xl font-bold text-gray-900 !mb-4">How Many Shingles Do I Need?</h2>
          <p className="text-gray-600 leading-relaxed">
            The quick answer: divide your roof surface area by 100 to get squares, then multiply by 3 for
            standard 3-tab shingles or 3-4 for architectural shingles to get bundle count. Always add 10-15%
            for waste, and don&apos;t forget starter strip and ridge cap.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Bundle Coverage</h2>
          <ul className="text-gray-600 leading-relaxed">
            <li><strong>3-tab shingles:</strong> 3 bundles per square (100 sq ft)</li>
            <li><strong>Architectural shingles:</strong> 3 bundles per square for most lines, 4 for heavy/premium</li>
            <li><strong>Starter strip:</strong> 1 bundle covers about 105 linear feet of eave and rake</li>
            <li><strong>Ridge cap shingles:</strong> 1 bundle covers about 30 linear feet of ridge</li>
          </ul>
          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Why Waste Factor Matters</h2>
          <p className="text-gray-600 leading-relaxed">
            Every roof has cuts, overlaps, and mistakes. Simple gable roofs need 10% waste. Complex roofs with
            dormers, valleys, and hips need 15-20%. Running out of shingles mid-job is worse than returning an
            unopened bundle.
          </p>
        </>
      }
    >
      <ShingleCalculator />
    </CalculatorPageShell>
  );
}
