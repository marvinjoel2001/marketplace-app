'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { marketplaceApi, type CustomerNotification } from '@/lib/api';
import { ListSkeleton } from '@/components/shop/Skeleton';

function when(iso: string) {
  return new Date(iso).toLocaleString('es-BO', { timeZone: 'America/La_Paz', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** Everything that happened with the customer's orders, newest first. Opening the page marks them read. */
export default function NotificationsPage() {
  const { user, ready, requestLogin } = useAuth();
  const [items, setItems] = useState<CustomerNotification[] | null>(null);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const load = () =>
      marketplaceApi.getNotifications(userId).then((r) => {
        if (!active) return;
        setItems(r?.items ?? []);
        if (r?.unread)
          marketplaceApi
            .markNotificationsRead(userId)
            .then(() => window.dispatchEvent(new Event('notifications-read')))
            .catch(() => undefined);
      });
    load();
    const timer = setInterval(() => document.visibilityState === 'visible' && load(), 20_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [userId]);

  if (!ready) return <div className="mx-auto max-w-xl"><ListSkeleton rows={4} /></div>;

  if (!user) {
    return (
      <div className="mx-auto my-8 max-w-xl panel p-8 text-center">
        <h1 className="type-sign text-2xl font-extrabold">Notificaciones</h1>
        <p className="mt-2 text-muted">Inicia sesión para ver qué pasó con tus pedidos.</p>
        <button type="button" className="btn btn-primary mt-6" onClick={() => requestLogin()}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <h1 className="type-sign text-2xl font-extrabold">Notificaciones</h1>
      {items === null ? (
        <ListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <p className="panel flex items-center gap-3 px-4 py-5 text-sm text-muted">
          <Bell className="h-5 w-5 shrink-0" /> Cuando hagas un pedido te avisamos aquí cada paso: pago, repartidor, en camino y entregado.
        </p>
      ) : (
        <ul className="panel divide-y divide-line">
          {items.map((n) => {
            const external = Boolean(n.link && /^https?:\/\//.test(n.link));
            const body = (
              <>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? 'bg-transparent' : 'bg-[#FE2C55]'}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{n.title}</span>
                  <span className="block text-sm text-ink-soft">{n.body}</span>
                  <span className="mt-0.5 block text-xs text-muted">{when(n.createdAt)}</span>
                </span>
                {n.link && (external ? <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted" /> : <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted" />)}
              </>
            );
            return (
              <li key={n.id}>
                {!n.link ? (
                  <div className="flex gap-3 p-3.5">{body}</div>
                ) : external ? (
                  <a href={n.link} target="_blank" rel="noopener noreferrer" className="flex gap-3 p-3.5">{body}</a>
                ) : (
                  <Link href={n.link} className="flex gap-3 p-3.5">{body}</Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
