import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In | SnapQuote',
  description: 'Sign in to your SnapQuote account to manage quotes, invoices, and customers.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
