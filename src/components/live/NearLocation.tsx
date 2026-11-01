'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { NEAR_COOKIE, nearestCity, type NearSource } from '@/lib/visitorCity';

const DISMISSED = 'vitrina:near-hint-dismissed';

/**
 * Automatic, like TikTok: the city comes from the visitor's connection (IP) with nothing to pick.
 * When the connection doesn't say, a browser that already allowed location is used silently;
 * otherwise a small dismissible hint offers to turn it on. The position never leaves the browser:
 * only the nearest city name is stored (cookie) and sent.
 */
export function NearLocation({ near, source }: { near: string | null; source: NearSource }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [offer, setOffer] = useState(false);

  const apply = (city: string) => {
    try {
      // A week: people travel, and the IP takes over again afterwards.
      document.cookie = `${NEAR_COOKIE}=${encodeURIComponent(city)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    } catch {
      return;
    }
    const next = new URLSearchParams(params.toString());
    next.delete('cerca');
    next.delete('page');
    const url = next.toString() ? `${pathname}?${next}` : pathname;
    startTransition(() => {
      router.replace(url, { scroll: false });
      router.refresh();
    });
  };

  const locate = (onFail?: () => void) =>
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const city = nearestCity(position.coords.latitude, position.coords.longitude);
        setOffer(false);
        if (city) apply(city);
      },
      () => onFail?.(),
      { timeout: 10000, maximumAge: 30 * 60 * 1000 },
    );

  useEffect(() => {
    if (near || source || !('geolocation' in navigator)) return;
    let cancelled = false;
    const dismissed = (() => {
      try {
        return localStorage.getItem(DISMISSED) === '1';
      } catch {
        return false;
      }
    })();
    const permissions = navigator.permissions?.query({ name: 'geolocation' as PermissionName });
    if (!permissions) {
      if (!dismissed) queueMicrotask(() => !cancelled && setOffer(true));
      return () => { cancelled = true; };
    }
    permissions
      .then((status) => {
        if (cancelled) return;
        if (status.state === 'granted') locate();
        else if (status.state === 'prompt' && !dismissed) setOffer(true);
      })
      .catch(() => {
        if (!cancelled && !dismissed) setOffer(true);
      });
    return () => {
      cancelled = true;
    };
    // Runs once per city resolution; locate/apply only read the current URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, source]);

  const dismiss = () => {
    setOffer(false);
    try {
      localStorage.setItem(DISMISSED, '1');
    } catch {
      /* optional */
    }
  };

  if (near)
    return (
      <p className="live-near" aria-live="polite">
        <MapPin aria-hidden="true" size={14} />
        <span>Primero los lives de <strong>{near}</strong></span>
      </p>
    );
  if (!offer) return null;
  return (
    <div className="live-near live-near-offer" aria-busy={pending}>
      <button type="button" className="live-near-locate" onClick={() => locate(() => setOffer(false))} disabled={pending}>
        <LocateFixed aria-hidden="true" size={14} />
        <span>Activa tu ubicación para ver primero los lives de tu ciudad</span>
      </button>
      <button type="button" className="live-near-close" onClick={dismiss} aria-label="No, gracias">
        <X aria-hidden="true" size={14} />
      </button>
    </div>
  );
}
