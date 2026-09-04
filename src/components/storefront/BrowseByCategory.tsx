'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Monitor,
  Headphones,
  Laptop,
  Activity,
  Wifi,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function BrowseByCategory() {
  const { language, t } = useLanguage();
  const [scrollIndex, setScrollIndex] = useState(0);

  const categories = [
    {
      id: 'phones',
      nameEs: 'Celulares y Teléfonos',
      nameEn: 'Phones & Mobiles',
      slug: 'celulares-y-telefonia',
      count: '24',
      icon: Smartphone,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'computers',
      nameEs: 'Computadoras & PC',
      nameEn: 'Computers & PC',
      slug: 'electronica-y-tecnologia',
      count: '18',
      icon: Monitor,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'accessories',
      nameEs: 'Moda y Accesorios',
      nameEn: 'Fashion & Accessories',
      slug: 'moda-y-accesorios',
      count: '36',
      icon: Headphones,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'laptops',
      nameEs: 'Laptops y Portátiles',
      nameEn: 'Laptops & Notebooks',
      slug: 'electronica-y-tecnologia',
      count: '20',
      icon: Laptop,
      color: 'text-cyan-600 bg-cyan-50',
    },
    {
      id: 'audio',
      nameEs: 'Audio y Auriculares',
      nameEn: 'Audio & Headphones',
      slug: 'electronica-y-tecnologia',
      count: '28',
      icon: Activity,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'gaming',
      nameEs: 'Gaming y Consolas',
      nameEn: 'Gaming & Consoles',
      slug: 'electronica-y-tecnologia',
      count: '32',
      icon: Gamepad2,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <section className="mb-14">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>{t('shop_by_category', 'Comprar por Categoría')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {t('browse_by_category', 'Explora Nuestras Categorías')}
          </h2>
        </div>

        {/* Carousel arrows */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setScrollIndex((prev) => Math.max(0, prev - 1))}
            aria-label="Anterior categoría"
            className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScrollIndex((prev) => Math.min(categories.length - 4, prev + 1))}
            aria-label="Siguiente categoría"
            className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const name = language === 'es' ? cat.nameEs : cat.nameEn;
          const itemsText = language === 'es' ? `${cat.count} productos` : `${cat.count} items`;

          return (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className="group bg-white rounded-3xl p-5 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition-all flex flex-col items-center text-center select-none"
            >
              {/* Category Icon Badge */}
              <div
                className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-2xs`}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Title & Count */}
              <h3 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                {name}
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 mt-1">
                {itemsText}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
