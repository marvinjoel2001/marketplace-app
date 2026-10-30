'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { AlarmClock, ArrowRight, Receipt, Store, Wallet } from 'lucide-react';
import { Empty, ErrorBox, Loading, PageHeader, adminFetch, dateTime, useAdminData } from '@/components/admin/ui';

interface Notice {
  id: string;
  type: 'NEW_STORE' | 'NEW_ORDER' | 'LATE_DELIVERY' | 'PAYOUT_DUE';
  title: string;
  detail: string;
  at: string;
  link: string;
}

const ICON = { NEW_STORE: Store, NEW_ORDER: Receipt, LATE_DELIVERY: AlarmClock, PAYOUT_DUE: Wallet };
const TONE = {
  NEW_STORE: 'bg-indigo-50 text-indigo-600',
  NEW_ORDER: 'bg-emerald-50 text-emerald-600',
  LATE_DELIVERY: 'bg-rose-50 text-rose-600',
  PAYOUT_DUE: 'bg-amber-50 text-amber-700',
};

export default function AdminNotificationsPage() {
  const { data, error, loading, reload } = useAdminData<{ items: Notice[]; unread: number }>('notifications');
  const marked = useRef(false);

  // Opening the page counts as reading: the bell resets on the next check.
  useEffect(() => {
    if (data && !marked.current) {
      marked.current = true;
      adminFetch('notifications/seen', { method: 'POST' }).catch(() => {});
    }
  }, [data]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader title="Notificaciones" subtitle="Tiendas nuevas, pedidos de las últimas 48 horas, entregas atrasadas y pagos pendientes." />
      {data.items.length === 0 ? (
        <Empty>No hay novedades por ahora.</Empty>
      ) : (
        <ul className="vendor-card divide-y divide-slate-100">
          {data.items.map((n, i) => {
            const Icon = ICON[n.type];
            return (
              <li key={n.id}>
                <Link href={n.link} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TONE[n.type]}`}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {n.title}
                      {i < data.unread && <span className="h-2 w-2 rounded-full bg-rose-500" aria-label="Nueva" />}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{n.detail}</span>
                  </span>
                  <span className="hidden text-xs text-slate-400 sm:block">{dateTime(n.at)}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
