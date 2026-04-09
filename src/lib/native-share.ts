export async function nativeShare(options: { title: string; text: string; url: string }) {
  try {
    const isNative = (window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      const { Share } = await import('@capacitor/share');
      await Share.share(options);
      return true;
    }
    // Fall back to Web Share API
    if (navigator.share) {
      await navigator.share(options);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
