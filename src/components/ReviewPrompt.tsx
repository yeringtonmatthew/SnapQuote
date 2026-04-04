'use client';

import { useState } from 'react';

interface ReviewPromptProps {
  contractorId: string;
  quoteId: string;
  customerName: string;
}

export function ReviewPrompt({ contractorId, quoteId, customerName }: ReviewPromptProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractor_id: contractorId,
          quote_id: quoteId,
          customer_name: customerName,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white px-5 py-6 shadow-sm text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-gray-900">Thank you for your review!</p>
        <p className="mt-1 text-[13px] text-gray-500">Your feedback helps others find great contractors.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
        How was your experience?
      </p>
      <p className="text-[15px] font-semibold text-gray-900 mb-4">
        Leave a review
      </p>

      {/* Star selector */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= (hoveredStar || rating);
          return (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="touch-manipulation p-1 transition-transform active:scale-90"
            >
              <svg
                className={`h-9 w-9 transition-colors ${
                  active ? 'text-amber-400' : 'text-gray-200'
                }`}
                viewBox="0 0 24 24"
                fill={active ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={active ? 0 : 1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          );
        })}
      </div>

      {rating > 0 && (
        <p className="text-center text-[13px] text-gray-500 mb-4">
          {rating === 5
            ? 'Excellent!'
            : rating === 4
              ? 'Great!'
              : rating === 3
                ? 'Good'
                : rating === 2
                  ? 'Fair'
                  : 'Poor'}
        </p>
      )}

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell us about your experience (optional)"
        rows={3}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
      />

      {error && (
        <p className="mt-2 text-[13px] text-red-500">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className={`mt-3 w-full rounded-2xl py-3 text-[14px] font-semibold transition-all ${
          rating === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]'
        }`}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
