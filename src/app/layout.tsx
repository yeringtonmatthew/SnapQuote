import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import RegisterSW from '@/components/RegisterSW';
import OfflineBanner from '@/components/OfflineBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import ScrollToTop from '@/components/ScrollToTop';
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'SnapQuote — AI-Powered Quotes for Contractors',
  description:
    'Create professional quotes in seconds. Snap a photo, let AI generate line items, and send it to your customer via SMS or email.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://snapquote.dev'),
  alternates: {
    canonical: '/',
  },
  robots: 'index, follow',
  openGraph: {
    title: 'SnapQuote — AI-Powered Quotes for Contractors',
    description:
      'Create professional quotes in seconds. Snap a photo, let AI generate line items, and send it to your customer via SMS or email.',
    type: 'website',
    url: 'https://snapquote.dev',
    images: [{ url: 'https://snapquote.dev/api/og?title=SnapQuote&subtitle=AI-Powered+Quotes+for+Contractors', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SnapQuote — AI-Powered Quotes for Contractors',
    description:
      'Create professional quotes in seconds. Snap a photo, let AI generate line items, and send it to your customer via SMS or email.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SnapQuote',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2E7BFF',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <head>
        {/* Apple splash screens for common iOS devices */}
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        {/* iPad */}
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        <script dangerouslySetInnerHTML={{ __html: `
          try { document.documentElement.classList.remove('dark'); } catch {}
        `}} />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <RegisterSW />
        <OfflineBanner />
        <ThemeProvider>
          <ToastProvider>
            <div id="main-content" className="min-h-dvh">{children}</div>
          </ToastProvider>
        </ThemeProvider>
        <KeyboardShortcuts />
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
