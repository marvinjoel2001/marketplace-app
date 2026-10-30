'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, ExternalLink, Loader2, MessageCircle, ShieldCheck } from 'lucide-react';
import {
  BarChart, Badge, Card, ErrorBox, Loading, Modal, PAYMENT_LABEL, PageHeader, Stat, StatusBadge, adminFetch, bs, dateOnly, dateTime,
  useAdminData, whatsappLink,
} from '@/components/admin/ui';
import { AdminOrder, AdminStore, STORE_STATUS } from '@/components/admin/types';
import { useToast } from '@/context/ToastContext';

const PointsMap = dynamic(() => import('@/components/admin/PointsMap').then((m) => m.PointsMap), { ssr: false });

interface Detail {
  store: AdminStore;
  salesByDay: { date: string; orders: number; sales: number }[];
  orders: AdminOrder[];
  payouts: { id: string; kind: 'STORE' | 'DRIVER'; amount: number; method: string | null; reference: string | null; createdAt: string }[];
}

export default function AdminStoreDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, reload } = useAdminData<Detail>(`stores/${id}/detail`);
  const [statusModal, setStatusModal] = useState<AdminStore['status'] | null>(null);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;
  const { store } = data;
  const wa = whatsappLink(store.owner?.phone ?? store.phone);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Link href="/admin/tiendas" className="flex w-fit items-center gap-1 text-sm font-semibold text-slate-500"><ArrowLeft className="h-4 w-4" />Tiendas</Link>
      <PageHeader
        title={store.name}
        subtitle={`${store.category} · ${store.address}`}
        actions={
          <>
            <Badge tone={STORE_STATUS[store.status].tone}>{STORE_STATUS[store.status].label}</Badge>
            <a href={`/en-vivo/${store.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-10 text-xs"><ExternalLink className="h-4 w-4" />Ver tienda</a>
            {store.status !== 'ACTIVE' && <button type="button" className="btn btn-primary !min-h-10 text-xs" onClick={() => setStatusModal('ACTIVE')}>Reactivar</button>}
            {store.status !== 'SUSPENDED' && <button type="button" className="btn btn-ghost !min-h-10 text-xs" onClick={() => setStatusModal('SUSPENDED')}>Suspender</button>}
            {store.status !== 'BANNED' && <button type="button" className="btn btn-ghost !min-h-10 text-xs text-rose-600" onClick={() => setStatusModal('BANNED')}>Bloquear</button>}
          </>
        }
      />
      {store.statusReason && store.status !== 'ACTIVE' && (
        <p role="note" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Motivo: {store.statusReason}</p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Ventas" value={bs(store.sales)} detail={`${store.orders} pedidos · ${store.cancelledOrders} cancelados`} />
        <Stat label="En curso" value={store.inProgress} detail={`${store.deliveredOrders} entregados`} />
        <Stat label="Por pagar a la tienda" value={bs(store.walletBalance)} tone={store.walletBalance > 0 ? 'red' : undefined} detail="Ventas entregadas" />
        <Stat label="Por pagar al repartidor" value={bs(store.driverOwed)} tone={store.driverOwed > 0 ? 'red' : undefined} detail="Envíos entregados" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Ventas de los últimos 30 días">
          {data.salesByDay.some((d) => d.sales > 0) ? <BarChart data={data.salesByDay} valueKey="sales" format={bs} /> : <p className="py-10 text-center text-sm text-slate-500">Sin ventas en los últimos 30 días.</p>}
        </Card>
        <Card title="Dueño y contacto">
          {store.owner ? (
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-1.5 font-bold">{store.owner.name}{store.owner.phoneVerified && <ShieldCheck className="h-4 w-4 text-emerald-600" aria-label="Celular verificado" />}</p>
              <p className="text-slate-500">{store.owner.phone ?? 'Sin celular'} · entra con {store.owner.provider.toLowerCase()}</p>
              <p className="truncate text-slate-500">{store.owner.email}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Esta tienda no tiene un dueño vinculado.</p>
          )}
          <p className="mt-3 text-sm text-slate-500">Celular de la tienda: {store.phone ?? '—'}</p>
          {store.tiktokUsername && <p className="text-sm text-slate-500">TikTok: @{store.tiktokUsername}</p>}
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-4 w-full text-sm"><MessageCircle className="h-4 w-4" />Escribir por WhatsApp</a>}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StoreConfig store={store} onSaved={reload} />
        <Card title="Ubicación">
          <PointsMap className="h-[300px]" points={[{ id: store.id, lat: store.latitude, lng: store.longitude, label: store.name, detail: store.address }]} />
        </Card>
      </div>

      <Card title="Pedidos de la tienda" action={<Link href={`/admin/pedidos?storeId=${store.id}`} className="text-xs font-semibold text-[#5b45fa]">Gestionar pedidos</Link>}>
        {data.orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Esta tienda todavía no recibió pedidos.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.orders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                <strong>{o.orderNumber}</strong>
                <span className="text-slate-500">para {o.recipient.name} · {o.recipient.phone}</span>
                <span className="text-slate-500">entrega {o.deliveryAt ? `${dateOnly(o.deliveryAt)} ${o.deliveryWindow ?? ''}` : '—'}</span>
                <span className="ml-auto font-semibold">{bs(o.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Pagos registrados" action={<Link href="/admin/pagos" className="text-xs font-semibold text-[#5b45fa]">Registrar un pago</Link>}>
        {data.payouts.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">Todavía no registraste pagos para esta tienda.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {data.payouts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <Badge tone={p.kind === 'STORE' ? 'indigo' : 'amber'}>{p.kind === 'STORE' ? 'A la tienda' : 'Al repartidor'}</Badge>
                <strong>{bs(p.amount)}</strong>
                <span className="text-slate-500">{[p.method, p.reference].filter(Boolean).join(' · ')}</span>
                <span className="ml-auto text-xs text-slate-500">{dateTime(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {statusModal && <StatusModal store={store} status={statusModal} onClose={() => setStatusModal(null)} onSaved={() => { setStatusModal(null); reload(); }} />}
    </div>
  );
}

function StoreConfig({ store, onSaved }: { store: AdminStore; onSaved: () => void }) {
  const toast = useToast();
  const [methods, setMethods] = useState<string[]>(store.paymentMethods);
  const [custom, setCustom] = useState(store.rates.custom);
  const [baseFare, setBaseFare] = useState(String(store.rates.baseFare));
  const [perKm, setPerKm] = useState(String(store.rates.perKm));
  const [commission, setCommission] = useState(store.customCommissionRate === null ? '' : String(store.customCommissionRate));
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminFetch(`stores/${store.id}/config`, {
        method: 'PATCH',
        json: {
          paymentMethods: methods,
          shippingBaseFare: custom ? Number(baseFare) : null,
          shippingPerKm: custom ? Number(perKm) : null,
          customCommissionRate: commission.trim() === '' ? null : Number(commission),
        },
      });
      toast('Configuración guardada');
      onSaved();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggle = (m: string) => setMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  return (
    <Card title="Configuración de la tienda">
      <form onSubmit={save} className="space-y-5">
        <fieldset>
          <legend className="field-label">Métodos de pago que puede ofrecer</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PAYMENT_LABEL).map(([key, label]) => (
              <button key={key} type="button" className="chip" aria-pressed={methods.includes(key)} onClick={() => toggle(key)}>{label}</button>
            ))}
          </div>
          {methods.length === 0 && <p className="mt-2 text-xs text-rose-600">Deja al menos un método activo.</p>}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="field-label">Tarifa del repartidor para esta tienda</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={custom} onChange={(e) => setCustom(e.target.checked)} className="h-4 w-4 accent-[#5b45fa]" />
            Usar una tarifa propia (si no, se usa la tarifa general)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cfg-base" className="text-xs font-semibold text-slate-500">Base por envío (Bs)</label>
              <input id="cfg-base" className="field" inputMode="decimal" disabled={!custom} value={baseFare} onChange={(e) => setBaseFare(e.target.value)} />
            </div>
            <div>
              <label htmlFor="cfg-km" className="text-xs font-semibold text-slate-500">Por kilómetro (Bs)</label>
              <input id="cfg-km" className="field" inputMode="decimal" disabled={!custom} value={perKm} onChange={(e) => setPerKm(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Ejemplo con 4 km: {bs(Math.round(Number(baseFare || 0) + 4 * Number(perKm || 0)))} de envío.</p>
        </fieldset>

        <div>
          <label htmlFor="cfg-commission" className="field-label">Comisión de Vitrina (%)</label>
          <input id="cfg-commission" className="field" inputMode="decimal" placeholder="Vacío = comisión general (5 %)" value={commission} onChange={(e) => setCommission(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={busy || methods.length === 0}>
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}Guardar configuración
        </button>
      </form>
    </Card>
  );
}

const STATUS_COPY: Record<AdminStore['status'], { title: string; text: string; button: string }> = {
  ACTIVE: { title: 'Reactivar tienda', text: 'La tienda vuelve a aparecer en Vitrina y puede recibir pedidos.', button: 'Reactivar' },
  SUSPENDED: { title: 'Suspender tienda', text: 'La tienda deja de recibir pedidos y se cierra su live. Puedes reactivarla cuando quieras.', button: 'Suspender' },
  BANNED: { title: 'Bloquear tienda', text: 'La tienda queda fuera de Vitrina: no recibe pedidos ni aparece en los lives.', button: 'Bloquear' },
};

function StatusModal({ store, status, onClose, onSaved }: { store: AdminStore; status: AdminStore['status']; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const copy = STATUS_COPY[status];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminFetch(`stores/${store.id}/config`, { method: 'PATCH', json: { status, statusReason: reason.trim() || null } });
      toast(`${store.name}: ${STORE_STATUS[status].label.toLowerCase()}`);
      onSaved();
    } catch (err) {
      toast((err as Error).message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal title={copy.title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">{copy.text}</p>
        {status !== 'ACTIVE' && (
          <div>
            <label htmlFor="status-reason" className="field-label">Motivo (lo verás en el panel)</label>
            <textarea id="status-reason" className="field min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej.: reclamos de clientes por pedidos no entregados" />
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancelar</button>
          <button type="submit" className={`btn flex-1 ${status === 'BANNED' ? 'bg-rose-600 text-white hover:bg-rose-700' : 'btn-primary'}`} disabled={busy}>
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}{copy.button}
          </button>
        </div>
      </form>
    </Modal>
  );
}
