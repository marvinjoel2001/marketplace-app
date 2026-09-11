'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Heart,
  Tag,
  Volume2,
  BatteryCharging,
  ShieldCheck,
  Clock,
  Calendar,
  Timer,
  Zap,
  Radio,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useDataMode } from '@/context/DataModeContext';
import { useCart } from '@/context/CartContext';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton';

export function SpecialOfferBanner() {
  const { language, t } = useLanguage();
  const { isRealMode } = useDataMode();
  const { addToCart } = useCart();

  // Hide in real mode if user chooses real data only
  if (isRealMode) {
    return null;
  }

  const [isFavorited, setIsFavorited] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vitrina_wishlist');
      if (stored) {
        const items = JSON.parse(stored);
        if (Array.isArray(items) && items.some((i: any) => i.id === 'special-earbuds')) {
          setIsFavorited(true);
        }
      }
    } catch {}
  }, []);

  const handleToggleFavorite = () => {
    try {
      const stored = localStorage.getItem('vitrina_wishlist');
      const items = stored ? JSON.parse(stored) : [];
      let updated;
      if (isFavorited) {
        updated = items.filter((i: any) => i.id !== 'special-earbuds');
        setIsFavorited(false);
      } else {
        updated = [
          ...items,
          {
            id: 'special-earbuds',
            title: 'Auriculares TWS Pro ANC Wireless',
            slug: 'auriculares-headphone-pro-anc',
            price: 338,
            originalPrice: 455,
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
            storeName: 'AudioPro Bolivia',
          },
        ];
        setIsFavorited(true);
      }
      localStorage.setItem('vitrina_wishlist', JSON.stringify(updated));
    } catch {}
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      productId: 'special-earbuds',
      productTitle: 'Auriculares TWS Pro ANC Wireless',
      productSlug: 'auriculares-headphone-pro-anc',
      storeId: 'store-audiopro',
      storeName: 'AudioPro Bolivia',
      unitPrice: 338,
      quantity: 1,
      productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      shippingCost: 0,
      estimatedDelivery: 'Llega hoy con OpenDSP',
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Countdown timer state matching mockup numbers
  const [timeLeft, setTimeLeft] = useState({
    days: 16,
    hours: 10,
    mins: 56,
    secs: 38,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-white/75 backdrop-blur-2xl border border-white/90 p-6 sm:p-10 lg:p-12 mb-14 shadow-[0_20px_60px_rgba(124,58,237,0.06)] hover:shadow-[0_25px_70px_rgba(124,58,237,0.12)] transition-all duration-500">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading, Countdown & CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Pill Tag: Oferta Especial */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-purple-50 text-[#7C3AED] text-xs font-extrabold border border-purple-200/70 shadow-2xs">
            <Star className="w-3.5 h-3.5 text-[#7C3AED] fill-[#7C3AED]/20" />
            <span>{t('special_offer', 'Oferta Especial')}</span>
          </div>

          {/* Heading with Purple Highlight */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
            {language === 'es' ? (
              <>
                Mejora Tu <br />
                <span className="text-[#7C3AED]">Experiencia Musical</span>
              </>
            ) : (
              <>
                Enhance Your <br />
                <span className="text-[#7C3AED]">Music Experience</span>
              </>
            )}
          </h2>

          {/* Subtitle description */}
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md leading-relaxed">
            {language === 'es'
              ? 'Auriculares inalámbricos con sonido de alta fidelidad, comodidad total y la mejor tecnología.'
              : 'Wireless headphones with high-fidelity sound, total comfort, and the best technology.'}
          </p>

          {/* Countdown timer with 4 frosted rounded boxes with icons */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 pt-1">
            <div className="w-14 sm:w-16 py-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex flex-col items-center">
              <Clock className="w-3 h-3 text-slate-400 mb-1" />
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_days', 'Días')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex flex-col items-center">
              <Calendar className="w-3 h-3 text-slate-400 mb-1" />
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_hours', 'Horas')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex flex-col items-center">
              <Timer className="w-3 h-3 text-slate-400 mb-1" />
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.mins).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_mins', 'Min')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex flex-col items-center">
              <Zap className="w-3 h-3 text-slate-400 mb-1" />
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.secs).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_secs', 'Seg')}</span>
            </div>
          </div>

          {/* Action Buttons: Aprovechar Oferta + Agregar a Favoritos */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/product/auriculares-headphone-pro-anc"
              className="inline-flex items-center space-x-2 px-7 py-3.5 bg-gradient-to-r from-[#5B4DF0] to-[#794EF5] hover:from-[#4E3FE0] hover:to-[#6C40E5] text-white font-extrabold text-xs sm:text-sm rounded-full shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('check_it_out', 'Aprovechar Oferta')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleToggleFavorite}
              className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-full bg-white/80 hover:bg-white text-slate-700 text-xs font-bold border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFavorited ? 'text-rose-500 fill-rose-500' : 'text-slate-500 stroke-[2]'
                }`}
              />
              <span>{isFavorited ? 'En Favoritos' : 'Agregar a favoritos'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Featured Product Showcase + 4 Floating Feature Pills */}
        <div className="lg:col-span-6 relative flex flex-col md:flex-row items-center justify-center gap-5 sm:gap-6">
          {/* Main Product Container with purple glow */}
          <div className="relative group w-full max-w-[340px] sm:max-w-[380px] aspect-[4/3] rounded-[2rem] overflow-visible shrink-0">
            {/* Background ambient halo */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500/25 via-indigo-400/20 to-pink-400/15 rounded-[2.5rem] blur-2xl -z-10 group-hover:scale-105 transition-transform duration-500"></div>

            {/* Photo Container with Earbuds Case */}
            <div className="w-full h-full rounded-[2rem] overflow-hidden border-2 border-white/90 shadow-2xl relative bg-slate-900">
              <ImageWithSkeleton
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=85"
                alt="Mejora Tu Experiencia Musical"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Top-Left 15% OFF Badge */}
              <div className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-[#7C3AED] text-white font-black text-xs shadow-md flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>15% OFF</span>
              </div>

              {/* Floating Bottom-Right Price & Quick Cart Pill */}
              <div className="absolute bottom-3.5 right-3.5 z-20 bg-white/95 backdrop-blur-md rounded-2xl py-2 px-3.5 shadow-xl border border-white flex items-center space-x-3">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 line-through font-bold block leading-tight">
                    Bs. 455
                  </span>
                  <span className="text-base font-black text-[#5B4DF0] leading-none">
                    Bs. 338
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="w-9 h-9 rounded-xl bg-[#5B4DF0] hover:bg-[#4E3FE0] text-white flex items-center justify-center shadow-md shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Añadir al carrito"
                >
                  {isAdded ? (
                    <Check className="w-4 h-4 text-white animate-badge-pop" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 4 Frosted Feature Pills Stacked Vertically */}
          <div className="flex flex-row md:flex-col gap-2.5 shrink-0 justify-center flex-wrap w-full md:w-auto">
            <div className="px-4 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-white/80 shadow-xs flex items-center space-x-2 text-xs font-black text-slate-800 transition-all hover:translate-x-1">
              <Radio className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>Bluetooth 5.3</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-white/80 shadow-xs flex items-center space-x-2 text-xs font-black text-slate-800 transition-all hover:translate-x-1">
              <Volume2 className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>Sonido HD</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-white/80 shadow-xs flex items-center space-x-2 text-xs font-black text-slate-800 transition-all hover:translate-x-1">
              <BatteryCharging className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>Batería de larga duración</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/85 hover:bg-white backdrop-blur-md border border-white/80 shadow-xs flex items-center space-x-2 text-xs font-black text-slate-800 transition-all hover:translate-x-1">
              <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
              <span>Diseño ergonómico</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
