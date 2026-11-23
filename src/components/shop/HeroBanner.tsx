'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ChevronLeft, ChevronRight, ShoppingCart, Sparkles, Store as StoreIcon } from 'lucide-react';
import type { Product } from '@/lib/api';
import { discountOf, isPromoActive, mainOffer, offerPrice, productImages } from '@/lib/catalog';
import { formatBs } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { toCartItem } from './QuickAdd';
import { parseVariants } from '@/lib/variants';

/** Two-tone title: the first half of the name in dark, the rest in blue. */
function splitTitle(title: string): [string, string] {
  const words = title.split(/\s+/);
  if (words.length < 2) return [title, ''];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
}

/** Glass carousel with real products from the stores, offers first. */
export function HeroBanner({ products }: { products: Product[] }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [active, setActive] = useState(0);
  const count = products.length;

  // Advances on its own, and restarts the wait whenever the shopper picks a slide.
  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % count), 7000);
    return () => clearInterval(timer);
  }, [count, active]);

  if (count === 0) return null;
  const product = products[active % count];
  const offer = mainOffer(product)!;
  const promo = isPromoActive(offer);
  const [line1, line2] = splitTitle(product.title);
  const image = productImages(product)[0];
  const go = (delta: number) => setActive((i) => (i + delta + count) % count);

  const buyNow = () => {
    // With options the buyer picks one on the product page first.
    if (parseVariants(offer).length) return router.push(`/product/${product.slug}`);
    addToCart(toCartItem(product, offer));
    router.push(`/checkout?store=${offer.storeId}`);
  };

  const inStock = offer.stock > 0;

  return (
    <section aria-label="Producto destacado" className="relative mb-8 sm:mb-10">
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center min-h-[26rem] lg:min-h-[30rem] py-4 sm:py-8">
        <div className="lg:col-span-6 xl:col-span-6 space-y-5 text-left order-2 lg:order-1 lg:pl-4 xl:pl-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 text-[#5B4DF0] text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            {promo ? `Oferta -${discountOf(offer)}%` : 'Nueva en Vitrina'}
          </span>

          <h1 className="text-[2.4rem] sm:text-6xl xl:text-[4.4rem] font-extrabold tracking-tight leading-[1.02]">
            <Link href={`/product/${product.slug}`} className="hover:opacity-90">
              <span className="block text-[#0F172A]">{line1}</span>
              {line2 && <span className="block text-[#5B4DF0]">{line2}</span>}
            </Link>
          </h1>

          {product.description && (
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed line-clamp-2">{product.description}</p>
          )}

          <div className="pt-1 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={buyNow}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#5B4DF0] hover:bg-[#4E3FE0] text-white font-bold text-base rounded-full shadow-lg shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              <span>Comprar ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {offer.store && (
              <Link
                href={`/en-vivo/${offer.store.slug}`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-slate-900 font-bold text-base shadow-sm transition-all"
              >
                <StoreIcon className="w-[18px] h-[18px] text-emerald-600" />
                <span className="truncate max-w-[14rem]">Tienda oficial</span>
              </Link>
            )}
          </div>

          {count > 1 && (
            <div className="pt-3 flex items-center gap-2">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver ${p.title}`}
                  aria-current={i === active % count}
                  className={`transition-all rounded-full cursor-pointer ${i === active % count ? 'w-9 h-2.5 bg-[#5B4DF0]' : 'w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 relative order-1 lg:order-2 flex items-center justify-center">
          {/* Purple shape behind the product */}
          <div aria-hidden className="absolute inset-y-2 right-0 left-6 sm:left-16 lg:left-10 rounded-[38%_62%_46%_54%/46%_40%_60%_54%] bg-gradient-to-br from-indigo-200/80 via-[#C9C3FA] to-violet-200/70 -rotate-2" />
          <Link href={`/product/${product.slug}`} className="relative block w-full max-w-[34rem] aspect-[5/4] group">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-contain p-4 sm:p-8 drop-shadow-[0_24px_30px_rgba(60,40,160,0.28)] group-hover:scale-[1.03] transition-transform duration-500"
              />
            )}
          </Link>

          <span
            className={`absolute top-6 right-2 sm:right-8 inline-flex items-center gap-2 rounded-2xl bg-white shadow-xl shadow-indigo-900/10 px-4 py-2.5 text-base font-extrabold rotate-[5deg] select-none ${
              inStock ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <span className={`flex w-7 h-7 items-center justify-center rounded-full text-white ${inStock ? 'bg-emerald-500' : 'bg-slate-400'}`}>
              <Check className="w-4 h-4" strokeWidth={3} />
            </span>
            {inStock ? 'En stock' : 'Agotado'}
          </span>

          <span className="absolute bottom-10 right-0 sm:right-4 rounded-2xl bg-white shadow-xl shadow-indigo-900/10 px-5 py-2.5 text-center -rotate-[5deg] select-none">
            {promo && <span className="block text-xs font-semibold text-slate-400 line-through leading-none mb-0.5">{formatBs(offer.price)}</span>}
            <span className="block text-2xl font-extrabold text-[#5B4DF0] tracking-tight leading-none">{formatBs(offerPrice(offer))}</span>
          </span>

          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Producto anterior" className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 text-slate-600 hidden sm:flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Producto siguiente" className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 text-slate-600 hidden sm:flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
