'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Phone, Search, MessageCircle } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { type Order } from '@/lib/api';
import { useStoreOrders } from '@/components/vendor/useStoreOrders';
import { describeWindow } from '@/lib/schedule';
import { formatBs } from '@/lib/utils';
import { ORDER_STATUS, PAYMENT_LABEL, STATUS_TONE_CLASS } from '@/lib/orderStatus';
import { ListSkeleton } from '@/components/shop/Skeleton';

const FILTERS = [
  { key: 'pending', label: 'Por entregar', match: (o: Order) => ['SCHEDULED', 'CONFIRMED', 'PREPARING', 'DSP_DISPATCHED', 'IN_TRANSIT'].includes(o.status) },
  { key: 'done', label: 'Entregadas', match: (o: Order) => o.status === 'DELIVERED' },
  { key: 'all', label: 'Todas', match: () => true },
] as const;

function SalesScreen() {
  const { store, unseenSales, markSalesSeen } = useVendor();
  const params = useSearchParams();
  const selectedOrder = params.get('pedido');
  const { orders, error, reload } = useStoreOrders(store.id, unseenSales);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>(selectedOrder ? 'all' : 'pending');

  useEffect(() => {
    if (orders && unseenSales) markSalesSeen();
  }, [orders, unseenSales, markSalesSeen]);
  useEffect(() => {
    if (selectedOrder && orders) document.getElementById(`order-${selectedOrder}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [selectedOrder, orders]);

  const rule = FILTERS.find((f) => f.key === filter)!;
  const list = (orders ?? []).filter((o) => rule.match(o) && `${o.orderNumber} ${o.customerName}`.toLowerCase().includes(query.toLowerCase().trim()));
  // Pending sales read best in pickup order; the rest newest first.
  if (filter === 'pending') list.sort((a, b) => (a.deliveryAt ?? '').localeCompare(b.deliveryAt ?? ''));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Pedidos de tu tienda</h1><p className="mt-2 text-sm text-slate-500">Revisa tus ventas, coordina el recojo y contacta a tus clientes.</p></div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar ventas">
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className="chip" aria-pressed={f.key === filter} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="relative"><Search className="absolute left-4 top-4 h-4 w-4 text-slate-500" /><input type="search" className="field !pl-11" aria-label="Buscar pedido o cliente" placeholder="Buscar por número de pedido o cliente" value={query} onChange={(e) => setQuery(e.target.value)} /></div>

      {error ? <p role="alert" className="panel p-5 text-sm text-red-600">No pudimos cargar tus pedidos. <button onClick={reload} className="font-bold underline">Reintentar</button></p> : orders === null ? (
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
              <li key={o.id} id={`order-${o.id}`} className={`panel p-4 ${selectedOrder === o.id ? 'ring-2 ring-[#bcb0ff]' : ''}`}>
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
                    <a href={`https://wa.me/${o.customerPhone.replace(/\D/g, '').length === 8 ? '591' : ''}${o.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6248ff]"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>
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

export default function VendorSalesPage() {
  return <Suspense fallback={<ListSkeleton rows={3} />}><SalesScreen /></Suspense>;
}
