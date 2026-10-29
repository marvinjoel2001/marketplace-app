'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, Package, Plus } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { marketplaceApi, type StoreSummary } from '@/lib/api';
import { describeSchedule, describeWindow } from '@/lib/schedule';
import { formatBs } from '@/lib/utils';
import { TikTokIcon } from '@/components/common/TikTokIcon';
import { ListSkeleton } from '@/components/shop/Skeleton';

function NotifyToggle() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  useEffect(() => {
    const read = () => setPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
    const timer = setTimeout(read, 0);
    return () => clearTimeout(timer);
  }, []);
  if (permission !== 'default') return null;
  return (
    <button
      type="button"
      onClick={() => Notification.requestPermission().then(setPermission)}
      className="panel flex w-full items-center gap-3 p-4 text-left"
    >
      <Bell className="h-5 w-5 shrink-0 text-verde" />
      <span className="flex-1 text-sm">
        <span className="block font-semibold">Activa los avisos de venta</span>
        <span className="text-muted">Te avisamos en este celular cada vez que vendas, con la hora de recojo.</span>
      </span>
    </button>
  );
}

export default function VendorHomePage() {
  const { store, unseenSales } = useVendor();
  const [summary, setSummary] = useState<StoreSummary | null>(null);

  useEffect(() => {
    let active = true;
    marketplaceApi
      .getStoreSummary(store.id)
      .then((s) => active && setSummary(s))
      .catch(() => {});
    return () => {
      active = false;
    };
    // New sales change the totals.
  }, [store.id, unseenSales]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-muted">Hola, {store.name}</p>
        <h1 className="type-sign mt-0.5 text-[1.7rem] font-extrabold leading-tight">
          Hoy vendiste <span className="tabular-nums">{summary ? formatBs(summary.today.total) : '…'}</span>
        </h1>
        {summary && (
          <p className="mt-1 text-sm text-ink-soft">
            {summary.today.count === 1 ? '1 pedido' : `${summary.today.count} pedidos`} hoy. Esta semana {formatBs(summary.week.total)}, este mes{' '}
            {formatBs(summary.month.total)}.
          </p>
        )}
      </div>

      <Link href="/vendor/tiktok" className="flex items-center gap-4 rounded-[var(--radius-card)] bg-ink p-4 text-white">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
          <TikTokIcon className="h-6 w-6" />
        </span>
        <span className="flex-1">
          <span className="type-sign block text-lg font-extrabold">Vender por TikTok</span>
          <span className="text-sm text-white/75">Elige qué vas a mostrar en tu live y tus clientes lo compran aquí.</span>
        </span>
        <ChevronRight className="h-5 w-5 text-white/60" />
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/vendor/productos?nuevo=1" className="panel flex flex-col gap-2 p-4">
          <Plus className="h-5 w-5 text-verde" />
          <span className="font-semibold">Subir producto</span>
        </Link>
        <Link href="/vendor/productos" className="panel flex flex-col gap-2 p-4">
          <Package className="h-5 w-5 text-verde" />
          <span className="font-semibold">
            {summary ? (summary.products === 1 ? '1 producto' : `${summary.products} productos`) : 'Mis productos'}
            {summary && summary.activeOffers > 0 && <span className="block text-sm font-normal text-muted">{summary.activeOffers} en oferta</span>}
          </span>
        </Link>
      </div>

      <NotifyToggle />

      <section aria-labelledby="upcoming-title">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 id="upcoming-title" className="font-bold">
            Próximos recojos
          </h2>
          <Link href="/vendor/ventas" className="text-sm font-semibold text-verde-dark">
            Ver ventas
          </Link>
        </div>
        {!summary ? (
          <ListSkeleton rows={2} />
        ) : summary.upcoming.length === 0 ? (
          <p className="panel px-4 py-5 text-sm text-muted">
            No tienes pedidos por entregar. Entregas {describeSchedule(store).toLowerCase()}.
          </p>
        ) : (
          <ul className="panel divide-y divide-line">
            {summary.upcoming.map((o) => (
              <li key={o.id} className="flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">El repartidor recoge {describeWindow(o.deliveryAt, o.deliveryWindow).toLowerCase()}</p>
                  <p className="truncate text-xs text-muted">
                    {o.items.map((it) => `${it.quantity} × ${it.productTitle}`).join(', ')}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatBs(o.subtotal)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
