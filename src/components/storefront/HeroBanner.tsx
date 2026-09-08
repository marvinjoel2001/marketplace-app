'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function HeroBanner() {
  const { language } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      badge: language === 'es' ? '+ Nuevo producto' : '+ New product',
      title: 'Roco Wireless Headphones',
      price: 'Bs. 89.00',
      bullets: [
        language === 'es' ? 'Sonido Premium con Bajos Profundos' : 'Premium Sound with Deep Bass',
        language === 'es' ? 'Comodidad para Todo el Día' : 'All-Day Comfort & Ergonomics',
        language === 'es' ? 'Entrega Express OpenDSP Bolivia' : 'OpenDSP Express Bolivia Delivery',
      ],
      productUrl: '/product/roco-wireless-headphones',
      deskImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=85',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=85',
    },
    {
      badge: language === 'es' ? '🔥 Más vendido' : '🔥 Best seller',
      title: 'Smart Band Pro Ultra',
      price: 'Bs. 149.00',
      bullets: [
        language === 'es' ? 'Monitoreo Cardíaco & GPS Deportivo' : 'Heart Rate & Sports GPS',
        language === 'es' ? 'Batería hasta 14 Días' : 'Up to 14 Days Battery',
        language === 'es' ? 'Sumergible 50m Resistente al Agua' : '50m Water Resistant',
      ],
      productUrl: '/?flashSale=true',
      deskImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=85',
      userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=85',
    },
  ];

  const current = slides[activeSlide];

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#EEF7F2] via-[#F7FAF8] to-[#EDF6F1] border border-emerald-100/60 p-5 sm:p-7 lg:p-9 mb-8 shadow-card">
      {/* Soft natural lighting ambient blobs */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Grid: 3-column layout matching reference screenshot */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center">
        {/* Left Column: Product on desk */}
        <div className="lg:col-span-3 flex items-center justify-center">
          <div className="relative w-full max-w-[240px] aspect-square rounded-3xl bg-white/70 backdrop-blur-xs p-3.5 border border-emerald-100/70 shadow-xs group hover:shadow-md transition-all duration-300">
            <img
              src={current.deskImage}
              alt="Desk setup preview"
              className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Center Column: Badge, Title, Bullets, Price, CTA, Social proof */}
        <div className="lg:col-span-6 space-y-4 text-left px-2">
          {/* Top tag & price row */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold shadow-2xs border border-emerald-200/60">
              {current.badge}
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {current.price}
            </span>
          </div>

          {/* Big Clean Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            {current.title}
          </h1>

          {/* Bullet points with checkmarks */}
          <ul className="space-y-1.5 text-xs sm:text-sm font-medium text-slate-700">
            {current.bullets.map((b, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* CTA & Customer Social Proof */}
          <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href={current.productUrl}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-emerald-pill hover:scale-102 active:scale-98 transition-all"
            >
              <span>{language === 'es' ? 'Comprar ahora' : 'Shop now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Avatars proof */}
            <div className="flex items-center space-x-2.5">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                  alt="Cliente 1"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                  alt="Cliente 2"
                />
                <img
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt="Cliente 3"
                />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-extrabold text-slate-900 block">1,200+</span>
                <span className="text-slate-500 font-medium">
                  {language === 'es' ? 'clientes felices' : 'happy customers'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Smiling user wearing headphones */}
        <div className="lg:col-span-3 flex items-center justify-center">
          <div className="relative w-full max-w-[260px] aspect-4/5 rounded-3xl overflow-hidden border border-emerald-100 shadow-sm group">
            <img
              src={current.userImage}
              alt="Happy customer wearing headphones"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Subtle gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Side Arrow Navigation Buttons */}
      <button
        onClick={() => setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        aria-label="Slide anterior"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 z-20 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
        aria-label="Slide siguiente"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-sm border border-slate-100 flex items-center justify-center transition-all hover:scale-105 z-20 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slide Navigation Dots (bottom center) */}
      <div className="relative z-10 flex items-center justify-center space-x-2 mt-5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            aria-label={`Slide ${i + 1}`}
            className={`transition-all rounded-full ${
              activeSlide === i ? 'w-6 h-1.5 bg-emerald-600' : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
