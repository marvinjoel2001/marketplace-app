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

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  count: string;
  icon: any;
  color: string;
}

export function BrowseByCategory() {
  const categories: CategoryItem[] = [
    {
      id: 'phones',
      name: 'Phones',
      slug: 'celulares-y-telefonia',
      count: '24 items',
      icon: Smartphone,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'computers',
      name: 'Computers',
      slug: 'electronica-y-tecnologia',
      count: '18 items',
      icon: Monitor,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'accessories',
      name: 'Accessories',
      slug: 'moda-y-accesorios',
      count: '36 items',
      icon: Headphones,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'laptops',
      name: 'Laptops',
      slug: 'electronica-y-tecnologia',
      count: '20 items',
      icon: Laptop,
      color: 'text-cyan-600 bg-cyan-50',
    },
    {
      id: 'audio',
      name: 'Audio',
      slug: 'electronica-y-tecnologia',
      count: '28 items',
      icon: Activity,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'networking',
      name: 'Networking',
      slug: 'electronica-y-tecnologia',
      count: '14 items',
      icon: Wifi,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'gaming',
      name: 'Gaming',
      slug: 'electronica-y-tecnologia',
      count: '32 items',
      icon: Gamepad2,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  const [scrollIndex, setScrollIndex] = useState(0);

  return (
    <section className="mb-14">
      {/* Section Header with Left Subtitle & Right Arrows */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#4F46E5] uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]"></span>
            <span>Shop by Category</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Browse by Category
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

      {/* 7 Category Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-200/80 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center cursor-pointer"
            >
              {/* Category Icon */}
              <div
                className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 stroke-[1.8]" />
              </div>

              {/* Title & Item Count */}
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {cat.count}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
