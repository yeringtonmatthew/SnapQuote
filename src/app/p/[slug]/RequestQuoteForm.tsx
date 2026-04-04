'use client';

import { useState, type FormEvent } from 'react';

interface RequestQuoteFormProps {
  slug: string;
  businessName: string;
}

export default function RequestQuoteForm({ slug, businessName }: RequestQuoteFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [jobAddress, setJobAddress] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/leads/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          job_address: jobAddress.trim() || undefined,
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white px-5 py-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <svg className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-[18px] font-bold text-gray-900">Request Sent!</h3>
        <p className="mt-2 text-[14px] text-gray-500 leading-relaxed">
          Thanks! {businessName} will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white px-5 py-6 shadow-sm">
      <h3 className="text-[16px] font-bold text-gray-900">Request a Quote</h3>
      <p className="mt-1 text-[13px] text-gray-400">
        Fill out the form below and {businessName} will get back to you.
      </p>

      <div className="mt-5 space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="rq-name" className="block text-[13px] font-medium text-gray-700">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="rq-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="rq-phone" className="block text-[13px] font-medium text-gray-700">
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            id="rq-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="rq-email" className="block text-[13px] font-medium text-gray-700">
            Email <span className="text-gray-300">(optional)</span>
          </label>
          <input
            id="rq-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Job Address */}
        <div>
          <label htmlFor="rq-address" className="block text-[13px] font-medium text-gray-700">
            Job Address <span className="text-gray-300">(optional)</span>
          </label>
          <input
            id="rq-address"
            type="text"
            value={jobAddress}
            onChange={(e) => setJobAddress(e.target.value)}
            placeholder="123 Main St, City, State"
            className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="rq-description" className="block text-[13px] font-medium text-gray-700">
            Description of Work Needed <span className="text-red-400">*</span>
          </label>
          <textarea
            id="rq-description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work you need done..."
            className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary mt-5 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </>
        ) : (
          'Send Request'
        )}
      </button>
    </form>
  );
}
