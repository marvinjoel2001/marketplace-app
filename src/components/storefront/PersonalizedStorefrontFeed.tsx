'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  Scale,
  ArrowRight,
} from 'lucide-react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { FeaturedProductsGrid } from './FeaturedProductsGrid';
import { formatBs } from '@/lib/utils';
import { AddToCartButton } from '@/components/common/AddToCartButton';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { useDataMode } from '@/context/DataModeContext';

interface PersonalizedStorefrontFeedProps {
  initialProducts: any[];
  searchQuery?: string;
  categorySlug?: string;
  isFlashSale?: boolean;
}

export function PersonalizedStorefrontFeed({
  initialProducts,
  searchQuery,
  categorySlug,
  isFlashSale,
}: PersonalizedStorefrontFeedProps) {
  const { rerankProducts, personalizedFeed, isLoaded } = usePersonalization();
  const { isRealMode } = useDataMode();

  // Re-ranking dinámico por comportamiento del usuario
  const displayProducts = useMemo(() => {
    if (!isLoaded || searchQuery || categorySlug || isFlashSale) {
      return initialProducts;
    }
    return rerankProducts(initialProducts);
  }, [initialProducts, rerankProducts, isLoaded, searchQuery, categorySlug, isFlashSale]);

  const { lastSearchKeyword, recentlyViewed } = personalizedFeed;

  // Productos sugeridos por la última búsqueda
  const basedOnSearchProducts = useMemo(() => {
    if (!lastSearchKeyword) return [];
    const kwLower = lastSearchKeyword.toLowerCase();
    return initialProducts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(kwLower) ||
        (p.description || '').toLowerCase().includes(kwLower)
    );
  }, [initialProducts, lastSearchKeyword]);

  return (
    <div className="space-y-12">
      {/* 1. SECCIÓN: PORQUE BUSCASTE '...' (Si hay búsquedas recientes en modo demo) */}
      {!isRealMode && !searchQuery && !categorySlug && !isFlashSale && lastSearchKeyword && basedOnSearchProducts.length > 0 && (
        <section className="bg-[#F5F3FF] rounded-[2rem] p-6 sm:p-8 border border-[#EDE9FE] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-[#4F46E5] text-[10px] font-bold uppercase tracking-wider mb-2 border border-purple-100 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#4F46E5]" />
                <span>Recomendación Personalizada</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
                Porque buscaste &quot;<span className="text-[#4F46E5]">{lastSearchKeyword}</span>&quot;
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Seleccionamos las mejores opciones y ofertas disponibles para ti.
              </p>
            </div>

            <Link
              href={`/?q=${encodeURIComponent(lastSearchKeyword)}`}
              className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center hover:underline self-start sm:self-center"
            >
              <span>Ver más resultados</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {basedOnSearchProducts.slice(0, 3).map((item) => {
              let parsedImages: string[] = [];
              try {
                parsedImages = JSON.parse(item.images);
              } catch {
                parsedImages = [item.images];
              }
              const img = parsedImages[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300';
              const offer = item.offers?.[0];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover-card-3d transition-all duration-300 flex space-x-3.5 items-center"
                >
                  <div className="w-20 h-20 rounded-xl bg-slate-50 p-2 shrink-0 flex items-center justify-center overflow-hidden relative">
                    <ImageWithSkeleton src={img} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold block truncate">
                      {offer?.store?.name || 'Tienda Oficial'}
                    </span>
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-[#4F46E5] transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 mt-1 mb-2">
                      <span className="text-sm font-black text-slate-900">{formatBs(item.basePrice)}</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        OpenDSP
                      </span>
                    </div>

                    <AddToCartButton
                      item={{
                        productOfferId: offer?.id,
                        productId: item.id,
                        productTitle: item.title,
                        productSlug: item.slug,
                        storeId: offer?.store?.id || 'store-1',
                        storeName: offer?.store?.name || 'Tienda Oficial',
                        unitPrice: item.basePrice,
                        quantity: 1,
                        productImage: img,
                        shippingCost: 0,
                        estimatedDelivery: 'Llega hoy con OpenDSP',
                      }}
                      size="sm"
                      variant="icon"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. SECCIÓN: VISTOS RECIENTEMENTE (Sólo en demo o con historial real) */}
      {!isRealMode && !searchQuery && !categorySlug && !isFlashSale && recentlyViewed.length > 0 && (
        <section className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Vistos Recientemente</h2>
                <p className="text-xs text-slate-400 font-medium">Continúa explorando tus productos guardados.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">{recentlyViewed.length} items</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {recentlyViewed.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 hover-card-3d transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="block aspect-square w-full rounded-lg bg-white p-2 border border-slate-100 mb-2 overflow-hidden flex items-center justify-center relative"
                  >
                    <ImageWithSkeleton
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <p className="text-[10px] text-slate-400 truncate">{item.storeName}</p>
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-[#4F46E5] leading-tight mb-1">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="text-xs font-black text-slate-900 mb-2">{formatBs(item.basePrice)}</div>
                </div>

                <Link
                  href={`/compare/${item.slug}`}
                  className="w-full py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 font-bold text-[10px] rounded-full flex items-center justify-center space-x-1 transition-all"
                >
                  <Scale className="w-3 h-3 text-indigo-600" />
                  <span>Comparar</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. GRID PRINCIPAL DE PRODUCTOS */}
      <FeaturedProductsGrid products={displayProducts} />
    </div>
  );
}
