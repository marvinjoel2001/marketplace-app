import React from 'react';
import { marketplaceApi } from '@/lib/api';
import { HeroBanner } from '@/components/storefront/HeroBanner';
import { HomeHighlightSection } from '@/components/storefront/HomeHighlightSection';
import { BrowseByCategory } from '@/components/storefront/BrowseByCategory';
import { SpecialOfferBanner } from '@/components/storefront/SpecialOfferBanner';
import { PersonalizedStorefrontFeed } from '@/components/storefront/PersonalizedStorefrontFeed';
import { TrustBadgesBar } from '@/components/storefront/TrustBadgesBar';
import { VendorViewPrompt } from '@/components/vendor/VendorViewPrompt';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; flashSale?: string; view?: string }>;
}) {
  const params = await searchParams;
  const categorySlug = params.category;
  const searchQuery = params.q;
  const isFlashSale = params.flashSale === 'true';

  let products: any[] = [];
  try {
    products = await marketplaceApi.getProducts({
      category: categorySlug,
      flashSale: isFlashSale,
      q: searchQuery,
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }

  const isFiltering = !!(searchQuery || categorySlug || isFlashSale);

  return (
    <div className="w-full">
      {/* Banner de aviso para tiendas que visualizan el marketplace */}
      <VendorViewPrompt />

      {/* If not filtering, show full Vitrina Market Experience */}
      {!isFiltering ? (
        <>
          {/* 1. Hero Banner Asimétrico: Roco Wireless Headphones & Happy User */}
          <HeroBanner />

          {/* 2. Fila Doble: En Vivo Ahora (Tiendas Destacadas) + Nuestras Mejores Ofertas */}
          <div id="tiendas" className="scroll-mt-20">
            <HomeHighlightSection />
          </div>

          {/* 3. Categorías Principales (Cuadrícula de 8 tarjetas verde menta) */}
          <BrowseByCategory />

          {/* 4. Mid-Page Special Offer: Banner de Promoción */}
          <SpecialOfferBanner />

          {/* 5. Catálogo Completo y Recomendaciones Personalizadas */}
          <div id="catalogo" className="scroll-mt-20">
            <PersonalizedStorefrontFeed
              initialProducts={products}
              searchQuery={searchQuery}
              categorySlug={categorySlug}
              isFlashSale={isFlashSale}
            />
          </div>

          {/* 6. Garantías y Envíos OpenDSP */}
          <div id="envios" className="scroll-mt-20">
            <TrustBadgesBar />
          </div>
        </>
      ) : (
        /* If filtering by search, category or flash sale, show filtered results */
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100/90 flex items-center justify-between shadow-card">
            <div>
              <h1 className="text-xl font-black text-slate-900">
                {searchQuery
                  ? `Resultados para: "${searchQuery}"`
                  : categorySlug
                  ? `Categoría: ${categorySlug.replace(/-/g, ' ')}`
                  : '⚡ Ofertas Relámpago activas'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Se encontraron {products.length} productos disponibles en Vitrina Market con despacho express OpenDSP
              </p>
            </div>
          </div>

          {/* Destacados en vivo también en modo búsqueda */}
          <div id="tiendas" className="scroll-mt-20">
            <HomeHighlightSection />
          </div>

          <div id="catalogo" className="scroll-mt-20">
            <PersonalizedStorefrontFeed
              initialProducts={products}
              searchQuery={searchQuery}
              categorySlug={categorySlug}
              isFlashSale={isFlashSale}
            />
          </div>

          <div id="envios" className="scroll-mt-20">
            <TrustBadgesBar />
          </div>
        </div>
      )}
    </div>
  );
}
