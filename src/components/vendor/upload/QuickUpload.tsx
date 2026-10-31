'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, Check, Images, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { marketplaceApi, type Category, type Offer, type Product } from '@/lib/api';
import { mediaUrl } from '@/lib/catalog';
import { useToast } from '@/context/ToastContext';
import { Bone } from '@/components/shop/Skeleton';
import { DraftEditor, Stepper } from './DraftEditor';
import { addPhoto, draftFromOffer, duplicateDraft, emptyDraft, problem, processPhoto, stockOf, toInput, type Draft } from './draft';

type StoreOffer = Offer & { product: Product };
export type UploadMode = { kind: 'create' } | { kind: 'edit'; offer: StoreOffer } | { kind: 'duplicate'; offer: StoreOffer };

const MAX_BURST = 20;
/** Photos read at the same time in a burst, so a phone on mobile data doesn't stall. */
const PARALLEL = 3;

/**
 * Publishing from a photo: take it, the assistant fills the sheet, check the price and publish.
 * Picking several photos from the gallery prepares them all at once (ráfaga).
 */
export function QuickUpload({ storeId, mode, onSaved, onPublished }: { storeId: string; mode: UploadMode; onSaved: (closeSheet: boolean) => void; onPublished?: (product: Product) => void }) {
  const toast = useToast();
  const [ai, setAi] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>(() => (mode.kind === 'edit' ? [draftFromOffer(mode.offer)] : []));
  const [view, setView] = useState<'capture' | 'review' | 'burst'>(mode.kind === 'edit' ? 'review' : 'capture');
  const [activeKey, setActiveKey] = useState<string | null>(() => drafts[0]?.key ?? null);
  const [fromBurst, setFromBurst] = useState(false);
  const [busy, setBusy] = useState<'publish' | 'next' | 'all' | null>(null);
  const [error, setError] = useState('');
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    marketplaceApi.photoAiStatus().then((s) => alive && setAi(s.enabled)).catch(() => alive && setAi(false));
    marketplaceApi.getCategories().then((list) => alive && setCategories(list)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((key: string, fn: (d: Draft) => Draft) => setDrafts((list) => list.map((d) => (d.key === key ? fn(d) : d))), []);
  const active = drafts.find((d) => d.key === activeKey) ?? null;
  const template = mode.kind === 'duplicate' ? draftFromOffer(mode.offer) : null;

  const startDraft = (file: File) => {
    const draft = template ? duplicateDraft(template, '') : emptyDraft();
    setDrafts((list) => [...list, draft]);
    // A duplicate already has its details: only the photo is new.
    processPhoto(file, draft.key, storeId, Boolean(ai) && !template, update).catch((err: Error) =>
      update(draft.key, (d) => ({ ...d, uploadError: err.message, ai: d.ai === 'working' ? 'failed' : d.ai })),
    );
    return draft;
  };

  const onCapture = (files: File[]) => {
    if (!files.length) return;
    setError('');
    if (files.length === 1) {
      const draft = startDraft(files[0]);
      setActiveKey(draft.key);
      setFromBurst(false);
      setView('review');
      return;
    }
    const picked = files.slice(0, MAX_BURST);
    if (files.length > MAX_BURST) toast(`Tomamos las primeras ${MAX_BURST} fotos`, 'info');
    const created = picked.map(() => (template ? duplicateDraft(template, '') : emptyDraft()));
    setDrafts((list) => [...list, ...created]);
    setView('burst');
    let next = 0;
    const worker = async () => {
      while (next < picked.length) {
        const i = next++;
        await processPhoto(picked[i], created[i].key, storeId, Boolean(ai) && !template, update).catch((err: Error) =>
          update(created[i].key, (d) => ({ ...d, uploadError: err.message, ai: d.ai === 'working' ? 'failed' : d.ai })),
        );
      }
    };
    Array.from({ length: Math.min(PARALLEL, picked.length) }, worker);
  };

  const save = async (draft: Draft) => {
    const issue = problem(draft);
    if (issue) throw new Error(issue);
    const input = toInput(draft, storeId, categories[0]?.id ?? '');
    if (mode.kind === 'edit') {
      const { offer } = mode;
      await marketplaceApi.updateProduct(offer.productId, {
        title: input.title, description: input.description, images: input.images, categoryId: input.categoryId,
        condition: input.condition, audience: input.audience, bulky: input.bulky, color: input.color, specifications: input.specifications,
      });
      await marketplaceApi.updateOffer(storeId, offer.id, input.variants ? { price: input.basePrice, variantAxis: input.variantAxis, variants: input.variants } : { price: input.basePrice, stock: input.stock, variants: null });
    } else {
      // Created first: an optional call would skip evaluating its argument when nobody listens.
      const created = await marketplaceApi.createProduct(input);
      onPublished?.(created);
    }
  };

  const publish = async (another: boolean) => {
    if (!active) return;
    setBusy(another ? 'next' : 'publish');
    setError('');
    try {
      await save(active);
      toast(mode.kind === 'edit' ? 'Cambios guardados' : 'Producto publicado');
      setDrafts((list) => list.filter((d) => d.key !== active.key));
      setActiveKey(null);
      if (fromBurst && drafts.length > 1) {
        setView('burst');
        onSaved(false);
      } else if (another) {
        setView('capture');
        onSaved(false);
      } else {
        onSaved(true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const publishReady = async () => {
    const ready = drafts.filter((d) => !problem(d));
    if (!ready.length) return;
    setBusy('all');
    let done = 0;
    // A few at a time instead of one by one: twenty products publish in seconds, without flooding a phone's connection.
    let next = 0;
    const worker = async () => {
      while (next < ready.length) {
        const draft = ready[next++];
        try {
          await save(draft);
          done += 1;
          setDrafts((list) => list.filter((d) => d.key !== draft.key));
        } catch (err) {
          update(draft.key, (d) => ({ ...d, uploadError: (err as Error).message }));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, ready.length) }, worker));
    setBusy(null);
    toast(done === 1 ? 'Producto publicado' : `${done} productos publicados`);
    onSaved(done === drafts.length);
  };

  if (view === 'capture') {
    return (
      <div className="space-y-3">
        {template && (
          <p className="flex items-center gap-3 rounded-2xl bg-[#f6f5ff] p-3 text-sm">
            <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#eef0f7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {template.images[0] && <img src={mediaUrl(template.images[0])} alt="" className="h-full w-full object-cover" />}
            </span>
            <span>Copiamos los datos de <strong>{template.title}</strong>. Solo toma la foto del nuevo.</span>
          </p>
        )}
        <button type="button" className="upload-tile upload-tile--main" onClick={() => camera.current?.click()} disabled={ai === null && !template}>
          <span className="upload-tile-icon">{ai === null && !template ? <Loader2 className="h-7 w-7 animate-spin" /> : <Camera className="h-7 w-7" />}</span>
          <span>
            <span className="block text-lg font-extrabold">Tomar foto</span>
            <span className="mt-0.5 block text-sm text-white/80">{ai && !template ? 'Reconocemos el producto y llenamos los datos por ti' : 'Después pones el precio y la cantidad'}</span>
          </span>
        </button>
        <button type="button" className="upload-tile" onClick={() => gallery.current?.click()}>
          <span className="upload-tile-icon"><Images className="h-7 w-7" /></span>
          <span>
            <span className="block font-bold">Elegir de la galería</span>
            <span className="mt-0.5 block text-sm text-slate-500">Elige varias fotos para subir muchos productos de una vez</span>
          </span>
        </button>
        {drafts.length > 0 && (
          <button type="button" onClick={() => setView('burst')} className="w-full py-2 text-sm font-semibold text-[#5b45fa]">Ver los {drafts.length} productos sin publicar</button>
        )}
        <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onCapture(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
        <input ref={gallery} type="file" accept="image/*" multiple hidden onChange={(e) => { onCapture(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
      </div>
    );
  }

  if (view === 'review' && active) {
    const editing = mode.kind === 'edit';
    return (
      <div>
        {fromBurst && (
          <button type="button" onClick={() => { setView('burst'); setActiveKey(null); }} className="-mt-1 mb-3 flex items-center gap-1 text-sm font-semibold text-slate-500"><ArrowLeft className="h-4 w-4" />Volver a la lista</button>
        )}
        <DraftEditor draft={active} update={(fn) => update(active.key, fn)} categories={categories} onAddPhotos={(files) => files.forEach((f) => addPhoto(f, active.key, update))} />
        <div className="upload-footer mt-5">
          {error && <p role="alert" className="mb-2.5 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
          {editing ? (
            <button type="button" className="btn btn-primary w-full" disabled={busy !== null} onClick={() => publish(false)}>{busy && <Loader2 className="h-5 w-5 animate-spin" />}Guardar cambios</button>
          ) : fromBurst ? (
            <button type="button" className="btn btn-primary w-full" disabled={busy !== null} onClick={() => publish(false)}>{busy && <Loader2 className="h-5 w-5 animate-spin" />}Publicar este</button>
          ) : (
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <button type="button" className="btn btn-ghost" disabled={busy !== null} onClick={() => publish(true)}>{busy === 'next' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5 text-[#5b45fa]" />}Publicar y otra</button>
              <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={() => publish(false)}>{busy === 'publish' && <Loader2 className="h-5 w-5 animate-spin" />}Publicar</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <Burst drafts={drafts} ai={Boolean(ai) && !template} busy={busy === 'all'} update={update} onOpen={(key) => { setActiveKey(key); setFromBurst(true); setView('review'); }} onRemove={(key) => setDrafts((list) => list.filter((d) => d.key !== key))} onAddMore={() => setView('capture')} onPublish={publishReady} />;
}

function Burst({
  drafts, ai, busy, update, onOpen, onRemove, onAddMore, onPublish,
}: {
  drafts: Draft[]; ai: boolean; busy: boolean;
  update: (key: string, fn: (d: Draft) => Draft) => void;
  onOpen: (key: string) => void; onRemove: (key: string) => void; onAddMore: () => void; onPublish: () => void;
}) {
  const [bulkPrice, setBulkPrice] = useState('');
  const ready = drafts.filter((d) => !problem(d)).length;
  const reading = drafts.filter((d) => d.ai === 'working' || d.uploading > 0).length;

  if (!drafts.length) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Check className="h-6 w-6" /></span>
        <p className="font-bold">Todo publicado</p>
        <button type="button" className="btn btn-primary mt-4" onClick={onAddMore}><Camera className="h-5 w-5" />Subir más</button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 rounded-2xl bg-[#f6f5ff] p-3.5">
        <p className="text-sm font-semibold">{reading ? (ai ? `Reconociendo ${reading} de ${drafts.length} fotos…` : `Subiendo ${reading} fotos…`) : `${drafts.length} productos listos para revisar`}</p>
        <form className="mt-2.5 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!(Number(bulkPrice.replace(',', '.')) > 0)) return; drafts.forEach((d) => update(d.key, (x) => ({ ...x, price: bulkPrice }))); }}>
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">Bs</span>
            <input className="field !min-h-11 pl-10 text-sm" inputMode="decimal" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="Precio para todos" aria-label="Mismo precio para todos" />
          </div>
          <button type="submit" className="btn btn-ghost !min-h-11 shrink-0 !px-4" disabled={!bulkPrice}>Aplicar</button>
        </form>
      </div>

      <ul className="space-y-2.5">
        {drafts.map((d) => {
          const issue = problem(d);
          const working = d.ai === 'working';
          return (
            <li key={d.key} className="upload-draft" data-ready={!issue}>
              <button type="button" onClick={() => onOpen(d.key)} className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#eef0f7]" aria-label={`Revisar ${d.title || 'producto'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {(d.images[0] || d.preview) && <img src={d.images[0] ? mediaUrl(d.images[0]) : d.preview} alt="" className="h-full w-full object-cover" />}
                {(working || d.uploading > 0) && <span className="absolute inset-0 flex items-center justify-center bg-white/55"><Loader2 className="h-5 w-5 animate-spin text-[#5b45fa]" /></span>}
              </button>
              <div className="min-w-0 space-y-2">
                {working ? (
                  <Bone className="h-10 rounded-xl" />
                ) : (
                  <input className="field !min-h-10 text-sm font-semibold" value={d.title} onChange={(e) => update(d.key, (x) => ({ ...x, title: e.target.value }))} placeholder="Nombre del producto" aria-label="Nombre del producto" />
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-28">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">Bs</span>
                    <input className="field !min-h-10 pl-9 text-sm font-bold" inputMode="decimal" value={d.price} onChange={(e) => update(d.key, (x) => ({ ...x, price: e.target.value.replace(/[^\d.,]/g, '') }))} placeholder={d.priceRange ? String(d.priceRange.low) : '0'} aria-label={`Precio de ${d.title || 'producto'}`} />
                  </div>
                  {d.qtyMode === 'options' ? (
                    <button type="button" onClick={() => onOpen(d.key)} className="text-xs font-semibold text-[#5b45fa]">{stockOf(d)} en {d.variants.length} {d.variantAxis.toLowerCase() || 'opciones'}</button>
                  ) : (
                    <Stepper value={stockOf(d)} min={0} label="unidades" onChange={(n) => update(d.key, (x) => ({ ...x, qtyMode: n === 1 ? 'one' : 'many', quantity: n }))} />
                  )}
                  <button type="button" onClick={() => onRemove(d.key)} aria-label="Quitar de la lista" className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-[#f2f4f9]"><Trash2 className="h-4 w-4" /></button>
                </div>
                <p className={`flex items-center gap-1.5 text-xs ${issue ? 'text-slate-500' : 'text-emerald-700'}`}>
                  {issue ? (d.uploadError || (working ? 'Leyendo la foto' : issue)) : <><Check className="h-3.5 w-3.5" />Listo para publicar</>}
                  {!issue && d.ai === 'done' && <Sparkles className="h-3 w-3 text-[#5b45fa]" aria-label="Datos sugeridos" />}
                  {!working && <button type="button" onClick={() => onOpen(d.key)} className="ml-auto font-semibold text-[#5b45fa]">Revisar</button>}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="upload-footer mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <button type="button" className="btn btn-ghost" onClick={onAddMore} aria-label="Agregar más fotos"><Camera className="h-5 w-5 text-[#5b45fa]" /></button>
        <button type="button" className="btn btn-primary" disabled={!ready || busy} onClick={onPublish}>{busy && <Loader2 className="h-5 w-5 animate-spin" />}{ready ? `Publicar ${ready === 1 ? 'el listo' : `los ${ready} listos`}` : reading ? 'Preparando fotos…' : 'Completa nombre y precio'}</button>
      </div>
    </div>
  );
}
