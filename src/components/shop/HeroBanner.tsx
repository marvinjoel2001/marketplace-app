'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Store as StoreIcon } from 'lucide-react';
import type { Product } from '@/lib/api';
import { discountOf, isPromoActive, mainOffer, offerPrice, productImages } from '@/lib/catalog';
import { formatBs } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { toCartItem } from './QuickAdd';

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
  const nextImage = productImages(products[(active + 1) % count])[0];
  const go = (delta: number) => setActive((i) => (i + delta + count) % count);

  const buyNow = () => {
    addToCart(toCartItem(product, offer));
    router.push(`/checkout?store=${offer.storeId}`);
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 sm:p-10 lg:p-14 mb-8">
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Producto anterior"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow-md border border-white hidden sm:flex items-center justify-center transition-all hover:scale-105 z-30 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Producto siguiente"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow-md border border-white hidden sm:flex items-center justify-center transition-all hover:scale-105 z-30 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-center sm:px-8">
        <div className="lg:col-span-7 space-y-5 text-left">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50/90 text-[#5B4DF0] text-xs font-bold border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            {promo ? `Oferta -${discountOf(offer)}%` : 'Nuevo en Vitrina'}
          </span>

          <h1 className="text-[2.1rem] sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            <Link href={`/product/${product.slug}`} className="hover:opacity-90">
              <span className="block text-[#0F172A]">{line1}</span>
              {line2 && <span className="block text-[#3B82F6]">{line2}</span>}
            </Link>
          </h1>

          {product.description && (
            <p className="text-[15px] sm:text-base text-slate-600 max-w-lg leading-relaxed line-clamp-2">{product.description}</p>
          )}

          <div className="pt-1 flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={buyNow}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-[#5B4DF0] to-[#794EF5] hover:from-[#4E3FE0] hover:to-[#6C40E5] text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Comprar ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {offer.store && (
              <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 ring-2 ring-white flex items-center justify-center">
                  <StoreIcon className="w-4 h-4" />
                </span>
                {offer.store.name}
              </span>
            )}
          </div>

          {count > 1 && (
            <div className="pt-2 flex items-center space-x-2">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver ${p.title}`}
                  aria-current={i === active % count}
                  className={`transition-all rounded-full cursor-pointer ${i === active % count ? 'w-6 h-2 bg-[#5B4DF0]' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 relative flex items-center justify-center">
          <Link href={`/product/${product.slug}`} className="relative w-full max-w-[420px] aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden group block bg-slate-50">
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
          </Link>

          <div className="absolute top-3 right-3 sm:right-6 rounded-2xl bg-white/95 border border-white/80 shadow-lg px-4 py-2 text-center select-none">
            {promo && <span className="block text-xs font-semibold text-slate-500 line-through">{formatBs(offer.price)}</span>}
            <span className="block text-lg font-black text-[#5B4DF0] tracking-tight">{formatBs(offerPrice(offer))}</span>
          </div>

          {count > 1 && nextImage && (
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Ver el siguiente producto"
              className="absolute bottom-3 right-3 sm:right-6 flex items-center gap-2 rounded-2xl bg-white/95 border border-white/80 shadow-md p-1 pr-2 cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nextImage} alt="" className="w-12 h-12 object-cover rounded-xl" />
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
