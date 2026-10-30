'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, QrCode } from 'lucide-react';
import { Badge, Card, Empty, ErrorBox, Loading, Modal, PageHeader, Stat, adminFetch, bs, dateTime, useAdminData } from '@/components/admin/ui';
import { useToast } from '@/context/ToastContext';
import { mediaUrl } from '@/lib/catalog';

interface PayoutRow {
  storeId: string;
  name: string;
  status: string;
  phone: string | null;
  deliveredOrders: number;
  storeOwed: number;
  storePaid: number;
  driverOwed: number;
  driverPaid: number;
  hasQr: boolean;
  payoutQr: string | null;
  bank: { bank?: string; account?: string; holder?: string; nit?: string; doc?: string } | null;
}

interface Payouts {
  totals: { storeOwed: number; driverOwed: number };
  stores: PayoutRow[];
  history: { id: string; kind: 'STORE' | 'DRIVER'; storeName: string; amount: number; method: string | null; reference: string | null; note: string | null; createdAt: string }[];
}

export default function AdminPayoutsPage() {
  const { data, error, loading, reload } = useAdminData<Payouts>('payouts');
  const [paying, setPaying] = useState<{ row: PayoutRow; kind: 'STORE' | 'DRIVER' } | null>(null);
  const [qr, setQr] = useState<PayoutRow | null>(null);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;
  const pending = data.stores.filter((r) => r.storeOwed > 0 || r.driverOwed > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader title="Pagos pendientes" subtitle="Lo que debes a cada tienda por sus ventas entregadas y al repartidor por los envíos. Registra cada pago al hacerlo." />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total a pagar a tiendas" value={bs(data.totals.storeOwed)} tone={data.totals.storeOwed > 0 ? 'red' : undefined} detail="Ventas entregadas menos comisión" />
        <Stat label="Total a pagar a repartidores" value={bs(data.totals.driverOwed)} tone={data.totals.driverOwed > 0 ? 'red' : undefined} detail="Envíos de pedidos entregados" />
      </div>

      <Card title={`Por pagar (${pending.length})`}>
        {pending.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Estás al día: no hay pagos pendientes.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.map((r) => (
              <div key={r.storeId} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 text-sm">
                <div className="min-w-48 flex-1">
                  <Link href={`/admin/tiendas/${r.storeId}`} className="font-bold hover:underline">{r.name}</Link>
                  <p className="text-xs text-slate-500">
                    {r.bank?.bank ? `${r.bank.bank} · ${r.bank.account ?? ''} · ${r.bank.holder ?? ''}` : 'Sin cuenta bancaria'}
                    {r.hasQr && <button type="button" className="ml-2 inline-flex items-center gap-1 font-semibold text-[#5b45fa]" onClick={() => setQr(r)}><QrCode className="h-3.5 w-3.5" />Ver QR</button>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Tienda</p>
                  <p className="font-bold">{bs(r.storeOwed)}</p>
                </div>
                <button type="button" className="btn btn-primary !min-h-9 text-xs" disabled={r.storeOwed <= 0} onClick={() => setPaying({ row: r, kind: 'STORE' })}>Pagar tienda</button>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Repartidor</p>
                  <p className="font-bold">{bs(r.driverOwed)}</p>
                </div>
                <button type="button" className="btn btn-ghost !min-h-9 text-xs" disabled={r.driverOwed <= 0} onClick={() => setPaying({ row: r, kind: 'DRIVER' })}>Pagar repartidor</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Historial de pagos">
        {data.history.length === 0 ? (
          <Empty>Todavía no registraste pagos.</Empty>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {data.history.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <Badge tone={p.kind === 'STORE' ? 'indigo' : 'amber'}>{p.kind === 'STORE' ? 'Tienda' : 'Repartidor'}</Badge>
                <strong>{p.storeName}</strong>
                <span>{bs(p.amount)}</span>
                <span className="text-slate-500">{[p.method, p.reference, p.note].filter(Boolean).join(' · ')}</span>
                <span className="ml-auto text-xs text-slate-500">{dateTime(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {paying && <PayModal {...paying} onClose={() => setPaying(null)} onDone={() => { setPaying(null); reload(); }} />}
      {qr && (
        <Modal title={`QR de cobro de ${qr.name}`} onClose={() => setQr(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl(qr.payoutQr)} alt={`QR de ${qr.name}`} className="mx-auto max-h-[60dvh] rounded-xl" />
        </Modal>
      )}
    </div>
  );
}

function PayModal({ row, kind, onClose, onDone }: { row: PayoutRow; kind: 'STORE' | 'DRIVER'; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const owed = kind === 'STORE' ? row.storeOwed : row.driverOwed;
  const [amount, setAmount] = useState(String(owed));
  const [method, setMethod] = useState('QR');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminFetch('payouts', { method: 'POST', json: { kind, storeId: row.storeId, amount: Number(amount), method, reference, note } });
      toast(`Pago de ${bs(Number(amount))} registrado`);
      onDone();
    } catch (err) {
      toast((err as Error).message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal title={kind === 'STORE' ? `Pago a ${row.name}` : `Pago al repartidor (${row.name})`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-600">Pendiente: <strong>{bs(owed)}</strong>. Registra el pago después de transferir; se descuenta de lo pendiente.</p>
        <div>
          <label htmlFor="pay-amount" className="field-label">Monto pagado (Bs)</label>
          <input id="pay-amount" className="field" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label htmlFor="pay-method" className="field-label">Cómo pagaste</label>
          <select id="pay-method" className="field" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="QR">QR</option>
            <option value="TRANSFERENCIA">Transferencia bancaria</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TIGO_MONEY">Tigo Money</option>
          </select>
        </div>
        <div>
          <label htmlFor="pay-ref" className="field-label">N.º de comprobante (opcional)</label>
          <input id="pay-ref" className="field" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
        <div>
          <label htmlFor="pay-note" className="field-label">Nota (opcional)</label>
          <input id="pay-note" className="field" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary flex-1" disabled={busy || !(Number(amount) > 0)}>{busy && <Loader2 className="h-5 w-5 animate-spin" />}Registrar pago</button>
        </div>
      </form>
    </Modal>
  );
}
