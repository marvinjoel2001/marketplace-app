'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Badge, Card, ErrorBox, Loading, PageHeader, adminFetch, bs, useAdminData } from '@/components/admin/ui';
import { AdminStore, ShippingRates } from '@/components/admin/types';
import { useToast } from '@/context/ToastContext';

const price = (km: number, r: { baseFare: number; perKm: number; minDistanceKm: number }) => Math.round(r.baseFare + Math.max(r.minDistanceKm, km) * r.perKm);

export default function AdminRatesPage() {
  const toast = useToast();
  const rates = useAdminData<ShippingRates>('shipping');
  const stores = useAdminData<AdminStore[]>('stores/overview');
  const [form, setForm] = useState({ baseFare: '', perKm: '', minDistanceKm: '' });
  const [km, setKm] = useState('4');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Fill the form once the saved tariff arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (rates.data) setForm({ baseFare: String(rates.data.baseFare), perKm: String(rates.data.perKm), minDistanceKm: String(rates.data.minDistanceKm) });
  }, [rates.data]);

  if (rates.loading) return <Loading />;
  if (rates.error || !rates.data) return <ErrorBox message={rates.error || 'Sin datos'} onRetry={rates.reload} />;

  const draft = { baseFare: Number(form.baseFare) || 0, perKm: Number(form.perKm) || 0, minDistanceKm: Number(form.minDistanceKm) || 0 };
  const custom = (stores.data ?? []).filter((s) => s.rates.custom);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminFetch('shipping', { method: 'PUT', json: draft });
      toast('Tarifa general guardada: se aplica a los próximos pedidos');
      rates.reload();
      stores.reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader title="Tarifas de envío" subtitle="Lo que cobra el repartidor. Con esta tarifa se calcula el envío que paga el cliente al hacer su pedido." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Tarifa general">
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="r-base" className="text-xs font-semibold text-slate-500">Base por envío (Bs)</label>
                <input id="r-base" className="field" inputMode="decimal" value={form.baseFare} onChange={(e) => setForm({ ...form, baseFare: e.target.value })} />
              </div>
              <div>
                <label htmlFor="r-km" className="text-xs font-semibold text-slate-500">Por km (Bs)</label>
                <input id="r-km" className="field" inputMode="decimal" value={form.perKm} onChange={(e) => setForm({ ...form, perKm: e.target.value })} />
              </div>
              <div>
                <label htmlFor="r-min" className="text-xs font-semibold text-slate-500">Km mínimos</label>
                <input id="r-min" className="field" inputMode="decimal" value={form.minDistanceKm} onChange={(e) => setForm({ ...form, minDistanceKm: e.target.value })} />
              </div>
            </div>
            <p className="text-xs text-slate-500">Envío = base + km × tarifa por km. Si la entrega está más cerca que los km mínimos, se cobran los km mínimos. La distancia es en línea recta entre la tienda y el cliente.</p>
            <button type="submit" className="btn btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-5 w-5 animate-spin" />}Guardar tarifa general</button>
          </form>
        </Card>

        <Card title="Simulador">
          <label htmlFor="sim-km" className="field-label">Distancia de la entrega (km)</label>
          <input id="sim-km" className="field" inputMode="decimal" value={km} onChange={(e) => setKm(e.target.value)} />
          <p className="mt-4 text-sm text-slate-500">Con la tarifa general el cliente paga</p>
          <p className="text-3xl font-extrabold">{bs(price(Number(km) || 0, draft))}</p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            {[1, 3, 5, 10].map((d) => (
              <span key={d} className="rounded-xl bg-[#f6f7fb] p-2"><strong className="block text-sm">{bs(price(d, draft))}</strong>{d} km</span>
            ))}
          </div>
        </Card>
      </div>

      <Card title={`Tiendas con tarifa propia (${custom.length})`}>
        <p className="mb-3 text-sm text-slate-500">Para dar una tarifa distinta a una tienda, ábrela y cambia “Tarifa del repartidor para esta tienda”.</p>
        {stores.loading ? (
          <Loading />
        ) : custom.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">Todas las tiendas usan la tarifa general.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {custom.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <Link href={`/admin/tiendas/${s.id}`} className="font-semibold hover:underline">{s.name}</Link>
                <Badge tone="indigo">{bs(s.rates.baseFare)} + {bs(s.rates.perKm)}/km</Badge>
                <span className="ml-auto text-xs text-slate-500">4 km = {bs(price(4, { ...rates.data!, ...s.rates }))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
