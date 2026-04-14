import type { Metadata } from 'next';
import { TemplateResourcePage } from '@/components/TemplateResourcePage';

export const metadata: Metadata = {
  title: 'Free Roofing Quote Template + Example | SnapQuote',
  description:
    'Use this roofing quote template to present scope, price, options, and approval terms in a customer-friendly format. See an example, then generate it from photos with SnapQuote.',
  keywords: [
    'roofing quote template',
    'roof quote template',
    'roofing quote example',
    'residential roofing quote',
    'roofing bid template',
  ],
  alternates: {
    canonical: 'https://snapquote.dev/roofing-quote-template',
  },
  openGraph: {
    title: 'Free Roofing Quote Template + Example | SnapQuote',
    description:
      'See the structure roofers use to send a cleaner, customer-ready roofing quote, then automate it with SnapQuote.',
    url: 'https://snapquote.dev/roofing-quote-template',
    type: 'website',
    images: [
      {
        url: 'https://snapquote.dev/api/og?title=Roofing+Quote+Template&subtitle=Free+Example+from+SnapQuote',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RoofingQuoteTemplatePage() {
  return (
    <TemplateResourcePage
      eyebrow="Free Roofing Quote Template"
      title="Use a roofing quote template that feels fast to send and still strong enough to win."
      description="A roofing quote template is the customer-facing version of the estimate: clear scope, clear total, and an easy next step. Use it when you want to send the price quickly without looking rushed or bare-bones."
      canonicalPath="/roofing-quote-template"
      webPageName="Roofing Quote Template"
      webPageDescription="Use this roofing quote template to present scope, price, options, and approval terms in a customer-friendly format."
      previewType="quote"
      previewEyebrow="Quote example"
      previewCaption="Price-forward, customer-friendly, and still polished enough to build trust."
      previewBadge="Customer-ready"
      chips={['Estimate plus context', 'Easy customer yes', 'Great for retail roofing']}
      templateSections={[
        {
          title: 'Scope summary and product selection',
          body: 'Show the homeowner what they are getting in plain language: tear-off, shingle system, underlayment, flashing, cleanup, and warranty-ready product details.',
        },
        {
          title: 'Price, options, and expiration',
          body: 'Display the total clearly, add good-better-best options when useful, and include an expiration date so the quote feels current and actionable.',
        },
        {
          title: 'Approval terms and next step',
          body: 'A quote should still tell the customer how to move forward. Approval language, scheduling expectations, and deposit terms keep the momentum alive.',
        },
      ]}
      narrativeTitle="When should you use a quote template instead of a full proposal?"
      narrativeParagraphs={[
        'A roofing quote sits between the raw estimate and the full proposal. It is shorter and more price-forward, but still organized enough that the homeowner feels like they are dealing with a serious company.',
        'This is especially useful when the customer wants a clean number quickly and you do not need a long narrative or inspection-heavy document yet. The quote gives them a professional answer without slowing the sale down.',
        'If you later need findings, photo evidence, warranty detail, signature, and deposit in one polished flow, that quote can expand into a full proposal. SnapQuote is built to bridge that exact gap.',
      ]}
      relatedLinks={[
        {
          href: '/roofing-proposal-template',
          title: 'Roofing proposal template',
          body: 'See the fuller document you use when you need more trust-building detail and a place to sign.',
        },
        {
          href: '/roofing-estimate-template',
          title: 'Roofing estimate template',
          body: 'Start with the pricing-first version if the homeowner only wants the number right now.',
        },
        {
          href: '/roofing-proposal-software',
          title: 'Roofing proposal software',
          body: 'Let SnapQuote turn photos into a customer-ready quote or proposal automatically.',
        },
        {
          href: '/blog/what-to-include-in-a-roofing-proposal',
          title: 'What to include in a roofing proposal',
          body: 'Use the full checklist when your quote needs to become the closing document.',
        },
      ]}
      faqs={[
        {
          q: 'What should a roofing quote template include?',
          a: 'A roofing quote template should include the customer and property, a clear scope summary, total price, product selection, expiration date, and a simple next step for approval.',
        },
        {
          q: 'Is a quote different from an estimate?',
          a: 'Usually, yes. An estimate is often the rougher pricing document. A quote is more customer-ready, with a cleaner format, clearer scope, and stronger language around what is actually being sold.',
        },
        {
          q: 'Can a roofing quote include good-better-best options?',
          a: 'Yes. Roofing quotes are a great place to present option packages because the homeowner can compare systems without getting overwhelmed by a full contract-style document.',
        },
      ]}
      ctaTitle="Ready to send quotes that feel cleaner than the other guy's?"
      ctaBody="SnapQuote helps roofers go from job-site photos to a customer-ready quote in one fast workflow, then expand that quote into a full proposal when the sale needs it."
      secondaryCtaHref="/roof-quote-generator"
      secondaryCtaLabel="See quote generator"
    />
  );
}
