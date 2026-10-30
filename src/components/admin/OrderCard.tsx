'use client';

import { useState } from 'react';
import { Loader2, MapPin, MessageCircle, Phone, Truck } from 'lucide-react';
import { Modal, ORDER_STATUS, PAYMENT_LABEL, StatusBadge, adminFetch, bs, dateOnly, dateTime, whatsappLink } from './ui';
import { AdminOrder, storeColor } from './types';
import { useToast } from '@/context/ToastContext';

const NEXT_STATUSES = ['SCHEDULED', 'PREPARING', 'DSP_DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];

/** One order with everything needed to act on it: who receives it, where, when, and its state. */
export function OrderCard({ order, onChanged, compact }: { order: AdminOrder; onChanged: () => void; compact?: boolean }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const wa = whatsappLink(order.recipient.phone);
  const closed = order.status === 'CANCELLED' || order.status === 'DELIVERED';

  const setStatus = async (status: string) => {
    setBusy(true);
    try {
      await adminFetch(`orders/${order.id}/status`, { method: 'PATCH', json: { status } });
      toast(`${order.orderNumber}: ${ORDER_STATUS[status]?.label ?? status}`);
      onChanged();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="vendor-card space-y-3 p-4" style={{ borderLeft: `4px solid ${storeColor(order.storeId)}` }}>
      <div className="flex flex-wrap items-center gap-2">
        <strong>{order.orderNumber}</strong>
        <span className="text-sm text-slate-500">de {order.storeName || 'Tienda'}</span>
        <span className="ml-auto"><StatusBadge status={order.status} /></span>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Para</p>
          <p className="font-semibold">{order.recipient.name}</p>
          <p className="flex items-start gap-1 text-slate-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{order.recipient.address}{order.recipient.reference ? ` · ${order.recipient.reference}` : ''}</p>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs font-semibold">
            <a href={`tel:${order.recipient.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 text-[#5b45fa]"><Phone className="h-3.5 w-3.5" />{order.recipient.phone}</a>
            {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-700"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Entrega</p>
          <p className="font-semibold">{order.deliveryAt ? `${dateOnly(order.deliveryAt)}, ${order.deliveryWindow ?? ''}` : 'Sin horario'}</p>
          <p className="text-slate-500">{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod} · {bs(order.total)} <span className="text-xs">(envío {bs(order.shippingFee)})</span></p>
          <p className="flex items-center gap-1 text-slate-500"><Truck className="h-3.5 w-3.5" />{order.driver ? `${order.driver.name}${order.driver.phone ? ` · ${order.driver.phone}` : ''}` : 'Sin repartidor asignado'}</p>
        </div>
      </div>

      {!compact && (
        <ul className="rounded-xl bg-[#f6f7fb] px-3 py-2 text-xs text-slate-600">
          {order.items.map((i, n) => <li key={n}>{i.quantity} × {i.title} — {bs(i.unitPrice * i.quantity)}</li>)}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">Pedido {dateTime(order.createdAt)}</span>
        {!closed && (
          <>
            <label htmlFor={`st-${order.id}`} className="sr-only">Cambiar estado</label>
            <select id={`st-${order.id}`} className="ml-auto h-9 rounded-xl border border-[#dce1ed] bg-white px-3 text-xs font-semibold" value={order.status} disabled={busy} onChange={(e) => setStatus(e.target.value)}>
              {!NEXT_STATUSES.includes(order.status) && <option value={order.status}>{ORDER_STATUS[order.status]?.label ?? order.status}</option>}
              {NEXT_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS[s].label}</option>)}
            </select>
            {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            <button type="button" className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50" onClick={() => setCancelling(true)}>Cancelar</button>
          </>
        )}
      </div>

      {cancelling && <CancelModal order={order} onClose={() => setCancelling(false)} onDone={() => { setCancelling(false); onChanged(); }} />}
    </article>
  );
}

function CancelModal({ order, onClose, onDone }: { order: AdminOrder; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminFetch(`orders/${order.id}/cancel`, { method: 'POST', json: { reason } });
      toast(`Pedido ${order.orderNumber} cancelado; el stock volvió a la tienda`);
      onDone();
    } catch (err) {
      toast((err as Error).message, 'error');
      setBusy(false);
    }
  };
  return (
    <Modal title={`Cancelar ${order.orderNumber}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">El pedido de {order.recipient.name} ({bs(order.total)}) se cancela y los productos vuelven al stock de {order.storeName}. Avisa al cliente por WhatsApp.</p>
        <div>
          <label htmlFor="cancel-reason" className="field-label">Motivo</label>
          <textarea id="cancel-reason" className="field min-h-20" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Volver</button>
          <button type="submit" className="btn flex-1 bg-rose-600 text-white hover:bg-rose-700" disabled={busy}>{busy && <Loader2 className="h-5 w-5 animate-spin" />}Cancelar pedido</button>
        </div>
      </form>
    </Modal>
  );
}
