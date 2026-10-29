import Link from 'next/link';
import { ImageOff, Store as StoreIcon, Tag } from 'lucide-react';
import type { Product } from '@/lib/api';
import { discountOf, isPromoActive, mainOffer, offerPrice, productImages, promoEndsLabel } from '@/lib/catalog';
import { DiscountBadge, PriceTag } from './PriceTag';
import { QuickAdd } from './QuickAdd';

/** Product card of the storefront grid: white rounded card, photo, title, price and cart button. */
export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const offer = mainOffer(product);
  if (!offer) return null;
  const image = productImages(product)[0];
  const promo = isPromoActive(offer);

  return (
    <article
      className={`bg-white rounded-[1.75rem] border border-slate-100 p-3 sm:p-4 shadow-sm hover-card-3d transition-all duration-300 flex flex-col justify-between group relative h-full ${compact ? 'w-56 sm:w-64' : ''}`}
    >
      <div>
        <div className="relative w-full aspect-[4/3] rounded-[1.25rem] overflow-hidden bg-slate-50 mb-3 flex items-center justify-center">
          <Link href={`/product/${product.slug}`} className="w-full h-full block" tabIndex={-1}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
            ) : (
              <span className="flex h-full items-center justify-center text-slate-300">
                <ImageOff className="h-8 w-8" />
              </span>
            )}
          </Link>
          {promo && (
            <span className="absolute top-2.5 left-2.5 z-10">
              <DiscountBadge percent={discountOf(offer)} />
            </span>
          )}
          {offer.stock === 0 && (
            <span className="absolute inset-x-0 bottom-0 bg-slate-900/75 py-1 text-center text-[11px] font-bold text-white">Agotado</span>
          )}
        </div>

        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-[13px] sm:text-sm font-black text-slate-900 line-clamp-2 group-hover:text-[#5B4DF0] transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs font-medium text-slate-500 truncate mt-0.5 mb-1.5">{product.category?.name ?? 'Producto'}</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <PriceTag price={offerPrice(offer)} regular={promo ? offer.price : undefined} />
          {offer.stock > 0 && <QuickAdd product={product} offer={offer} />}
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-600">
          <span className="inline-flex min-w-0 items-center gap-1">
            <StoreIcon className="w-3 h-3 shrink-0 text-[#5B4DF0]" />
            <span className="truncate">{offer.store?.name ?? 'Tienda'}</span>
          </span>
          {promo && offer.flashSaleEnd && (
            <span className="inline-flex shrink-0 items-center gap-1 text-amber-600 font-bold">
              <Tag className="w-3 h-3" />
              {promoEndsLabel(offer.flashSaleEnd).replace('Hasta el ', 'Hasta ')}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
