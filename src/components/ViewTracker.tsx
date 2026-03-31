'use client';

import { useEffect } from 'react';

export function ViewTracker({ quoteId }: { quoteId: string }) {
  useEffect(() => {
    // Fire-and-forget POST to track the view
    fetch(`/api/quotes/${quoteId}/view`, { method: 'POST' }).catch(() => {});
  }, [quoteId]);

  return null;
}
