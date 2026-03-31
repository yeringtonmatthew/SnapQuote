/**
 * Format a quote number as "Q-001", "Q-012", "Q-123", etc.
 * Zero-padded to at least 3 digits; grows if the number exceeds 999.
 */
export function formatQuoteNumber(n: number | null | undefined): string {
  if (n == null) return '';
  return `Q-${String(n).padStart(3, '0')}`;
}
