import Link from 'next/link';
import { ChevronRight, Tag } from 'lucide-react';
import type { LiveStore, Product, TikTokLiveItem } from '@/lib/api';
import { discountOf, mainOffer, offerPrice, productImages, promoEndsLabel } from '@/lib/catalog';
import { formatBs } from '@/lib/utils';
import { StoreAvatar } from './LiveStrip';
import { QuickAdd } from './QuickAdd';

const TILE_TINTS = [
  'bg-[#FFF8E7] border-amber-200/70',
  'bg-[#F0F4FF] border-indigo-200/70',
  'bg-[#F4F6F8] border-sky-200/70',
  'bg-[#F8FAFC] border-slate-200/70',
];

interface LiveBubble {
  key: string;
  name: string;
  sub: string | null;
  avatar: string | null;
  href: string;
}

/** Stores registered in Vitrina first (you buy inside Vitrina), then the TikTok lives found by the scraper. */
function bubbles(lives: LiveStore[], tiktok: TikTokLiveItem[]): LiveBubble[] {
  const own = lives.map((l) => ({
    key: `store-${l.store.id}`,
    name: l.store.name,
    sub: 'Compra aquí',
    avatar: l.store.logo,
    href: `/en-vivo/${l.store.slug}`,
  }));
  const seen = new Set(lives.map((l) => l.store.tiktokUsername?.toLowerCase()).filter(Boolean));
  const scraped = tiktok
    .filter((t) => !seen.has(t.username.toLowerCase()))
    .map((t) => ({
      key: `tt-${t.username}`,
      name: `@${t.username}`,
      sub: t.viewer_count > 0 ? `${t.viewer_count.toLocaleString('es-BO')} viendo` : null,
      avatar: t.avatar_url,
      href: '/live',
    }));
  return [...own, ...scraped].slice(0, 16);
}

/** Who is live right now, next to the offers the stores have running. */
export function HomeHighlightSection({ lives, tiktok, deals }: { lives: LiveStore[]; tiktok: TikTokLiveItem[]; deals: Product[] }) {
  const live = bubbles(lives, tiktok);
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
      {live.length > 0 && (
        <div className="lg:col-span-5 rounded-[2rem] bg-white/90 backdrop-blur-2xl p-5 sm:p-6 border border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 tracking-tight">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" aria-hidden />
              En vivo ahora
            </h2>
            <Link href="/live" className="text-sm font-bold text-indigo-700 hover:text-indigo-900 flex items-center shrink-0">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <ul className="flex items-start gap-4 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {live.map((b) => (
              <li key={b.key} className="shrink-0">
                <Link href={b.href} className="group flex flex-col items-center text-center w-[70px]">
                  <span className="relative w-16 h-16 mb-2 block">
                    <span className="block w-full h-full rounded-full p-[2.5px] bg-gradient-to-tr from-rose-500 via-red-500 to-amber-500 transition-transform group-hover:scale-105">
                      <span className="block w-full h-full rounded-full p-0.5 bg-white overflow-hidden">
                        <StoreAvatar name={b.name.replace('@', '')} logo={b.avatar} fill />
                      </span>
                    </span>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 rounded-full bg-red-600 text-white font-black text-[9px] border border-white">LIVE</span>
                  </span>
                  <span className="w-full text-xs font-bold text-slate-900 truncate leading-tight">{b.name}</span>
                  {b.sub && <span className="w-full text-[11px] text-slate-600 truncate leading-tight mt-0.5">{b.sub}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`${live.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-[2rem] bg-white/90 backdrop-blur-2xl p-5 sm:p-6 border border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.06)]`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Nuestras mejores ofertas</h2>
          {deals.length > 0 && (
            <Link href="/ofertas" className="text-sm font-bold text-indigo-700 hover:text-indigo-900 flex items-center">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {deals.length === 0 ? (
          <p className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm text-slate-700">
            <Tag className="w-4 h-4 text-amber-500 shrink-0" />
            Ninguna tienda tiene descuentos activos en este momento.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {deals.slice(0, 4).map((product, i) => {
              const offer = mainOffer(product)!;
              const image = productImages(product)[0];
              return (
                <div key={product.id} className={`rounded-2xl p-2.5 border ${TILE_TINTS[i % TILE_TINTS.length]} flex flex-col justify-between group`}>
                  <Link href={`/product/${product.slug}`} className="block">
                    <span className="relative block aspect-square w-full rounded-xl overflow-hidden mb-2 bg-white">
                      {image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                      <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-[#5B4DF0] text-white text-[10px] font-black">-{discountOf(offer)}%</span>
                    </span>
                    <span className="block text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{product.title}</span>
                    <span className="block text-[11px] font-semibold text-amber-700 mt-0.5">{promoEndsLabel(offer.flashSaleEnd)}</span>
                  </Link>
                  <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-200/70">
                    <span className="text-sm font-black text-slate-900 truncate">{formatBs(offerPrice(offer))}</span>
                    <QuickAdd product={product} offer={offer} light />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
