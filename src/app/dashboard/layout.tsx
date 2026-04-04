import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | SnapQuote',
  description: 'View your quotes, revenue, and business performance at a glance.',
  robots: 'noindex, nofollow',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
