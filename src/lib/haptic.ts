export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const ms = style === 'light' ? 10 : style === 'medium' ? 25 : 50;
    navigator.vibrate(ms);
  }
}
