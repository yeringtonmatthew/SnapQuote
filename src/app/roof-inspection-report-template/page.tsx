import type { Metadata } from 'next';
import { TemplateResourcePage } from '@/components/TemplateResourcePage';

export const metadata: Metadata = {
  title: 'Free Roof Inspection Report Template + Example | SnapQuote',
  description:
    'Use this roof inspection report template to document condition, visible damage, findings, and recommended work. See the structure roofers use, then generate it from photos with SnapQuote.',
  keywords: [
    'roof inspection report template',
    'roofing inspection report template',
    'roof inspection template',
    'roof damage report template',
    'roof condition report',
  ],
  alternates: {
    canonical: 'https://snapquote.dev/roof-inspection-report-template',
  },
  openGraph: {
    title: 'Free Roof Inspection Report Template + Example | SnapQuote',
    description:
      'See how roofers document visible damage, findings, and recommended work in a clean inspection report format.',
    url: 'https://snapquote.dev/roof-inspection-report-template',
    type: 'website',
    images: [
      {
        url: 'https://snapquote.dev/api/og?title=Roof+Inspection+Report+Template&subtitle=Free+Example+from+SnapQuote',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RoofInspectionReportTemplatePage() {
  return (
    <TemplateResourcePage
      eyebrow="Free Roof Inspection Report Template"
      title="Use a roof inspection report template that makes the quote easier to trust."
      description="This roof inspection report template helps you document what you found on the property: visible damage, wear, leak risks, photo evidence, and recommended repairs or replacement. It is the inspection side of the job that makes the final quote feel earned."
      canonicalPath="/roof-inspection-report-template"
      webPageName="Roof Inspection Report Template"
      webPageDescription="Use this roof inspection report template to document condition, visible damage, findings, and recommended work."
      previewType="inspection"
      previewEyebrow="Inspection example"
      previewCaption="Show the condition clearly first, then the price conversation gets much easier."
      previewBadge="Field-ready"
      chips={['Photo-backed findings', 'Storm + retail work', 'Inspection plus quote flow']}
      templateSections={[
        {
          title: 'Property condition and inspection context',
          body: 'Start with the address, inspection date, roof type, access conditions, and any notes about storm activity, leak complaints, or age of the current system.',
        },
        {
          title: 'Findings with severity and photo notes',
          body: 'List the visible issues clearly: missing shingles, lifted tabs, flashing wear, granule loss, punctures, ponding, or leak-prone transitions, along with photo references.',
        },
        {
          title: 'Recommended work and follow-up',
          body: 'Close with the practical next step: repair, replacement, further investigation, or insurance follow-up. This is what turns the report into a sales tool instead of a dead-end document.',
        },
      ]}
      narrativeTitle="Why inspection reports help roofing quotes close"
      narrativeParagraphs={[
        'Homeowners say yes faster when they understand the problem before they are asked to trust the price. A good inspection report does that work for you. It makes the roof condition visual, specific, and harder to brush off.',
        'This is especially useful for storm damage, insurance-funded work, repairs, and any replacement where the customer needs to see what you saw. The report becomes the bridge between the inspection and the quote.',
        'SnapQuote is built around that flow: capture photos on site, generate findings, then roll those findings straight into the proposal or quote so nothing gets lost between steps.',
      ]}
      relatedLinks={[
        {
          href: '/roofing-proposal-template',
          title: 'Roofing proposal template',
          body: 'Use the inspection report to support the final proposal and make the scope easier to trust.',
        },
        {
          href: '/roofing-quote-template',
          title: 'Roofing quote template',
          body: 'Turn the inspection findings into a shorter customer-facing quote when you need a faster sales doc.',
        },
        {
          href: '/blog/hail-damage-roof-insurance-claim-guide',
          title: 'Hail damage insurance claim guide',
          body: 'Use the report structure alongside the claim workflow for storm-related jobs.',
        },
        {
          href: '/blog/how-to-file-a-roofing-insurance-claim',
          title: 'Roof insurance claim guide',
          body: 'Read the homeowner-facing explanation of how the inspection and claim process fit together.',
        },
      ]}
      faqs={[
        {
          q: 'What should a roof inspection report template include?',
          a: 'A roof inspection report template should include the property information, inspection date, roof type, visible findings, severity, photo notes, and a clear recommendation for repair, replacement, or further review.',
        },
        {
          q: 'Can I use an inspection report for insurance roofing jobs?',
          a: 'Yes. Inspection reports are especially useful on storm and insurance jobs because they document visible condition issues before the estimate or proposal is sent.',
        },
        {
          q: 'Does an inspection report replace a roofing proposal?',
          a: 'No. The inspection report explains the condition. The proposal or quote explains the work and the price. The strongest sales flow uses both together.',
        },
      ]}
      ctaTitle="Want the inspection report and the quote in the same flow?"
      ctaBody="SnapQuote turns the job-site photos into inspection findings first, then carries that proof straight into the proposal so you do not have to duplicate the work."
      secondaryCtaHref="/roofing-proposal-software"
      secondaryCtaLabel="See proposal software"
    />
  );
}
