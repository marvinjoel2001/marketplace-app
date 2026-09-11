'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  Shirt,
  Home,
  Camera,
  Gamepad2,
  Tv,
  ShoppingBag,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function BrowseByCategory() {
  const { language } = useLanguage();

  const categories = [
    {
      id: 'tecnologia',
      name: language === 'es' ? 'Tecnología' : 'Technology',
      description: language === 'es' ? 'Celulares, laptops, accesorios...' : 'Phones, laptops, accessories...',
      slug: 'electronica-y-tecnologia',
      icon: Laptop,
      iconColor: 'text-sky-600',
      bgColor: 'bg-sky-50/90 text-sky-600',
    },
    {
      id: 'moda',
      name: language === 'es' ? 'Moda' : 'Fashion',
      description: language === 'es' ? 'Ropa, calzado, accesorios...' : 'Clothing, shoes, accessories...',
      slug: 'moda-y-accesorios',
      icon: Shirt,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50/90 text-rose-500',
    },
    {
      id: 'hogar',
      name: language === 'es' ? 'Hogar' : 'Home',
      description: language === 'es' ? 'Decoración, cocina, limpieza...' : 'Decor, kitchen, cleaning...',
      slug: 'hogar-y-muebles',
      icon: Home,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/90 text-amber-600',
    },
    {
      id: 'camaras',
      name: language === 'es' ? 'Cámaras' : 'Cameras',
      description: language === 'es' ? 'Fotografía y video' : 'Photography and video',
      slug: 'electronica-y-tecnologia',
      icon: Camera,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/90 text-indigo-600',
    },
    {
      id: 'juegos',
      name: language === 'es' ? 'Juegos & PC' : 'Gaming & PC',
      description: language === 'es' ? 'Consolas, gaming, accesorios...' : 'Consoles, gaming, accessories...',
      slug: 'electronica-y-tecnologia',
      icon: Gamepad2,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/90 text-purple-600',
    },
    {
      id: 'celulares',
      name: language === 'es' ? 'Celulares' : 'Phones',
      description: language === 'es' ? 'Smartphones y accesorios...' : 'Smartphones and accessories...',
      slug: 'celulares-y-telefonia',
      icon: Smartphone,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/90 text-emerald-600',
    },
    {
      id: 'belleza',
      name: language === 'es' ? 'Belleza' : 'Beauty',
      description: language === 'es' ? 'Cuidado personal, cosmética...' : 'Personal care, cosmetics...',
      slug: 'belleza-y-cuidado-personal',
      icon: Tv,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50/90 text-teal-600',
    },
    {
      id: 'mercado',
      name: language === 'es' ? 'Abarrotes' : 'Grocery',
      description: language === 'es' ? 'Alimentos, bebidas, limpieza...' : 'Food, beverages, cleaning...',
      slug: 'abarrotes-y-alimentos',
      icon: ShoppingBag,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50/90 text-red-500',
    },
  ];

  return (
    <section className="mb-14">
      {/* Section Header Matching Mockup */}
      <div className="mb-6">
        <div className="flex items-center space-x-1.5 text-xs font-black text-[#7C3AED] uppercase tracking-wider mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
          <span>{language === 'es' ? 'CATEGORÍAS PRINCIPALES' : 'MAIN CATEGORIES'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {language === 'es' ? (
            <>
              Todo lo que necesitas, <br className="hidden sm:inline" />
              <span className="text-[#7C3AED]">en un solo lugar</span>
            </>
          ) : (
            <>
              Everything you need, <br className="hidden sm:inline" />
              <span className="text-[#7C3AED]">in one place</span>
            </>
          )}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 max-w-xl">
          {language === 'es'
            ? 'Descubre productos increíbles, las mejores marcas y precios que se adaptan a ti.'
            : 'Discover incredible products, the best brands and prices tailored to you.'}
        </p>
      </div>

      {/* Grid of 8 Frosted Glass Rounded Cards with chevron and descriptions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className="bg-white/80 hover:bg-white/95 backdrop-blur-xl border border-white/85 hover:border-purple-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between text-left transition-all duration-300 hover-card-3d shadow-sm group cursor-pointer min-h-[135px]"
            >
              {/* Icon Container with category specific soft tint */}
              <div
                className={`w-10 h-10 rounded-xl ${cat.bgColor} shadow-2xs flex items-center justify-center mb-3 group-hover:scale-115 group-hover:-rotate-6 transition-all duration-300 border border-white/80`}
              >
                <Icon className={`w-5 h-5 ${cat.iconColor} transition-transform duration-300 group-hover:scale-110`} />
              </div>

              {/* Title & Chevron & Subtitle */}
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-[13px] font-black text-slate-900 group-hover:text-[#7C3AED] transition-colors leading-tight truncate">
                    {cat.name}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </div>
                <p className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium truncate mt-0.5 leading-tight">
                  {cat.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
