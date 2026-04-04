import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pipeline | SnapQuote',
  description: 'Manage your sales pipeline and track leads through every stage.',
  robots: 'noindex, nofollow',
};

export default function PipelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
