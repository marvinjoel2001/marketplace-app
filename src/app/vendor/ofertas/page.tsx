'use client';

import { useState } from 'react';
import { Check, Loader2, Search } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { useToast } from '@/context/ToastContext';
import { marketplaceApi } from '@/lib/api';
import { isPromoActive, offerPrice, productImages, promoEndsLabel } from '@/lib/catalog';
import { formatBs } from '@/lib/utils';
import { useStoreOffers } from '@/components/vendor/useStoreOffers';
import { PriceTag } from '@/components/shop/PriceTag';

const PERCENTS = [10, 15, 20, 30, 50];

/** YYYY-MM-DD for a date in Bolivia, `days` from today. */
function boliviaDate(days = 0) {
  const local = new Date(Date.now() - 4 * 3_600_000 + days * 86_400_000);
  return local.toISOString().slice(0, 10);
}

export default function VendorOffersPage() {
  const { store } = useVendor();
  const toast = useToast();
  const { offers, reload } = useStoreOffers(store.id);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [percent, setPercent] = useState(20);
  const [until, setUntil] = useState(boliviaDate(7));
  const [saving, setSaving] = useState(false);

  const active = (offers ?? []).filter((o) => isPromoActive(o));
  const candidates = (offers ?? []).filter((o) => o.isActive && o.product.title.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const apply = async () => {
    setSaving(true);
    try {
      // The offer lasts through the whole chosen day, Bolivia time.
      const endsAt = new Date(`${until}T23:59:00-04:00`).toISOString();
      const res = await marketplaceApi.applyBulkOffer(store.id, { offerIds: [...selected], discountPercent: percent, endsAt });
      toast(`${res.updated} ${res.updated === 1 ? 'producto quedó' : 'productos quedaron'} con ${percent}% de descuento`);
      setSelected(new Set());
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const end = async (offerIds: string[]) => {
    try {
      await marketplaceApi.endOffers(store.id, offerIds);
      toast('Oferta terminada');
      reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-sign text-2xl font-extrabold">Ofertas</h1>
        <p className="mt-1 text-sm text-muted">Elige productos, ponles un descuento y hasta qué día dura.</p>
      </div>

      {active.length > 0 && (
        <section aria-labelledby="active-offers">
          <h2 id="active-offers" className="mb-2 font-bold">
            En oferta ahora
          </h2>
          <ul className="panel divide-y divide-line">
            {active.map((o) => (
              <li key={o.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.product.title}</p>
                  <p className="text-xs text-muted">
                    -{o.discountPercent}%. {promoEndsLabel(o.flashSaleEnd)}
                  </p>
                </div>
                <PriceTag price={offerPrice(o)} regular={o.price} />
                <button type="button" className="shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold text-danger hover:bg-red-50" onClick={() => end([o.id])}>
                  Terminar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="new-offer" className="flex flex-col gap-3">
        <h2 id="new-offer" className="font-bold">
          Nueva oferta
        </h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="field pl-10" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Busca tus productos" aria-label="Buscar productos para la oferta" />
        </div>
        {offers === null ? (
          <p className="text-sm text-muted">Cargando productos…</p>
        ) : candidates.length === 0 ? (
          <p className="panel px-4 py-5 text-sm text-muted">{offers.length === 0 ? 'Primero sube productos.' : 'Ningún producto coincide con la búsqueda.'}</p>
        ) : (
          <ul className="panel max-h-[420px] divide-y divide-line overflow-y-auto">
            {candidates.map((o) => {
              const on = selected.has(o.id);
              return (
                <li key={o.id}>
                  <button type="button" onClick={() => toggle(o.id)} aria-pressed={on} className="flex w-full items-center gap-3 p-3 text-left">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${on ? 'border-verde bg-verde text-white' : 'border-line'}`}>
                      {on && <Check className="h-4 w-4" strokeWidth={3} />}
                    </span>
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-paper">
                      {productImages(o.product)[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={productImages(o.product)[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{o.product.title}</span>
                    <span className="text-sm tabular-nums text-ink-soft">{formatBs(o.price)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {candidates.length > 1 && (
          <button
            type="button"
            className="w-fit text-sm font-semibold text-verde-dark"
            onClick={() => setSelected(selected.size === candidates.length ? new Set() : new Set(candidates.map((o) => o.id)))}
          >
            {selected.size === candidates.length ? 'Quitar selección' : 'Elegir todos'}
          </button>
        )}

        <div>
          <p className="field-label">Descuento</p>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Porcentaje de descuento">
            {PERCENTS.map((p) => (
              <button key={p} type="button" className="chip" aria-pressed={percent === p} onClick={() => setPercent(p)}>
                {p}%
              </button>
            ))}
            <label className="flex items-center gap-1.5 text-sm">
              <span className="sr-only">Otro porcentaje</span>
              <input
                className="field w-20 min-h-[38px] py-1 text-center"
                inputMode="numeric"
                value={percent}
                onChange={(e) => setPercent(Math.min(90, Number(e.target.value.replace(/\D/g, '')) || 0))}
                aria-label="Otro porcentaje"
              />
              %
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="until" className="field-label">
            Válida hasta el
          </label>
          <input id="until" type="date" className="field" min={boliviaDate(0)} max={boliviaDate(90)} value={until} onChange={(e) => setUntil(e.target.value)} />
        </div>

        <button type="button" className="btn btn-primary w-full" disabled={selected.size === 0 || percent < 1 || !until || saving} onClick={apply}>
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {selected.size === 0 ? 'Elige productos' : `Poner ${percent}% a ${selected.size} ${selected.size === 1 ? 'producto' : 'productos'}`}
        </button>
      </section>
    </div>
  );
}
