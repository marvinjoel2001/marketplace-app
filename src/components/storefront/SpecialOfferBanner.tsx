'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useDataMode } from '@/context/DataModeContext';

export function SpecialOfferBanner() {
  const { language, t } = useLanguage();
  const { isRealMode } = useDataMode();

  // Hide entirely in real mode to avoid mock products/countdowns
  if (isRealMode) {
    return null;
  }

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
    <section className="relative overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/80 p-8 sm:p-12 mb-14 shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-2xl transition-all duration-300">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading, Countdown & CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Pill Tag */}
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-indigo-50/90 backdrop-blur-md text-[#5B4DF0] text-xs font-bold border border-indigo-100 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#5B4DF0]" />
            <span>{t('special_offer', 'Oferta Especial')}</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            {language === 'es' ? (
              <>
                Mejora Tu <br />
                <span className="text-[#3B82F6]">Experiencia Musical</span>
              </>
            ) : (
              <>
                Enhance Your <br />
                <span className="text-[#3B82F6]">Music Experience</span>
              </>
            )}
          </h2>

          {/* Countdown timer with 4 frosted rounded boxes */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 pt-1">
            <div className="w-14 sm:w-16 py-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_days', 'Días')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_hours', 'Horas')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.mins).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">{t('countdown_mins', 'Min')}</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs flex flex-col items-center">
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
              className="inline-flex items-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-[#5B4DF0] to-[#794EF5] hover:from-[#4E3FE0] hover:to-[#6C40E5] text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
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
