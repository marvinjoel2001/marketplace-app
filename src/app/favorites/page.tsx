'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, Trash2, ChevronRight, ShoppingBag, Store, Star } from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { AddToCartButton } from '@/components/common/AddToCartButton';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { marketplaceApi } from '@/lib/api';

interface WishlistItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  storeName: string;
  storeId?: string;
  rating?: number;
}

export default function FavoritesPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recommended, setRecommended] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vitrina_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    // Load recommendations from real API or mock
    marketplaceApi.getProducts().then((res) => {
      const prods = (Array.isArray(res) ? res : []).slice(0, 4).map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.minPrice || p.price || 199,
        originalPrice: p.compareAtPrice || (p.minPrice ? p.minPrice * 1.25 : 249),
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
        storeName: p.offers?.[0]?.store?.name || 'Tienda Oficial',
        storeId: p.offers?.[0]?.store?.id || 'store-tech',
        rating: p.rating || 4.8,
      }));
      setRecommended(prods);
      setIsLoaded(true);
    });
  }, []);

  const removeItem = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    try {
      localStorage.setItem('vitrina_wishlist', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-4">
      <nav className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-black">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-bold">Mis Favoritos ({wishlist.length})</span>
      </nav>

      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>Lista de Deseos & Favoritos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Guarda tus artículos preferidos y agrégalos al carrito cuando quieras comprarlos.
          </p>
        </div>
      </div>

      {isLoaded && wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center max-w-xl mx-auto border border-gray-200/70 shadow-2xs my-8">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-4xl mx-auto mb-4">
            ❤️
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No tienes productos en tu lista</h2>
          <p className="text-xs text-slate-500 mb-6 max-w-md mx-auto">
            Explora nuestro catálogo y presiona el ícono del corazón en los productos que te gusten para tenerlos guardados aquí.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs rounded-full transition-all shadow-md active:scale-95"
          >
            <span>Explorar Ofertas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 border border-gray-200/70 shadow-2xs hover-card-3d transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3">
                  <ImageWithSkeleton
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-rose-600 hover:bg-rose-50 flex items-center justify-center shadow-xs transition-colors"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Store className="w-3 h-3 text-slate-400" />
                  <span>{item.storeName}</span>
                </div>

                <Link href={`/product/${item.slug}`}>
                  <h3 className="text-xs font-black text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors mb-2">
                    {item.title}
                  </h3>
                </Link>

                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="text-base font-black text-slate-900">{formatBs(item.price)}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatBs(item.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <AddToCartButton
                item={{
                  productId: item.id,
                  productTitle: item.title,
                  productSlug: item.slug,
                  storeId: item.storeId || 'store-tech',
                  storeName: item.storeName,
                  unitPrice: item.price,
                  quantity: 1,
                  productImage: item.image,
                  shippingCost: 0,
                }}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Recommended Section */}
      {recommended.length > 0 && (
        <div className="pt-8">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center space-x-2">
            <span>Recomendados para ti</span>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-full">
              Top Ventas
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recommended.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border border-gray-200/70 shadow-2xs hover-card-3d transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <Link href={`/product/${item.slug}`}>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-3">
                      <ImageWithSkeleton
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Store className="w-3 h-3 text-slate-400" />
                    <span>{item.storeName}</span>
                  </div>

                  <Link href={`/product/${item.slug}`}>
                    <h3 className="text-xs font-black text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors mb-2">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-baseline space-x-2 mb-3">
                    <span className="text-base font-black text-slate-900">{formatBs(item.price)}</span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatBs(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <AddToCartButton
                  item={{
                    productId: item.id,
                    productTitle: item.title,
                    productSlug: item.slug,
                    storeId: item.storeId || 'store-tech',
                    storeName: item.storeName,
                    unitPrice: item.price,
                    quantity: 1,
                    productImage: item.image,
                    shippingCost: 0,
                  }}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
