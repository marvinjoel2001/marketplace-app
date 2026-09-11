'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, ShieldCheck, Clock, ShoppingBag, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useDataMode } from '@/context/DataModeContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';

export function HeroBanner() {
  const { language } = useLanguage();
  const { isRealMode } = useDataMode();
  const { addToCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  // DEMO slides shown in demo mode matching user's reference mockup
  const demoSlides = [
    {
      badge: language === 'es' ? 'Nuevo producto' : 'New product',
      titleLine1: 'Roco Wireless',
      titleLine2: 'Headphones',
      price: 'Bs. 89.00',
      subtitle: language === 'es'
        ? 'Sonido premium con bajos profundos y comodidad todo el día. Disponible con entrega express OpenDSP en toda Bolivia.'
        : 'Premium sound with deep bass and all-day comfort. Available with OpenDSP express delivery throughout Bolivia.',
      productUrl: '/product/roco-wireless-headphones',
      heroImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=85',
      thumbImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    },
    {
      badge: language === 'es' ? 'Más vendido' : 'Best seller',
      titleLine1: 'Smart Band Pro',
      titleLine2: 'Ultra Fitness',
      price: 'Bs. 149.00',
      subtitle: language === 'es'
        ? 'Monitoreo cardíaco avanzado, GPS deportivo integrado y batería de 14 días. Despacho express en 15 a 45 minutos.'
        : 'Advanced heart rate monitoring, built-in sports GPS and 14-day battery. Express delivery in 15 to 45 minutes.',
      productUrl: '/?flashSale=true',
      heroImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=85',
      thumbImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200&auto=format&fit=crop&q=80',
    },
    {
      badge: language === 'es' ? 'Edición Limitada' : 'Limited Edition',
      titleLine1: 'Titanium Pro',
      titleLine2: 'Earbuds Max',
      price: 'Bs. 119.00',
      subtitle: language === 'es'
        ? 'Cancelación activa de ruido inteligente con estuche de carga inalámbrica ultrarrápida y audio espacial inmersivo.'
        : 'Smart active noise cancellation with ultra-fast wireless charging case and immersive spatial audio.',
      productUrl: '/product/roco-wireless-headphones',
      heroImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=85',
      thumbImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80',
    },
  ];

  // In REAL MODE: Render an authentic, clean customer banner with ZERO fake products or fake photos
  if (isRealMode) {
    return (
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/70 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 sm:p-8 lg:p-12 mb-8">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Center / Main Column: Customer Value Proposition */}
          <div className="lg:col-span-8 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50/80 backdrop-blur-md text-indigo-700 text-xs font-bold border border-indigo-100 shadow-2xs">
                ✦ {language === 'es' ? 'Vitrina Market Bolivia' : 'Vitrina Market Bolivia'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
                {language === 'es' ? 'Despachos Express 15 - 45 min' : 'Express Delivery 15 - 45 min'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {language === 'es'
                ? 'Tu Marketplace Local con Envíos Express OpenDSP'
                : 'Your Local Marketplace with OpenDSP Express Delivery'}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              {language === 'es'
                ? 'Compra en tiendas locales de Bolivia con entrega a domicilio inmediata y seguimiento satelital GPS en tiempo real.'
                : 'Shop local Bolivian stores with immediate home delivery and real-time GPS tracking.'}
            </p>

            <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-700 pt-1">
              <li className="flex items-center space-x-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{language === 'es' ? 'Envíos express motorizados con seguimiento GPS en vivo' : 'Express courier delivery with live GPS tracking'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{language === 'es' ? 'Pagos 100% seguros con QR Simple, transferencias bancarias y tarjetas' : '100% secure payments via QR Simple, bank transfers and cards'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{language === 'es' ? 'Garantía de compra protegida de 7 días y soporte dedicado' : '7-day protected purchase warranty and dedicated support'}</span>
              </li>
            </ul>

            {/* Customer CTA buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                href="/#catalogo"
                className="inline-flex items-center space-x-2 px-7 py-3 bg-gradient-to-r from-[#5B4DF0] to-[#794EF5] hover:from-[#4E3FE0] hover:to-[#6C40E5] text-white font-bold text-sm rounded-full shadow-lg shadow-indigo-500/25 hover:scale-102 active:scale-98 transition-all"
              >
                <span>{language === 'es' ? 'Explorar Catálogo' : 'Explore Catalog'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#tiendas"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 hover:bg-white text-slate-800 font-bold text-sm rounded-full border border-white/80 shadow-xs transition-all"
              >
                <span>{language === 'es' ? 'Ver Tiendas' : 'View Stores'}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Delivery & Trust Card */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 p-6 shadow-md space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Logística OpenDSP
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-bold">
                    ● Red activa en Santa Cruz
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tiempo estimado:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> 15 - 45 min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tarifa base:</span>
                  <span className="font-bold text-slate-900">Desde Bs. 8.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Seguridad:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> QR & PIN
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEMO MODE: Render exact Glassmorphic Hero Banner matching user mockup
  const current = demoSlides[activeSlide];

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(current.price.replace(/[^0-9.]/g, '')) || 89.0;
    const slug = current.productUrl.startsWith('/product/')
      ? current.productUrl.replace('/product/', '')
      : 'roco-wireless-headphones';

    addToCart({
      productId: slug,
      productTitle: `${current.titleLine1} ${current.titleLine2}`,
      productSlug: slug,
      unitPrice: numericPrice,
      productImage: current.heroImage,
      storeName: 'Vitrina Market Oficial',
      storeId: 'vitrina-oficial',
      shippingCost: 0,
      quantity: 1,
    });
    router.push('/checkout');
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 sm:p-10 lg:p-14 mb-8">
      {/* Left Navigation Chevron Button */}
      <button
        onClick={() => setActiveSlide((prev) => (prev === 0 ? demoSlides.length - 1 : prev - 1))}
        aria-label="Slide anterior"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow-md border border-white flex items-center justify-center transition-all hover:scale-105 z-30 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Navigation Chevron Button */}
      <button
        onClick={() => setActiveSlide((prev) => (prev === demoSlides.length - 1 ? 0 : prev + 1))}
        aria-label="Slide siguiente"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow-md border border-white flex items-center justify-center transition-all hover:scale-105 z-30 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center px-4 sm:px-8">
        {/* Left Column (55% width): Tag, Titles, Subtitle, CTA Button, Happy Customers, Pagination */}
        <div className="lg:col-span-7 space-y-5 text-left">
          {/* Tag Pill */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50/90 backdrop-blur-md text-[#5B4DF0] text-xs font-bold border border-indigo-100 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#5B4DF0]" />
              <span>{current.badge}</span>
            </span>
          </div>

          {/* Big Two-Tone Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            <span className="block text-[#0F172A]">{current.titleLine1}</span>
            <span className="block text-[#3B82F6]">{current.titleLine2}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed font-normal">
            {current.subtitle}
          </p>

          {/* Actions Row: Purple/Indigo Pill CTA + Happy Customer Avatars */}
          <div className="pt-2 flex flex-wrap items-center gap-5 sm:gap-7">
            <button
              type="button"
              onClick={handleBuyNow}
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-[#5B4DF0] to-[#794EF5] hover:from-[#4E3FE0] hover:to-[#6C40E5] text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>{language === 'es' ? 'Comprar ahora' : 'Shop now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Social Proof Avatars */}
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-2xs"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Cliente 1"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-2xs"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  alt="Cliente 2"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-2xs"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="Cliente 3"
                />
              </div>
              <div className="text-xs leading-tight">
                <span className="font-extrabold text-slate-900 block">1,200+</span>
                <span className="text-slate-500 font-medium">
                  {language === 'es' ? 'Clientes felices' : 'Happy customers'}
                </span>
              </div>
            </div>
          </div>

          {/* Slider Pagination Dots */}
          <div className="pt-4 flex items-center space-x-2">
            {demoSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  activeSlide === i ? 'w-6 h-2 bg-[#5B4DF0]' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Column (45% width): Headphone on desk + Floating Deal Badge + Mini Preview Thumbnail */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Main Product Photography */}
          <Link
            href={current.productUrl}
            className="relative w-full max-w-[420px] aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden group block cursor-pointer"
          >
            <ImageWithSkeleton
              src={current.heroImage}
              alt={current.titleLine1}
              containerClassName="w-full h-full rounded-2xl"
              className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
          </Link>

          {/* Floating Deal Badge at top right */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-lg px-4 py-2 text-center select-none animate-float-gentle">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              DEAL
            </span>
            <span className="block text-base sm:text-lg font-black text-[#5B4DF0] tracking-tight">
              {current.price}
            </span>
          </div>

          {/* Floating Thumbnail Preview Card at bottom right with mini arrow */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-6 flex items-center space-x-2">
            <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-md p-1 overflow-hidden">
              <ImageWithSkeleton
                src={current.thumbImage}
                alt="Vista miniatura"
                containerClassName="w-full h-full rounded-xl"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <button
              onClick={() => setActiveSlide((prev) => (prev === demoSlides.length - 1 ? 0 : prev + 1))}
              aria-label="Ver siguiente detalle"
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md border border-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
