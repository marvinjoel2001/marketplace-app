'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { marketplaceApi, type StoreTikTokAccount } from '@/lib/api';
import { useVendor } from '@/context/VendorContext';

/** Same limit as the server. */
export const MAX_TIKTOK_ACCOUNTS = 5;

/**
 * The store's TikTok accounts with their live status, refreshed every `pollMs` while the page is
 * visible. Keeps the store's main username (the first account) in the vendor context in step.
 */
export function useTikTokAccounts(pollMs: number | null) {
  const { store, setStore } = useVendor();
  const [accounts, setAccounts] = useState<StoreTikTokAccount[] | null>(null);

  const apply = useCallback(
    (list: StoreTikTokAccount[]) => {
      setAccounts(list);
      const main = list[0]?.username ?? null;
      if ((store.tiktokUsername ?? null) !== main)
        setStore({ ...store, tiktokUsername: main, tiktokLiveUrl: main ? `https://www.tiktok.com/@${main}/live` : null });
    },
    [store, setStore],
  );

  // Polling reads the latest apply without restarting the timer when the store object changes.
  const applyRef = useRef(apply);
  useEffect(() => { applyRef.current = apply; }, [apply]);

  useEffect(() => {
    let active = true;
    const read = () =>
      marketplaceApi
        .getStoreTikTokAccounts(store.id)
        .then((list) => { if (active) applyRef.current(list); })
        .catch(() => { if (active) setAccounts((prev) => prev ?? []); });
    void read();
    if (!pollMs) return () => { active = false; };
    const timer = setInterval(() => { if (!document.hidden) void read(); }, pollMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [store.id, pollMs]);

  // The account to show buyers: the one broadcasting now, else the main one.
  const showing = accounts?.find((a) => a.live) ?? accounts?.[0] ?? null;
  return { accounts, setAccounts: apply, showing };
}
