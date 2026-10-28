'use client';

import { useCallback, useEffect, useState } from 'react';
import { marketplaceApi, type Offer, type Product } from '@/lib/api';

export type StoreOffer = Offer & { product: Product };

/** The store's products (one offer each), newest first. `null` while loading. */
export function useStoreOffers(storeId: string) {
  const [offers, setOffers] = useState<StoreOffer[] | null>(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    marketplaceApi
      .getStoreOffers(storeId)
      .then((list) => {
        if (!active) return;
        setOffers([...list].sort((a, b) => (b.product.id > a.product.id ? 1 : -1)));
        setError('');
      })
      .catch((err: Error) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [storeId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { offers, error, reload, setOffers };
}
