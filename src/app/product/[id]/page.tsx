import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Clock, Store as StoreIcon } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';
import { discountOf, isPromoActive, mainOffer, offerPrice, productImages, promoEndsLabel } from '@/lib/catalog';
import { describeSchedule } from '@/lib/schedule';
import { DiscountBadge, PriceTag } from '@/components/shop/PriceTag';
import { BuyBox } from '@/components/shop/BuyBox';
import { ProductGallery } from '@/components/shop/ProductGallery';

export const dynamic = 'force-dynamic';

// One backend call per request, shared by the metadata and the page.
const loadProduct = cache((id: string) => marketplaceApi.getProduct(id));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const product = await loadProduct((await params).id);
  if (!product) return { title: 'Producto no encontrado — Vitrina' };
  const offer = mainOffer(product);
  const description = (product.description || '').slice(0, 160) || `${product.title}${offer?.store ? ` en ${offer.store.name}` : ''}`;
  const image = productImages(product)[0];
  return {
    title: `${product.title} — Vitrina`,
    description,
    openGraph: { title: product.title, description, ...(image && { images: [image] }) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await loadProduct(id);
  const offer = product && mainOffer(product);
  if (!product || !offer) notFound();

  const promo = isPromoActive(offer);
  const store = offer.store;

  return (
    <div className="space-y-5">
      <nav className="flex items-center space-x-2 text-xs text-slate-600 font-medium" aria-label="Ruta">
        <Link href="/" className="hover:text-[#5B4DF0]">
          Inicio
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/?category=${product.category.slug}`} className="hover:text-[#5B4DF0]">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-4 sm:p-8 grid gap-6 md:grid-cols-2 md:gap-10">
        <ProductGallery images={productImages(product)} title={product.title} />

        <div className="flex flex-col gap-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/90 text-[#5B4DF0] text-xs font-bold border border-indigo-100">
                {product.category?.name ?? 'Producto'}
              </span>
              {promo && (
                <>
                  <DiscountBadge percent={discountOf(offer)} />
                  <span className="text-xs font-bold text-amber-600">{promoEndsLabel(offer.flashSaleEnd)}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">{product.title}</h1>
            <div className="mt-4">
              <PriceTag price={offerPrice(offer)} regular={promo ? offer.price : undefined} size="lg" />
            </div>
          </div>

          <BuyBox product={product} offer={offer} />

          {store && (
            <div className="rounded-2xl bg-white/70 border border-white/80 shadow-2xs p-4 flex flex-col gap-3 text-sm">
              <p className="flex items-center gap-2 font-black text-slate-900">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <StoreIcon className="h-4 w-4" />
                </span>
                {store.name}
              </p>
              <p className="flex items-start gap-2 text-slate-600 text-xs leading-relaxed">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#5B4DF0]" />
                <span>
                  Entrega a domicilio: {describeSchedule(store)}. Eliges el día y la hora al hacer tu pedido.
                </span>
              </p>
            </div>
          )}

          {product.description && (
            <section>
              <h2 className="mb-1.5 text-sm font-black text-slate-900">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{product.description}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
