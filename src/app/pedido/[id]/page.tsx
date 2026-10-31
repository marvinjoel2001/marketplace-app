import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { CalendarClock, MapPin, Phone } from 'lucide-react';
import type { Order } from '@/lib/api';
import { SESSION_COOKIE, backend, verifySession } from '@/lib/server/session';
import { describeWindow } from '@/lib/schedule';
import { formatBs } from '@/lib/utils';
import { mediaUrl } from '@/lib/catalog';
import { ORDER_STATUS, PAYMENT_LABEL, STATUS_TONE_CLASS } from '@/lib/orderStatus';
import { RefreshWhileActive } from '@/components/shop/RefreshWhileActive';

export const dynamic = 'force-dynamic';
// The page shows the customer's address: keep it out of search engines.
export const metadata = { title: 'Tu pedido — Vitrina', robots: { index: false, follow: false } };

const panel = 'mx-auto my-8 max-w-xl rounded-[2rem] border border-white/80 bg-white/80 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-12';

/** Only the customer who placed the order (or the store selling it) can open it. */
async function loadOrder(id: string): Promise<Order | 'login' | 'error' | null> {
  const userId = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return 'login';
  try {
    return await backend(`/orders/${encodeURIComponent(id)}`, {}, userId);
  } catch (err) {
    return (err as { status?: number }).status === 404 ? null : 'error';
  }
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await loadOrder(id);
  if (!order) notFound();
  if (order === 'login' || order === 'error') {
    return (
      <div className={panel}>
        <h1 className="type-sign text-2xl font-extrabold">Pedido {id}</h1>
        <p className="mt-2 text-muted">
          {order === 'login' ? 'Inicia sesión con la cuenta que hizo el pedido para verlo.' : 'No pudimos cargar tu pedido. Inténtalo en un momento.'}
        </p>
        <Link href={order === 'login' ? '/cuenta' : `/pedido/${encodeURIComponent(id)}`} className="btn btn-primary mt-6">
          {order === 'login' ? 'Iniciar sesión' : 'Reintentar'}
        </Link>
      </div>
    );
  }
  const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.SCHEDULED;
  const active = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      {active && <RefreshWhileActive />}
      <div>
        <span className={`inline-block rounded-md px-2 py-1 text-sm font-bold ${STATUS_TONE_CLASS[status.tone]}`}>{status.customer}</span>
        <h1 className="type-sign mt-2 text-2xl font-extrabold">Pedido {order.orderNumber}</h1>
        <p className="mt-1 text-sm text-muted">De {order.items[0]?.storeName}</p>
      </div>

      <div className="panel flex flex-col gap-3 p-4 text-sm">
        <p className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
          <span>
            <span className="block font-semibold">Llega {describeWindow(order.deliveryAt, order.deliveryWindow)}</span>
            <span className="text-ink-soft">{PAYMENT_LABEL[order.paymentMethod] ?? 'Pago al recibir'}: {formatBs(order.totalAmount)}</span>
          </span>
        </p>
        <p className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
          <span>
            <span className="block font-semibold">{order.customerAddress}</span>
            {order.customerReference && <span className="text-ink-soft">{order.customerReference}</span>}
          </span>
        </p>
        {order.dspDriverName && (
          <p className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
            <span>
              Te entrega {order.dspDriverName}
              {order.dspDriverPhone && (
                <a href={`tel:${order.dspDriverPhone.replace(/\s/g, '')}`} className="ml-1 font-semibold text-verde-dark">
                  {order.dspDriverPhone}
                </a>
              )}
            </span>
          </p>
        )}
      </div>

      <ul className="panel divide-y divide-line">
        {order.items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 p-3">
            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper">
              {it.productImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(it.productImage)} alt="" className="h-full w-full object-cover" />
              )}
            </span>
            <span className="flex-1 text-sm">
              {it.quantity} × {it.productTitle}
            </span>
            <span className="text-sm tabular-nums">{formatBs(it.subtotal)}</span>
          </li>
        ))}
        <li className="flex justify-between p-3 text-sm text-ink-soft">
          <span>Envío</span>
          <span className="tabular-nums">{formatBs(order.shippingFee)}</span>
        </li>
        <li className="type-sign flex justify-between p-3 font-extrabold">
          <span>Total</span>
          <span className="tabular-nums">{formatBs(order.totalAmount)}</span>
        </li>
      </ul>

      <div className="flex gap-3">
        <Link href="/cuenta" className="btn btn-ghost flex-1">
          Mis pedidos
        </Link>
        <Link href="/" className="btn btn-primary flex-1">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
