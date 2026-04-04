'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'How much does SnapQuote cost?',
    answer:
      '$79/month gets you everything — unlimited quotes, AI generation, automated follow-ups, pipeline, payments, the works. Every account starts with a 14-day free trial, no credit card required. One closed job pays for years of SnapQuote.',
  },
  {
    question: 'How does the AI generate quotes?',
    answer:
      'Upload photos of the job site. Our AI analyzes each image to identify damage, materials, and scope of work. It then generates detailed line items with pricing, writes professional inspection findings, and assembles everything into a polished proposal — all in about 60 seconds.',
  },
  {
    question: 'Can my customers pay online?',
    answer:
      'Absolutely. Every proposal includes a secure payment link powered by Stripe. Customers can pay a deposit or the full amount right from their phone. You get notified instantly and funds hit your account in 2 business days.',
  },
  {
    question: 'Does it work offline?',
    answer:
      'Yes. You can capture photos and start building quotes even without cell service on the job site. Everything syncs automatically when you get back online.',
  },
  {
    question: 'Can I customize my proposals with my branding?',
    answer:
      'On the Pro plan, you can add your logo, company colors, license numbers, and custom terms. Your proposals look like they came from a Fortune 500 company — but with your brand front and center.',
  },
  {
    question: 'How is this different from Jobber or ServiceTitan?',
    answer:
      'Those are full-blown field service management platforms that cost $100-300+/month and take weeks to set up. SnapQuote does one thing incredibly well: help you create, send, and close quotes fast. You can be up and running in 2 minutes and use it alongside whatever FSM you already have.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-gray-200">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold text-gray-900 pr-4">{faq.question}</span>
              <svg
                className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isOpen ? '300px' : '0px',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p className="pb-5 text-sm leading-relaxed text-gray-500">{faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
