'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, ChevronRight } from 'lucide-react';

interface LiveItem {
  id: string;
  storeSlug: string;
  name: string;
  avatar: string;
  viewers: string;
  tiktokUsername?: string;
}

const mockLives: LiveItem[] = [
  {
    id: 'live-techplus',
    storeSlug: 'techplus-bolivia',
    name: 'TechPlus Bolivia',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    viewers: '1.4K',
    tiktokUsername: '@techplus_bolivia',
  },
  {
    id: 'live-moda',
    storeSlug: 'outfit-bolivia',
    name: 'Moda Trendy',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    viewers: '1.2K',
    tiktokUsername: '@outfitbolivia',
  },
  {
    id: 'live-hogar',
    storeSlug: 'hogar-feliz',
    name: 'Hogar Feliz',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    viewers: '842',
    tiktokUsername: '@hogarfeliz_bo',
  },
  {
    id: 'live-tecno',
    storeSlug: 'tecnoshop',
    name: 'TecnoShop',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    viewers: '1.5K',
    tiktokUsername: '@tecnoshop_bo',
  },
  {
    id: 'live-abarrotes',
    storeSlug: 'abarrotes-del-dia',
    name: 'Abarrotes del Día',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    viewers: '932',
    tiktokUsername: '@abarrotes_dia',
  },
  {
    id: 'live-belleza',
    storeSlug: 'belleza-natural',
    name: 'Belleza Natural',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    viewers: '1.1K',
    tiktokUsername: '@bellezanatural_bo',
  },
];

export function LiveShoppingBar() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 p-4 mb-6 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-600 text-white font-extrabold text-xs rounded-full uppercase tracking-wider animate-pulse-live">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>LIVE</span>
          </div>
          <h3 className="text-base font-extrabold text-gray-900">
            En vivo ahora en <span className="text-black">TikTok Live Shopping</span>
          </h3>
        </div>
        <Link
          href="/live/techplus-bolivia"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center hover:underline"
        >
          <span>Ver todas las transmisiones</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Link>
      </div>

      {/* Live Stream Avatars Grid / Carousel */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-none">
        {mockLives.map((live) => (
          <Link
            key={live.id}
            href={`/live/${live.storeSlug}`}
            className="flex flex-col items-center group shrink-0 w-24 sm:w-28 text-center transition-transform hover:-translate-y-1"
          >
            <div className="relative mb-2">
              {/* Animated Gradient Ring for Live Status */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-red-600 via-pink-500 to-amber-400 group-hover:p-1 transition-all shadow-md">
                <div className="w-full h-full rounded-full p-0.5 bg-white">
                  <img
                    src={live.avatar}
                    alt={live.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              {/* TikTok Badge */}
              <div className="absolute top-0 right-0 bg-black text-white p-1 rounded-full border-2 border-white shadow-xs">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </div>

              {/* LIVE Badge */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full border border-white uppercase shadow-xs flex items-center space-x-0.5">
                <span>LIVE</span>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-900 truncate w-full group-hover:text-amber-600 transition-colors">
              {live.name}
            </p>
            <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-500 mt-0.5">
              <Eye className="w-3 h-3 text-red-500" />
              <span>{live.viewers}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
