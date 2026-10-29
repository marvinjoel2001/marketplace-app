'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package, Plus, Search, EllipsisVertical, Pencil } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { useToast } from '@/context/ToastContext';
import { marketplaceApi } from '@/lib/api';
import { isPromoActive, offerPrice, productImages } from '@/lib/catalog';
import { formatBs } from '@/lib/utils';
import { Sheet } from '@/components/shop/Sheet';
import { ProductForm } from './ProductForm';
import { useStoreOffers, type StoreOffer } from './useStoreOffers';
import { Bone } from '@/components/shop/Skeleton';

const FILTERS = [
  { key: 'all', label: 'Todos', matches: () => true },
  { key: 'available', label: 'Disponibles', matches: (o: StoreOffer) => o.stock > 0 && o.isActive },
  { key: 'empty', label: 'Sin stock', matches: (o: StoreOffer) => o.stock === 0 },
  { key: 'promo', label: 'En promoción', matches: (o: StoreOffer) => isPromoActive(o) },
] as const;

export function ProductCatalog({ compact = false, initialQuery = '', createInitially = false, onCloseCreate, onChanged }: { compact?: boolean; initialQuery?: string; createInitially?: boolean; onCloseCreate?: () => void; onChanged?: () => void }) {
  const { store } = useVendor();
  const toast = useToast();
  const { offers, error, reload, setOffers } = useStoreOffers(store.id);
  const [creating, setCreating] = useState(createInitially);
  const [editing, setEditing] = useState<StoreOffer | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const rule = FILTERS.find((f) => f.key === filter)!;
  const filtered = (offers ?? []).filter((o) => rule.matches(o) && o.product.title.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')));
  const list = compact ? filtered.slice(0, 5) : filtered;
  const closeCreate = () => { setCreating(false); onCloseCreate?.(); };
  const saved = () => { reload(); onChanged?.(); };

  const toggleVisible = async (offer: StoreOffer) => {
    if (busy.has(offer.id)) return;
    setBusy((prev) => new Set(prev).add(offer.id));
    try {
      await marketplaceApi.updateOffer(store.id, offer.id, { isActive: !offer.isActive });
      setOffers((prev) => prev && prev.map((o) => o.id === offer.id ? { ...o, isActive: !offer.isActive } : o));
      onChanged?.();
      toast(offer.isActive ? 'Producto oculto de la tienda' : 'Producto publicado en tu tienda');
    } catch (err) { toast((err as Error).message, 'error'); }
    finally { setBusy((prev) => { const next = new Set(prev); next.delete(offer.id); return next; }); }
  };

  return <section className="vendor-card p-4 sm:p-5" aria-labelledby="catalog-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="catalog-title" className="text-lg font-extrabold tracking-tight">Productos</h2>
      <div className="flex items-center gap-4">{compact && <Link href="/vendor/productos" className="hidden items-center gap-1.5 text-xs font-semibold text-[#5b45fa] sm:flex">Ver todos<ArrowRight className="h-4 w-4" /></Link>}<button type="button" onClick={() => setCreating(true)} className="btn btn-primary !min-h-10 !px-3 !text-xs"><Plus className="h-4 w-4" />Subir producto</button></div>
    </div>
    <div className="my-3 flex flex-wrap items-center gap-3">
      <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filtrar productos">{FILTERS.map((f) => <button key={f.key} type="button" className="chip !min-h-9 !px-3 !text-[11px]" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}{offers && ` (${offers.filter(f.matches).length})`}</button>)}</div>
      <div className="relative min-w-[140px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar producto" placeholder="Buscar producto..." className="h-10 w-full rounded-xl border border-[#dce1ed] bg-[#fafbfe] pl-9 pr-3 text-xs outline-none" /></div>
    </div>
    {error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">No pudimos cargar tus productos. <button className="ml-2 font-bold underline" onClick={reload}>Reintentar</button></div> : offers === null ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <Bone key={i} className="h-56 rounded-2xl" />)}</div> : list.length === 0 ? <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-[#fafbfe] px-5 py-8 text-center"><Package className="mb-3 h-8 w-8 text-[#9b8fea]" /><p className="text-sm font-semibold">{offers.length ? 'No encontramos productos con este filtro' : 'Tu primera venta empieza con un producto'}</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{offers.length ? 'Prueba con otro nombre o elige otra categoría.' : 'Sube una foto, agrega el precio y la cantidad disponible.'}</p>{offers.length ? <button onClick={() => { setQuery(''); setFilter('all'); }} className="mt-3 text-xs font-semibold text-[#5b45fa]">Limpiar filtros</button> : <button className="btn btn-primary mt-4 !min-h-10 !text-xs" onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Subir mi primer producto</button>}</div> : <ul className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${compact ? 'xl:grid-cols-5' : 'xl:grid-cols-4 2xl:grid-cols-5'}`}>
      {list.map((o) => <li key={o.id} className="relative min-w-0 overflow-hidden rounded-2xl border border-[#e8eaf2] bg-[#fdfdff]">
        <button type="button" onClick={() => setEditing(o)} className="block w-full text-left" aria-label={`Editar ${o.product.title}`}><div className="vendor-product-image">{productImages(o.product)[0] ? <Image unoptimized width={640} height={640} src={productImages(o.product)[0]} alt={o.product.title} loading="lazy" /> : <div className="flex h-full items-center justify-center"><Package className="h-9 w-9 text-slate-300" /></div>}</div><div className="px-2.5 pb-1 pt-3"><p className="truncate text-xs font-bold">{o.product.title}</p><p className="mt-1 text-sm font-extrabold">{formatBs(offerPrice(o))}</p><p className={`mt-1 flex items-center gap-1 text-[10px] ${o.stock ? 'text-slate-600' : 'text-rose-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${o.stock ? 'bg-emerald-500' : 'bg-rose-500'}`} />{o.stock} en stock</p></div></button>
        <button type="button" onClick={() => setEditing(o)} aria-label={`Opciones de ${o.product.title}`} className="absolute right-2 top-2 rounded-lg bg-white/95 p-1 shadow-sm"><EllipsisVertical className="h-4 w-4" /></button>
        <div className="flex items-center gap-2 px-2.5 pb-3 pt-2"><button type="button" role="switch" aria-checked={o.isActive} aria-label={`Publicar ${o.product.title}`} disabled={busy.has(o.id)} onClick={() => toggleVisible(o)} className="vendor-toggle disabled:opacity-50" /><span className="text-[10px] text-slate-600">{busy.has(o.id) ? 'Guardando…' : o.isActive ? 'Publicado' : 'Oculto'}</span><button className="ml-auto text-slate-400 hover:text-indigo-600" onClick={() => setEditing(o)} aria-label={`Cambiar precio y stock de ${o.product.title}`}><Pencil className="h-3 w-3" /></button></div>
      </li>)}
    </ul>}
    {compact && filtered.length > 5 && <Link href="/vendor/productos" className="mt-4 block text-center text-xs font-semibold text-[#5b45fa]">Ver los {filtered.length} productos<ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>}
    <Sheet open={creating} onClose={closeCreate} title="Subir producto"><ProductForm storeId={store.id} onSaved={() => { closeCreate(); saved(); }} /></Sheet>
    <Sheet open={Boolean(editing)} onClose={() => setEditing(null)} title="Editar producto">{editing && <ProductForm key={editing.id} storeId={store.id} editing={editing} onSaved={() => { setEditing(null); saved(); }} />}</Sheet>
  </section>;
}


