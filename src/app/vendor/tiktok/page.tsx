'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, Plus } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { useToast } from '@/context/ToastContext';
import { marketplaceApi } from '@/lib/api';
import { offerPrice, productImages } from '@/lib/catalog';
import { formatBs } from '@/lib/utils';
import { Sheet } from '@/components/shop/Sheet';
import { QuickUpload } from '@/components/vendor/upload/QuickUpload';
import { useStoreOffers } from '@/components/vendor/useStoreOffers';
import { TikTokIcon } from '@/components/common/TikTokIcon';
import { ListSkeleton, PanelSkeleton } from '@/components/shop/Skeleton';

interface LiveStream {
  id: string;
  title: string;
  featuredProductIds: string | null;
}

export default function SellOnTikTokPage() {
  const { store, setStore } = useVendor();
  const toast = useToast();
  const { offers, reload } = useStoreOffers(store.id);
  const [live, setLive] = useState<LiveStream | null | undefined>(undefined);
  const [username, setUsername] = useState(store.tiktokUsername ?? '');
  const [title, setTitle] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set()); // product ids
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    marketplaceApi.getLiveStreams(store.id).then((list) => active && setLive((list[0] as LiveStream) ?? null));
    return () => {
      active = false;
    };
  }, [store.id]);

  const toggle = (productId: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });

  const start = async () => {
    setBusy(true);
    try {
      const updated = await marketplaceApi.updateStore(store.id, { tiktokUsername: username });
      setStore(updated);
      const stream = await marketplaceApi.createLiveStream({
        storeId: store.id,
        title: title.trim() || `Live de ${store.name}`,
        streamerName: store.name,
        featuredProductIds: [...picked],
        tiktokUrl: updated.tiktokLiveUrl ?? undefined,
      });
      setLive(stream);
      toast('Listo: tus productos ya se ven en Vitrina como "En vivo"');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    if (!live) return;
    setBusy(true);
    try {
      await marketplaceApi.endLiveStream(live.id);
      setLive(null);
      setPicked(new Set());
      toast('Live terminado');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const active = (offers ?? []).filter((o) => o.isActive);
  const featured = live ? (live.featuredProductIds ?? '').split(',').filter(Boolean) : [];

  return (
    <div className="flex flex-col gap-5">
      <Link href="/vendor" className="flex w-fit items-center gap-1 text-sm font-semibold text-muted">
        <ArrowLeft className="h-4 w-4" /> Inicio
      </Link>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
          <TikTokIcon />
        </span>
        <h1 className="type-sign text-2xl font-extrabold">Vender por TikTok</h1>
      </div>

      {live === undefined ? (
        <PanelSkeleton lines={3} />
      ) : live ? (
        <div className="flex flex-col gap-4">
          <div className="panel border-live/40 p-4">
            <p className="flex items-center gap-2 font-bold text-live">
              <span className="animate-live-dot h-2.5 w-2.5 rounded-full bg-live" /> Estás en vivo en Vitrina
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Los clientes ven tu live en la sección En vivo y compran {featured.length === 1 ? 'este producto' : 'estos productos'} sin salir de Vitrina.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {store.tiktokLiveUrl && (
                <a href={store.tiktokLiveUrl} target="_blank" rel="noopener noreferrer" className="btn bg-ink text-white hover:bg-ink-soft">
                  <TikTokIcon /> Abrir mi live
                </a>
              )}
              <Link href={`/en-vivo/${store.slug}`} className="btn btn-ghost">
                Ver cómo lo ven mis clientes
              </Link>
            </div>
          </div>
          <ul className="panel divide-y divide-line">
            {(offers ?? [])
              .filter((o) => featured.length === 0 || featured.includes(o.productId))
              .map((o) => (
                <li key={o.id} className="flex items-center gap-3 p-3 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium">{o.product.title}</span>
                  <span className="tabular-nums">{formatBs(offerPrice(o))}</span>
                  <span className="text-xs text-muted">{o.stock} disp.</span>
                </li>
              ))}
          </ul>
          <button type="button" className="btn btn-ghost w-full text-danger" onClick={stop} disabled={busy}>
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            Terminar live
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <section className="panel flex flex-col gap-3 p-4">
            <h2 className="font-bold">Tu cuenta de TikTok</h2>
            <div className="flex items-center gap-2">
              <span className="field w-auto shrink-0 bg-paper font-semibold text-ink-soft">@</span>
              <input
                className="field"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/^@/, '').replace(/\s/g, '').toLowerCase())}
                placeholder="tu_usuario"
                aria-label="Usuario de TikTok"
                autoCapitalize="none"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold">¿Qué vas a vender?</h2>
              <button type="button" className="flex items-center gap-1 text-sm font-semibold text-verde-dark" onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> Subir nuevo
              </button>
            </div>
            {offers === null ? (
              <ListSkeleton rows={3} />
            ) : active.length === 0 ? (
              <div className="panel px-4 py-6 text-center text-sm">
                <p className="text-muted">Sube los productos que vas a mostrar en tu live.</p>
                <button type="button" className="btn btn-primary mt-3" onClick={() => setCreating(true)}>
                  Subir producto
                </button>
              </div>
            ) : (
              <ul className="panel max-h-[420px] divide-y divide-line overflow-y-auto">
                {active.map((o) => {
                  const on = picked.has(o.productId);
                  return (
                    <li key={o.id}>
                      <button type="button" aria-pressed={on} onClick={() => toggle(o.productId)} className="flex w-full items-center gap-3 p-3 text-left">
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
                        <span className="text-sm tabular-nums text-ink-soft">{formatBs(offerPrice(o))}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div>
            <label htmlFor="live-title" className="field-label">
              Título del live (opcional)
            </label>
            <input id="live-title" className="field" maxLength={90} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Live de ${store.name}`} />
          </div>

          <button type="button" className="btn btn-primary w-full" onClick={start} disabled={busy || picked.size === 0 || !username}>
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            {picked.size === 0 ? 'Elige qué vas a vender' : !username ? 'Escribe tu usuario de TikTok' : `Empezar a vender ${picked.size} ${picked.size === 1 ? 'producto' : 'productos'}`}
          </button>
          <p className="-mt-2 text-center text-xs text-muted">Después inicia tu live en TikTok como siempre.</p>
        </div>
      )}

      <Sheet open={creating} onClose={() => setCreating(false)} title="Subir producto" wide>
        <QuickUpload
          storeId={store.id}
          mode={{ kind: 'create' }}
          onPublished={(product) => setPicked((prev) => new Set(prev).add(product.id))}
          onSaved={(close) => {
            if (close) setCreating(false);
            reload();
          }}
        />
      </Sheet>
    </div>
  );
}
