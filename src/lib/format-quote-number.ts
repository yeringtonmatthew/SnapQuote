/**
 * Customer-facing quote references should feel established, not like the very
 * first estimate a company has ever sent. We keep the stored quote number
 * simple, then present a higher public-facing reference.
 */
export const QUOTE_REFERENCE_OFFSET = 300;

export function getDisplayQuoteNumber(n: number | null | undefined): number | null {
  if (n == null) return null;
  return n + QUOTE_REFERENCE_OFFSET;
}

/**
 * Format a quote reference as "Q-301", "Q-412", "Q-1250", etc.
 * Zero-padded to at least 3 digits; grows if the number exceeds 999.
 */
export function formatQuoteNumber(n: number | null | undefined): string {
  const displayNumber = getDisplayQuoteNumber(n);
  if (displayNumber == null) return '';
  return `Q-${String(displayNumber).padStart(3, '0')}`;
}
