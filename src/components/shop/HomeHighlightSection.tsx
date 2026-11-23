import Link from 'next/link';
import { ChevronRight, Star, Tag } from 'lucide-react';
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

/**
 * Stores registered in Vitrina take priority (you buy inside Vitrina).
 * The TikTok lives found by the scraper only show when no registered store is live.
 */
function bubbles(lives: LiveStore[], tiktok: TikTokLiveItem[]): LiveBubble[] {
  if (lives.length > 0) {
    return lives.slice(0, 16).map((l) => ({
      key: `store-${l.store.id}`,
      name: l.store.name,
      sub: null,
      avatar: l.store.logo,
      href: l.store.tiktokUsername ? `/live/${l.store.tiktokUsername}` : `/en-vivo/${l.store.slug}`,
    }));
  }
  return tiktok.slice(0, 16).map((t) => ({
    key: `tt-${t.username}`,
    name: `@${t.username}`,
    sub: t.city,
    avatar: t.avatar_url,
    href: `/live/${t.username}`,
  }));
}

/** Who is live right now, next to the offers the stores have running. */
export function HomeHighlightSection({ lives, tiktok, deals }: { lives: LiveStore[]; tiktok: TikTokLiveItem[]; deals: Product[] }) {
  const live = bubbles(lives, tiktok);
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-10">
      {live.length > 0 && (
        <div className="lg:col-span-5 rounded-[2rem] bg-white p-5 sm:p-7 border border-slate-100 shadow-[0_10px_40px_rgba(30,20,90,0.07)]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 tracking-tight">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" aria-hidden />
              En vivo ahora
            </h2>
            <Link href="/live" className="text-sm font-bold text-[#5B4DF0] hover:text-indigo-900 flex items-center shrink-0">
              Ver todo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <ul className="flex items-start gap-5 overflow-x-auto pb-2 pt-1 scrollbar-none">
            {live.map((b) => (
              <li key={b.key} className="shrink-0">
                <Link href={b.href} className="group flex flex-col items-center text-center w-[92px]">
                  <span className="relative w-[84px] h-[84px] mb-2.5 block">
                    <span className="block w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-rose-500 via-red-500 to-amber-500 transition-transform group-hover:scale-105">
                      <span className="block w-full h-full rounded-full p-0.5 bg-white overflow-hidden">
                        <StoreAvatar name={b.name.replace('@', '')} logo={b.avatar} fill />
                      </span>
                    </span>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-px rounded-full bg-red-600 text-white font-black text-[10px] border-2 border-white">LIVE</span>
                  </span>
                  <span className="w-full text-[13px] font-bold text-slate-900 truncate leading-tight">{b.name}</span>
                  {b.sub && <span className="w-full text-[11px] text-slate-600 truncate leading-tight mt-0.5">{b.sub}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`${live.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-[2rem] bg-white p-5 sm:p-7 border border-slate-100 shadow-[0_10px_40px_rgba(30,20,90,0.07)]`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 tracking-tight"><Star className="w-5 h-5 text-[#5B4DF0] fill-[#5B4DF0]" aria-hidden />Nuestras mejores ofertas</h2>
          {deals.length > 0 && (
            <Link href="/ofertas" className="text-sm font-bold text-[#5B4DF0] hover:text-indigo-900 flex items-center">
              Ver más <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {deals.length === 0 ? (
          <p className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-sm text-slate-700">
            <Tag className="w-4 h-4 text-amber-500 shrink-0" />
            Ninguna tienda tiene descuentos activos en este momento.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
                      <span className="absolute right-2 top-2 px-2 py-0.5 rounded-full bg-[#5B4DF0] text-white text-xs font-extrabold shadow">-{discountOf(offer)}%</span>
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
