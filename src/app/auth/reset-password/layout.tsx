import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | SnapQuote',
  description: 'Reset your SnapQuote account password.',
  robots: 'noindex, nofollow',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
