import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SnapQuote',
  description: 'How SnapQuote collects, uses, and protects your data. Read our privacy policy.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-white px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: March 29, 2026</p>

        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Overview</h2>
            <p>
              SnapQuote is a quoting tool for independent contractors. We collect only the
              information necessary to create and deliver quotes to your customers.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Information We Collect</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Account information (name, email, phone number, business name)</li>
              <li>Quote data (customer names, phone numbers, line items, photos, signatures)</li>
              <li>Payment information is processed securely by Stripe and never stored on our servers</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">How We Use Your Information</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>To create and deliver quotes to your customers</li>
              <li>To send SMS notifications containing quote links when requested by the contractor</li>
              <li>To process deposit payments through Stripe</li>
              <li>To generate AI-powered quote descriptions from uploaded photos</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">SMS Messaging</h2>
            <p>
              We send transactional SMS messages to customers only when a contractor explicitly
              requests to send a quote. Customers typically receive 1–3 messages per quote
              (delivery, reminders, and payment confirmation). No marketing messages are sent.
              Message and data rates may apply. Text <strong>STOP</strong> to opt out at any time.
              Text <strong>HELP</strong> for help. Consent to receive messages is not a condition
              of purchase. For questions, contact support@snapquote.app.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Data Sharing</h2>
            <p>
              We do not sell or share your personal information with third parties for marketing
              purposes. We use the following service providers to operate SnapQuote:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Supabase (database and authentication)</li>
              <li>Stripe (payment processing)</li>
              <li>Twilio (SMS delivery)</li>
              <li>Anthropic (AI quote generation)</li>
              <li>Vercel (hosting)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Data Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS),
              secure authentication, and row-level security policies to protect your data.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Contact</h2>
            <p>
              For questions about this privacy policy, contact us at support@snapquote.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
