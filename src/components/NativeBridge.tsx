'use client';
import { useEffect } from 'react';

export default function NativeBridge() {
  useEffect(() => {
    // Only run in Capacitor native context
    if (typeof window === 'undefined') return;
    const isNative = window.location.href.includes('native=1') ||
      (window as any).Capacitor?.isNativePlatform?.();
    if (!isNative) return;

    initNativeFeatures();
  }, []);

  return null; // This component renders nothing
}

async function initNativeFeatures() {
  try {
    // Push Notifications — disabled: aps-environment entitlement not configured.
    // Re-enable after adding push notification capability to the provisioning profile.
    // const { PushNotifications } = await import('@capacitor/push-notifications');
    // const permResult = await PushNotifications.requestPermissions();
    // if (permResult.receive === 'granted') {
    //   await PushNotifications.register();
    //   PushNotifications.addListener('registration', (token) => {
    //     fetch('/api/notifications/register-device', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ token: token.value, platform: 'ios' }),
    //     }).catch(() => {});
    //   });
    //   PushNotifications.addListener('pushNotificationReceived', (notification) => {
    //     console.log('Push received:', notification);
    //   });
    //   PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    //     const data = action.notification.data;
    //     if (data?.url) {
    //       window.location.href = data.url;
    //     }
    //   });
    // }

    // Network status monitoring
    const { Network } = await import('@capacitor/network');
    Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        // Show offline banner
        document.body.setAttribute('data-offline', 'true');
      } else {
        document.body.removeAttribute('data-offline');
      }
    });

    // App state (foreground/background)
    const { App } = await import('@capacitor/app');
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // Refresh data when app comes to foreground
        if (window.location.pathname === '/dashboard') {
          window.location.reload();
        }
      }
    });

    // Handle back button
    App.addListener('backButton', () => {
      window.history.back();
    });

  } catch (e) {
    console.log('Native features init:', e);
  }
}
