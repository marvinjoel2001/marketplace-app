'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { List, Map as MapIcon, Search, ShieldCheck, Store as StoreIcon } from 'lucide-react';
import { Badge, Empty, ErrorBox, Loading, PageHeader, bs, dateOnly, useAdminData } from '@/components/admin/ui';
import { AdminStore, STORE_STATUS, storeColor } from '@/components/admin/types';
import { mediaUrl } from '@/lib/catalog';

const PointsMap = dynamic(() => import('@/components/admin/PointsMap').then((m) => m.PointsMap), { ssr: false });

const FILTERS = [
  { key: '', label: 'Todas' },
  { key: 'ACTIVE', label: 'Activas' },
  { key: 'SUSPENDED', label: 'Suspendidas' },
  { key: 'BANNED', label: 'Bloqueadas' },
];

export default function AdminStoresPage() {
  const { data, error, loading, reload } = useAdminData<AdminStore[]>('stores/overview');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');

  const stores = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (s) =>
        (!status || s.status === status) &&
        (!term || [s.name, s.category, s.address, s.owner?.name, s.owner?.phone, s.tiktokUsername].some((v) => v?.toLowerCase().includes(term))),
    );
  }, [data, q, status]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        title="Tiendas registradas"
        subtitle={`${data.length} tiendas · ${data.filter((s) => s.status === 'ACTIVE').length} activas`}
        actions={
          <div className="flex rounded-xl bg-white p-1" role="group" aria-label="Vista">
            <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${view === 'list' ? 'bg-[#5b45fa] text-white' : ''}`}><List className="h-4 w-4" />Lista</button>
            <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${view === 'map' ? 'bg-[#5b45fa] text-white' : ''}`}><MapIcon className="h-4 w-4" />Mapa</button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" className="field !pl-10" placeholder="Buscar por tienda, dueño, celular o dirección" aria-label="Buscar tiendas" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {FILTERS.map((f) => (
          <button key={f.key} type="button" className="chip" aria-pressed={status === f.key} onClick={() => setStatus(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {view === 'map' ? (
        <PointsMap
          className="h-[560px]"
          points={stores.map((s) => ({
            id: s.id,
            lat: s.latitude,
            lng: s.longitude,
            label: s.name,
            detail: `${STORE_STATUS[s.status].label} · ${s.address} · ${bs(s.sales)}`,
            color: s.status === 'ACTIVE' ? storeColor(s.id) : '#94a3b8',
            href: `/admin/tiendas/${s.id}`,
          }))}
        />
      ) : stores.length === 0 ? (
        <Empty>No hay tiendas con ese filtro.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stores.map((s) => (
            <Link key={s.id} href={`/admin/tiendas/${s.id}`} className="vendor-card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eeebff] text-[#5b45fa]">
                  {s.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(s.logo)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <StoreIcon className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{s.name}</p>
                  <p className="truncate text-xs text-slate-500">{s.category} · desde {dateOnly(s.createdAt)}</p>
                </div>
                <Badge tone={STORE_STATUS[s.status].tone}>{STORE_STATUS[s.status].label}</Badge>
              </div>
              <p className="truncate text-xs text-slate-500">{s.address}</p>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f6f7fb] p-3 text-center">
                <span><strong className="block text-sm">{bs(s.sales)}</strong><span className="text-[11px] text-slate-500">ventas</span></span>
                <span><strong className="block text-sm">{s.orders}</strong><span className="text-[11px] text-slate-500">pedidos</span></span>
                <span><strong className="block text-sm">{s.products}</strong><span className="text-[11px] text-slate-500">productos</span></span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 truncate text-slate-600">
                  {s.owner?.phoneVerified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-label="Celular verificado" />}
                  {s.owner?.name ?? 'Sin dueño vinculado'}
                </span>
                {s.walletBalance + s.driverOwed > 0 && <span className="font-semibold text-rose-600">Debes {bs(s.walletBalance + s.driverOwed)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
