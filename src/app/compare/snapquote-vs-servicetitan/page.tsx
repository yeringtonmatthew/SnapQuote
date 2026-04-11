import { Metadata } from 'next';
import { ComparisonTemplate } from '@/components/ComparisonTemplate';

export const metadata: Metadata = {
  title: 'SnapQuote vs ServiceTitan — Best ServiceTitan Alternative for Small Roofers',
  description:
    'ServiceTitan is built for enterprise trades. SnapQuote is built for small roofers who need fast AI quoting at $79/mo, not a $400+/mo enterprise platform with weeks of onboarding.',
  keywords: ['ServiceTitan alternative', 'SnapQuote vs ServiceTitan', 'small roofing software', 'cheaper than ServiceTitan'],
  openGraph: {
    title: 'SnapQuote vs ServiceTitan — The Small Roofer Alternative',
    description: 'ServiceTitan is enterprise. You\'re a small roofer. Meet the $79/mo alternative.',
    url: 'https://snapquote.dev/compare/snapquote-vs-servicetitan',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/compare/snapquote-vs-servicetitan' },
};

export default function Page() {
  return (
    <ComparisonTemplate
      competitorName="ServiceTitan"
      competitorSlug="servicetitan"
      urlPath="/compare/snapquote-vs-servicetitan"
      headline="SnapQuote vs ServiceTitan"
      intro="ServiceTitan is the Ferrari of field service software — powerful, polished, and priced for multi-crew operations pulling millions in annual revenue. If you're a small roofer running 1-5 trucks, it's overkill. SnapQuote does the one thing you actually need — fast, AI-powered roof quotes from your phone — without the enterprise price tag or the two-week onboarding."
      features={[
        { feature: 'Best For', snapquote: 'Small roofers (1-5 trucks)', competitor: 'Mid-market to enterprise trades' },
        { feature: 'Starting Price', snapquote: '$79/mo flat', competitor: 'Custom quote, typically $300-400+/mo per user' },
        { feature: 'Contract Length', snapquote: 'Month-to-month', competitor: 'Annual contract typical' },
        { feature: 'Onboarding Time', snapquote: '5 minutes', competitor: '2-6 weeks of setup' },
        { feature: 'Quote Generation', snapquote: 'AI from photos in 60 seconds', competitor: 'Manual line-item entry' },
        { feature: 'Primary Focus', snapquote: 'Sales and quoting', competitor: 'Dispatch, scheduling, CRM, reporting' },
        { feature: 'Mobile Experience', snapquote: 'Native iOS, built for the field', competitor: 'Mobile app available' },
        { feature: 'Setup Required', snapquote: 'None — snap a photo', competitor: 'Dedicated implementation specialist' },
        { feature: 'Learning Curve', snapquote: 'Minutes', competitor: 'Weeks of training' },
        { feature: 'Annual Cost (solo roofer)', snapquote: '~$948/year', competitor: '~$4,800-6,000+/year' },
      ]}
      whenSnapQuoteWins={[
        {
          heading: "You're Not Running 20 Trucks",
          body: "ServiceTitan is priced and scoped for companies with 10+ techs, multi-location dispatching, and full CSR teams. If you're a one-to-five-truck roofer, you're paying for features you'll never use. SnapQuote starts at $79/mo flat — you don't need a sales call, a demo, or a custom quote to try it.",
        },
        {
          heading: "You Need to Close Jobs, Not Manage Dispatchers",
          body: "ServiceTitan's killer feature is its dispatch board. Great if you have a full-time dispatcher. Useless if you're the roofer, the dispatcher, and the estimator all at once. SnapQuote kills the single biggest pain of a small roofer — turning a roof walk into a professional proposal before the homeowner calls the next guy.",
        },
        {
          heading: "You Can't Wait Two Weeks to Send a Quote",
          body: "ServiceTitan requires a multi-week implementation with a specialist, price book setup, team training, and integrations. SnapQuote works the minute you download the app. Snap a photo, review the AI-generated scope, send. That's the onboarding.",
        },
        {
          heading: "You Want Transparent Pricing",
          body: "ServiceTitan won't show you pricing without a sales call. SnapQuote is $79/mo, clearly listed, with a 14-day free trial you start yourself. No demo. No pitch. No negotiation. If you close one extra job in a month, SnapQuote paid for the entire year.",
        },
      ]}
      bottomLine="ServiceTitan is the right call if you're running a 20+ truck operation that needs enterprise dispatching, multi-location reporting, and a dedicated CSR team. If you're a small roofer who just needs to send better proposals faster, SnapQuote solves that specific problem at a tenth of the price with zero setup time. Use ServiceTitan when you scale. Use SnapQuote to get there."
    />
  );
}
