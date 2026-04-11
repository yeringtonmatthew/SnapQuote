import { Metadata } from 'next';
import { IntentLandingTemplate } from '@/components/IntentLandingTemplate';

export const metadata: Metadata = {
  title: 'Roofing Sales App — Close More Jobs with AI-Powered Quotes | SnapQuote',
  description:
    'Roofing sales app that helps you close more jobs. AI-generated proposals, eSignature, deposit collection — all from your iPhone. $79/mo, 14-day free trial.',
  keywords: [
    'roofing sales app',
    'roofing sales software',
    'roof sales tool',
    'roofing sales rep app',
    'close more roofing jobs',
  ],
  openGraph: {
    title: 'Roofing Sales App — SnapQuote',
    description: 'Close more roofing jobs with AI-powered proposals.',
    url: 'https://snapquote.dev/roofing-sales-app',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/roofing-sales-app' },
};

export default function Page() {
  return (
    <IntentLandingTemplate
      eyebrow="Roofing Sales App"
      urlPath="/roofing-sales-app"
      headline="The Roofing Sales App That Actually Closes Jobs"
      subhead="Most roofing software is built for operations. SnapQuote is built for sales — helping you turn the first 10 minutes of a roof walk into a signed, deposited job. AI writes the proposal, homeowner signs on their phone, deposit hits your Stripe account. All before the next contractor even calls back."
      benefits={[
        {
          title: 'Speed Wins Jobs',
          body: 'Contractors who send proposals within an hour close 2-3x more jobs than those who take a day or more. SnapQuote gets your proposal in the homeowner\u2019s hand before you leave the driveway.',
        },
        {
          title: 'Professional Beats Amateur',
          body: 'Homeowners pick the contractor whose proposal looks most put-together. SnapQuote\u2019s branded PDFs and clean web proposals make you look like a 20-person operation.',
        },
        {
          title: 'Signature and Deposit in One Flow',
          body: 'eSignature and Stripe Connect deposit collection are built right into the proposal. Homeowner signs, pays, and you\u2019re booked — no separate invoicing step, no deposit chase.',
        },
        {
          title: 'Follow-Up Without the Work',
          body: 'Automatic client records for every quote you send. See who opened the proposal, who signed, and who needs a follow-up call. Nothing falls through the cracks.',
        },
      ]}
      howItWorks={[
        'Walk the roof and snap photos on your iPhone.',
        'SnapQuote\u2019s AI drafts the proposal — scope, line items, pricing — automatically.',
        'Send the proposal as an SMS link. Homeowner reviews on their phone.',
        'They tap to sign with their finger and pay the deposit via Stripe. You\u2019re booked.',
      ]}
      faqs={[
        {
          q: 'Can I use SnapQuote for insurance claim work?',
          a: 'Yes. SnapQuote handles insurance-ready proposal formats and the scope detail adjusters expect. Many roofers use it specifically for turning storm damage walks into fast, clean claims-ready proposals.',
        },
        {
          q: 'How does the deposit collection work?',
          a: 'Connect your Stripe account in settings. When a homeowner signs the proposal, they can pay the deposit (you set the percentage) right there. The money hits your Stripe account immediately.',
        },
        {
          q: 'Can I track which proposals are getting opened?',
          a: 'Yes. The dashboard shows every proposal you\u2019ve sent, whether it was opened, and whether it was signed. Easy to see which ones need a follow-up call.',
        },
        {
          q: 'What\u2019s the pricing?',
          a: '$79/mo flat. Unlimited proposals, unlimited clients, unlimited users. 14-day free trial with no credit card required.',
        },
      ]}
    />
  );
}
