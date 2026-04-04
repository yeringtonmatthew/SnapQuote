import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schedule | SnapQuote',
  description: 'View and manage your job schedule and appointments.',
  robots: 'noindex, nofollow',
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
