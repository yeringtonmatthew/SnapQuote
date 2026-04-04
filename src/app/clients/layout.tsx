import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clients | SnapQuote',
  description: 'Manage your customer contacts and client information.',
  robots: 'noindex, nofollow',
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
