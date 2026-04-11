import { Metadata } from 'next';
import { CalculatorPageShell } from '@/components/CalculatorPageShell';
import { RoofReplacementCostCalculator } from './RoofReplacementCostCalculator';

export const metadata: Metadata = {
  title: 'Roof Replacement Cost Calculator — Free Estimate Tool | SnapQuote',
  description:
    'Free roof replacement cost calculator. Estimate the cost of replacing your roof by size, pitch, material type, and tear-off scope. Built by working roofers.',
  keywords: [
    'roof replacement cost calculator',
    'how much does a new roof cost',
    'roof replacement estimate',
    'roof cost estimator',
    'new roof cost calculator',
  ],
  alternates: { canonical: 'https://snapquote.dev/tools/roof-replacement-cost-calculator' },
  openGraph: {
    title: 'Roof Replacement Cost Calculator — SnapQuote',
    description: 'Estimate the cost of a full roof replacement by size, pitch, and material.',
    url: 'https://snapquote.dev/tools/roof-replacement-cost-calculator',
    type: 'website',
  },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does a new roof cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A typical asphalt shingle roof replacement in the US costs between $8,000 and $18,000 for a 2,000 square foot home, depending on pitch, tear-off requirements, and regional labor rates. Premium materials like metal or tile can push that to $20,000-$40,000+.',
      },
    },
    {
      '@type': 'Question',
      name: 'What factors affect roof replacement cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The biggest drivers are: roof size (square footage), pitch (steeper = more labor), material choice (asphalt vs metal vs tile), number of existing layers to tear off, deck repair needs, and regional labor rates.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is a roof replacement estimate online accurate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Online calculators give you a ballpark range within 10-20% of the real cost. For an exact quote you need a roofer to inspect the actual roof — tools like SnapQuote let roofers send a real proposal in 60 seconds after a site visit.',
      },
    },
  ],
};

export default function Page() {
  return (
    <CalculatorPageShell
      eyebrow="Roof Replacement Cost Calculator"
      title="Roof Replacement Cost Calculator"
      description="Free roof replacement cost calculator. Get a ballpark estimate of what a new roof will cost based on square footage, pitch, material, and tear-off scope."
      urlPath="/tools/roof-replacement-cost-calculator"
      faqLd={faqLd}
      ctaHeadline="Homeowners: Want a Real Quote?"
      ctaBody="This calculator gives you a ballpark. For an exact quote from a local roofer, contractors using SnapQuote can send you a detailed AI-generated proposal in 60 seconds after walking your roof."
      educational={
        <>
          <h2 className="text-2xl font-bold text-gray-900 !mb-4">How Much Does a New Roof Cost in 2026?</h2>
          <p className="text-gray-600 leading-relaxed">
            The average cost to replace a roof in the US ranges from $8,000 to $18,000 for a typical 2,000
            square foot home with asphalt shingles. Premium materials like metal, tile, or cedar can push the
            total to $20,000-$40,000 or more. The biggest factors driving cost are size, pitch, material,
            tear-off scope, and regional labor rates.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">What You Pay For</h2>
          <p className="text-gray-600 leading-relaxed">
            A full roof replacement includes tear-off of the old roof, disposal fees, new underlayment, new
            flashing, new shingles (or other material), ridge cap, new vents, labor, and often deck repair. On
            an average job, labor is about 40-60% of the total cost.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Cost by Material</h2>
          <ul className="text-gray-600 leading-relaxed">
            <li><strong>3-tab asphalt shingles:</strong> $3.50–$5.50 per square foot installed</li>
            <li><strong>Architectural asphalt shingles:</strong> $4.50–$7.00 per square foot installed</li>
            <li><strong>Metal roofing (standing seam):</strong> $10–$16 per square foot installed</li>
            <li><strong>Cedar shake:</strong> $9–$14 per square foot installed</li>
            <li><strong>Tile (clay or concrete):</strong> $10–$18 per square foot installed</li>
            <li><strong>Slate:</strong> $15–$30+ per square foot installed</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Why Pitch Matters</h2>
          <p className="text-gray-600 leading-relaxed">
            A steep roof costs significantly more to replace than a low-pitched one for two reasons: more
            actual surface area (a 12/12 pitch has ~41% more surface than its footprint), and harder, slower
            labor because the crew needs fall protection, roof jacks, and more care on every step.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Should You Get Multiple Quotes?</h2>
          <p className="text-gray-600 leading-relaxed">
            Yes. Get at least three quotes from licensed, insured roofers in your area. Watch for prices that
            are significantly lower than the others — that often means the contractor is cutting corners on
            materials, labor, insurance, or all three. The cheapest roof is usually the one that fails first.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">How much does a new roof cost?</h3>
              <p className="text-gray-600 leading-relaxed !mt-2">
                A typical asphalt shingle roof replacement in the US costs between $8,000 and $18,000 for a
                2,000 square foot home. Premium materials like metal or tile can push that to $20,000-$40,000+.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">What factors affect roof replacement cost?</h3>
              <p className="text-gray-600 leading-relaxed !mt-2">
                Size, pitch, material choice, number of existing layers to tear off, deck repair needs, and
                regional labor rates all drive the final number.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Is this calculator estimate accurate?</h3>
              <p className="text-gray-600 leading-relaxed !mt-2">
                Online calculators give you a ballpark within 10-20% of the real cost. For an exact quote you
                need a roofer to inspect your actual roof.
              </p>
            </div>
          </div>
        </>
      }
    >
      <RoofReplacementCostCalculator />
    </CalculatorPageShell>
  );
}
