'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Empty, ErrorBox, Loading, ORDER_STATUS, PageHeader, bs, useAdminData } from '@/components/admin/ui';
import { AdminOrder, AdminStore } from '@/components/admin/types';
import { OrderCard } from '@/components/admin/OrderCard';

const STATUS_FILTERS = ['', 'SCHEDULED', 'PREPARING', 'DSP_DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

function OrdersScreen() {
  const params = useSearchParams();
  const [status, setStatus] = useState('');
  const [storeId, setStoreId] = useState(params.get('storeId') ?? '');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');

  const path = useMemo(() => {
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    if (storeId) qs.set('storeId', storeId);
    // Dates are local Bolivian days; the API compares delivery times in UTC.
    if (from) qs.set('from', new Date(`${from}T00:00:00-04:00`).toISOString());
    if (to) qs.set('to', new Date(new Date(`${to}T00:00:00-04:00`).getTime() + 86_400_000).toISOString());
    if (query) qs.set('q', query);
    return `orders/overview${qs.size ? `?${qs}` : ''}`;
  }, [status, storeId, from, to, query]);

  const orders = useAdminData<AdminOrder[]>(path);
  const stores = useAdminData<AdminStore[]>('stores/overview');
  const total = (orders.data ?? []).filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader title="Pedidos" subtitle="Quién compró, a quién se entrega, cuándo y en qué estado está cada pedido." />

      <div className="vendor-card grid gap-3 p-4 md:grid-cols-4">
        <form className="relative md:col-span-2" onSubmit={(e) => { e.preventDefault(); setQuery(q.trim()); }}>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" className="field !pl-10" placeholder="N.º de pedido, nombre o celular del cliente" aria-label="Buscar pedidos" value={q} onChange={(e) => { setQ(e.target.value); if (!e.target.value) setQuery(''); }} />
        </form>
        <select className="field" aria-label="Tienda" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
          <option value="">Todas las tiendas</option>
          {(stores.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="field !px-2 text-xs" aria-label="Entrega desde" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" className="field !px-2 text-xs" aria-label="Entrega hasta" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-4">
          {STATUS_FILTERS.map((s) => (
            <button key={s || 'all'} type="button" className="chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s ? ORDER_STATUS[s].label : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {orders.loading ? (
        <Loading />
      ) : orders.error ? (
        <ErrorBox message={orders.error} onRetry={orders.reload} />
      ) : (orders.data ?? []).length === 0 ? (
        <Empty>No hay pedidos con esos filtros.</Empty>
      ) : (
        <>
          <p className="text-sm text-slate-500">{orders.data!.length} pedidos · {bs(total)} sin contar cancelados{orders.data!.length === 200 ? ' · se muestran los 200 más recientes' : ''}</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {orders.data!.map((o) => <OrderCard key={o.id} order={o} onChanged={orders.reload} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return <Suspense fallback={<Loading />}><OrdersScreen /></Suspense>;
}
