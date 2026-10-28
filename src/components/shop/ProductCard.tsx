import Link from 'next/link';
import { ImageOff } from 'lucide-react';
import type { Product } from '@/lib/api';
import { discountOf, isPromoActive, mainOffer, offerPrice, productImages } from '@/lib/catalog';
import { DiscountBadge, PriceTag } from './PriceTag';
import { QuickAdd } from './QuickAdd';

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const offer = mainOffer(product);
  if (!offer) return null;
  const image = productImages(product)[0];
  const promo = isPromoActive(offer);
  const price = offerPrice(offer);

  return (
    <article className={`group relative flex flex-col ${compact ? 'w-40 sm:w-48' : ''}`}>
      <Link href={`/product/${product.slug}`} className="block rounded-[var(--radius-card)]">
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <ImageOff className="h-8 w-8" />
            </div>
          )}
          {promo && (
            <span className="absolute left-2 top-2">
              <DiscountBadge percent={discountOf(offer)} />
            </span>
          )}
          {offer.stock === 0 && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-xs font-semibold text-white">Agotado</span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-ink">{product.title}</h3>
        {offer.store && <p className="mt-0.5 truncate text-xs text-muted">{offer.store.name}</p>}
      </Link>
      <div className="mt-2 flex items-end justify-between gap-2">
        <PriceTag price={price} regular={promo ? offer.price : undefined} />
        {offer.stock > 0 && <QuickAdd product={product} offer={offer} />}
      </div>
    </article>
  );
}
