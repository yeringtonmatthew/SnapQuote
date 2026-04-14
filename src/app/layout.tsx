import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import dynamic from 'next/dynamic';
import RegisterSW from '@/components/RegisterSW';
import OfflineBanner from '@/components/OfflineBanner';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import ScrollToTop from '@/components/ScrollToTop';

const NativeBridge = dynamic(() => import('@/components/NativeBridge'), { ssr: false });
import './globals.css';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SnapQuote',
  url: 'https://snapquote.dev',
  logo: 'https://snapquote.dev/icon-512.png',
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SnapQuote',
  url: 'https://snapquote.dev',
  description:
    'AI roofing proposal software for contractors. Snap a photo, build the proposal, and get the signature and deposit faster.',
};

export const metadata: Metadata = {
  title: 'SnapQuote — AI Roofing Proposal Software for Contractors',
  description:
    'Snap a roof photo and let AI build a polished proposal with scope, signature, and deposit built in. Roofing-first quoting software for contractors.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://snapquote.dev'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'SnapQuote — AI Roofing Proposal Software for Contractors',
    description:
      'Snap a roof photo and let AI build a polished proposal with scope, signature, and deposit built in. Roofing-first quoting software for contractors.',
    type: 'website',
    url: 'https://snapquote.dev',
    siteName: 'SnapQuote',
    images: [{ url: 'https://snapquote.dev/api/og?title=SnapQuote&subtitle=AI+Roofing+Proposal+Software', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SnapQuote — AI Roofing Proposal Software for Contractors',
    description:
      'Snap a roof photo and let AI build a polished proposal with scope, signature, and deposit built in. Roofing-first quoting software for contractors.',
    images: ['https://snapquote.dev/api/og?title=SnapQuote&subtitle=AI+Roofing+Proposal+Software'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/icon-152.png', sizes: '152x152' },
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
        <meta name="google-site-verification" content="rBkPmUVQTkBYWNVh7wRQmPIzQ45PPTd7icDW8AFwqBI" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
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
      <body className="bg-[#f2f2f7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors overscroll-none">
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
        <NativeBridge />
        <KeyboardShortcuts />
        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
