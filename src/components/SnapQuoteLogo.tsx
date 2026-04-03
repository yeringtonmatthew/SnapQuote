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
      {/* Bolt mark — blue rounded square with white lightning bolt */}
      <div
        className="shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          width: s.mark,
          height: s.mark,
          borderRadius: s.mark * 0.225,
          background: '#2E7BFF',
        }}
      >
        <svg
          width={s.mark * 0.48}
          height={s.mark * 0.8}
          viewBox="0 0 58 96"
          fill="none"
        >
          <polygon
            points="34,0 0,52 22,52 18,96 58,38 34,38 34,0"
            fill="white"
          />
        </svg>
      </div>
      {variant === 'full' && (
        <span className={`${s.text} font-bold tracking-tight text-gray-900 dark:text-white`}>
          Snap<span className="text-brand-600">Quote</span>
        </span>
      )}
    </span>
  );
}
