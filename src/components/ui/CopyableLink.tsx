'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLongPressCopy } from '@/components/ui/useLongPressCopy';

interface CopyableLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  value: string;
  copiedMessage?: string;
  children: ReactNode;
}

export default function CopyableLink({
  value,
  copiedMessage,
  className,
  children,
  ...props
}: CopyableLinkProps) {
  const longPressProps = useLongPressCopy({
    value,
    successMessage: copiedMessage,
  });

  return (
    <a
      {...props}
      {...longPressProps}
      className={cn('select-text', className)}
    >
      {children}
    </a>
  );
}
