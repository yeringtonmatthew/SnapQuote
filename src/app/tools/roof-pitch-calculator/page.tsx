import { Metadata } from 'next';
import { CalculatorPageShell } from '@/components/CalculatorPageShell';
import { RoofPitchCalculator } from './RoofPitchCalculator';

export const metadata: Metadata = {
  title: 'Roof Pitch Calculator — Convert Rise/Run to Degrees and Multiplier | SnapQuote',
  description:
    'Free roof pitch calculator. Convert rise-over-run (like 6/12) to degrees, percentage, and the multiplier you need to calculate actual roof surface area.',
  keywords: [
    'roof pitch calculator',
    'roof pitch to degrees',
    'roof pitch multiplier',
    'roof slope calculator',
    'rise over run calculator',
  ],
  alternates: { canonical: 'https://snapquote.dev/tools/roof-pitch-calculator' },
  openGraph: {
    title: 'Roof Pitch Calculator — SnapQuote',
    description: 'Convert any roof pitch to degrees, percentage, and surface multiplier instantly.',
    url: 'https://snapquote.dev/tools/roof-pitch-calculator',
    type: 'website',
  },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is roof pitch expressed as?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Roof pitch is typically written as rise/run, like 6/12 — meaning the roof rises 6 inches for every 12 inches of horizontal distance. It can also be expressed in degrees or percentage.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a standard residential roof pitch?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most residential homes in the US use a 4/12 to 8/12 pitch, with 6/12 being the most common. Anything below 2/12 is considered a low-slope or flat roof and requires different materials.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I convert roof pitch to degrees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the formula degrees = arctan(rise / run). For a 6/12 pitch, arctan(6/12) = 26.57 degrees. A 12/12 pitch equals 45 degrees.',
      },
    },
  ],
};

export default function Page() {
  return (
    <CalculatorPageShell
      eyebrow="Roof Pitch Calculator"
      title="Roof Pitch Calculator"
      description="Free roof pitch calculator. Convert rise-over-run to degrees, percentage, and the surface-area multiplier you need to estimate materials for any roof."
      urlPath="/tools/roof-pitch-calculator"
      faqLd={faqLd}
      educational={
        <>
          <h2 className="text-2xl font-bold text-gray-900 !mb-4">What Is Roof Pitch?</h2>
          <p className="text-gray-600 leading-relaxed">
            Roof pitch is the steepness of a roof expressed as the ratio of vertical rise to horizontal run.
            Written as rise/run, a 6/12 pitch means the roof rises 6 inches for every 12 inches of horizontal
            distance. It&apos;s the standard way roofers and building codes describe slope.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">How to Measure Roof Pitch</h2>
          <p className="text-gray-600 leading-relaxed">
            There are a few ways to measure pitch on an existing roof. The simplest is to use a 2-foot level and
            a tape measure. Hold the level horizontally against the roof, then measure the distance from the end
            of the level down to the roof surface. That&apos;s the rise in a 24-inch run, which you divide by 2
            to get the rise in a 12-inch run (the standard way pitch is expressed).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Why Pitch Matters for Estimating</h2>
          <p className="text-gray-600 leading-relaxed">
            The steeper the pitch, the more actual surface area the roof has compared to its footprint. A 10/12
            pitch roof has 30% more surface than its footprint would suggest — which means 30% more shingles,
            underlayment, and labor. Miss the pitch adjustment and you&apos;ll under-order materials and under-bid
            the job.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">Pitch Categories</h2>
          <ul className="text-gray-600 leading-relaxed">
            <li><strong>Flat (0/12 – 2/12):</strong> Requires membrane roofing (TPO, EPDM, modified bitumen). Shingles don&apos;t work.</li>
            <li><strong>Low slope (2/12 – 4/12):</strong> Shingles work but need ice and water shield across the entire roof.</li>
            <li><strong>Standard (4/12 – 8/12):</strong> The sweet spot for residential. Most common pitch range.</li>
            <li><strong>Steep (8/12 – 12/12):</strong> Harder to walk, needs fall protection, more labor time.</li>
            <li><strong>Very steep (12/12+):</strong> Roof jacks and scaffolding required. Labor costs climb fast.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 !mt-10 !mb-4">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">What is a standard residential roof pitch?</h3>
              <p className="text-gray-600 leading-relaxed !mt-2">
                Most residential homes in the US use a 4/12 to 8/12 pitch, with 6/12 being the most common.
                Anything below 2/12 is considered a low-slope or flat roof and requires different materials.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">How do I convert roof pitch to degrees?</h3>
              <p className="text-gray-600 leading-relaxed !mt-2">
                Use the formula degrees = arctan(rise / run). For a 6/12 pitch, arctan(6/12) ≈ 26.57 degrees.
                A 12/12 pitch equals exactly 45 degrees.
              </p>
            </div>
          </div>
        </>
      }
    >
      <RoofPitchCalculator />
    </CalculatorPageShell>
  );
}
