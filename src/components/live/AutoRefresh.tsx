'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Re-renders the server component so freshly verified lives appear (and ended ones disappear).
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    const id = setInterval(tick, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return null;
}
