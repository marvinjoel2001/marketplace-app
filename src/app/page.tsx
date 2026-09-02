import React from 'react';
import { marketplaceApi } from '@/lib/api';
import { HeroBanner } from '@/components/storefront/HeroBanner';
import { BrowseByCategory } from '@/components/storefront/BrowseByCategory';
import { SpecialOfferBanner } from '@/components/storefront/SpecialOfferBanner';
import { PersonalizedStorefrontFeed } from '@/components/storefront/PersonalizedStorefrontFeed';
import { TrustBadgesBar } from '@/components/storefront/TrustBadgesBar';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; flashSale?: string }>;
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
    console.error('Error loading products from NestJS backend:', error);
  }

  const isFiltering = !!(searchQuery || categorySlug || isFlashSale);

  return (
    <div className="w-full">
      {/* If not filtering, show full NovaTech Showcase */}
      {!isFiltering ? (
        <>
          {/* 1. Hero Banner: Roco Wireless Headphones */}
          <HeroBanner />

          {/* 2. Category Row: 7 Cards */}
          <BrowseByCategory />

          {/* 3. Mid-Page Special Offer: Enhance Your Music Experience */}
          <SpecialOfferBanner />

          {/* 4. Best Sellers & Behavioral Re-ranked Feed */}
          <PersonalizedStorefrontFeed
            initialProducts={products}
            searchQuery={searchQuery}
            categorySlug={categorySlug}
            isFlashSale={isFlashSale}
          />

          {/* 5. Bottom Trust Badges Bar */}
          <TrustBadgesBar />
        </>
      ) : (
        /* If filtering by search, category or flash sale, show filtered results */
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-2xs">
            <div>
              <h1 className="text-xl font-black text-slate-900">
                {searchQuery
                  ? `Resultados para: "${searchQuery}"`
                  : categorySlug
                  ? `Categoría: ${categorySlug.replace(/-/g, ' ')}`
                  : '⚡ Ofertas Relámpago activas'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Se encontraron {products.length} productos disponibles con envío express OpenDSP
              </p>
            </div>
          </div>

          <PersonalizedStorefrontFeed
            initialProducts={products}
            searchQuery={searchQuery}
            categorySlug={categorySlug}
            isFlashSale={isFlashSale}
          />

          <TrustBadgesBar />
        </div>
      )}
    </div>
  );
}
