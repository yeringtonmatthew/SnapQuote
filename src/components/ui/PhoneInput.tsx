'use client';

import { formatPhoneNumber, stripPhone } from '@/lib/format-phone';

interface PhoneInputProps {
  value: string;
  onChange: (digits: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  autoFocus?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  className = 'input-field',
  placeholder = '(555) 123-4567',
  id,
  autoFocus,
}: PhoneInputProps) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="numeric"
      autoFocus={autoFocus}
      value={formatPhoneNumber(value)}
      onChange={(e) => {
        const digits = stripPhone(e.target.value);
        onChange(digits);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}
