'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Copy, Eye, Loader2, Square } from 'lucide-react';
import type { LiveRoomData, Offer, Product } from '@/lib/api';
import { mediaUrl, productImages } from '@/lib/catalog';
import { copyText } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { TikTokIcon } from '@/components/common/TikTokIcon';
import { LiveVideo } from '@/components/live/LivePreview';

export interface OpenSale {
  id: string;
  title: string;
  startedAt: string;
  featuredProductIds: string | null;
}

/** A sale left open this long while TikTok shows nothing probably just wasn't closed. */
const STALE_MS = 6 * 60 * 60 * 1000;

function since(startedAt: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - Date.parse(startedAt)) / 60000));
  if (minutes < 1) return 'Empezaste hace un momento';
  if (minutes < 60) return `Empezaste hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Empezaste hace ${hours} h ${minutes % 60} min`;
  const date = new Date(startedAt).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
  return `Abierto desde el ${date}`;
}

/**
 * The store's own live, at the top of its home panel while a sale is open: what buyers see,
 * whether TikTok is broadcasting, the products on sale, and the way to end it.
 */
export function LiveNowCard({ sale, room, username, storeName, onEnd }: {
  sale: OpenSale;
  room: LiveRoomData | null | undefined;
  username: string | null;
  storeName: string;
  onEnd: () => Promise<void>;
}) {
  const toast = useToast();
  const [now, setNow] = useState(() => Date.now());
  const [confirming, setConfirming] = useState(false);
  const [ending, setEnding] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const onTikTok = Boolean(room?.tiktokLive && room.live);
  const live = room?.live ?? null;
  const featured = (sale.featuredProductIds ?? '').split(',').filter(Boolean);
  const offers = (room?.store?.offers ?? []) as (Offer & { product: Product })[];
  const products = (featured.length ? offers.filter((o) => featured.includes(o.productId)) : offers).slice(0, 5);
  const stale = !onTikTok && room !== undefined && now - Date.parse(sale.startedAt) > STALE_MS;
  const roomHref = username ? `/live/${username}` : null;

  const copyLink = async () => {
    if (!roomHref) return;
    if (await copyText(`${window.location.origin}${roomHref}`)) {
      setCopied(true);
      toast('Enlace de tu live copiado');
    } else toast('No se pudo copiar el enlace. Abre «Ver mi live» y copia la dirección.', 'error');
  };

  const end = async () => {
    setEnding(true);
    try {
      await onEnd();
    } catch (err) {
      toast((err as Error).message || 'No pudimos terminar el live. Inténtalo de nuevo.', 'error');
      setEnding(false);
      setConfirming(false);
    }
  };

  return (
    <section aria-label="Tu live en curso" className="overflow-hidden rounded-[20px] bg-black text-white">
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:p-5">
        {/* The broadcast as buyers see it: TikTok's own vertical frame. */}
        <div className="relative mx-auto aspect-[9/16] w-36 shrink-0 overflow-hidden rounded-2xl bg-[#1a1a1a] ring-1 ring-white/10 sm:mx-0 sm:w-40">
          {live?.cover_image_url && (
            <Image unoptimized fill sizes="160px" src={live.cover_image_url} alt="" className={`object-cover ${onTikTok ? '' : 'opacity-30 grayscale'}`} />
          )}
          {onTikTok && live && (
            <LiveVideo roomId={live.room_id} hlsUrl={live.stream_hls_url} flvUrl={live.stream_flv_url} alt={storeName} enabled muted />
          )}
          {onTikTok ? (
            <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-md bg-[#FE2C55] px-2 py-0.5 text-[11px] font-bold">
              <span className="animate-live-dot h-1.5 w-1.5 rounded-full bg-white" /> En vivo
            </span>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3 text-center">
              <span className="relative flex h-12 w-12 items-center justify-center">
                <span className="absolute inset-0 rounded-full border-2 border-[#FE2C55]/60 motion-safe:animate-ping" />
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <TikTokIcon className="h-5 w-5" />
                </span>
              </span>
              <span className="text-[11px] font-semibold leading-4 text-white/80">
                {room === undefined ? 'Buscando tu live…' : 'Esperando TikTok'}
              </span>
            </div>
          )}
          {onTikTok && live && live.viewer_count > 0 && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">
              <Eye className="h-3 w-3" /> {live.viewer_count.toLocaleString('es-BO')}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-[28px]">
            {onTikTok ? 'Estás vendiendo en vivo' : 'Tu venta en vivo está abierta'}
          </h2>
          <p className="mt-1 text-sm text-white/60">{since(sale.startedAt, now)}</p>

          <p role="status" className="mt-4 text-sm leading-6 text-white/85">
            {onTikTok
              ? 'Tus clientes ven tu transmisión en Vitrina y compran sin salir del live.'
              : stale
                ? 'TikTok no muestra un live activo. Si ya terminaste de transmitir, termina también la venta.'
                : `Empieza a transmitir en TikTok${username ? ` con @${username}` : ''}. Tu video aparecerá aquí en menos de un minuto.`}
          </p>

          {products.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-white/50">
                {products.length === 1 ? 'Producto en este live' : `${featured.length || products.length} productos en este live`}
              </p>
              <ul className="flex gap-2">
                {products.map((o) => {
                  const image = productImages(o.product)[0];
                  return (
                    <li key={o.id} title={o.product.title} className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/10">
                      {image && <Image unoptimized width={96} height={96} src={mediaUrl(image)} alt={o.product.title} className="h-full w-full object-cover" />}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
            {confirming ? (
              <div className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-white/[0.06] p-2 pl-3" role="group" aria-label="Confirmar fin del live">
                <p className="mr-auto text-sm font-semibold">¿Terminar la venta en vivo? Tus pedidos se conservan.</p>
                <button type="button" onClick={() => setConfirming(false)} disabled={ending} className="rounded-lg px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                  Seguir en vivo
                </button>
                <button type="button" onClick={end} disabled={ending} className="inline-flex items-center gap-2 rounded-lg bg-[#FE2C55] px-3 py-2 text-xs font-bold hover:bg-[#e8264d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                  {ending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Terminar live
                </button>
              </div>
            ) : (
              <>
                {roomHref && (
                  <Link href={roomHref} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    <TikTokIcon className="h-4 w-4" /> Ver mi live
                  </Link>
                )}
                {roomHref && (
                  <button type="button" onClick={copyLink} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Enlace copiado' : 'Copiar enlace'}
                  </button>
                )}
                <button type="button" onClick={() => setConfirming(true)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white sm:ml-auto ${stale ? 'bg-[#FE2C55] font-bold hover:bg-[#e8264d]' : 'text-[#ff8aa1] hover:bg-white/10'}`}>
                  <Square className="h-3.5 w-3.5 fill-current" /> Terminar live
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
