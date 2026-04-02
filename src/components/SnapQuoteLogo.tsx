'use client';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'mark' | 'full';
  className?: string;
}

const sizes = {
  xs: { mark: 24, text: 'text-[14px]' },
  sm: { mark: 32, text: 'text-[17px]' },
  md: { mark: 40, text: 'text-[20px]' },
  lg: { mark: 48, text: 'text-[24px]' },
};

export function SnapQuoteLogo({ size = 'sm', variant = 'full', className = '' }: LogoProps) {
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Mark — Abstract lightning/quote mark in a rounded square */}
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="48" height="48" rx="12" className="fill-brand-600" />
        {/* Lightning bolt — clean geometric style */}
        <path
          d="M27.5 10L17 26h7.5L22 38l13-18h-8.5L27.5 10z"
          fill="white"
          fillOpacity="0.95"
        />
        {/* Subtle highlight on top-left for depth */}
        <rect width="48" height="48" rx="12" fill="url(#logoSheen)" />
        <defs>
          <linearGradient id="logoSheen" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {variant === 'full' && (
        <span className={`${s.text} font-bold tracking-tight text-gray-900 dark:text-white`}>
          Snap<span className="text-brand-600">Quote</span>
        </span>
      )}
    </span>
  );
}
