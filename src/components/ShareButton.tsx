'use client';

import { useEffect, useState } from 'react';
import { CopyLinkButton } from '@/components/CopyLinkButton';

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  if (!canShare) {
    return <CopyLinkButton url={url} />;
  }

  async function handleShare() {
    try {
      await navigator.share({ url, title, text });
    } catch {
      // User cancelled or share failed — no action needed
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 press-scale"
      title="Share quote"
    >
      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" />
      </svg>
      Share
    </button>
  );
}
