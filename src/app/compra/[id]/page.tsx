import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Bike, CalendarClock, CheckCircle2, ChevronRight, MapPin, Navigation } from 'lucide-react';
import type { Order } from '@/lib/api';
import { SESSION_COOKIE, backend, verifySession } from '@/lib/server/session';
import { describeWindow } from '@/lib/schedule';
import { formatBs } from '@/lib/utils';
import { ORDER_STATUS, PAYMENT_LABEL, STATUS_TONE_CLASS } from '@/lib/orderStatus';
import { QrPayment } from '@/components/shop/QrPayment';
import { RefreshWhileActive } from '@/components/shop/RefreshWhileActive';

export const dynamic = 'force-dynamic';
// The page shows the customer's address: keep it out of search engines.
export const metadata = { title: 'Tu compra — Vitrina', robots: { index: false, follow: false } };

const panel = 'mx-auto my-8 max-w-xl rounded-[2rem] border border-white/80 bg-white/80 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-12';

interface PurchaseView {
  purchaseId: string;
  combined: boolean;
  orders: Order[];
}

const units = (order: Order) => {
  const count = order.items.reduce((n, it) => n + it.quantity, 0);
  return count === 1 ? '1 producto' : `${count} productos`;
};

/** Only the customer who made the purchase can open it. */
async function loadPurchase(id: string): Promise<PurchaseView | 'login' | 'error' | null> {
  const userId = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!userId) return 'login';
  try {
    return await backend(`/orders/purchase/${encodeURIComponent(id)}`, {}, userId);
  } catch (err) {
    return (err as { status?: number }).status === 404 ? null : 'error';
  }
}

/** A purchase made in one checkout: one order per store, paid and (when it is cheaper) delivered together. */
export default async function PurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await loadPurchase(id);
  if (!purchase) notFound();
  if (purchase === 'login' || purchase === 'error') {
    return (
      <div className={panel}>
        <h1 className="type-sign text-2xl font-extrabold">Compra {id}</h1>
        <p className="mt-2 text-muted">
          {purchase === 'login' ? 'Inicia sesión con la cuenta que hizo la compra para verla.' : 'No pudimos cargar tu compra. Inténtalo en un momento.'}
        </p>
        <Link href={purchase === 'login' ? '/cuenta' : `/compra/${encodeURIComponent(id)}`} className="btn btn-primary mt-6">
          {purchase === 'login' ? 'Iniciar sesión' : 'Reintentar'}
        </Link>
      </div>
    );
  }

  const { orders } = purchase;
  const [first] = orders;
  const open = orders.filter((o) => o.status !== 'CANCELLED');
  const total = open.reduce((sum, o) => sum + o.totalAmount, 0);
  const shipping = open.reduce((sum, o) => sum + o.shippingFee, 0);
  const unpaidQr = open.filter((o) => o.paymentMethod === 'QR_PREPAID' && o.paymentStatus !== 'PAID');
  const allPaid = open.length > 0 && open.every((o) => o.paymentStatus === 'PAID');
  const active = orders.some((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      {active && <RefreshWhileActive />}
      <div>
        <h1 className="type-sign text-2xl font-extrabold">Compra {purchase.purchaseId}</h1>
        <p className="mt-1 text-sm text-muted">
          {orders.length} pedidos, uno por tienda. Cada tienda prepara lo suyo.
        </p>
      </div>

      {unpaidQr.length > 0 && (
        // One payment covers every order of the purchase.
        <QrPayment
          orderNumber={unpaidQr[0].orderNumber}
          amount={unpaidQr.reduce((sum, o) => sum + o.totalAmount, 0)}
          storeName={`tus ${unpaidQr.length} tiendas`}
          afterPaidHref={first.trackingCode ? `/seguir/${first.trackingCode}` : undefined}
        />
      )}

      {first.trackingCode && unpaidQr.length === 0 && open.length > 0 && (
        <Link href={`/seguir/${first.trackingCode}`} className="btn btn-primary w-full">
          <Navigation className="h-5 w-5" /> Seguir mi compra en el mapa
        </Link>
      )}

      <div className="panel flex flex-col gap-3 p-4 text-sm">
        <p className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
          <span>
            <span className="block font-semibold">Llega {describeWindow(first.deliveryAt, first.deliveryWindow)}</span>
            <span className="text-ink-soft">
              {PAYMENT_LABEL[first.paymentMethod] ?? 'Pago al recibir'}: {formatBs(total)}
              {allPaid && (
                <span className="ml-1.5 inline-flex items-center gap-1 font-semibold text-verde-dark">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Pagado
                </span>
              )}
            </span>
          </span>
        </p>
        <p className="flex items-start gap-3">
          <Bike className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
          <span>
            <span className="block font-semibold">{purchase.combined ? 'Un solo repartidor trae todo' : 'Cada tienda envía por separado'}</span>
            <span className="text-ink-soft">Envío: {formatBs(shipping)}</span>
          </span>
        </p>
        <p className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
          <span>
            <span className="block font-semibold">{first.customerAddress}</span>
            {first.customerReference && <span className="text-ink-soft">{first.customerReference}</span>}
          </span>
        </p>
      </div>

      <ul className="panel divide-y divide-line">
        {orders.map((o) => {
          const status = ORDER_STATUS[o.status] ?? ORDER_STATUS.SCHEDULED;
          return (
            <li key={o.id}>
              <Link href={`/pedido/${o.orderNumber}`} className="flex items-center gap-3 p-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{o.items[0]?.storeName ?? 'Tienda'}</span>
                  <span className="block text-xs text-muted">
                    Pedido {o.orderNumber} · {units(o)}
                  </span>
                </span>
                <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${STATUS_TONE_CLASS[status.tone]}`}>{status.customer}</span>
                <span className="shrink-0 text-sm tabular-nums">{formatBs(o.totalAmount)}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            </li>
          );
        })}
        <li className="type-sign flex justify-between p-3.5 font-extrabold">
          <span>Total</span>
          <span className="tabular-nums">{formatBs(total)}</span>
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
