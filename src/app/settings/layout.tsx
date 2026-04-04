import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | SnapQuote',
  description: 'Manage your SnapQuote account settings, branding, and integrations.',
  robots: 'noindex, nofollow',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
