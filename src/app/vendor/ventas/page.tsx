'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { marketplaceApi, type Order } from '@/lib/api';
import { describeWindow } from '@/lib/schedule';
import { formatBs } from '@/lib/utils';
import { ORDER_STATUS, PAYMENT_LABEL, STATUS_TONE_CLASS } from '@/lib/orderStatus';
import { ListSkeleton } from '@/components/shop/Skeleton';

const FILTERS = [
  { key: 'pending', label: 'Por entregar', match: (o: Order) => ['SCHEDULED', 'CONFIRMED', 'PREPARING', 'DSP_DISPATCHED', 'IN_TRANSIT'].includes(o.status) },
  { key: 'done', label: 'Entregadas', match: (o: Order) => o.status === 'DELIVERED' },
  { key: 'all', label: 'Todas', match: () => true },
] as const;

export default function VendorSalesPage() {
  const { store, unseenSales, markSalesSeen } = useVendor();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('pending');

  useEffect(() => {
    let active = true;
    marketplaceApi
      .getStoreOrders(store.id)
      .then((list) => {
        if (!active) return;
        setOrders(list);
        markSalesSeen();
      })
      .catch(() => active && setOrders([]));
    return () => {
      active = false;
    };
  }, [store.id, unseenSales, markSalesSeen]);

  const rule = FILTERS.find((f) => f.key === filter)!;
  const list = (orders ?? []).filter(rule.match);
  // Pending sales read best in pickup order; the rest newest first.
  if (filter === 'pending') list.sort((a, b) => (a.deliveryAt ?? '').localeCompare(b.deliveryAt ?? ''));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="type-sign text-2xl font-extrabold">Ventas</h1>
      <div className="flex gap-2" role="group" aria-label="Filtrar ventas">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className="chip" aria-pressed={f.key === filter} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {orders === null ? (
        <ListSkeleton rows={3} />
      ) : list.length === 0 ? (
        <p className="panel px-4 py-6 text-center text-sm text-muted">
          {filter === 'pending' ? 'No tienes pedidos por entregar.' : 'Aquí aparecerán tus ventas.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((o) => {
            const s = ORDER_STATUS[o.status] ?? ORDER_STATUS.SCHEDULED;
            const mine = o.items.filter((it) => it.storeId === store.id);
            return (
              <li key={o.id} className="panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">Recojo {describeWindow(o.deliveryAt, o.deliveryWindow).toLowerCase()}</p>
                    <p className="text-xs text-muted">
                      Pedido {o.orderNumber}, hecho el{' '}
                      {new Date(o.createdAt).toLocaleString('es-BO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/La_Paz' })}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${STATUS_TONE_CLASS[s.tone]}`}>{s.store}</span>
                </div>
                <ul className="mt-3 flex flex-col gap-1 text-sm">
                  {mine.map((it) => (
                    <li key={it.id} className="flex justify-between gap-3">
                      <span>
                        {it.quantity} × {it.productTitle}
                      </span>
                      <span className="tabular-nums">{formatBs(it.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-sm text-ink-soft">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-verde" />
                    <span>
                      {o.customerName}: {o.customerAddress}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-verde" />
                    <a href={`tel:${o.customerPhone.replace(/\s/g, '')}`} className="font-semibold text-verde-dark">
                      {o.customerPhone}
                    </a>
                    <span className="ml-auto text-xs">{PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod}</span>
                  </p>
                  {o.dspDriverName && <p className="text-xs">Repartidor: {o.dspDriverName}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
