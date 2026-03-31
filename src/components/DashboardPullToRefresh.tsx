'use client';

import { useRouter } from 'next/navigation';
import { useCallback, type ReactNode } from 'react';
import PullToRefresh from '@/components/PullToRefresh';

export default function DashboardPullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleRefresh = useCallback(async () => {
    router.refresh();
    // Small delay so the spinner is visible and the server has time to respond
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, [router]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {children}
    </PullToRefresh>
  );
}
