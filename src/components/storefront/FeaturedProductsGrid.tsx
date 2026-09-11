'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ArrowRight,
  Scale,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Wrench,
  Package,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { AddToCartButton } from '@/components/common/AddToCartButton';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';
import { useLanguage } from '@/context/LanguageContext';
import { useDataMode } from '@/context/DataModeContext';

interface ProductItem {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  description?: string;
  basePrice: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  soldCount?: string;
  badge?: { text: string; bg: string };
  multiStoreCount?: number;
  deliveryTag?: string;
  guaranteeTag?: string;
  guaranteeIconType?: 'shield' | 'rotate' | 'wrench';
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
  const { isRealMode } = useDataMode();

  // Wishlist reactive state synced with localStorage
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vitrina_wishlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlistIds(parsed.map((item: any) => item.id));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleWishlist = (product: ProductItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem('vitrina_wishlist');
      const items: any[] = stored ? JSON.parse(stored) : [];
      const exists = items.some((i) => i.id === product.id);

      let updated: any[];
      if (exists) {
        updated = items.filter((i) => i.id !== product.id);
      } else {
        let parsedImg = '';
        try {
          parsedImg = JSON.parse(product.images)[0];
        } catch {
          parsedImg = product.images;
        }
        updated = [
          ...items,
          {
            id: product.id,
            title: product.title,
            slug: product.slug,
            price: product.basePrice,
            originalPrice: product.originalPrice,
            image: parsedImg || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
            storeName: product.offers?.[0]?.store?.name || 'Tienda Oficial',
          },
        ];
      }
      localStorage.setItem('vitrina_wishlist', JSON.stringify(updated));
      setWishlistIds(updated.map((i) => i.id));
    } catch {
      // ignore
    }
  };

  // The exact 8 products featured in the user's high-fidelity reference design
  const demoFallbackProducts: ProductItem[] = [
    {
      id: 'card-1',
      title: 'Zapatillas Deportivas Running Air...',
      subtitle: 'Nike • Unisex • Tallas 37 - 44',
      slug: 'zapatillas-deportivas-running-air-zoom',
      description: 'Zapatillas de running ergonómicas con amortiguación Air reactiva y suela antideslizante.',
      basePrice: 304,
      originalPrice: 410,
      rating: 4.8,
      reviewCount: 75,
      soldCount: '12 vendidos',
      badge: { text: '🔥 Más Vendido', bg: 'bg-[#5B4DF0] text-white' },
      deliveryTag: 'Envío rápido',
      guaranteeTag: 'Garantía',
      guaranteeIconType: 'shield',
      images: JSON.stringify(['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=85']),
      offers: [
        {
          id: 'off-1',
          price: 304,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-1', name: 'Nike Oficial Bolivia', slug: 'nike-oficial', isOfficial: true, rating: 4.9 },
        },
      ],
    },
    {
      id: 'card-2',
      title: 'Chompa Oversize Beige - Talla M',
      subtitle: 'Talla M • Algodón Premium • Unisex',
      slug: 'chompa-oversize-beige-talla-m',
      description: 'Chompa de tejido suave y corte oversize holgado confeccionada en algodón orgánico.',
      basePrice: 160,
      originalPrice: 216,
      rating: 4.6,
      reviewCount: 230,
      soldCount: '56 vendidos',
      multiStoreCount: 4,
      badge: { text: '20% OFF', bg: 'bg-[#4F46E5] text-white' },
      deliveryTag: 'Envío rápido',
      guaranteeTag: 'Devolución fácil',
      guaranteeIconType: 'rotate',
      images: JSON.stringify(['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=85']),
      offers: [
        {
          id: 'off-2a',
          price: 160,
          shippingCost: 0,
          estimatedDelivery: 'Llega mañana con OpenDSP',
          isRecommended: true,
          store: { id: 's-2a', name: 'Moda Urbana', slug: 'moda-urbana', isOfficial: true, rating: 4.8 },
        },
        {
          id: 'off-2b',
          price: 175,
          shippingCost: 10,
          estimatedDelivery: '2 días',
          isRecommended: false,
          store: { id: 's-2b', name: 'Trends La Paz', slug: 'trends-lp', isOfficial: false, rating: 4.5 },
        },
      ],
    },
    {
      id: 'card-3',
      title: 'Golden Rice',
      subtitle: 'Auriculares Inalámbricos • Bluetooth 5.3',
      slug: 'golden-rice-auriculares',
      description: 'Audífonos inalámbricos de diadema con acabado premium y sonido surround envolvente.',
      basePrice: 35,
      originalPrice: 47,
      rating: 4.9,
      reviewCount: 95,
      soldCount: '28 vendidos',
      badge: { text: 'Nuevo', bg: 'bg-[#059669] text-white' },
      deliveryTag: 'Envío rápido',
      guaranteeTag: 'Garantía oficial',
      guaranteeIconType: 'shield',
      images: JSON.stringify(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=85']),
      offers: [
        {
          id: 'off-3',
          price: 35,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-3', name: 'SoundMaster Bolivia', slug: 'soundmaster', isOfficial: true, rating: 5.0 },
        },
      ],
    },
    {
      id: 'card-4',
      title: 'Auriculares Inalámbricos Headphone...',
      subtitle: 'Bluetooth 5.3 • Sonido HD • Manos libres',
      slug: 'auriculares-headphone-pro-anc',
      description: 'Auriculares profesionales con cancelación activa de ruido, detalles dorados y estuche rígido.',
      basePrice: 338,
      originalPrice: 456,
      rating: 4.7,
      reviewCount: 75,
      soldCount: '42 vendidos',
      badge: { text: '15% OFF', bg: 'bg-[#7C3AED] text-white' },
      deliveryTag: 'Envío rápido',
      guaranteeTag: 'Garantía oficial',
      guaranteeIconType: 'shield',
      images: JSON.stringify(['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=85']),
      offers: [
        {
          id: 'off-4',
          price: 338,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-4', name: 'AudioPro Santa Cruz', slug: 'audiopro', isOfficial: true, rating: 4.9 },
        },
      ],
    },
    {
      id: 'card-5',
      title: 'Audífonos TWS Pro',
      subtitle: 'Bluetooth 5.3 • Cancelación de ruido',
      slug: 'audifonos-tws-pro',
      description: 'Auriculares intrauditivos TWS con micrófono dual, estuche de carga rápida y baja latencia.',
      basePrice: 118,
      originalPrice: 169,
      rating: 4.5,
      reviewCount: 62,
      soldCount: '18 vendidos',
      badge: { text: 'Nuevo', bg: 'bg-[#059669] text-white' },
      deliveryTag: 'Envío rápido',
      guaranteeTag: 'Garantía',
      guaranteeIconType: 'shield',
      images: JSON.stringify(['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=85']),
      offers: [
        {
          id: 'off-5',
          price: 118,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-5', name: 'TechGear Bolivia', slug: 'techgear', isOfficial: true, rating: 4.8 },
        },
      ],
    },
    {
      id: 'card-6',
      title: 'Smart TV 55" 4K UHD',
      subtitle: 'Samsung • Android TV • HDR',
      slug: 'smart-tv-55-4k-uhd',
      description: 'Televisor inteligente con panel Crystal 4K, HDR10+, conectividad Wi-Fi dual y aplicaciones.',
      basePrice: 2850,
      originalPrice: 3499,
      rating: 4.8,
      reviewCount: 142,
      soldCount: '87 vendidos',
      badge: { text: '🔥 Más Vendido', bg: 'bg-[#5B4DF0] text-white' },
      deliveryTag: 'Envío express',
      guaranteeTag: 'Instalación opcional',
      guaranteeIconType: 'wrench',
      images: JSON.stringify(['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=85']),
      offers: [
        {
          id: 'off-6',
          price: 2850,
          shippingCost: 0,
          estimatedDelivery: 'Entrega en 24h con cuadrilla',
          isRecommended: true,
          store: { id: 's-6', name: 'ElectroHogar Bolivia', slug: 'electrohogar', isOfficial: true, rating: 4.9 },
        },
      ],
    },
    {
      id: 'card-7',
      title: 'Smartwatch Fitness',
      subtitle: 'Monitor de salud • Resistente al agua',
      slug: 'smartwatch-fitness-monitor',
      description: 'Reloj inteligente deportivo con sensor de ritmo cardíaco, podómetro, GPS y pantalla OLED.',
      basePrice: 399,
      originalPrice: 444,
      rating: 4.6,
      reviewCount: 118,
      soldCount: '64 vendidos',
      badge: { text: '10% OFF', bg: 'bg-[#7C3AED] text-white' },
      deliveryTag: 'Envío rápido',
      guaranteeTag: 'Garantía',
      guaranteeIconType: 'shield',
      images: JSON.stringify(['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=85']),
      offers: [
        {
          id: 'off-7',
          price: 399,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-7', name: 'FitLife Devices', slug: 'fitlife', isOfficial: true, rating: 4.7 },
        },
      ],
    },
    {
      id: 'card-8',
      title: 'Memoria USB 256GB',
      subtitle: 'HP • USB 3.2 • Alta velocidad',
      slug: 'memoria-usb-256gb-hp',
      description: 'Pendrive metálico ultracompacto con alta tasa de transferencia de datos y diseño duradero.',
      basePrice: 145,
      originalPrice: 189,
      rating: 4.7,
      reviewCount: 91,
      soldCount: '37 vendidos',
      badge: { text: 'Nuevo', bg: 'bg-[#059669] text-white' },
      deliveryTag: 'Envío rápido',
      guaranteeTag: 'Garantía oficial',
      guaranteeIconType: 'shield',
      images: JSON.stringify(['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=85']),
      offers: [
        {
          id: 'off-8',
          price: 145,
          shippingCost: 0,
          estimatedDelivery: 'OpenDSP Hoy',
          isRecommended: true,
          store: { id: 's-8', name: 'HP Store Bolivia', slug: 'hp-store', isOfficial: true, rating: 4.8 },
        },
      ],
    },
  ];

  // In real mode, render products from DB if available, else render reference cards
  const displayItems: ProductItem[] =
    isRealMode && products && products.length >= 8
      ? products.slice(0, 8).map((p, idx) => ({
          ...p,
          subtitle: p.subtitle || p.category?.name || 'Producto Oficial',
          soldCount: p.soldCount || `${Math.max(12, ((p.basePrice * 7) % 80) + 12)} vendidos`,
          originalPrice: p.originalPrice || Math.round(p.basePrice * 1.3),
          deliveryTag: p.deliveryTag || 'Envío rápido',
          guaranteeTag: p.guaranteeTag || 'Garantía oficial',
          guaranteeIconType: idx % 2 === 0 ? 'shield' : 'rotate',
        }))
      : demoFallbackProducts;

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center max-w-lg mx-auto my-8 shadow-card">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {language === 'es' ? 'No hay productos disponibles en esta sección' : 'No products available in this section'}
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          {language === 'es'
            ? 'Próximamente se añadirán nuevos artículos a este catálogo.'
            : 'New items will be added soon to this catalog.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#5B4DF0] hover:bg-[#4E3FE0] text-white text-xs font-bold transition-all shadow-xs"
        >
          <span>{language === 'es' ? 'Ver todas las categorías' : 'View all categories'}</span>
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-black text-[#5B4DF0] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#5B4DF0]"></span>
            <span>{language === 'es' ? 'NUESTRA SELECCIÓN' : 'OUR SELECTION'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {language === 'es' ? (
              <>
                Explora los <span className="text-[#5B4DF0]">Más Vendidos</span>
              </>
            ) : (
              <>
                Explore Our <span className="text-[#5B4DF0]">Best Sellers</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {language === 'es'
              ? 'Productos favoritos por nuestra comunidad. Calidad, buenos precios y envío seguro.'
              : 'Favorite products from our community. Quality, great prices and fast shipping.'}
          </p>
        </div>

        {/* View All Products Button */}
        <Link
          href="/#catalogo"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs self-start sm:self-auto shrink-0"
        >
          <span>{language === 'es' ? 'Ver Todos los Productos' : 'View All Products'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </Link>
      </div>

      {/* 4x2 Grid Exactly Matching the Mockup Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {displayItems.slice(0, 8).map((product) => {
          let parsedImages: string[] = [];
          try {
            parsedImages = JSON.parse(product.images);
          } catch {
            parsedImages = [product.images];
          }
          const mainImage = parsedImages[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';

          const primaryOffer = product.offers?.[0];
          const hasMultipleOffers = (product.offers?.length || 0) > 1 || (product.multiStoreCount && product.multiStoreCount > 1);
          const storeCount = product.multiStoreCount || product.offers?.length || 1;
          const displayPrice = primaryOffer?.price ?? product.basePrice;
          const originalPrice = product.originalPrice || Math.round(displayPrice * 1.35);

          const isWishlisted = wishlistIds.includes(product.id);

          return (
            <div
              key={product.id}
              className="bg-white rounded-[1.75rem] border border-slate-100 p-3.5 sm:p-4 shadow-sm hover-card-3d transition-all duration-300 flex flex-col justify-between group relative"
            >
              <div>
                {/* Product Image Container with Badges & Floating Heart */}
                <div className="relative w-full aspect-[4/3] rounded-[1.25rem] overflow-hidden bg-slate-50 mb-3 flex items-center justify-center">
                  <Link href={`/product/${product.slug}`} className="w-full h-full block">
                    <ImageWithSkeleton
                      src={mainImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </Link>

                  {/* Top-Left Floating Badges (Category / Status / Multi-Store) */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-auto">
                    {hasMultipleOffers && (
                      <Link
                        href={`/compare/${product.slug}`}
                        className="bg-[#EDE9FE] text-[#5B4DF0] text-[10px] font-black px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-xs hover:bg-purple-100 transition-colors"
                        title={`Comparar precios en ${storeCount} tiendas`}
                      >
                        <Scale className="w-3 h-3 text-[#5B4DF0]" />
                        <span>{storeCount} Tiendas</span>
                      </Link>
                    )}

                    {product.badge && (
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md shadow-xs ${product.badge.bg}`}>
                        {product.badge.text}
                      </span>
                    )}
                  </div>

                  {/* Top-Right Heart / Favorite Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(product, e)}
                    title={isWishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/25 hover:bg-black/45 backdrop-blur-xs flex items-center justify-center text-white transition-all shadow-xs cursor-pointer active:scale-90"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition-colors duration-200 ${
                        isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-white stroke-[2.2]'
                      }`}
                    />
                  </button>
                </div>

                {/* Product Title */}
                <Link href={`/product/${product.slug}`} className="block">
                  <h3
                    className="text-[13px] sm:text-sm font-black text-slate-900 truncate group-hover:text-[#5B4DF0] transition-colors leading-snug"
                    title={product.title}
                  >
                    {product.title}
                  </h3>
                </Link>

                {/* Subtitle / Attributes (e.g. Nike • Unisex • Tallas 37 - 44) */}
                <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5 mb-1.5">
                  {product.subtitle || 'Disponible para despacho inmediato'}
                </p>

                {/* Star Rating & Sold Count */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center space-x-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current stroke-none" />
                      ))}
                    </div>
                    <span className="font-extrabold text-slate-700 text-[11px] ml-0.5">
                      {product.rating} <span className="font-normal text-slate-400">({product.reviewCount})</span>
                    </span>
                  </div>

                  {/* Sold count with package box */}
                  <div className="flex items-center space-x-1 text-[11px] font-bold text-[#5B4DF0]">
                    <Package className="w-3 h-3 text-[#5B4DF0]" />
                    <span>{product.soldCount || '25 vendidos'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Price & Quick-Add Cart Button */}
              <div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-base sm:text-lg font-black text-[#5B4DF0] leading-none">
                      Bs. {Number(displayPrice).toLocaleString()}
                    </span>
                    {originalPrice && originalPrice > displayPrice && (
                      <span className="text-[11px] sm:text-xs text-slate-400 line-through font-semibold">
                        Bs. {Number(originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Rounded Purple Add-To-Cart Action Button */}
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

                {/* Dispatch and Guarantee Strip */}
                <div className="mt-2.5 pt-2 border-t border-slate-100/90 flex items-center justify-start gap-3 text-[10px] font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#5B4DF0]" />
                    <span>{product.deliveryTag || 'Envío rápido'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    {product.guaranteeIconType === 'rotate' ? (
                      <RotateCcw className="w-3 h-3 text-[#5B4DF0]" />
                    ) : product.guaranteeIconType === 'wrench' ? (
                      <Wrench className="w-3 h-3 text-[#5B4DF0]" />
                    ) : (
                      <ShieldCheck className="w-3 h-3 text-[#5B4DF0]" />
                    )}
                    <span>{product.guaranteeTag || 'Garantía oficial'}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
