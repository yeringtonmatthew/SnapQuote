'use client';

interface Props {
  isConnected: boolean;
}

export function StripeConnectButton({ isConnected }: Props) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 shrink-0">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-green-900">Stripe Connected</p>
          <p className="text-[12px] text-green-600">Customers can pay deposits online</p>
        </div>
        <a
          href="/api/stripe/connect"
          className="text-[12px] font-medium text-green-700 underline underline-offset-2"
        >
          Reconnect
        </a>
      </div>
    );
  }

  return (
    <a
      href="/api/stripe/connect"
      className="flex items-center gap-3 rounded-2xl bg-[#635bff] px-4 py-3.5 press-scale transition-colors"
    >
      <svg className="h-5 w-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.622.511-1 1.362-1 1.578 0 3.129.614 4.229 1.235l.638-3.941C16.102 3.694 14.42 3 12.04 3 9.395 3 7.314 4.066 6.34 5.879c-.566 1.043-.793 2.204-.648 3.35.361 2.784 2.494 3.9 4.414 4.695 1.71.717 2.533 1.217 2.533 2.009 0 .728-.621 1.16-1.712 1.16-1.559 0-3.389-.68-4.717-1.638l-.703 3.967c1.397.862 3.303 1.376 5.113 1.376 2.754 0 4.91-1.066 5.857-2.923.518-1.01.72-2.135.585-3.268-.337-2.742-2.485-3.826-4.583-4.724z" />
      </svg>
      <div className="flex-1">
        <p className="text-[14px] font-bold text-white">Connect Stripe</p>
        <p className="text-[12px] text-white/70">Accept online deposits from customers</p>
      </div>
      <svg className="h-4 w-4 text-white/60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </a>
  );
}
