'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function HeroBanner() {
  const { t, language } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#F4F9F5] via-[#FAFCFA] to-[#F1F7F3] border border-slate-100 p-8 sm:p-12 lg:p-14 mb-10 shadow-xs">
      {/* Background Soft Natural Lighting Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-green-50/50 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline, Description, Shop Now CTA & Social Proof */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tag: Nuevo producto */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-bold shadow-2xs">
            <span className="text-emerald-600">✦</span>
            <span>{language === 'es' ? 'Nuevo producto' : 'New product'}</span>
          </div>

          {/* Big Clean Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
            Roco Wireless <br />
            Headphones
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 font-normal max-w-md leading-relaxed">
            {language === 'es'
              ? 'Sonido premium con bajos profundos y comodidad todo el día. Disponible con entrega express OpenDSP en toda Bolivia.'
              : 'Premium sound with deep bass and all-day comfort. Available with OpenDSP express delivery across Bolivia.'}
          </p>

          {/* CTA & Social Proof Row */}
          <div className="pt-2 flex flex-wrap items-center gap-5 sm:gap-7">
            <Link
              href="/product/roco-wireless-headphones"
              className="inline-flex items-center space-x-2.5 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-600/25 transition-all hover:scale-102 active:scale-98"
            >
              <span>{language === 'es' ? 'Comprar ahora' : 'Shop now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Social Proof: Overlapping Avatars + 1,200+ Happy Customers */}
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Cliente 1"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  alt="Cliente 2"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="Cliente 3"
                />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-slate-900 block leading-tight">1,200+</span>
                <span className="text-slate-500 font-medium leading-tight">
                  {language === 'es' ? 'Clientes felices' : 'Happy customers'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Headphones with Price Tag & Secondary Smartwatch */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[340px] sm:min-h-[420px]">
          {/* Subtle background circle behind headphones */}
          <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-emerald-50/70 border border-emerald-100/60 shadow-inner"></div>

          {/* Floating Price Pill Tag */}
          <div className="absolute top-4 sm:top-8 right-8 sm:right-20 z-20 bg-white rounded-2xl px-4 py-2 shadow-md border border-slate-100 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SOLO</span>
            <span className="text-sm font-black text-emerald-700">Bs. 89.00</span>
          </div>

          {/* Main Hero Product Image: Wireless Headphones */}
          <div className="relative z-10 w-64 sm:w-84 md:w-96 transform hover:scale-105 transition-transform duration-500">
            <img
              src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=85"
              alt="Roco Wireless Headphones"
              className="w-full h-auto object-contain drop-shadow-[0_20px_25px_rgba(22,163,74,0.12)] rounded-3xl"
            />
          </div>

          {/* Floating Secondary Smartwatch in bottom right */}
          <div className="absolute -bottom-2 right-2 sm:right-6 z-15 w-24 sm:w-28 bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-slate-100 shadow-sm transform rotate-6 hover:rotate-0 transition-transform hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80"
              alt="Smartwatch"
              className="w-full h-auto object-contain drop-shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots (bottom center) */}
      <div className="relative z-10 flex items-center justify-center space-x-2 mt-4 sm:mt-6">
        <button className="w-6 h-1.5 rounded-full bg-emerald-600 transition-all" aria-label="Slide 1"></button>
        <button className="w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all" aria-label="Slide 2"></button>
        <button className="w-1.5 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-all" aria-label="Slide 3"></button>
      </div>
    </div>
  );
}
