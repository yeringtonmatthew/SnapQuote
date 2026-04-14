'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import BottomSheet from '@/components/BottomSheet';
import { useToast } from '@/components/ui/Toast';
import { useLongPressCopy } from '@/components/ui/useLongPressCopy';
import { cn } from '@/lib/utils';

interface AddressActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  address: string;
  children: ReactNode;
  copiedMessage?: string;
  sheetTitle?: string;
}

export default function AddressActionButton({
  address,
  children,
  className,
  copiedMessage = 'Address copied',
  sheetTitle = 'Address Options',
  type = 'button',
  onClick,
  ...props
}: AddressActionButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const encoded = encodeURIComponent(address);
  const longPressProps = useLongPressCopy({
    value: address,
    successMessage: copiedMessage,
  });

  async function handleCopyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      toast({ message: copiedMessage, type: 'success' });
      setOpen(false);
    } catch {
      toast({ message: 'Could not copy address right now', type: 'error' });
    }
  }

  return (
    <>
      <button
        {...props}
        {...longPressProps}
        type={type}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          setOpen(true);
        }}
        className={cn('select-text', className)}
      >
        {children}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={sheetTitle}>
        <div className="px-5 pb-6">
          <p className="truncate text-center text-[14px] text-gray-500 dark:text-gray-400">
            {address}
          </p>

          <div className="mt-4 space-y-2">
            <a
              href={`maps://maps.apple.com/?daddr=${encoded}`}
              className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3.5 press-scale"
            >
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Open in Apple Maps</span>
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3.5 press-scale"
            >
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Open in Google Maps</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="flex w-full items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3.5 press-scale"
            >
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Copy Address</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
