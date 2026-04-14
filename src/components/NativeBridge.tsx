'use client';
import { startTransition, useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isNativeAppClient } from '@/lib/subscription';
import {
  getNativeResumeTarget,
  isNativeAppRoute,
} from '@/lib/native-app-routing';

const LAST_NATIVE_APP_PATH_KEY = 'snapquote:last-native-app-path';

export default function NativeBridge() {
  const pathname = usePathname();
  const router = useRouter();
  const didInit = useRef(false);
  const refreshCurrentRoute = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isNativeAppClient()) return;

    persistLastNativeAppPath();
    void restoreNativeUserIntoApp();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isNativeAppClient() || didInit.current) return;

    didInit.current = true;

    let removeListeners: (() => void) | undefined;

    void initNativeFeatures({
      onResumeInApp: refreshCurrentRoute,
    }).then((cleanup) => {
      removeListeners = cleanup;
    });

    return () => {
      removeListeners?.();
    };
  }, [refreshCurrentRoute]);

  return null; // This component renders nothing
}

function persistLastNativeAppPath() {
  if (typeof window === 'undefined') return;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (!isNativeAppRoute(window.location.pathname)) return;

  window.localStorage.setItem(LAST_NATIVE_APP_PATH_KEY, currentPath);
}

async function restoreNativeUserIntoApp() {
  if (typeof window === 'undefined') return;

  const target = getNativeResumeTarget(
    window.location.pathname,
    window.localStorage.getItem(LAST_NATIVE_APP_PATH_KEY)
  );

  if (!target) return;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || target === `${window.location.pathname}${window.location.search}`) {
    return;
  }

  window.location.replace(target);
}

async function initNativeFeatures({
  onResumeInApp,
}: {
  onResumeInApp: () => void;
}): Promise<() => void> {
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
    const networkListener = await Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        // Show offline banner
        document.body.setAttribute('data-offline', 'true');
      } else {
        document.body.removeAttribute('data-offline');
      }
    });

    // App state (foreground/background)
    const { App } = await import('@capacitor/app');
    let lastBackgroundedAt: number | null = null;
    const appStateListener = await App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        lastBackgroundedAt = Date.now();
        return;
      }

      if (isActive) {
        persistLastNativeAppPath();

        // Use a soft refresh only after the app has actually been backgrounded
        // for a bit. This avoids full-page flicker every time the user briefly
        // app-switches, while still keeping server-rendered data reasonably fresh.
        if (isNativeAppRoute(window.location.pathname)) {
          if (lastBackgroundedAt && Date.now() - lastBackgroundedAt > 60_000) {
            onResumeInApp();
          }
          lastBackgroundedAt = null;
          return;
        }

        lastBackgroundedAt = null;
        void restoreNativeUserIntoApp();
      }
    });

    // Handle back button
    const backButtonListener = await App.addListener('backButton', () => {
      window.history.back();
    });

    return () => {
      void networkListener.remove();
      void appStateListener.remove();
      void backButtonListener.remove();
    };

  } catch (e) {
    console.log('Native features init:', e);
    return () => {};
  }
}
