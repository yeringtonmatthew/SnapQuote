import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | SnapQuote',
  description: 'Create a free SnapQuote account. AI-powered quoting for contractors — send professional quotes in 60 seconds.',
  robots: 'noindex, nofollow',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
