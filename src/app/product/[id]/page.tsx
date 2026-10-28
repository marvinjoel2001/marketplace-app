import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Store as StoreIcon } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';
import { discountOf, isPromoActive, mainOffer, offerPrice, productImages, promoEndsLabel } from '@/lib/catalog';
import { describeSchedule } from '@/lib/schedule';
import { DiscountBadge, PriceTag } from '@/components/shop/PriceTag';
import { BuyBox } from '@/components/shop/BuyBox';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await marketplaceApi.getProduct(id);
  const offer = product && mainOffer(product);
  if (!product || !offer) notFound();

  const images = productImages(product);
  const promo = isPromoActive(offer);
  const store = offer.store;

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-10">
      <div className="-mx-4 md:mx-0">
        <ul className="scroll-row snap-mandatory gap-0 md:gap-3">
          {(images.length ? images : ['']).map((src, i) => (
            <li key={i} className="w-full md:w-full">
              <div className="aspect-square w-screen overflow-hidden bg-surface md:w-full md:rounded-[var(--radius-card)] md:border md:border-line">
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={i === 0 ? product.title : ''} className="h-full w-full object-cover" />
                )}
              </div>
            </li>
          ))}
        </ul>
        {images.length > 1 && <p className="mt-2 px-4 text-center text-xs text-muted md:px-0">Desliza para ver {images.length} fotos</p>}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          {promo && (
            <div className="mb-2 flex items-center gap-2">
              <DiscountBadge percent={discountOf(offer)} />
              <span className="text-sm font-medium text-ink-soft">{promoEndsLabel(offer.flashSaleEnd)}</span>
            </div>
          )}
          <h1 className="type-sign text-2xl font-extrabold leading-tight">{product.title}</h1>
          <div className="mt-3">
            <PriceTag price={offerPrice(offer)} regular={promo ? offer.price : undefined} size="lg" />
          </div>
        </div>

        <BuyBox product={product} offer={offer} />

        {store && (
          <div className="panel flex flex-col gap-3 p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <StoreIcon className="h-4 w-4 text-verde" />
              {store.name}
            </p>
            <p className="flex items-start gap-2 text-ink-soft">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-verde" />
              <span>
                Entrega a domicilio: {describeSchedule(store)}. Eliges el día y la hora al pedir.
              </span>
            </p>
          </div>
        )}

        {product.description && (
          <section>
            <h2 className="mb-1.5 font-bold">Descripción</h2>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
          </section>
        )}

        <Link href="/" className="text-sm font-semibold text-verde-dark">
          Seguir viendo productos
        </Link>
      </div>
    </div>
  );
}
