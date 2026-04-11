import { Metadata } from 'next';
import { CalculatorPageShell } from '@/components/CalculatorPageShell';
import { RoofSquareFootageCalculator } from './RoofSquareFootageCalculator';

export const metadata: Metadata = {
  title: 'Roof Square Footage Calculator — From Footprint and Pitch | SnapQuote',
  description:
    'Free roof square footage calculator. Enter your home footprint and roof pitch to get the actual roof surface area in square feet.',
  keywords: ['roof square footage calculator', 'roof surface area calculator', 'square footage of roof', 'how to calculate roof area'],
  alternates: { canonical: 'https://snapquote.dev/tools/roof-square-footage-calculator' },
};

export default function Page() {
  return (
    <CalculatorPageShell
      eyebrow="Roof Square Footage"
      title="Roof Square Footage Calculator"
      description="Enter your home footprint and roof pitch to get the actual roof surface area in square feet. Critical for accurate material estimates."
      urlPath="/tools/roof-square-footage-calculator"
      educational={
        <>
          <h2 className="text-2xl font-bold text-gray-900 !mb-4">Why Roof Area Differs From House Footprint</h2>
          <p className="text-gray-600 leading-relaxed">
            Your house may be 2,000 square feet of footprint, but your roof surface is larger because of the
            pitch. A 6/12 pitch adds about 12% to the footprint. A 12/12 pitch adds about 41%. If you calculate
            shingles based on the footprint instead of the actual surface, you&apos;ll come up short every time.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">The Formula</h2>
          <p className="text-gray-600 leading-relaxed">
            Actual roof surface = footprint × pitch multiplier. Most residential pitches use a multiplier
            between 1.054 (4/12) and 1.414 (12/12). This calculator does it for you.
          </p>
        </>
      }
    >
      <RoofSquareFootageCalculator />
    </CalculatorPageShell>
  );
}
