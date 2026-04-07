import { DEFAULT_TERMS } from '@/lib/defaultTerms';

export function ContractDisclaimer() {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] overflow-hidden">
      <details>
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors">
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Contract / Disclaimer
          </span>
          <svg className="h-4 w-4 text-gray-300 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-[12px] leading-relaxed text-gray-500 whitespace-pre-line">{DEFAULT_TERMS}</p>
        </div>
      </details>
    </div>
  );
}
