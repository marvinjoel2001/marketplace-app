'use client';

import { useState } from 'react';
import { ShoppingCart, Receipt, CircleDollarSign } from 'lucide-react';
import type { Order } from '@/lib/api';
import { formatBs } from '@/lib/utils';
import { boliviaDate, storeOrderTotal } from './useStoreOrders';

export function SalesOverview({ orders, storeId }: { orders: Order[]; storeId: string }) {
  const [period, setPeriod] = useState('7');
  const days = Number(period);
  const end = new Date(`${boliviaDate(new Date())}T12:00:00-04:00`);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const startDate = boliviaDate(start);
  const endDate = boliviaDate(end);
  const sales = orders.filter((o) => o.status !== 'CANCELLED' && boliviaDate(o.createdAt) >= startDate && boliviaDate(o.createdAt) <= endDate);
  const total = sales.reduce((sum, o) => sum + storeOrderTotal(o, storeId), 0);
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const from = new Date(start);
    from.setUTCDate(from.getUTCDate() + Math.floor(index * days / 7));
    const to = new Date(start);
    to.setUTCDate(to.getUTCDate() + Math.floor((index + 1) * days / 7) - 1);
    const fromKey = boliviaDate(from);
    const toKey = boliviaDate(to);
    return { label: from.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', timeZone: 'America/La_Paz' }), total: sales.filter((o) => boliviaDate(o.createdAt) >= fromKey && boliviaDate(o.createdAt) <= toKey).reduce((sum, o) => sum + storeOrderTotal(o, storeId), 0) };
  });
  const max = Math.max(1, ...buckets.map((b) => b.total));
  const metrics = [
    { label: 'Ventas registradas', value: formatBs(total), icon: ShoppingCart },
    { label: 'Pedidos', value: String(sales.length), icon: Receipt },
    { label: 'Promedio por pedido', value: formatBs(sales.length ? total / sales.length : 0), icon: CircleDollarSign },
  ];
  return <section className="vendor-card p-4" aria-labelledby="stats-title">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 id="stats-title" className="text-lg font-extrabold tracking-tight">Estadísticas de la tienda</h2><select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Periodo de estadísticas" className="rounded-xl border border-[#e5e8f1] bg-white px-3 py-2 text-xs"><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option></select></div>
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div><div className="vendor-chart" role="img" aria-label={`Ventas por periodo. ${buckets.map((b) => `${b.label}: ${formatBs(b.total)}`).join('; ')}`}>{buckets.map((b) => <div key={b.label} title={`${b.label}: ${formatBs(b.total)}`} className="group relative flex h-full items-end justify-center"><div className="w-full max-w-12 rounded-t-md bg-[#b8aaff] transition-all group-hover:bg-[#6545ff]" style={{ height: `${Math.max(2, b.total / max * 100)}%` }} /><span className="pointer-events-none absolute bottom-full hidden whitespace-nowrap rounded-lg bg-slate-900 p-2 text-[10px] text-white group-hover:block">{formatBs(b.total)}</span></div>)}</div><div className="mt-2 grid grid-cols-7 gap-3 text-center text-[10px] text-slate-500">{buckets.map((b) => <span key={b.label}>{b.label}</span>)}</div>{!sales.length && <p className="mt-3 text-xs text-slate-400">Tus ventas aparecerán aquí cuando recibas pedidos.</p>}</div>
      <dl className="flex flex-col justify-center gap-4">{metrics.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eeebff] text-[#6545ff]"><Icon className="h-4 w-4" /></span><dt className="flex-1 text-xs text-slate-500">{label}</dt><dd className="text-sm font-bold tabular-nums">{value}</dd></div>)}</dl>
    </div>
    <p className="mt-3 text-[10px] leading-4 text-slate-400">Importes de tus productos, sobre los últimos 100 pedidos. No incluyen envío ni pedidos cancelados; el pago se consulta en cada pedido.</p>
  </section>;
}

