import { Metadata } from 'next';
import { IntentLandingTemplate } from '@/components/IntentLandingTemplate';

export const metadata: Metadata = {
  title: 'Roofing Proposal Software — AI-Powered Proposals in 60 Seconds | SnapQuote',
  description:
    'Roofing proposal software that writes proposals for you. Snap photos, AI drafts the scope, homeowner signs and pays on their phone. $79/mo, built for working roofers.',
  keywords: [
    'roofing proposal software',
    'roof proposal software',
    'roofing proposal app',
    'proposal software for roofers',
    'digital roofing proposal',
  ],
  openGraph: {
    title: 'Roofing Proposal Software — SnapQuote',
    description: 'AI writes the proposal. You review and send.',
    url: 'https://snapquote.dev/roofing-proposal-software',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/roofing-proposal-software' },
};

export default function Page() {
  return (
    <IntentLandingTemplate
      eyebrow="Roofing Proposal Software"
      urlPath="/roofing-proposal-software"
      headline="Roofing Proposal Software That Writes the Proposal for You"
      subhead="Most roofing proposal tools are just glorified template builders — you still manually type in line items, quantities, and prices. SnapQuote is different. AI reads your roof photos, drafts the entire proposal, and hands you something that's 90% done in 10 seconds. Review, tweak, send."
      benefits={[
        {
          title: 'AI-First Proposal Building',
          body: 'Claude Vision AI analyzes your roof photos and writes the proposal draft — scope, line items, quantities, and pricing. You stop being a typist and start being an editor.',
        },
        {
          title: 'Branded, Beautiful PDFs',
          body: 'Every proposal ships as a professional branded PDF with your logo and colors. No more proposals that look typed in the Notes app.',
        },
        {
          title: 'Built-In eSignature',
          body: 'Homeowners sign the proposal with their finger on their phone. No DocuSign, no PDF workflow, no emails back and forth.',
        },
        {
          title: 'Deposit Collection Included',
          body: 'Stripe Connect is built in. Homeowner signs the proposal and pays the deposit right there. No separate invoice, no chasing payments.',
        },
      ]}
      howItWorks={[
        'Walk the roof and snap photos with the SnapQuote iPhone app.',
        'AI drafts the proposal — scope, line items, quantities, and pricing.',
        'Review the draft and tweak anything in the editor.',
        'Send as a text link. Homeowner reviews, signs, and pays the deposit on their phone.',
      ]}
      faqs={[
        {
          q: 'Is the proposal template customizable?',
          a: 'Yes. Your logo, colors, default terms & conditions, and line-item defaults are all customizable from the settings screen. Once configured, every future proposal inherits your branding automatically.',
        },
        {
          q: 'Can I edit the AI-generated proposal before sending?',
          a: 'Always. The AI is a starting point, not a black box. Every line item is editable. You can add, remove, change prices, or rewrite the entire scope before sending.',
        },
        {
          q: 'What file format does the proposal come as?',
          a: 'Homeowners get a mobile-optimized web proposal they can sign from their phone. They also get a downloadable PDF attached for their records.',
        },
        {
          q: 'How much does it cost?',
          a: '$79/mo flat. Unlimited proposals, unlimited clients, 14-day free trial with no credit card required.',
        },
      ]}
    />
  );
}
