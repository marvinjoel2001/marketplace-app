'use client';

import { useCallback, useEffect, useState } from 'react';
import { marketplaceApi, type Order } from '@/lib/api';

export function useStoreOrders(storeId: string, version = 0) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    marketplaceApi.getStoreOrders(storeId).then((list) => {
      if (active) { setOrders(list); setError(''); }
    }).catch((err: Error) => { if (active) setError(err.message || 'No se pudieron cargar los pedidos.'); });
    return () => { active = false; };
  }, [storeId, version, retry]);
  const reload = useCallback(() => setRetry((n) => n + 1), []);
  return { orders, error, reload };
}

export function storeOrderTotal(order: Order, storeId: string) {
  return order.items.filter((item) => item.storeId === storeId).reduce((total, item) => total + Number(item.subtotal), 0);
}

export function boliviaDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-CA', { timeZone: 'America/La_Paz' });
}
