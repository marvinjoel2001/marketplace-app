'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, LogOut, MapPin, Store as StoreIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { marketplaceApi, type Order } from '@/lib/api';
import { describeWindow } from '@/lib/schedule';
import { formatBs } from '@/lib/utils';
import { ORDER_STATUS, STATUS_TONE_CLASS } from '@/lib/orderStatus';
import { Sheet } from '@/components/shop/Sheet';
import { AddressForm } from '@/components/shop/AddressForm';

export default function AccountPage() {
  const { user, ready, requestLogin, logout } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [editing, setEditing] = useState(false);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    marketplaceApi.getUserOrders(userId).then((list) => active && setOrders(list));
    return () => {
      active = false;
    };
  }, [userId]);

  if (!ready) return <p className="py-10 text-center text-muted">Cargando…</p>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h1 className="type-sign text-2xl font-extrabold">Tu cuenta</h1>
        <p className="mt-2 text-muted">Inicia sesión para ver tus pedidos y tu dirección guardada.</p>
        <button type="button" className="btn btn-primary mt-6" onClick={() => requestLogin()}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <h1 className="type-sign text-2xl font-extrabold">Hola, {user.name.split(' ')[0]}</h1>

      <section className="panel p-4" aria-labelledby="addr-title">
        <div className="flex items-center justify-between">
          <h2 id="addr-title" className="font-bold">
            Dirección de entrega
          </h2>
          <button type="button" className="text-sm font-semibold text-verde-dark" onClick={() => setEditing(true)}>
            {user.address ? 'Cambiar' : 'Agregar'}
          </button>
        </div>
        {user.address ? (
          <p className="mt-2 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-verde" />
            <span>
              {user.address}
              {user.addressReference && <span className="block text-ink-soft">{user.addressReference}</span>}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Guárdala una vez y tus próximos pedidos son más rápidos.</p>
        )}
      </section>

      <section aria-labelledby="orders-title">
        <h2 id="orders-title" className="mb-2 font-bold">
          Mis pedidos
        </h2>
        {orders === null ? (
          <p className="text-sm text-muted">Cargando pedidos…</p>
        ) : orders.length === 0 ? (
          <p className="panel px-4 py-5 text-sm text-muted">Todavía no hiciste pedidos.</p>
        ) : (
          <ul className="panel divide-y divide-line">
            {orders.map((o) => {
              const s = ORDER_STATUS[o.status] ?? ORDER_STATUS.SCHEDULED;
              return (
                <li key={o.id}>
                  <Link href={`/pedido/${o.orderNumber}`} className="flex items-center gap-3 p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{o.items[0]?.storeName}</p>
                      <p className="text-xs text-muted">{describeWindow(o.deliveryAt, o.deliveryWindow)}</p>
                    </div>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${STATUS_TONE_CLASS[s.tone]}`}>{s.customer}</span>
                    <span className="text-sm tabular-nums">{formatBs(o.totalAmount)}</span>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Link href="/vendor" className="panel flex items-center gap-3 p-4">
        <StoreIcon className="h-5 w-5 text-verde" />
        <span className="flex-1">
          <span className="block font-semibold">{user.storeId ? 'Ir a mi tienda' : '¿Tienes una tienda? Vende en Vitrina'}</span>
          {!user.storeId && <span className="text-sm text-muted">Sube tus productos y recibe pedidos.</span>}
        </span>
        <ChevronRight className="h-4 w-4 text-muted" />
      </Link>

      <button type="button" onClick={logout} className="btn btn-ghost w-full text-danger">
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Dirección de entrega" wide>
        <AddressForm onSaved={() => setEditing(false)} />
      </Sheet>
    </div>
  );
}
