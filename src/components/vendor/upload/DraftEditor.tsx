'use client';

import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Minus, Plus, Sparkles, Truck, X } from 'lucide-react';
import type { Category, Condition } from '@/lib/api';
import { mediaUrl } from '@/lib/catalog';
import { AUDIENCES, AXIS_OPTIONS, AXIS_SUGGESTIONS, CONDITIONS } from '@/lib/variants';
import { Bone } from '@/components/shop/Skeleton';
import { priceChips, touch, type Draft, type QtyMode, type SuggestedField } from './draft';

type Update = (fn: (d: Draft) => Draft) => void;

/** The product sheet the seller reviews: photo first, then name, price and quantity, then the details. */
export function DraftEditor({
  draft,
  update,
  categories,
  onAddPhotos,
}: {
  draft: Draft;
  update: Update;
  categories: Category[];
  onAddPhotos: (files: File[]) => void;
}) {
  const reading = draft.ai === 'working';
  const set = <K extends keyof Draft>(field: K, value: Draft[K], suggestion?: SuggestedField) =>
    update((d) => ({ ...d, [field]: value, suggested: suggestion ? touch(d, suggestion) : d.suggested }));

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-start">
      <Photos draft={draft} reading={reading} update={update} onAddPhotos={onAddPhotos} />

      {reading ? (
        <div className="space-y-4" aria-live="polite">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#5034ef]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reconociendo tu producto…
          </p>
          <Bone className="h-12 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Bone className="h-12 rounded-2xl" />
            <Bone className="h-12 rounded-2xl" />
          </div>
          <Bone className="h-24 rounded-2xl" />
          <p className="text-xs leading-5 text-slate-500">Puedes ir escribiendo el precio: lo demás se llena solo en unos segundos.</p>
          <PriceField draft={draft} set={set} />
        </div>
      ) : (
        <div className={`space-y-5 ${draft.ai === 'done' ? 'upload-fields' : ''}`}>
          {(draft.ai === 'failed' || draft.ai === 'unrecognized') && (
            <p role="status" className="rounded-2xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
              {draft.ai === 'unrecognized' ? 'No reconocimos un producto en la foto. Prueba con otra foto o llena los datos.' : 'No pudimos leer la foto esta vez. Llena los datos a mano.'}
            </p>
          )}

          <div>
            <Label htmlFor={`${draft.key}-title`} suggested={draft.suggested.includes('title')}>Nombre</Label>
            <input id={`${draft.key}-title`} className="field" maxLength={120} value={draft.title} onChange={(e) => set('title', e.target.value, 'title')} placeholder="Ej.: Licuadora Oster 10 velocidades" />
          </div>

          <PriceField draft={draft} set={set} />
          <QuantityField draft={draft} update={update} />

          <details className="group rounded-2xl border border-[#e8eaf2] bg-[#fafbfe] open:bg-white" open={draft.ai === 'done'}>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold">
              Detalles del producto
              <span className="text-xs font-medium text-slate-500 group-open:hidden">Categoría, estado, colores…</span>
            </summary>
            <div className="space-y-5 px-4 pb-4 pt-1">
              {categories.length > 0 && (
                <div>
                  <Label htmlFor={`${draft.key}-cat`} suggested={draft.suggested.includes('categoryId')}>Categoría</Label>
                  <select id={`${draft.key}-cat`} className="field" value={draft.categoryId || categories[0].id} onChange={(e) => set('categoryId', e.target.value, 'categoryId')}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <ChipGroup label="Estado" suggested={draft.suggested.includes('condition')} options={CONDITIONS.map((c) => ({ key: c.key, label: c.label }))} value={draft.condition} onChange={(v) => set('condition', v as Condition, 'condition')} />
              <ChipGroup label="Para quién" suggested={draft.suggested.includes('audience')} options={AUDIENCES.map((a) => ({ key: a, label: a }))} value={draft.audience} onChange={(v) => set('audience', draft.audience === v ? '' : v, 'audience')} />
              <Colors draft={draft} set={set} />
              <Details draft={draft} set={set} />
              <div>
                <Label htmlFor={`${draft.key}-desc`} suggested={draft.suggested.includes('description')}>Descripción</Label>
                <textarea id={`${draft.key}-desc`} className="field min-h-[84px] py-3" maxLength={1000} value={draft.description} onChange={(e) => set('description', e.target.value, 'description')} placeholder="Lo que el comprador debe saber" />
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e8eaf2] bg-white p-3.5">
                <button type="button" role="switch" aria-checked={draft.bulky} onClick={() => set('bulky', !draft.bulky, 'bulky')} className="vendor-toggle mt-0.5" aria-label="No entra en moto" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold"><Truck className="h-4 w-4 text-amber-600" />No entra en moto{draft.suggested.includes('bulky') && <SuggestedTag />}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">Para muebles, refrigeradores, colchones y otras cosas grandes o pesadas.</span>
                </span>
              </label>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function Photos({ draft, reading, update, onAddPhotos }: { draft: Draft; reading: boolean; update: Update; onAddPhotos: (files: File[]) => void }) {
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const main = draft.images[0] ? mediaUrl(draft.images[0]) : draft.preview;
  const pick = (list: FileList | null) => list?.length && onAddPhotos(Array.from(list).slice(0, 5 - draft.images.length));

  return (
    <div className="space-y-2.5">
      <div className="upload-photo" data-reading={reading}>
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={main} alt={draft.title || 'Foto del producto'} />
        ) : (
          <button type="button" onClick={() => camera.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm font-semibold text-[#5034ef]">
            <Camera className="h-8 w-8" />
            Tomar foto
          </button>
        )}
        {draft.uploading > 0 && !reading && (
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            <Loader2 className="h-3 w-3 animate-spin" />Subiendo foto
          </span>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {draft.images.slice(1).map((url, i) => (
          <div key={url} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#eef0f7]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl(url)} alt={`Foto ${i + 2}`} className="h-full w-full object-cover" />
            <button type="button" aria-label={`Quitar foto ${i + 2}`} onClick={() => update((d) => ({ ...d, images: d.images.filter((u) => u !== url) }))} className="absolute right-0.5 top-0.5 rounded-full bg-[#10152c]/70 p-0.5 text-white"><X className="h-3 w-3" /></button>
          </div>
        ))}
        {draft.images.length > 0 && draft.images.length < 5 && (
          <>
            <button type="button" onClick={() => camera.current?.click()} aria-label="Tomar otra foto" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#c9c1ff] bg-[#fbfaff] text-[#5b45fa]"><Camera className="h-5 w-5" /></button>
            <button type="button" onClick={() => gallery.current?.click()} aria-label="Agregar foto de la galería" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#c9c1ff] bg-[#fbfaff] text-[#5b45fa]"><ImagePlus className="h-5 w-5" /></button>
          </>
        )}
        {draft.images.length > 1 && (
          <button type="button" onClick={() => update((d) => ({ ...d, images: d.images.slice(1) }))} className="ml-auto shrink-0 self-center text-xs font-semibold text-slate-500">Quitar principal</button>
        )}
      </div>
      {draft.uploadError && <p role="alert" className="text-xs font-medium text-danger">{draft.uploadError}</p>}
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
      <input ref={gallery} type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

function PriceField({ draft, set }: { draft: Draft; set: <K extends keyof Draft>(field: K, value: Draft[K], s?: SuggestedField) => void }) {
  const chips = priceChips(draft.priceRange);
  return (
    <div>
      <Label htmlFor={`${draft.key}-price`}>Precio</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">Bs</span>
        <input id={`${draft.key}-price`} className="field pl-12 text-lg font-bold" inputMode="decimal" value={draft.price} onChange={(e) => set('price', e.target.value.replace(/[^\d.,]/g, ''), 'price')} placeholder="0" />
      </div>
      {chips.length > 0 && (
        <div className="mt-2.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500"><Sparkles className="h-3.5 w-3.5 text-[#5b45fa]" />Se vende entre {draft.priceRange!.low} y {draft.priceRange!.high} Bs en Santa Cruz</p>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((n) => <button key={n} type="button" className="chip !min-h-9 !px-3.5 !text-xs" aria-pressed={draft.price === String(n)} onClick={() => set('price', String(n), 'price')}>{n} Bs</button>)}
          </div>
        </div>
      )}
    </div>
  );
}

function QuantityField({ draft, update }: { draft: Draft; update: Update }) {
  const axis = draft.variantAxis || (draft.variantOptions.length ? 'Opción' : '');
  const modes: { key: QtyMode; label: string }[] = [
    { key: 'one', label: 'Solo este' },
    { key: 'many', label: 'Varios iguales' },
    { key: 'options', label: axis ? `Por ${axis.toLowerCase()}` : 'Con opciones' },
  ];
  const setMode = (qtyMode: QtyMode) => update((d) => ({ ...d, qtyMode, quantity: qtyMode === 'many' && d.quantity < 2 ? 2 : d.quantity }));

  return (
    <fieldset>
      <legend className="upload-field-label w-full">Cantidad{draft.suggested.includes('variants') && draft.qtyMode !== 'options' && <span className="text-xs font-medium text-slate-500">Suele venderse por {axis.toLowerCase()}</span>}</legend>
      <div className="upload-segment" role="group">
        {modes.map((m) => <button key={m.key} type="button" aria-pressed={draft.qtyMode === m.key} onClick={() => setMode(m.key)}>{m.label}</button>)}
      </div>
      {draft.qtyMode === 'one' && <p className="mt-2 text-xs text-slate-500">Cuando lo vendas, se oculta solo de tu tienda.</p>}
      {draft.qtyMode === 'many' && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-600">Unidades disponibles</span>
          <Stepper value={draft.quantity} min={0} onChange={(quantity) => update((d) => ({ ...d, quantity }))} label="unidades" />
        </div>
      )}
      {draft.qtyMode === 'options' && <OptionsEditor draft={draft} update={update} />}
    </fieldset>
  );
}

function OptionsEditor({ draft, update }: { draft: Draft; update: Update }) {
  const [custom, setCustom] = useState('');
  const axis = draft.variantAxis;
  const known = draft.variantOptions.length ? draft.variantOptions : AXIS_OPTIONS[axis] ?? [];
  const has = (label: string) => draft.variants.some((v) => v.label.toLowerCase() === label.toLowerCase());
  const toggle = (label: string) =>
    update((d) => ({ ...d, suggested: touch(d, 'variants'), variants: has(label) ? d.variants.filter((v) => v.label.toLowerCase() !== label.toLowerCase()) : [...d.variants, { label, stock: 1 }] }));
  const addCustom = () => {
    const label = custom.trim();
    if (label && !has(label)) toggle(label);
    setCustom('');
  };

  return (
    <div className="mt-3 space-y-3">
      <div>
        <label htmlFor={`${draft.key}-axis`} className="mb-1.5 block text-xs font-semibold text-slate-600">Las opciones son por</label>
        <input id={`${draft.key}-axis`} className="field !min-h-11" value={axis} maxLength={30} onChange={(e) => update((d) => ({ ...d, variantAxis: e.target.value }))} placeholder="Talla, voltaje, presentación…" list={`${draft.key}-axes`} />
        <datalist id={`${draft.key}-axes`}>{AXIS_SUGGESTIONS.map((a) => <option key={a} value={a} />)}</datalist>
        {!axis && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {AXIS_SUGGESTIONS.map((a) => <button key={a} type="button" className="chip !min-h-8 !px-3 !text-xs" onClick={() => update((d) => ({ ...d, variantAxis: a }))}>{a}</button>)}
          </div>
        )}
      </div>
      {axis && (
        <>
          {known.length > 0 && (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Elige ${axis.toLowerCase()}`}>
              {known.map((o) => <button key={o} type="button" className="chip !min-h-9 !px-3.5 !text-xs" aria-pressed={has(o)} onClick={() => toggle(o)}>{o}</button>)}
            </div>
          )}
          <div className="flex gap-2">
            <input className="field !min-h-11" value={custom} maxLength={40} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} placeholder="Otra opción" aria-label={`Agregar otra opción de ${axis.toLowerCase()}`} />
            <button type="button" className="btn btn-ghost !min-h-11 shrink-0 !px-4" onClick={addCustom} disabled={!custom.trim()}>Agregar</button>
          </div>
          {draft.variants.length > 0 && (
            <ul className="space-y-2">
              {draft.variants.map((v) => (
                <li key={v.label} className="upload-option">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{v.label}</span>
                  <Stepper value={v.stock} min={0} label={`de ${v.label}`} onChange={(stock) => update((d) => ({ ...d, variants: d.variants.map((x) => (x.label === v.label ? { ...x, stock } : x)) }))} />
                  <button type="button" aria-label={`Quitar ${v.label}`} onClick={() => toggle(v.label)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-[#f2f4f9]"><X className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 999, label }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="upload-stepper">
      <button type="button" aria-label={`Quitar uno (${label})`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}><Minus className="h-4 w-4" /></button>
      <input aria-label={`Cantidad ${label}`} inputMode="numeric" value={value} onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value.replace(/\D/g, '')) || 0)))} />
      <button type="button" aria-label={`Sumar uno (${label})`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}><Plus className="h-4 w-4" /></button>
    </div>
  );
}

function Colors({ draft, set }: { draft: Draft; set: <K extends keyof Draft>(field: K, value: Draft[K], s?: SuggestedField) => void }) {
  const [text, setText] = useState('');
  const add = () => {
    const color = text.trim();
    if (color && !draft.colors.includes(color)) set('colors', [...draft.colors, color].slice(0, 6), 'colors');
    setText('');
  };
  return (
    <div>
      <Label htmlFor={`${draft.key}-color`} suggested={draft.suggested.includes('colors')}>Colores</Label>
      <div className="flex flex-wrap items-center gap-1.5">
        {draft.colors.map((c) => (
          <span key={c} className="inline-flex min-h-9 items-center gap-1 rounded-full bg-[#f2f4f9] pl-3.5 pr-1.5 text-xs font-semibold">
            {c}
            <button type="button" aria-label={`Quitar ${c}`} onClick={() => set('colors', draft.colors.filter((x) => x !== c), 'colors')} className="rounded-full p-1 text-slate-500 hover:bg-white"><X className="h-3 w-3" /></button>
          </span>
        ))}
        <input id={`${draft.key}-color`} className="h-9 min-w-[110px] flex-1 rounded-full border border-dashed border-[#dce1ed] bg-white px-3.5 text-xs outline-none focus:border-[#b6aaff]" value={text} onChange={(e) => setText(e.target.value)} onBlur={add} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} placeholder="Agregar color" />
      </div>
    </div>
  );
}

function Details({ draft, set }: { draft: Draft; set: <K extends keyof Draft>(field: K, value: Draft[K], s?: SuggestedField) => void }) {
  const change = (i: number, key: 'name' | 'value', value: string) => set('details', draft.details.map((d, j) => (j === i ? { ...d, [key]: value } : d)), 'details');
  return (
    <div>
      <p className="upload-field-label">Características{draft.suggested.includes('details') && <SuggestedTag />}</p>
      <ul className="space-y-2">
        {draft.details.map((d, i) => (
          <li key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2">
            <input className="field !min-h-11 text-xs font-semibold" value={d.name} maxLength={40} onChange={(e) => change(i, 'name', e.target.value)} placeholder="Marca" aria-label="Característica" />
            <input className="field !min-h-11 text-xs" value={d.value} maxLength={80} onChange={(e) => change(i, 'value', e.target.value)} placeholder="Bosch" aria-label={`Valor de ${d.name || 'la característica'}`} />
            <button type="button" aria-label={`Quitar ${d.name || 'característica'}`} onClick={() => set('details', draft.details.filter((_, j) => j !== i), 'details')} className="flex h-11 w-9 items-center justify-center text-slate-400"><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
      {draft.details.length < 10 && (
        <button type="button" onClick={() => set('details', [...draft.details, { name: '', value: '' }], 'details')} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#5b45fa]"><Plus className="h-3.5 w-3.5" />Agregar característica</button>
      )}
    </div>
  );
}

function ChipGroup({ label, options, value, onChange, suggested }: { label: string; options: { key: string; label: string }[]; value: string; onChange: (v: string) => void; suggested?: boolean }) {
  return (
    <fieldset>
      <legend className="upload-field-label w-full">{label}{suggested && <SuggestedTag />}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => <button key={o.key} type="button" className="chip !min-h-9 !px-3.5 !text-xs" aria-pressed={value === o.key} onClick={() => onChange(o.key)}>{o.label}</button>)}
      </div>
    </fieldset>
  );
}

function Label({ htmlFor, suggested, children }: { htmlFor: string; suggested?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="upload-field-label">
      {children}
      {suggested && <SuggestedTag />}
    </label>
  );
}

function SuggestedTag() {
  return <span className="upload-suggested"><Sparkles className="h-3 w-3" />Sugerido</span>;
}
