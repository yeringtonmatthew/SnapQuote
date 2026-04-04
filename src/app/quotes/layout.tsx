import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quotes | SnapQuote',
  description: 'Create, view, and manage your contractor quotes.',
  robots: 'noindex, nofollow',
};

export default function QuotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
