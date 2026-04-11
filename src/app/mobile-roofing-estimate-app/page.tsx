import { Metadata } from 'next';
import { IntentLandingTemplate } from '@/components/IntentLandingTemplate';

export const metadata: Metadata = {
  title: 'Mobile Roofing Estimate App — Quote from Your iPhone | SnapQuote',
  description:
    'Mobile roofing estimate app for iOS. Snap photos of any roof and send a professional proposal in 60 seconds. $79/mo, 14-day free trial.',
  keywords: [
    'mobile roofing estimate app',
    'roof estimate app',
    'iphone roofing app',
    'ios roofing estimator',
    'mobile roofer app',
  ],
  openGraph: {
    title: 'Mobile Roofing Estimate App — SnapQuote',
    description: 'Quote roofs from your iPhone. Send proposals in 60 seconds.',
    url: 'https://snapquote.dev/mobile-roofing-estimate-app',
    type: 'website',
  },
  alternates: { canonical: 'https://snapquote.dev/mobile-roofing-estimate-app' },
};

export default function Page() {
  return (
    <IntentLandingTemplate
      eyebrow="Mobile Roofing App"
      urlPath="/mobile-roofing-estimate-app"
      headline="The Mobile Roofing Estimate App Built for the Field"
      subhead="SnapQuote is native iOS, optimized for how roofers actually work — on a roof, on a ladder, in a truck, in the rain. No clunky desktop software. No laptop-only workflows. Snap photos with your iPhone, send a branded proposal from the driveway, move on to the next job."
      benefits={[
        {
          title: 'Native iOS, Built for the Field',
          body: "SnapQuote is a real iOS app, not a wrapped web page. Works offline-friendly, handles iPhone cameras properly, and moves as fast as you do.",
        },
        {
          title: 'One-Handed Operation',
          body: 'Every screen is designed for one-handed use. Snap a photo, tap review, tap send. No pinching, zooming, or hunting for tiny buttons in the rain.',
        },
        {
          title: 'AI Photo Analysis',
          body: 'Take roof-walk photos like you normally do. The AI identifies the scope and drafts the quote for you. No manual line-item entry required.',
        },
        {
          title: 'Instant SMS Delivery',
          body: 'Send the proposal as a text link directly from the app. Homeowner gets it on their phone within seconds.',
        },
      ]}
      howItWorks={[
        'Download SnapQuote from the App Store and sign up in under 60 seconds.',
        'Walk the roof and snap photos — the AI handles scope detection from the pictures.',
        'Review the auto-generated quote and tweak anything you want on your phone.',
        'Tap send. The homeowner gets a mobile-optimized proposal link they can sign and pay from their phone.',
      ]}
      faqs={[
        {
          q: 'Does SnapQuote work on Android?',
          a: 'SnapQuote is currently iOS-first. We have a web app at snapquote.dev that works on any phone including Android, and a dedicated Android app is on the roadmap.',
        },
        {
          q: 'Do I need the iPhone app to use SnapQuote?',
          a: 'No. SnapQuote also works at snapquote.dev in any mobile browser. The iOS app is the fastest experience, but the web version covers everything.',
        },
        {
          q: 'How big are the photos I need to upload?',
          a: 'Your normal iPhone photos are fine. SnapQuote handles compression and upload automatically. No special camera or settings needed.',
        },
        {
          q: 'Does it work offline?',
          a: 'Partially. You can capture photos and draft quotes offline — they sync and send automatically once you get signal back.',
        },
      ]}
    />
  );
}
