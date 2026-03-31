'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100dvh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f2f2f7',
          padding: '1.5rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              margin: '0 auto 1rem',
              display: 'flex',
              height: '3.5rem',
              width: '3.5rem',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
            }}>
              <svg style={{ height: '1.75rem', width: '1.75rem', color: '#DC2626' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: '0.5rem', fontSize: '14px', color: '#6B7280', maxWidth: '24rem', lineHeight: 1.6 }}>
              We hit an unexpected error. This has been reported and we&apos;re looking into it.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={reset}
                style={{
                  borderRadius: '1rem',
                  backgroundColor: '#6366F1',
                  padding: '0.75rem 2rem',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <a
                href="/dashboard"
                style={{ fontSize: '14px', fontWeight: 500, color: '#9CA3AF', textDecoration: 'none' }}
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
