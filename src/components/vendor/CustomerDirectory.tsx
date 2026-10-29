'use client';

import { useState } from 'react';
import { MessageCircle, Phone, Search, Users } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { formatBs } from '@/lib/utils';
import { ListSkeleton } from '@/components/shop/Skeleton';
import { storeOrderTotal, useStoreOrders } from './useStoreOrders';

export function CustomerDirectory({ messages = false }: { messages?: boolean }) {
  const { store, unseenSales } = useVendor();
  const { orders, error, reload } = useStoreOrders(store.id, unseenSales);
  const [query, setQuery] = useState('');
  const customers = new Map<string, { name: string; phone: string; count: number; total: number; lastOrder: string }>();
  for (const order of [...(orders ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const phone = order.customerPhone.replace(/\D/g, '');
    const key = phone || order.customerName;
    const previous = customers.get(key);
    customers.set(key, { name: previous?.name ?? order.customerName, phone, count: (previous?.count ?? 0) + 1, total: (previous?.total ?? 0) + (order.status === 'CANCELLED' ? 0 : storeOrderTotal(order, store.id)), lastOrder: previous?.lastOrder ?? order.orderNumber });
  }
  const list = [...customers.values()].filter((c) => `${c.name} ${c.phone}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es').trim()));
  return <div className="mx-auto max-w-6xl space-y-5">
    <div><h1 className="text-2xl font-extrabold tracking-tight">{messages ? 'Mensajes y contacto' : 'Tus clientes'}</h1><p className="mt-2 text-sm text-slate-500">{messages ? 'Coordina los pedidos con tus clientes por WhatsApp o llamada.' : 'Consulta quiénes compraron en tu tienda y el historial de sus compras.'}</p></div>
    <section className="vendor-card p-5"><div className="mb-5 flex flex-wrap items-center justify-between gap-4"><h2 className="font-bold">{customers.size} {customers.size === 1 ? 'cliente' : 'clientes'}</h2><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o celular" aria-label="Buscar cliente" className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs" /></div></div>
    {error ? <p role="alert" className="text-sm text-red-600">No pudimos cargar tus clientes. <button onClick={reload} className="font-bold underline">Reintentar</button></p> : !orders ? <ListSkeleton rows={3} /> : !list.length ? <div className="py-14 text-center"><Users className="mx-auto mb-3 h-9 w-9 text-[#afa1e2]" /><p className="text-sm font-semibold">{customers.size ? 'No encontramos ese cliente' : 'Tus clientes aparecerán con tu primera venta'}</p><p className="mt-2 text-xs text-slate-500">{customers.size ? 'Prueba otro nombre o número de celular.' : 'Cada pedido agrega el contacto del comprador a tu tienda.'}</p></div> : <ul className="divide-y divide-[#edf0f6]">{list.map((c) => {
      const phone = c.phone.length === 8 ? `591${c.phone}` : c.phone;
      return <li key={c.phone || c.name} className="flex flex-wrap items-center gap-4 py-5"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eeebff] text-[#6248ff]"><Users className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{c.name}</p><p className="mt-1 text-xs text-slate-500">{c.phone || 'Sin teléfono'} · {c.count} {c.count === 1 ? 'pedido' : 'pedidos'}</p>{messages && <p className="mt-1 text-xs text-slate-400">Último pedido: #{c.lastOrder}</p>}</div><div className="text-right"><p className="text-sm font-bold">{formatBs(c.total)}</p><p className="mt-1 text-[10px] text-slate-400">Compras registradas</p></div>{phone && <div className="flex gap-2"><a href={`tel:+${phone}`} className="btn btn-ghost !min-h-10 !px-3 !text-xs" aria-label={`Llamar a ${c.name}`}><Phone className="h-4 w-4" /><span className="hidden sm:inline">Llamar</span></a><a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary !min-h-10 !px-3 !text-xs" aria-label={`Contactar a ${c.name} por WhatsApp`}><MessageCircle className="h-4 w-4" />WhatsApp</a></div>}</li>;
    })}</ul>}
    {messages && <p className="mt-4 rounded-xl bg-[#f5f3fb] p-3 text-xs leading-5 text-slate-500">Los mensajes se abren en WhatsApp. El historial de conversaciones se consulta en esa aplicación.</p>}
    </section>
  </div>;
}
