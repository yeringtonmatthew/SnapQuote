import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | SnapQuote',
  description: 'Terms and conditions for using SnapQuote, the AI-powered quoting tool for contractors.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-white px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
        <p className="text-sm text-gray-500">Last updated: March 29, 2026</p>

        <div className="space-y-4 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Acceptance of Terms</h2>
            <p>
              By using SnapQuote, you agree to these terms and conditions. SnapQuote is a
              quoting and invoicing tool designed for independent contractors and trade
              professionals.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Service Description</h2>
            <p>
              SnapQuote enables contractors to create professional quotes, send them to customers
              via SMS, collect electronic signatures, and process deposit payments. The service
              includes AI-powered quote generation from photos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">SMS Messaging Terms</h2>
            <p className="mb-2">
              <strong>Program Name:</strong> SnapQuote Quote Notifications
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>SnapQuote sends transactional SMS messages to customers on behalf of contractors</li>
              <li>Messages contain a link to view and approve a quote that was requested by the customer</li>
              <li>No marketing or promotional messages are sent</li>
              <li>Message frequency: typically 1–3 messages per quote (delivery, reminders, and payment confirmation)</li>
              <li>Message and data rates may apply</li>
              <li>Text <strong>STOP</strong> to opt out of messages at any time</li>
              <li>Text <strong>HELP</strong> for assistance</li>
              <li>Contact: support@snapquote.app</li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              By providing your phone number to a contractor using SnapQuote, you consent to receive transactional SMS messages related to your quote. Consent is not a condition of purchase. Carriers are not liable for delayed or undelivered messages.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">User Responsibilities</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>You are responsible for the accuracy of quotes you create and send</li>
              <li>You must have consent from customers before sending them SMS messages</li>
              <li>You must not use the service for illegal or fraudulent purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Payments</h2>
            <p>
              Payment processing is handled by Stripe. SnapQuote does not store credit card
              information. Contractors are responsible for configuring their Stripe Connect
              account and any associated fees.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Limitation of Liability</h2>
            <p>
              SnapQuote is provided as-is. We are not liable for any damages arising from
              the use of the service, including but not limited to lost revenue, data loss,
              or business interruption.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-gray-900">Contact</h2>
            <p>
              For questions about these terms, contact us at support@snapquote.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
