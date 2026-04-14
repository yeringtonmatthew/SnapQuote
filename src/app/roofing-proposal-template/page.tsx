import type { Metadata } from 'next';
import { TemplateResourcePage } from '@/components/TemplateResourcePage';

export const metadata: Metadata = {
  title: 'Free Roofing Proposal Template + Example | SnapQuote',
  description:
    'Use this roofing proposal template to structure scope, pricing, warranty, signature, and deposit terms. See a real example, then let SnapQuote generate it from photos.',
  keywords: [
    'roofing proposal template',
    'roof proposal template',
    'roofing proposal example',
    'residential roofing proposal template',
    'roofing proposal sample',
  ],
  alternates: {
    canonical: 'https://snapquote.dev/roofing-proposal-template',
  },
  openGraph: {
    title: 'Free Roofing Proposal Template + Example | SnapQuote',
    description:
      'See what a customer-ready roofing proposal should include, then let SnapQuote generate it from roof photos.',
    url: 'https://snapquote.dev/roofing-proposal-template',
    type: 'website',
    images: [
      {
        url: 'https://snapquote.dev/api/og?title=Roofing+Proposal+Template&subtitle=Free+Example+from+SnapQuote',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RoofingProposalTemplatePage() {
  return (
    <TemplateResourcePage
      eyebrow="Free Roofing Proposal Template"
      title="Use a better roofing proposal template, then stop building it by hand."
      description="This page shows what a customer-ready roofing proposal should include: scope, pricing, warranty, signature, and deposit terms. Use it as your template, or let SnapQuote generate the same structure from job-site photos in minutes."
      canonicalPath="/roofing-proposal-template"
      webPageName="Roofing Proposal Template"
      webPageDescription="Use this roofing proposal template to structure scope, pricing, warranty, signature, and deposit terms."
      previewType="proposal"
      previewEyebrow="Template example"
      previewCaption="This is the level of trust and clarity homeowners respond to."
      previewBadge="Roofing quote"
      chips={['Built for residential roofers', 'Proposal + signature + deposit', '$79/month after trial']}
      templateSections={[
        {
          title: 'Customer and property details',
          body: 'Every roofing proposal should clearly identify the homeowner, property address, contact info, and inspection date so there is no confusion about the job.',
        },
        {
          title: 'Scope of work',
          body: 'Spell out tear-off, underlayment, shingles, flashing, ventilation, cleanup, and any decking or change-order assumptions in plain language.',
        },
        {
          title: 'Pricing, terms, and options',
          body: 'Present the total clearly, show good-better-best options when relevant, and keep payment schedule, warranty, and signature terms easy to scan.',
        },
      ]}
      narrativeTitle="What makes a roofing proposal actually win jobs?"
      narrativeParagraphs={[
        'Most roofing estimates lose the sale because they look rushed. A winning proposal explains the problem, shows the scope clearly, makes pricing easy to trust, and gives the homeowner a clean next step.',
        'That is why roofers need more than a blank Word document or a handwritten estimate. They need a proposal structure that feels premium and a workflow fast enough to send while the job is still fresh.',
        'If you want the exact sections, use this page as the model. If you want the whole thing generated from photos, SnapQuote turns that structure into a repeatable sales system.',
      ]}
      relatedLinks={[
        {
          href: '/roofing-proposal-software',
          title: 'Roofing proposal software',
          body: 'See the AI product page built around this exact proposal workflow.',
        },
        {
          href: '/roofing-estimate-template',
          title: 'Roofing estimate template',
          body: 'Use the pricing-first version when the homeowner wants a fast number first.',
        },
        {
          href: '/roofing-quote-template',
          title: 'Roofing quote template',
          body: 'See the shorter, customer-facing quote format that sits between estimate and proposal.',
        },
        {
          href: '/roof-inspection-report-template',
          title: 'Roof inspection report template',
          body: 'Document the condition first so the final proposal feels earned and easier to trust.',
        },
      ]}
      faqs={[
        {
          q: 'What should a roofing proposal template include?',
          a: 'A strong roofing proposal template should include customer details, property address, scope of work, product specs, pricing, warranty terms, signature, and deposit instructions.',
        },
        {
          q: 'Is a roofing proposal different from a roofing estimate?',
          a: 'Yes. An estimate is usually just pricing. A proposal is the sales document that explains the job, builds trust, and helps the homeowner say yes.',
        },
        {
          q: 'Can I use this template for residential roofing jobs?',
          a: 'Yes. This structure is especially useful for residential reroofs, storm damage work, and insurance-funded projects where clear scope and photos matter.',
        },
      ]}
      ctaTitle="Ready to stop writing proposals manually?"
      ctaBody="SnapQuote turns job-site photos into a polished roofing proposal with findings, scope, signature, and deposit flow built in."
    />
  );
}
