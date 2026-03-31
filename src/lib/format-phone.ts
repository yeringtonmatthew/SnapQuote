// Formats a US phone number as (XXX) XXX-XXXX while typing
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

// Strips formatting, returns just digits
export function stripPhone(value: string): string {
  return value.replace(/\D/g, '');
}
