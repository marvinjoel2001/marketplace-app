'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Pin,
  Search,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { marketplaceApi, type FeedComment, type LiveFeed, type LiveRoomData, type Offer, type Product, type Store } from '@/lib/api';
import { discountOf, isPromoActive, mediaUrl, offerPrice, productImages } from '@/lib/catalog';
import { copyText, formatBs } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { toCartItem } from '@/components/shop/QuickAdd';
import { TikTokIcon } from '@/components/common/TikTokIcon';
import { LiveVideo } from './LivePreview';

type StoreOffer = Offer & { product: Product };
type Tab = 'productos' | 'chat' | 'destacados';
type Filter = 'todos' | 'disponibles' | 'agotados';

const POLL_MS = 2500;
const MAX_COMMENTS = 200;

const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace('.0', '')}M` : n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}K` : String(n);

function Avatar({ src, name, size = 32 }: { src: string | null; name: string; size?: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="shrink-0 overflow-hidden rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white" style={{ width: size, height: size }}>
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(src)} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} className="h-full w-full object-cover" />
      ) : (
        name.replace('@', '').slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

function Availability({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><span className="h-2 w-2 rounded-full bg-slate-500" />Agotado</span>;
  if (stock <= 3) return <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-400" />Últimas {stock} unidades</span>;
  return <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400" />Disponible</span>;
}

/** The live room: video with chat and likes on top, and the store's products to buy without leaving. */
export function LiveRoom({ room }: { room: LiveRoomData }) {
  const router = useRouter();
  const toast = useToast();
  const { addToCart } = useCart();
  const live = room.live;
  const store = room.store;
  const name = store?.name ?? `@${room.username}`;
  const avatar = store?.logo || live?.avatar_url || null;
  const tiktokUrl = live?.live_url ?? `https://www.tiktok.com/@${room.username}/live`;

  const [feed, setFeed] = useState<LiveFeed | null>(room.feed);
  const [comments, setComments] = useState<FeedComment[]>(room.feed?.comments ?? []);
  const [muted, setMuted] = useState(true);
  const [tab, setTab] = useState<Tab>(store?.offers.length || room.feed?.products.length ? 'productos' : 'chat');
  const [filter, setFilter] = useState<Filter>('todos');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [likeBump, setLikeBump] = useState(false);
  const lastId = useRef<string | undefined>(room.feed?.comments.at(-1)?.id);
  const panel = useRef<HTMLDivElement>(null);
  const tabBody = useRef<HTMLDivElement>(null);
  const previousLikes = useRef<number | null>(room.feed?.likes ?? null);

  // Follow the room: new comments, likes and viewers every few seconds while the page is visible.
  useEffect(() => {
    if (!room.isLive || !live) return;
    let active = true;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const next = await marketplaceApi.getLiveFeed(room.username, lastId.current);
        if (!active) return;
        setFeed(next);
        if (next.comments.length) {
          lastId.current = next.comments.at(-1)!.id;
          setComments((prev) => {
            const seen = new Set(prev.map((c) => c.id));
            return [...prev, ...next.comments.filter((c) => !seen.has(c.id))].slice(-MAX_COMMENTS);
          });
        }
      } catch {
        // Keep what we have; the next tick tries again.
      }
    };
    const timer = setInterval(tick, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [room.isLive, room.username, live]);

  // A small pulse on the heart when the like count grows.
  const likes = feed?.likes ?? null;
  useEffect(() => {
    if (likes === null) return;
    const grew = previousLikes.current !== null && likes > previousLikes.current;
    previousLikes.current = likes;
    if (!grew) return;
    const on = setTimeout(() => setLikeBump(true), 0);
    const off = setTimeout(() => setLikeBump(false), 400);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [likes]);

  useEffect(() => {
    // Keep the newest comment in view inside the panel, without moving the page.
    const box = tabBody.current;
    if (tab === 'chat' && box) box.scrollTop = box.scrollHeight;
  }, [comments, tab]);

  const offers = useMemo(() => store?.offers ?? [], [store]);
  const storeForCart = store as unknown as Store | undefined;
  const filtered = offers.filter((o) => {
    if (filter === 'disponibles' && o.stock <= 0) return false;
    if (filter === 'agotados' && o.stock > 0) return false;
    return !query.trim() || o.product.title.toLowerCase().includes(query.trim().toLowerCase());
  });
  const shopProducts = feed?.products ?? [];
  const productCount = offers.length || shopProducts.length;
  const viewers = feed?.viewers ?? live?.viewer_count ?? 0;

  const buy = useCallback(
    (offer: StoreOffer) => {
      addToCart(toCartItem(offer.product, { ...offer, store: storeForCart }));
      router.push(`/checkout?store=${offer.storeId}`);
    },
    [addToCart, router, storeForCart],
  );

  const add = (offer: StoreOffer) => {
    addToCart(toCartItem(offer.product, { ...offer, store: storeForCart }));
    toast(`Agregaste ${offer.product.title} al carrito`);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} en vivo`, url });
        return;
      } catch (err) {
        // Closing the share sheet is not an error; any other failure falls back to copying.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    if (await copyText(url)) toast('Enlace copiado');
    else toast('No se pudo copiar el enlace. Cópialo desde la barra del navegador.', 'error');
  };

  const openProducts = () => {
    setTab('productos');
    panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const poster = live?.cover_image_url || avatar;
  const recent = comments.slice(-5);
  const featured = offers.filter((o) => store?.featuredProductIds.includes(o.productId));
  const strip = featured.length ? featured : offers.slice(0, 10);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)] lg:rounded-[28px] lg:border lg:border-[#1f2a33] lg:bg-[#0b1117] lg:p-5">
      <section aria-label={`Live de ${name}`} className="min-w-0">
        <header className="mb-3 flex items-center gap-3">
          <Link href="/live" aria-label="Volver a los lives" className="rounded-full p-2 text-slate-300 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Avatar src={avatar} name={name} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-white">{store?.liveTitle || live?.title || 'En vivo'}</p>
            <p className="flex min-w-0 items-center gap-2 text-sm text-slate-300">
              <span className="truncate">{name}</span>
              <a
                href={`https://www.tiktok.com/@${room.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-white/20 px-2.5 py-0.5 text-xs font-bold text-white hover:bg-white/10"
              >
                + Seguir
              </a>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Activar sonido' : 'Silenciar'} className="rounded-full p-2.5 text-white hover:bg-white/10">
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button type="button" onClick={share} aria-label="Compartir este live" className="rounded-full p-2.5 text-white hover:bg-white/10">
              <Share2 className="h-5 w-5" />
            </button>
            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir en TikTok" className="hidden rounded-full p-2.5 text-white hover:bg-white/10 sm:inline-flex">
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </header>

        <div className="relative h-[72dvh] max-h-[680px] min-h-[420px] overflow-hidden rounded-[22px] bg-black">
          {poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt="" referrerPolicy="no-referrer" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
          )}
          <div className="absolute inset-y-0 left-1/2 aspect-[9/16] max-w-full -translate-x-1/2 overflow-hidden">
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
            )}
            {live && room.isLive && (
              <LiveVideo roomId={live.room_id} hlsUrl={live.stream_hls_url} flvUrl={live.stream_flv_url} alt={name} enabled expanded muted={muted} />
            )}
          </div>

          <div className="absolute left-3 top-3 flex items-center gap-2">
            {room.isLive ? (
              <span className="rounded-md bg-[#FE2C55] px-2.5 py-1 text-xs font-black text-white">LIVE</span>
            ) : (
              <span className="rounded-md bg-black/60 px-2.5 py-1 text-xs font-bold text-white">Terminó</span>
            )}
            {room.isLive && viewers > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-xs font-bold text-white">
                <Eye className="h-3.5 w-3.5" /> {compact(viewers)}
              </span>
            )}
          </div>

          {room.isLive && (
            <div className="absolute bottom-24 right-3 flex flex-col items-center gap-3 text-white">
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="Dar me gusta en TikTok" className="flex flex-col items-center gap-1 text-xs font-bold">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur transition-transform ${likeBump ? 'scale-125' : ''}`}>
                  <Heart className="h-6 w-6 fill-[#FE2C55] text-[#FE2C55]" />
                </span>
                {likes !== null ? compact(likes) : ''}
              </a>
              <button type="button" onClick={() => setTab('chat')} className="flex flex-col items-center gap-1 text-xs font-bold" aria-label="Ver el chat">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur">
                  <MessageCircle className="h-6 w-6" />
                </span>
                {comments.length > 0 ? compact(comments.length) : ''}
              </button>
              <button type="button" onClick={share} className="flex flex-col items-center gap-1 text-xs font-bold" aria-label="Compartir">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur">
                  <Share2 className="h-5 w-5" />
                </span>
                {feed?.shares ? compact(feed.shares) : ''}
              </button>
              {productCount > 0 && (
                <button type="button" onClick={openProducts} className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#FE2C55]" aria-label={`Ver ${productCount} productos`}>
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-amber-400 px-1 text-[10px] font-black leading-[18px] text-slate-900">{productCount}</span>
                </button>
              )}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-16">
            <ul className="mb-3 max-w-[78%] space-y-2" aria-live="polite" aria-label="Últimos comentarios">
              {recent.map((c) => (
                <li key={c.id} className="flex items-start gap-2 animate-fade-in-up">
                  <Avatar src={c.avatar} name={c.name} size={28} />
                  <p className="min-w-0 text-[13px] leading-snug text-white">
                    <span className="block truncate text-xs font-semibold text-white/70">{c.name}</span>
                    <span className="break-words">{c.text}</span>
                  </p>
                </li>
              ))}
            </ul>
            {room.isLive ? (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full max-w-sm items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white/80 backdrop-blur hover:bg-white/20"
              >
                <TikTokIcon className="h-4 w-4" size={16} /> Comenta o pregunta en TikTok
              </a>
            ) : (
              <Link href="/live" className="inline-flex rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-900">
                Ver otros lives
              </Link>
            )}
          </div>
        </div>

        {strip.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-2 text-sm font-bold text-white">{featured.length ? 'Vistos en este live' : 'De esta tienda'}</h2>
            <ul className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {strip.map((o, i) => {
                const image = productImages(o.product)[0];
                return (
                  <li key={o.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={openProducts}
                      className={`relative block h-28 w-24 overflow-hidden rounded-xl border-2 bg-[#182127] ${i === 0 && featured.length ? 'border-[#FE2C55]' : 'border-transparent'}`}
                      aria-label={`${o.product.title}, ${formatBs(offerPrice(o))}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                      {o.stock <= 0 && <span className="absolute inset-x-0 top-2 mx-auto w-fit rounded bg-black/70 px-1.5 text-[10px] font-bold text-white">Agotado</span>}
                      <span className={`absolute inset-x-1 bottom-1 rounded-md py-0.5 text-center text-xs font-black text-white ${i === 0 && featured.length ? 'bg-[#FE2C55]' : 'bg-black/70'}`}>
                        {formatBs(offerPrice(o))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <aside ref={panel} aria-label="Productos y chat" className="scroll-mt-24 flex min-h-0 flex-col rounded-[22px] border border-[#1f2a33] bg-[#10171d] lg:max-h-[calc(72dvh+64px)] lg:border-0 lg:bg-transparent">
        <div className="flex items-center gap-2 p-3" role="tablist" aria-label="Secciones del live">
          {(
            [
              ['productos', `Productos${productCount ? ` (${productCount})` : ''}`, ShoppingBag],
              ['chat', 'Chat', MessageCircle],
              ['destacados', 'Destacados', Pin],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-bold transition-colors ${
                tab === key ? 'bg-[#FE2C55] text-white' : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div ref={tabBody} className="min-h-0 flex-1 overflow-y-auto px-3 pb-3" role="tabpanel">
          {tab === 'productos' &&
            (offers.length > 0 ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  {searching ? (
                    <div className="relative flex-1">
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar en esta tienda"
                        aria-label="Buscar productos de la tienda"
                        className="h-10 w-full rounded-full border border-white/15 bg-white/5 px-4 pr-10 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-white/40"
                      />
                      <button type="button" onClick={() => { setSearching(false); setQuery(''); }} aria-label="Cerrar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-300">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      {(
                        [
                          ['todos', `Todos (${offers.length})`],
                          ['disponibles', `Disponibles (${offers.filter((o) => o.stock > 0).length})`],
                          ['agotados', `Agotados (${offers.filter((o) => o.stock <= 0).length})`],
                        ] as const
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={filter === key}
                          onClick={() => setFilter(key)}
                          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${filter === key ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                        >
                          {label}
                        </button>
                      ))}
                      <button type="button" onClick={() => setSearching(true)} aria-label="Buscar productos" className="ml-auto rounded-full bg-white/5 p-2 text-slate-200 hover:bg-white/10">
                        <Search className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">Ningún producto coincide.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {filtered.map((o) => {
                      const image = productImages(o.product)[0];
                      const promo = isPromoActive(o);
                      return (
                        <li key={o.id} className="flex gap-3 rounded-2xl bg-white/[0.04] p-2.5">
                          <Link href={`/product/${o.product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {image && <img src={image} alt="" className="h-full w-full object-cover" />}
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <Link href={`/product/${o.product.slug}`} className="line-clamp-2 text-sm font-bold text-white hover:underline">
                              {o.product.title}
                            </Link>
                            {promo && <span className="mt-1 w-fit rounded bg-[#FE2C55]/20 px-1.5 py-0.5 text-[11px] font-bold text-[#ff6b86]">Oferta -{discountOf(o)}%</span>}
                            <p className="mt-1 text-lg font-black text-white">
                              {formatBs(offerPrice(o))}
                              {promo && <span className="ml-1.5 text-xs font-semibold text-slate-400 line-through">{formatBs(o.price)}</span>}
                            </p>
                            <Availability stock={o.stock} />
                            <div className="mt-2 flex gap-2">
                              {o.stock > 0 ? (
                                <>
                                  <button type="button" onClick={() => buy(o)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FE2C55] px-3 py-2 text-sm font-bold text-white hover:bg-[#e4244b]">
                                    <ShoppingCart className="h-4 w-4" /> Comprar
                                  </button>
                                  <button type="button" onClick={() => add(o)} aria-label={`Agregar ${o.product.title} al carrito`} className="rounded-xl border border-white/15 px-3 text-white hover:bg-white/10">
                                    <ShoppingBag className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="flex-1 rounded-xl border border-white/10 py-2 text-center text-sm font-bold text-slate-400">Agotado</span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            ) : shopProducts.length > 0 ? (
              <ul className="space-y-2.5">
                {shopProducts.map((p) => (
                  <li key={p.title} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-2.5">
                    <span className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.image && <img src={p.image} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-white">{p.title}</p>
                      {p.price && <p className="mt-1 text-lg font-black text-white">{p.price}</p>}
                      <a href={p.url ?? tiktokUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-[#FE2C55] px-3 py-1.5 text-sm font-bold text-white">
                        Comprar en TikTok <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl bg-white/[0.04] p-5 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-3 font-bold text-white">{name} vende por el chat del live</p>
                <p className="mt-1 text-sm text-slate-300">
                  Pregunta por lo que muestra y coordina con la tienda.
                  {live?.price_text ? ` En el título del live dice ${live.price_text}.` : ''}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE2C55] px-4 py-2.5 text-sm font-bold text-white">
                    <TikTokIcon className="h-4 w-4" size={16} /> Preguntar en TikTok
                  </a>
                  {live?.whatsapp_url && (
                    <a href={live.whatsapp_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">
                      Escribir por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}

          {tab === 'chat' && (
            <div>
              {feed?.status === 'unavailable' && comments.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No pudimos traer el chat de este live. Puedes verlo en TikTok.</p>
              )}
              {feed?.status !== 'unavailable' && comments.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">{room.isLive ? 'Los comentarios aparecen aquí mientras llegan.' : 'Este live ya terminó.'}</p>
              )}
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="flex items-start gap-2.5">
                    <Avatar src={c.avatar} name={c.name} size={32} />
                    <p className="min-w-0 text-sm leading-snug text-slate-100">
                      <span className="block truncate text-xs font-semibold text-slate-400">{c.name}</span>
                      <span className="break-words">{c.text}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'destacados' &&
            (feed?.pins.length ? (
              <ul className="space-y-2.5">
                {feed.pins.map((p) => (
                  <li key={p.id} className="rounded-2xl bg-white/[0.04] p-3.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Pin className="h-3.5 w-3.5" /> Fijado por {p.name}
                    </p>
                    <p className="mt-1 text-sm text-white">{p.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">Cuando la tienda fije un mensaje en su live (precios, números de prenda), aparece aquí.</p>
            ))}
        </div>
      </aside>
    </div>
  );
}
