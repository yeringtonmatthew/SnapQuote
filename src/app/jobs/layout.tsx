import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jobs | SnapQuote',
  description: 'Track and manage your active jobs and completed work.',
  robots: 'noindex, nofollow',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
