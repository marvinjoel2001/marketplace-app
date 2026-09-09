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
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function BrowseByCategory() {
  const { language } = useLanguage();

  const categories = [
    {
      id: 'tecnologia',
      name: language === 'es' ? 'Tecnología' : 'Technology',
      slug: 'electronica-y-tecnologia',
      icon: Laptop,
      iconColor: 'text-sky-600',
    },
    {
      id: 'moda',
      name: language === 'es' ? 'Moda' : 'Fashion',
      slug: 'moda-y-accesorios',
      icon: Shirt,
      iconColor: 'text-rose-500',
    },
    {
      id: 'hogar',
      name: language === 'es' ? 'Hogar' : 'Home',
      slug: 'hogar-y-muebles',
      icon: Home,
      iconColor: 'text-amber-600',
    },
    {
      id: 'camaras',
      name: language === 'es' ? 'Cámaras' : 'Cameras',
      slug: 'electronica-y-tecnologia',
      icon: Camera,
      iconColor: 'text-indigo-600',
    },
    {
      id: 'juegos',
      name: language === 'es' ? 'Juegos' : 'Gaming',
      slug: 'gaming-y-computacion',
      icon: Gamepad2,
      iconColor: 'text-purple-600',
    },
    {
      id: 'celulares',
      name: language === 'es' ? 'Celulares' : 'Phones',
      slug: 'celulares-y-telefonia',
      icon: Smartphone,
      iconColor: 'text-emerald-600',
    },
    {
      id: 'decoracion',
      name: language === 'es' ? 'Decoración' : 'Decor',
      slug: 'hogar-y-confort',
      icon: Tv,
      iconColor: 'text-teal-600',
    },
    {
      id: 'mercado',
      name: language === 'es' ? 'Mercado' : 'Grocery',
      slug: 'supermercado-y-abarrotes',
      icon: ShoppingBag,
      iconColor: 'text-red-500',
    },
  ];

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {language === 'es' ? 'Categorías Principales' : 'Main Categories'}
        </h2>
      </div>

      {/* Grid of 8 Frosted Glass rounded square cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className="bg-white/75 hover:bg-white/95 backdrop-blur-xl border border-white/80 hover:border-emerald-300/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-sm group cursor-pointer aspect-square sm:aspect-auto sm:py-6"
            >
              <div className="w-10 h-10 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-200 border border-white/80">
                <Icon className={`w-5 h-5 ${cat.iconColor}`} />
              </div>
              <span className="text-xs font-black text-slate-800 group-hover:text-emerald-950 transition-colors">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
