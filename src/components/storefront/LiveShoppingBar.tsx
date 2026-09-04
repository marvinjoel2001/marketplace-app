'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Radio } from 'lucide-react';
import { MOCK_STORES } from '@/lib/mockData';
import { useLanguage } from '@/context/LanguageContext';

export function LiveShoppingBar() {
  const { t } = useLanguage();
  const liveStores = MOCK_STORES.filter((s) => s.isLive);

  return (
    <section id="tiendas-live" className="mb-12 animate-in fade-in duration-300">
      <div className="bg-[#F9FAF9] rounded-[2rem] p-6 sm:p-8 border border-slate-200/70 shadow-2xs">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div className="flex items-start sm:items-center space-x-3.5">
            {/* Live Indicator Pill with animated red dot & mini dots */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 text-emerald-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>{t('live_badge', 'EN VIVO')}</span>
              </div>
              <div className="flex items-center space-x-1 mt-1 text-emerald-500 text-[10px] tracking-widest font-black">
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {t('live_title_prefix', 'Tiendas en')}{' '}
                  <span className="text-emerald-600">TikTok Live</span>
                </h3>
                {/* Clean Subtitle Pill */}
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600" />
                  <span>{t('live_subtitle_pill', 'Compras en tiempo real')}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {t('live_description', 'Demostraciones en vivo, cupones exclusivos y envío express con OpenDSP')}
              </p>
            </div>
          </div>

          {/* View All Streams Button */}
          <Link
            href="/live"
            className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50/60 border border-emerald-500 px-5 py-2.5 rounded-full shadow-2xs transition-all self-start sm:self-center"
          >
            <span>{t('live_view_all', 'Ver todas las transmisiones')} ({liveStores.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Live Presenters Row (Exact circular avatars with green ring, TikTok badge & LIVE pill) */}
        <div className="flex items-center space-x-5 sm:space-x-7 overflow-x-auto pb-4 pt-2 scrollbar-none">
          {liveStores.map((store) => (
            <Link
              key={store.id}
              href={`/live/${store.slug}`}
              className="group shrink-0 flex flex-col items-center transition-transform duration-200 hover:scale-105 focus:outline-hidden"
              title={`Ver Live de ${store.name}`}
            >
              {/* Avatar with Ring, TikTok badge and LIVE pill */}
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 mb-2">
                {/* Presenter circular image with emerald ring */}
                <div className="w-full h-full rounded-full p-0.5 ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#F9FAF9] overflow-hidden bg-white shadow-xs">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full rounded-full object-cover object-center group-hover:brightness-95 transition-all"
                  />
                </div>

                {/* TikTok Badge top-right */}
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shadow-xs border-2 border-white">
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </div>

                {/* LIVE Pill bottom-center */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider shadow-xs border border-white">
                  LIVE
                </div>
              </div>
            </Link>
          ))}

          {/* Right Chevron Navigation Button */}
          <Link
            href="/live"
            aria-label="Ver más transmisiones"
            className="shrink-0 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-xs hover:shadow-md hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-all ml-1"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
