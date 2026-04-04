import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started | SnapQuote',
  description: 'Set up your SnapQuote account in a few quick steps.',
  robots: 'noindex, nofollow',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
