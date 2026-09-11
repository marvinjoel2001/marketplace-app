import React from 'react';
import Link from 'next/link';
import { Scale, ChevronRight, Store, Truck, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { formatBs } from '@/lib/utils';

import { marketplaceApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function CompareHubPage() {
  let productsToDisplay: any[] = MOCK_PRODUCTS;

  try {
    const res = await marketplaceApi.getProducts();
    if (Array.isArray(res) && res.length > 0) {
      productsToDisplay = res.map((p: any) => {
        let imgs = p.images;
        if (Array.isArray(imgs)) {
          imgs = JSON.stringify(imgs);
        } else if (typeof imgs !== 'string') {
          imgs = JSON.stringify(['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300']);
        }

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          images: imgs,
          category: {
            name: p.category?.name || 'General',
            slug: p.category?.slug || 'general',
          },
          basePrice: p.minPrice || p.price || 199,
          offers: p.offers || [
            {
              id: `offer-${p.id}`,
              price: p.minPrice || p.price || 199,
              store: { name: 'Tienda Oficial Vitrina' },
            },
          ],
        };
      });
    }
  } catch {
    // fallback to MOCK_PRODUCTS
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-black font-medium">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">Comparador de Precios Multi-tiendas</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full mb-3 border border-indigo-400/20">
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transparencia y Ahorro Inteligente</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Compara precios entre tiendas oficiales en Bolivia
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            Un mismo producto puede tener distintos precios, tiempos de entrega y condiciones de garantía. Nuestro comparador te muestra todas las ofertas en tiempo real con cotización exacta de flete <strong>OpenDSP</strong>.
          </p>
        </div>
      </div>

      {/* Products Comparison Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Productos con Múltiples Ofertas Disponibles</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en cualquier producto para comparar ofertas de tiendas, precios y tiempos de despacho
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsToDisplay.map((product) => {
            let img = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300';
            try {
              img = JSON.parse(product.images)[0] || img;
            } catch {
              img = product.images;
            }

            const offersCount = product.offers?.length || 1;
            const minPrice = Math.min(...(product.offers?.map((o: any) => o.price) || [product.basePrice]));
            const maxPrice = Math.max(...(product.offers?.map((o: any) => o.price) || [product.basePrice]));

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-full aspect-square rounded-2xl bg-slate-50 p-4 mb-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={img}
                      alt={product.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {product.category.name}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center">
                      <Store className="w-3 h-3 mr-1 text-slate-400" />
                      {offersCount} {offersCount === 1 ? 'tienda' : 'tiendas'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                    {product.title}
                  </h3>

                  <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Desde:</span>
                      <span className="font-black text-slate-900 text-base">{formatBs(minPrice)}</span>
                    </div>
                    {maxPrice > minPrice && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Hasta:</span>
                        <span className="line-through">{formatBs(maxPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/compare/${product.slug}`}
                  className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs text-center transition-all shadow-xs flex items-center justify-center space-x-1.5 group-hover:shadow-md"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Comparar {offersCount} ofertas</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
