'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  mockup: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'ai-quotes',
    label: 'AI Quotes',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: 'AI-Powered Quote Generation',
    description:
      'Upload job site photos and let AI do the heavy lifting. It identifies damage, generates line items, writes inspection findings, and calculates pricing — all in under 60 seconds.',
    mockup: (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center">
            <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">AI Analysis Complete</span>
          <span className="ml-auto rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Done</span>
        </div>
        <div className="space-y-2.5">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">INSPECTION FINDING</p>
            <p className="text-sm text-gray-800">Hail damage detected on north-facing slope. ~30% of shingles show impact marks.</p>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-600">Tear-off &amp; disposal</span>
            <span className="font-semibold text-gray-900 tabular-nums">$2,400</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-600">Synthetic underlayment</span>
            <span className="font-semibold text-gray-900 tabular-nums">$1,800</span>
          </div>
          <div className="flex justify-between items-center py-2 text-sm">
            <span className="text-gray-600">Architectural shingles (30-yr)</span>
            <span className="font-semibold text-gray-900 tabular-nums">$4,200</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'proposals',
    label: 'Proposals',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Branded Good / Better / Best Proposals',
    description:
      'Send stunning proposals with your logo, colors, and tiered pricing options. Customers choose from Good, Better, and Best packages — increasing your average ticket by up to 40%.',
    mockup: (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <p className="text-xs font-medium text-gray-400 mb-3">CHOOSE YOUR PACKAGE</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { tier: 'Good', price: '$6,200', items: '3-tab shingles, standard felt', opacity: 'opacity-80' },
            { tier: 'Better', price: '$8,400', items: 'Architectural, synthetic underlay', opacity: '' },
            { tier: 'Best', price: '$11,800', items: 'Premium, ice & water shield', opacity: 'opacity-80' },
          ].map((pkg) => (
            <div
              key={pkg.tier}
              className={`rounded-xl p-3 text-center ${
                pkg.tier === 'Better'
                  ? 'bg-brand-600 text-white ring-2 ring-brand-600 scale-[1.03]'
                  : 'bg-gray-50 text-gray-900'
              } ${pkg.opacity}`}
            >
              <p className={`text-[10px] font-semibold uppercase ${pkg.tier === 'Better' ? 'text-brand-200' : 'text-gray-400'}`}>
                {pkg.tier}
              </p>
              <p className="text-lg font-bold mt-1">{pkg.price}</p>
              <p className={`text-[10px] mt-1 ${pkg.tier === 'Better' ? 'text-brand-100' : 'text-gray-500'}`}>
                {pkg.items}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
            Most customers choose Better
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Get Paid Online via Stripe',
    description:
      'Collect deposits or full payment right from the proposal. Customers enter their card, you get paid — no chasing checks, no awkward money conversations.',
    mockup: (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-900">Payment Received</span>
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">Paid</span>
        </div>
        <div className="rounded-xl bg-green-50 p-4 text-center mb-4">
          <p className="text-3xl font-bold text-green-700 tabular-nums">$4,200.00</p>
          <p className="text-xs text-green-600 mt-1">50% deposit collected</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Customer</span>
            <span className="font-medium text-gray-900">John Mitchell</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Method</span>
            <span className="font-medium text-gray-900">Visa ****4242</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">Today, 2:34 PM</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'CRM Pipeline Tracking',
    description:
      'Track every lead from first contact to job completion. See your pipeline value at a glance, follow up at the right time, and never let a hot lead go cold.',
    mockup: (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-3 mb-4">
          {['New', 'Quoted', 'Signed', 'Complete'].map((stage, i) => (
            <div key={stage} className="flex-1 text-center">
              <div className={`h-2 rounded-full mb-1.5 ${i <= 2 ? 'bg-brand-500' : 'bg-gray-200'}`} />
              <p className="text-[10px] font-medium text-gray-500">{stage}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { name: 'Mitchell Roof', stage: 'Signed', amount: '$8,400', color: 'bg-green-500' },
            { name: 'Garcia Gutters', stage: 'Quoted', amount: '$3,200', color: 'bg-brand-500' },
            { name: 'Thompson Siding', stage: 'New', amount: '$12,600', color: 'bg-gray-400' },
          ].map((job) => (
            <div key={job.name} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5">
              <div className={`h-2 w-2 rounded-full ${job.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{job.name}</p>
                <p className="text-xs text-gray-500">{job.stage}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900 tabular-nums">{job.amount}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Scheduling & "On My Way" SMS',
    description:
      'Schedule jobs on your calendar, assign crew members, and send automatic "On My Way" text messages to customers. Professional touches that build trust.',
    mockup: (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-900">Today&apos;s Schedule</span>
          <span className="text-xs text-gray-500">Apr 3</span>
        </div>
        <div className="space-y-2">
          {[
            { time: '8:00 AM', job: 'Mitchell Roof Inspection', status: 'On My Way sent', statusColor: 'text-brand-600' },
            { time: '11:00 AM', job: 'Garcia Gutter Estimate', status: 'Confirmed', statusColor: 'text-green-600' },
            { time: '2:30 PM', job: 'Thompson Siding Quote', status: 'Pending', statusColor: 'text-yellow-600' },
          ].map((item) => (
            <div key={item.time} className="flex gap-3 rounded-lg bg-gray-50 p-3">
              <span className="text-xs font-medium text-gray-500 w-16 shrink-0 pt-0.5">{item.time}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.job}</p>
                <p className={`text-xs font-medium ${item.statusColor}`}>{item.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-brand-50 p-2.5">
          <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span className="text-xs font-medium text-brand-700">&quot;On My Way!&quot; SMS sent to Mitchell</span>
        </div>
      </div>
    ),
  },
];

export default function FeatureTabs() {
  const [activeTab, setActiveTab] = useState('ai-quotes');
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div key={active.id} className="animate-fadeIn">
          <h3 className="text-2xl font-bold text-gray-900">{active.title}</h3>
          <p className="mt-3 text-base leading-relaxed text-gray-500">{active.description}</p>
        </div>
        <div key={`mockup-${active.id}`} className="animate-fadeIn">
          {active.mockup}
        </div>
      </div>
    </div>
  );
}
