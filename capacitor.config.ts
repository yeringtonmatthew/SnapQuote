import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.snapquote.app',
  appName: 'SnapQuote',
  webDir: 'out',

  server: {
    // Load the hosted web app instead of local static files.
    // This lets the native shell use all server-side features
    // (API routes, server components, SSR) without a static export.
    url: 'https://snapquote.dev?native=1',
    cleartext: false,
    allowNavigation: [
      'snapquote.dev',
      '*.supabase.co',
      '*.stripe.com',
      'js.stripe.com',
      'accounts.google.com',
      'appleid.apple.com',
    ],
  },

  ios: {
    backgroundColor: '#ffffff',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scrollEnabled: true,
    allowsLinkPreview: false,
    scheme: 'SnapQuote',
    // Handles the iOS status bar and safe areas properly
    limitsNavigationsToAppBoundDomains: true,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false,
      splashImmersive: false,
    },
    Keyboard: {
      resize: 'body' as any,
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'LIGHT' as any,
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
