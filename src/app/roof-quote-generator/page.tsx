import { Metadata } from 'next';
import { IntentLandingTemplate } from '@/components/IntentLandingTemplate';

export const metadata: Metadata = {
  title: 'AI Roof Quote Generator — Free to Start | SnapQuote',
  description:
    'AI-powered roof quote generator. Snap photos of any roof and get a detailed proposal in 60 seconds. $79/mo, 14-day free trial. Built for working roofers.',
  keywords: [
    'roof quote generator',
    'AI roof quote',
    'free roof quote generator',
    'roofing quote software',
    'instant roof estimate',
  ],
  openGraph: {
    title: 'AI Roof Quote Generator — SnapQuote',
    description: 'Snap photos, get a detailed proposal in 60 seconds.',
    url: 'https://snapquote.dev/roof-quote-generator',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/roof-quote-generator' },
};

export default function Page() {
  return (
    <IntentLandingTemplate
      eyebrow="Roof Quote Generator"
      urlPath="/roof-quote-generator"
      headline="The AI Roof Quote Generator Built for Working Roofers"
      subhead="Walk the roof, snap a few photos, and get a detailed, branded proposal in 60 seconds. No typing line items. No digging through templates. Just photos in, quote out — ready to text to the homeowner before you leave the driveway."
      benefits={[
        {
          title: 'AI That Understands Roofing',
          body: 'SnapQuote uses Claude Vision AI trained on roofing work — squares, pitch, tear-off, underlayment, flashing, ridge cap. It reads your photos and drafts the scope automatically.',
        },
        {
          title: '60 Seconds from Walk to Proposal',
          body: 'Your competition takes 24-72 hours to send a proposal. SnapQuote sends it from the truck. The roofer who quotes first usually wins.',
        },
        {
          title: 'Branded, Professional PDFs',
          body: 'Your logo, your colors, your terms — every quote looks like something a big operation sent. Homeowners pick the roofer whose proposal looks most put-together.',
        },
        {
          title: 'Text-to-Sign Workflow',
          body: 'Quote goes out as an SMS link. Homeowner taps it, reviews, signs with their finger, pays the deposit. All on their phone, in under a minute.',
        },
      ]}
      howItWorks={[
        'Open SnapQuote on your iPhone and walk the roof.',
        'Snap 3-5 photos — the AI handles the scope detection automatically.',
        'Review the auto-generated quote and tweak anything you want.',
        'Text the proposal link to the homeowner. They sign and pay on their phone.',
      ]}
      faqs={[
        {
          q: 'How accurate is the AI-generated quote?',
          a: 'Very accurate for typical residential roofs. The AI identifies materials, estimates scope from your photos, and drafts line items. You always review and adjust before sending — the AI gets you 90% of the way in 10 seconds instead of you starting from scratch.',
        },
        {
          q: 'Do I need a big camera or special equipment?',
          a: 'No. Your iPhone is all you need. The better your photos, the more accurate the scope — but regular roof-walk photos work fine.',
        },
        {
          q: 'What does it cost?',
          a: '$79/mo flat. 14-day free trial. No credit card required to start. Unlimited quotes, unlimited clients, unlimited everything.',
        },
        {
          q: 'Can I customize the quote before sending?',
          a: 'Yes. Every line item is editable. You can add, remove, change prices, update quantities, and tweak the scope before sending. The AI is a starting point, not a black box.',
        },
      ]}
    />
  );
}
