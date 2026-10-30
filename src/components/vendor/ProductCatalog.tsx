'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Copy, EllipsisVertical, Loader2, Minus, Package, Pencil, Plus, Search, Truck } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { useToast } from '@/context/ToastContext';
import { marketplaceApi } from '@/lib/api';
import { isPromoActive, offerPrice, productImages } from '@/lib/catalog';
import { isStale, parseVariants } from '@/lib/variants';
import { formatBs } from '@/lib/utils';
import { Sheet } from '@/components/shop/Sheet';
import { QuickUpload, type UploadMode } from './upload/QuickUpload';
import { Stepper } from './upload/DraftEditor';
import { useStoreOffers, type StoreOffer } from './useStoreOffers';
import { Bone } from '@/components/shop/Skeleton';

const FILTERS = [
  { key: 'all', label: 'Todos', matches: () => true },
  { key: 'available', label: 'Disponibles', matches: (o: StoreOffer) => o.stock > 0 && o.isActive },
  { key: 'empty', label: 'Agotados', matches: (o: StoreOffer) => o.stock === 0 },
  { key: 'promo', label: 'En promoción', matches: (o: StoreOffer) => isPromoActive(o) },
] as const;

export function ProductCatalog({ compact = false, initialQuery = '', createInitially = false, onCloseCreate, onChanged }: { compact?: boolean; initialQuery?: string; createInitially?: boolean; onCloseCreate?: () => void; onChanged?: () => void }) {
  const { store } = useVendor();
  const toast = useToast();
  const { offers, error, reload, setOffers } = useStoreOffers(store.id);
  const [upload, setUpload] = useState<UploadMode | null>(createInitially ? { kind: 'create' } : null);
  const [actionsFor, setActionsFor] = useState<StoreOffer | null>(null);
  const [checking, setChecking] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const rule = FILTERS.find((f) => f.key === filter)!;
  const filtered = (offers ?? []).filter((o) => rule.matches(o) && o.product.title.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')));
  const list = compact ? filtered.slice(0, 5) : filtered;
  const stale = (offers ?? []).filter((o) => isStale(o));

  const closeUpload = () => {
    if (upload?.kind === 'create') onCloseCreate?.();
    setUpload(null);
  };
  const changed = () => { reload(); onChanged?.(); };
  const replace = (next: StoreOffer) => setOffers((prev) => prev && prev.map((o) => (o.id === next.id ? { ...o, ...next, product: { ...o.product, ...next.product } } : o)));
  const withBusy = async (id: string, action: () => Promise<void>) => {
    if (busy.has(id)) return;
    setBusy((prev) => new Set(prev).add(id));
    try { await action(); } catch (err) { toast((err as Error).message, 'error'); }
    finally { setBusy((prev) => { const next = new Set(prev); next.delete(id); return next; }); }
  };

  const toggleVisible = (offer: StoreOffer) => withBusy(offer.id, async () => {
    await marketplaceApi.updateOffer(store.id, offer.id, { isActive: !offer.isActive });
    setOffers((prev) => prev && prev.map((o) => o.id === offer.id ? { ...o, isActive: !offer.isActive } : o));
    onChanged?.();
    toast(offer.isActive ? 'Producto oculto de la tienda' : 'Producto publicado en tu tienda');
  });

  const adjust = (offer: StoreOffer, change: number, variant?: string) => withBusy(offer.id, async () => {
    const next = await marketplaceApi.adjustStock(store.id, offer.id, { change, variant });
    replace(next as StoreOffer);
    setActionsFor((open) => (open?.id === offer.id ? { ...open, ...next, product: open.product } : open));
    onChanged?.();
    if (change < 0) toast(next.stock === 0 ? 'Vendido. Se agotó y lo ocultamos de tu tienda' : `Vendido. Te quedan ${next.stock}`);
    else toast(`Listo, ahora tienes ${next.stock}`);
  });

  const soldOne = (offer: StoreOffer) => (parseVariants(offer).length ? setActionsFor(offer) : adjust(offer, -1));

  return <section className="vendor-card p-4 sm:p-5" aria-labelledby="catalog-title">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="catalog-title" className="text-lg font-extrabold tracking-tight">Productos</h2>
      <div className="flex items-center gap-4">{compact && <Link href="/vendor/productos" className="hidden items-center gap-1.5 text-xs font-semibold text-[#5b45fa] sm:flex">Ver todos<ArrowRight className="h-4 w-4" /></Link>}<button type="button" onClick={() => setUpload({ kind: 'create' })} className="btn btn-primary !min-h-10 !px-3 !text-xs"><Plus className="h-4 w-4" />Subir producto</button></div>
    </div>

    {stale.length > 0 && !compact && (
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-[#f6f5ff] px-4 py-3">
        <p className="min-w-0 flex-1 text-sm"><strong>¿Sigues teniendo {stale.length === 1 ? 'este producto' : `estos ${stale.length} productos`}?</strong> <span className="text-slate-600">No los revisas hace más de dos semanas.</span></p>
        <button type="button" className="btn btn-ghost !min-h-10 !px-4 !text-xs" onClick={() => setChecking(true)}>Revisar</button>
      </div>
    )}

    <div className="my-3 flex flex-wrap items-center gap-3">
      <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filtrar productos">{FILTERS.map((f) => <button key={f.key} type="button" className="chip !min-h-9 !px-3 !text-[11px]" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}{offers && ` (${offers.filter(f.matches).length})`}</button>)}</div>
      <div className="relative min-w-[140px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar producto" placeholder="Buscar producto..." className="h-10 w-full rounded-xl border border-[#dce1ed] bg-[#fafbfe] pl-9 pr-3 text-xs outline-none" /></div>
    </div>
    {error ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">No pudimos cargar tus productos. <button className="ml-2 font-bold underline" onClick={reload}>Reintentar</button></div> : offers === null ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <Bone key={i} className="h-56 rounded-2xl" />)}</div> : list.length === 0 ? <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-[#fafbfe] px-5 py-8 text-center"><Package className="mb-3 h-8 w-8 text-[#9b8fea]" /><p className="text-sm font-semibold">{offers.length ? 'No encontramos productos con este filtro' : 'Tu primera venta empieza con una foto'}</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{offers.length ? 'Prueba con otro nombre o elige otro filtro.' : 'Toma la foto, revisa el precio y publícalo.'}</p>{offers.length ? <button onClick={() => { setQuery(''); setFilter('all'); }} className="mt-3 text-xs font-semibold text-[#5b45fa]">Limpiar filtros</button> : <button className="btn btn-primary mt-4 !min-h-10 !text-xs" onClick={() => setUpload({ kind: 'create' })}><Plus className="h-4 w-4" />Subir mi primer producto</button>}</div> : <ul className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${compact ? 'xl:grid-cols-5' : 'xl:grid-cols-4 2xl:grid-cols-5'}`}>
      {list.map((o) => {
        const variants = parseVariants(o);
        const working = busy.has(o.id);
        return <li key={o.id} className="relative min-w-0 overflow-hidden rounded-2xl border border-[#e8eaf2] bg-[#fdfdff]">
          <button type="button" onClick={() => setActionsFor(o)} className="block w-full text-left" aria-label={`Opciones de ${o.product.title}`}>
            <div className="vendor-product-image relative">{productImages(o.product)[0] ? <Image unoptimized width={640} height={640} src={productImages(o.product)[0]} alt={o.product.title} loading="lazy" /> : <div className="flex h-full items-center justify-center"><Package className="h-9 w-9 text-slate-300" /></div>}{o.product.bulky && <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-amber-700"><Truck className="h-3 w-3" />No entra en moto</span>}</div>
            <div className="px-2.5 pb-1 pt-3"><p className="truncate text-xs font-bold">{o.product.title}</p><p className="mt-1 text-sm font-extrabold">{formatBs(offerPrice(o))}</p><p className={`mt-1 flex items-center gap-1 text-[10px] ${o.stock ? 'text-slate-600' : 'text-rose-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${o.stock ? 'bg-emerald-500' : 'bg-rose-500'}`} />{o.stock === 0 ? 'Agotado' : variants.length ? `${o.stock} en ${variants.filter((v) => v.stock > 0).length} ${(o.variantAxis || 'opciones').toLowerCase()}` : o.stock === 1 ? 'Queda 1' : `${o.stock} en stock`}</p></div>
          </button>
          <span aria-hidden className="pointer-events-none absolute right-2 top-2 rounded-lg bg-white/95 p-1 shadow-sm"><EllipsisVertical className="h-4 w-4" /></span>
          <div className="flex items-center gap-2 px-2.5 pb-3 pt-2">
            <button type="button" role="switch" aria-checked={o.isActive} aria-label={`Publicar ${o.product.title}`} disabled={working} onClick={() => toggleVisible(o)} className="vendor-toggle disabled:opacity-50" />
            {o.stock > 0 ? <button type="button" disabled={working} onClick={() => soldOne(o)} className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-lg bg-[#eeebff] px-2.5 text-[11px] font-semibold text-[#5034ef] disabled:opacity-50">{working ? <Loader2 className="h-3 w-3 animate-spin" /> : <Minus className="h-3 w-3" />}Vendí una</button> : <button type="button" disabled={working} onClick={() => setActionsFor(o)} className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-lg bg-[#f2f4f9] px-2.5 text-[11px] font-semibold text-slate-700"><Plus className="h-3 w-3" />Llegaron más</button>}
          </div>
        </li>;
      })}
    </ul>}
    {compact && filtered.length > 5 && <Link href="/vendor/productos" className="mt-4 block text-center text-xs font-semibold text-[#5b45fa]">Ver los {filtered.length} productos<ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>}

    <Sheet open={Boolean(upload)} onClose={closeUpload} title={upload?.kind === 'edit' ? 'Editar producto' : upload?.kind === 'duplicate' ? 'Otro igual con otra foto' : 'Subir producto'} wide>
      {upload && <QuickUpload key={upload.kind === 'create' ? 'create' : `${upload.kind}-${upload.offer.id}`} storeId={store.id} mode={upload} onSaved={(close) => { changed(); if (close) closeUpload(); }} />}
    </Sheet>

    <Sheet open={Boolean(actionsFor)} onClose={() => setActionsFor(null)} title={actionsFor?.product.title ?? 'Producto'}>
      {actionsFor && <StockActions offer={actionsFor} busy={busy.has(actionsFor.id)} onAdjust={(change, variant) => adjust(actionsFor, change, variant)} onEdit={() => { setUpload({ kind: 'edit', offer: actionsFor }); setActionsFor(null); }} onDuplicate={() => { setUpload({ kind: 'duplicate', offer: actionsFor }); setActionsFor(null); }} />}
    </Sheet>

    <Sheet open={checking} onClose={() => setChecking(false)} title="¿Sigues teniendo estos?">
      {checking && <StaleCheck storeId={store.id} offers={stale} onDone={() => { setChecking(false); changed(); }} />}
    </Sheet>
  </section>;
}

/** Quick stock changes for rotating inventory, plus edit and duplicate. */
function StockActions({ offer, busy, onAdjust, onEdit, onDuplicate }: { offer: StoreOffer; busy: boolean; onAdjust: (change: number, variant?: string) => void; onEdit: () => void; onDuplicate: () => void }) {
  const variants = parseVariants(offer);
  const [arrived, setArrived] = useState(1);
  const image = productImages(offer.product)[0];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#eef0f7]">{image && <Image unoptimized width={128} height={128} src={image} alt="" className="h-full w-full object-cover" />}</div>
        <div className="min-w-0">
          <p className="text-lg font-extrabold">{formatBs(offerPrice(offer))}</p>
          <p className={`text-sm ${offer.stock ? 'text-slate-600' : 'text-rose-700'}`}>{offer.stock ? (offer.stock === 1 ? 'Queda 1' : `${offer.stock} disponibles`) : 'Agotado'}{!offer.isActive && offer.stock > 0 && ', oculto en tu tienda'}</p>
        </div>
      </div>

      {variants.length > 0 ? (
        <ul className="space-y-2" aria-label={offer.variantAxis || 'Opciones'}>
          {variants.map((v) => (
            <li key={v.label} className="upload-option">
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{v.label}</span><span className={`text-xs ${v.stock ? 'text-slate-500' : 'text-rose-700'}`}>{v.stock ? (v.stock === 1 ? 'Queda 1' : `${v.stock} disponibles`) : 'Agotado'}</span></span>
              <button type="button" disabled={busy || v.stock === 0} onClick={() => onAdjust(-1, v.label)} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-[#eeebff] px-3 text-xs font-semibold text-[#5034ef] disabled:opacity-40"><Minus className="h-3.5 w-3.5" />Vendí una</button>
              <button type="button" disabled={busy} onClick={() => onAdjust(1, v.label)} aria-label={`Llegó una más de ${v.label}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f4f9] text-slate-700 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-3">
          <button type="button" className="btn btn-primary w-full" disabled={busy || offer.stock === 0} onClick={() => onAdjust(-1)}>{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Minus className="h-5 w-5" />}Vendí una</button>
          <div className="flex items-center gap-2 rounded-2xl border border-[#e8eaf2] p-2 pl-4">
            <span className="flex-1 text-sm font-semibold">Llegaron más</span>
            <Stepper value={arrived} min={1} label="unidades nuevas" onChange={setArrived} />
            <button type="button" className="btn btn-ghost !min-h-11 !px-4" disabled={busy} onClick={() => onAdjust(arrived)}>Sumar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 border-t border-[#edf0f6] pt-4">
        <button type="button" className="btn btn-ghost" onClick={onEdit}><Pencil className="h-4 w-4 text-[#5b45fa]" />Editar</button>
        <button type="button" className="btn btn-ghost" onClick={onDuplicate}><Copy className="h-4 w-4 text-[#5b45fa]" />Otro igual</button>
      </div>
    </div>
  );
}

/** Products not confirmed for a while: keep them, or mark them sold out in one tap. */
function StaleCheck({ storeId, offers, onDone }: { storeId: string; offers: StoreOffer[]; onDone: () => void }) {
  const toast = useToast();
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const keep = offers.filter((o) => !gone.has(o.id)).map((o) => o.id);
      if (keep.length) await marketplaceApi.confirmStock(storeId, keep, true);
      if (gone.size) await marketplaceApi.confirmStock(storeId, [...gone], false);
      toast(gone.size ? `Listo. Ocultamos ${gone.size === 1 ? '1 producto agotado' : `${gone.size} productos agotados`}` : 'Listo, tus productos siguen publicados');
      onDone();
    } catch (err) {
      toast((err as Error).message, 'error');
      setSaving(false);
    }
  };
  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">Marca los que ya no tienes. Los demás siguen publicados.</p>
      <ul className="space-y-2">
        {offers.map((o) => {
          const image = productImages(o.product)[0];
          const isGone = gone.has(o.id);
          return (
            <li key={o.id} className="upload-option">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#eef0f7]">{image && <Image unoptimized width={88} height={88} src={image} alt="" className={`h-full w-full object-cover ${isGone ? 'opacity-40 grayscale' : ''}`} />}</div>
              <span className={`min-w-0 flex-1 truncate text-sm font-semibold ${isGone ? 'text-slate-400 line-through' : ''}`}>{o.product.title}</span>
              <button type="button" className="chip !min-h-9 !px-3 !text-xs" aria-pressed={isGone} onClick={() => setGone((prev) => { const next = new Set(prev); if (isGone) next.delete(o.id); else next.add(o.id); return next; })}>Ya no lo tengo</button>
            </li>
          );
        })}
      </ul>
      <div className="upload-footer mt-4">
        <button type="button" className="btn btn-primary w-full" disabled={saving} onClick={save}>{saving && <Loader2 className="h-5 w-5 animate-spin" />}{gone.size ? 'Guardar' : 'Sí, todos siguen'}</button>
      </div>
    </div>
  );
}
