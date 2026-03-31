'use client';

import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

export default function FormField({ label, required, error, children, htmlFor }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className={error ? '[&>input]:border-red-400 [&>input]:focus:border-red-500 [&>input]:focus:ring-red-500/20 [&>select]:border-red-400 [&>textarea]:border-red-400' : ''}>
        {children}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-500 animate-shake">
          {error}
        </p>
      )}
    </div>
  );
}
