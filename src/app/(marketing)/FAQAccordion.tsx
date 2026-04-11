'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Why is SnapQuote so much cheaper than Jobber, ServiceTitan, and Roofr?',
    answer:
      "Because we built it from scratch on modern tech (AI, iPhone-first, cloud) instead of bolting features onto legacy software. We don't have a 300-person sales team or a $50M marketing budget to pay for. That saving gets passed to you. At $79/mo flat, you get every feature the $200-400/mo competitors charge extra for — unlimited quotes, AI, payments, CRM, scheduling, the works.",
  },
  {
    question: 'Is it really built by a contractor?',
    answer:
      "Yes. SnapQuote was built by Matt Yerington, who spent years running a contracting business. He got tired of losing jobs because his quotes took too long — and tired of $400/mo software that required a consultant to set up. Every feature in SnapQuote exists because he wished he had it on a tailgate, in the rain, at 6pm with a customer waiting.",
  },
  {
    question: 'How does the AI generate quotes from photos?',
    answer:
      "Walk the job site and snap photos of the roof, the damage, or the scope of work. Our AI analyzes each image to identify materials, square footage, damage types, and line items. It writes detailed inspection findings and generates a Good/Better/Best proposal — all in about 60 seconds. You can edit anything before you send it.",
  },
  {
    question: 'Will I lose data if I switch from Jobber / ServiceTitan / JobNimbus?',
    answer:
      "No. We'll help you import your existing customer list, active jobs, and past quotes in a couple of minutes. Most contractors are fully migrated inside their first 14-day free trial — and then keep both running in parallel for a month to make sure nothing slips.",
  },
  {
    question: 'Can my customers pay online?',
    answer:
      "Yes. Every proposal includes a secure payment link powered by Stripe. Customers can pay a deposit or the full amount right from their phone. You get notified instantly and funds hit your account in about 2 business days.",
  },
  {
    question: 'Does it work offline on a job site?',
    answer:
      "Yes. You can capture photos and start building quotes even without cell service on the roof. Everything syncs automatically the second you're back online.",
  },
  {
    question: 'Can I customize proposals with my branding?',
    answer:
      "Add your logo, company colors, license numbers, insurance info, and custom terms. Your proposals look like they came from a Fortune 500 company — but with your brand front and center. No 'Powered by SnapQuote' watermark on your work.",
  },
  {
    question: "What if I don't roof — I'm HVAC, plumbing, electrical, painting?",
    answer:
      "SnapQuote works for every trade that quotes jobs. Roofing is our largest vertical, but HVAC techs, plumbers, electricians, painters, landscapers, and general contractors all use it daily. The AI adapts line items to your trade, and you can build your own pricing library in about 10 minutes.",
  },
  {
    question: "What's the catch with the 14-day free trial?",
    answer:
      "No catch. No credit card. No auto-charge. You get the full app — unlimited quotes, AI, payments, everything — for 14 days. If you don't love it, you walk away and owe nothing. If you do love it, one closed job pays for your entire first year.",
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
                maxHeight: isOpen ? '600px' : '0px',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p className="pb-5 text-[15px] leading-relaxed text-gray-600">{faq.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
