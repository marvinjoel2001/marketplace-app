'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function SpecialOfferBanner() {
  const { language, t } = useLanguage();

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 16,
    hours: 10,
    mins: 56,
    secs: 54,
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
    <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#F4F9F5] via-[#FAFCFA] to-[#F1F7F3] border border-emerald-100/70 p-8 sm:p-12 mb-14 shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading, Countdown & CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Pill Tag */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/70">
            <span className="text-emerald-600">✦</span>
            <span>{t('special_offer', 'Oferta Especial')}</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            {language === 'es' ? (
              <>
                Mejora Tu <br />
                Experiencia Musical
              </>
            ) : (
              <>
                Enhance Your <br />
                Music Experience
              </>
            )}
          </h2>

          {/* Countdown timer with 4 white rounded boxes */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 pt-1">
            <div className="w-14 sm:w-16 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_days', 'Días')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_hours', 'Horas')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.mins).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_mins', 'Min')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.secs).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_secs', 'Seg')}</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <Link
              href="/?flashSale=true"
              className="inline-flex items-center space-x-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-md shadow-emerald-600/20 transition-all hover:scale-102 active:scale-98"
            >
              <span>{t('check_it_out', 'Aprovechar Oferta')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Centered White Headphones */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[280px] sm:min-h-[340px]">
          {/* Glowing Circular Aura */}
          <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-emerald-100 to-green-50 flex items-center justify-center shadow-md">
            {/* White Headphones Image */}
            <div className="w-48 sm:w-60 transform hover:scale-105 transition-transform duration-300 drop-shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=85"
                alt="Enhance Your Music Experience"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
