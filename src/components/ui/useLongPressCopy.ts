'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { SyntheticEvent } from 'react';
import { useToast } from '@/components/ui/Toast';

interface UseLongPressCopyOptions {
  value: string | null | undefined;
  successMessage?: string;
  errorMessage?: string;
  delayMs?: number;
}

export function useLongPressCopy({
  value,
  successMessage = 'Copied to clipboard',
  errorMessage = 'Could not copy right now',
  delayMs = 550,
}: UseLongPressCopyOptions) {
  const { toast } = useToast();
  const timeoutRef = useRef<number | null>(null);
  const copiedByLongPressRef = useRef(false);

  const clearLongPress = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startLongPress = useCallback(() => {
    if (!value) return;

    clearLongPress();
    copiedByLongPressRef.current = false;

    timeoutRef.current = window.setTimeout(async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast({ message: successMessage, type: 'success' });
        copiedByLongPressRef.current = true;
      } catch {
        toast({ message: errorMessage, type: 'error' });
      } finally {
        timeoutRef.current = null;
      }
    }, delayMs);
  }, [clearLongPress, delayMs, errorMessage, successMessage, toast, value]);

  const swallowClickAfterCopy = useCallback((event: SyntheticEvent) => {
    if (!copiedByLongPressRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    copiedByLongPressRef.current = false;
  }, []);

  useEffect(() => clearLongPress, [clearLongPress]);

  return {
    onPointerDown: startLongPress,
    onPointerUp: clearLongPress,
    onPointerLeave: clearLongPress,
    onPointerCancel: clearLongPress,
    onClickCapture: swallowClickAfterCopy,
  };
}
