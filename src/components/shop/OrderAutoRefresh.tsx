'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Re-reads the order every 20 s while the tab is visible, so status changes from OpenDSP show up on their own. */
export function OrderAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => document.visibilityState === 'visible' && router.refresh(), 20_000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
