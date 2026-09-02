'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function SpecialOfferBanner() {
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
    <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-[#F5F3FF] via-[#ECE8FE] to-[#F3F4F6] border border-slate-100 p-8 sm:p-12 mb-14 shadow-xs">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading, Countdown & CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Pill Tag */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-bold border border-purple-200/50">
            <span className="text-purple-600">✦</span>
            <span>Special Offer</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Enhance Your <br />
            Music Experience
          </h2>

          {/* Countdown timer with 4 white rounded boxes */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 pt-1">
            <div className="w-14 sm:w-16 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Days</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Hours</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.mins).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Mins</span>
            </div>

            <div className="w-14 sm:w-16 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-2xs flex flex-col items-center">
              <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                {String(timeLeft.secs).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Secs</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <Link
              href="/?flashSale=true"
              className="inline-flex items-center space-x-2 px-7 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs sm:text-sm rounded-full shadow-md shadow-indigo-500/20 transition-all hover:scale-102 active:scale-98"
            >
              <span>Check it Out</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Centered White Headphones with Lilac Aura & Soundwaves */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[280px] sm:min-h-[340px]">
          {/* Subtle soundwave graphic behind */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <svg className="w-full h-32 text-indigo-300" viewBox="0 0 400 100" fill="none">
              <path
                d="M10 50 Q 50 10, 90 50 T 170 50 T 250 50 T 330 50 T 390 50"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <path
                d="M10 50 Q 50 90, 90 50 T 170 50 T 250 50 T 330 50 T 390 50"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="2 3"
              />
            </svg>
          </div>

          {/* Glowing Lilac Circular Aura */}
          <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-[#C4B5FD] to-[#DDD6FE] flex items-center justify-center shadow-lg">
            {/* White Headphones Image */}
            <div className="w-48 sm:w-60 transform hover:scale-105 transition-transform duration-300 drop-shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=85"
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
