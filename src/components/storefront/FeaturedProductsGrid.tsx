'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Scale, ShoppingBag } from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { AddToCartButton } from '@/components/common/AddToCartButton';
import { useLanguage } from '@/context/LanguageContext';

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  images: string;
  category?: { name: string; slug?: string };
  offers?: Array<{
    id: string;
    price: number;
    shippingCost: number;
    estimatedDelivery: string;
    isRecommended: boolean;
    store: {
      id: string;
      name: string;
      slug: string;
      isOfficial: boolean;
      rating: number;
    };
  }>;
}

export function FeaturedProductsGrid({ products }: { products: ProductItem[] }) {
  const { language, t } = useLanguage();
  // Demo catalog products if DB has fewer than 8 to match the 4x2 grid from the image
  const demoFallbackProducts: ProductItem[] = [
    {
      id: 'demo-1',
      title: 'Wireless Game Controller',
      slug: 'wireless-game-controller',
      description: 'Ergonomic dual-vibration gamepad with ultra-low latency wireless connection.',
      basePrice: 189,
      rating: 5.0,
      reviewCount: 128,
      images: JSON.stringify(['https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500']),
      offers: [
        {
          id: 'off-1',
          price: 189,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-1', name: 'NovaGaming Bolivia', slug: 'novagaming', isOfficial: true, rating: 4.9 },
        },
      ],
    },
    {
      id: 'demo-2',
      title: 'RGB Mechanical Keyboard',
      slug: 'rgb-mechanical-keyboard',
      description: 'Hot-swappable mechanical switches with per-key RGB backlighting and aluminum body.',
      basePrice: 209,
      rating: 4.8,
      reviewCount: 95,
      images: JSON.stringify(['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500']),
      offers: [
        {
          id: 'off-2',
          price: 209,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-2', name: 'TechStore Bolivia', slug: 'techstore', isOfficial: true, rating: 4.8 },
        },
      ],
    },
    {
      id: 'demo-3',
      title: 'HD Webcam 1080P Pro',
      slug: 'hd-webcam-1080p',
      description: 'Auto-focus Full HD camera with stereo dual-noise cancelling microphones.',
      basePrice: 349,
      rating: 4.9,
      reviewCount: 76,
      images: JSON.stringify(['https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=500']),
      offers: [
        {
          id: 'off-3',
          price: 349,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-3', name: 'VisionTech Oficial', slug: 'visiontech', isOfficial: true, rating: 5.0 },
        },
      ],
    },
    {
      id: 'demo-4',
      title: '2.1 Speaker System Studio',
      slug: '2-1-speaker-system',
      description: 'Deep subwoofer bass system with dual satellite drivers and bluetooth 5.3.',
      basePrice: 489,
      rating: 4.7,
      reviewCount: 84,
      images: JSON.stringify(['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500']),
      offers: [
        {
          id: 'off-4',
          price: 489,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-4', name: 'AudioPro Santa Cruz', slug: 'audiopro', isOfficial: true, rating: 4.9 },
        },
      ],
    },
    {
      id: 'demo-5',
      title: 'Smart Bluetooth Speaker',
      slug: 'smart-bluetooth-speaker',
      description: '360 degree spatial sound cylinder with 16h battery and voice assistant support.',
      basePrice: 209,
      rating: 4.9,
      reviewCount: 52,
      images: JSON.stringify(['https://images.unsplash.com/photo-1543512214-318c7553f230?w=500']),
      offers: [
        {
          id: 'off-5',
          price: 209,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-5', name: 'NovaAudio', slug: 'novaaudio', isOfficial: true, rating: 4.9 },
        },
      ],
    },
    {
      id: 'demo-6',
      title: 'Ergonomic Vertical Mouse',
      slug: 'ergonomic-mouse',
      description: 'Precision wireless optical mouse designed for maximum wrist and palm comfort.',
      basePrice: 139,
      rating: 4.8,
      reviewCount: 110,
      images: JSON.stringify(['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500']),
      offers: [
        {
          id: 'off-6',
          price: 139,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-6', name: 'ErgoTech Bolivia', slug: 'ergotech', isOfficial: true, rating: 4.7 },
        },
      ],
    },
    {
      id: 'demo-7',
      title: 'Gaming Headset Surround',
      slug: 'gaming-headset',
      description: '7.1 immersive surround sound headset with memory foam earcups and boom mic.',
      basePrice: 310,
      rating: 4.9,
      reviewCount: 94,
      images: JSON.stringify(['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500']),
      offers: [
        {
          id: 'off-7',
          price: 310,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-7', name: 'GamerStore Bolivia', slug: 'gamerstore', isOfficial: true, rating: 4.8 },
        },
      ],
    },
  ];

  // Combine real DB products first, filling up to 8 with high-converting showcase products
  const displayItems = products.length >= 8 ? products : [...products, ...demoFallbackProducts.slice(products.length)];

  return (
    <section className="space-y-6">
      {/* Section Header: Our Collection -> Explore Our Best Sellers */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>{language === 'es' ? 'Nuestra Selección' : 'Our Collection'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {language === 'es' ? 'Explora los Más Vendidos' : 'Explore Our Best Sellers'}
          </h2>
        </div>

        {/* View All Products Button */}
        <Link
          href="/#catalogo"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
        >
          <span>{language === 'es' ? 'Ver Todos los Productos' : 'View All Products'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4x2 Grid Matching the Reference Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayItems.slice(0, 8).map((product, idx) => {
          let parsedImages: string[] = [];
          try {
            parsedImages = JSON.parse(product.images);
          } catch {
            parsedImages = [product.images];
          }
          const mainImage = parsedImages[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500';

          const primaryOffer = product.offers?.[0];
          const hasMultipleOffers = (product.offers?.length || 0) > 1;
          const displayPrice = primaryOffer?.price ?? product.basePrice;
          const originalPrice = Math.round(displayPrice * 1.35);

          // Assign badges matching the reference image layout
          const badges = ['Best Seller', '20% OFF', 'New', '15% OFF', 'New', 'Best Seller', '10% OFF', 'New'];
          const rawBadge = badges[idx % badges.length];
          const badgeType =
            language === 'es'
              ? rawBadge === 'Best Seller'
                ? 'Más Vendido'
                : rawBadge === 'New'
                ? 'Nuevo'
                : rawBadge
              : rawBadge;

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-2xs hover:shadow-lg hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col justify-between group relative"
            >
              <div>
                {/* Top Row: Multi-store comparator link & Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  {hasMultipleOffers ? (
                    <Link
                      href={`/compare/${product.slug}`}
                      className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 transition-colors"
                    >
                      <Scale className="w-3 h-3 text-indigo-600" />
                      <span>{product.offers?.length} Tiendas</span>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {/* Badge: Best Seller (Purple) / 20% OFF (Blue) / New (Dark) */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-2xs ${
                      badgeType === 'Best Seller'
                        ? 'bg-[#4F46E5] text-white'
                        : badgeType.includes('OFF')
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {badgeType}
                  </span>
                </div>

                {/* Product Image on Clean Background */}
                <Link
                  href={`/product/${product.slug}`}
                  className="block relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50/70 p-4 mb-3 flex items-center justify-center"
                >
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Product Title */}
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors leading-snug">
                    {product.title}
                  </h3>
                </Link>

                {/* Star Rating & Review Count */}
                <div className="flex items-center space-x-1 mt-1.5 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current stroke-none" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({product.reviewCount || 95})
                  </span>
                </div>
              </div>

              {/* Bottom Price & Add to Cart Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-sm sm:text-base font-black text-slate-900">
                    {formatBs(displayPrice)}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {formatBs(originalPrice)}
                  </span>
                </div>

                {/* Sleek Add to Cart Microinteraction Button */}
                <AddToCartButton
                  item={{
                    productOfferId: primaryOffer?.id || `offer-${product.id}`,
                    productId: product.id,
                    productTitle: product.title,
                    productSlug: product.slug,
                    storeId: primaryOffer?.store?.id || 'store-1',
                    storeName: primaryOffer?.store?.name || 'Tienda Oficial',
                    unitPrice: displayPrice,
                    quantity: 1,
                    productImage: mainImage,
                    shippingCost: primaryOffer?.shippingCost || 0,
                    estimatedDelivery: primaryOffer?.estimatedDelivery || 'Llega hoy con OpenDSP',
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
  );
}
