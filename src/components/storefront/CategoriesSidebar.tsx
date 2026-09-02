'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shirt,
  Home,
  Laptop,
  Smartphone,
  Dumbbell,
  Sparkles,
  Gamepad2,
  ShoppingBag,
  HeartPulse,
  Car,
  Dog,
  ChevronRight,
} from 'lucide-react';

const categories = [
  { name: 'Moda y Accesorios', slug: 'moda-y-accesorios', icon: Shirt },
  { name: 'Hogar y Muebles', slug: 'hogar-y-muebles', icon: Home },
  { name: 'Electrónica y Tecnología', slug: 'electronica-y-tecnologia', icon: Laptop },
  { name: 'Celulares y Telefonía', slug: 'celulares-y-telefonia', icon: Smartphone },
  { name: 'Deportes y Outdoors', slug: 'deportes-y-outdoors', icon: Dumbbell },
  { name: 'Belleza y Cuidado Personal', slug: 'belleza-y-cuidado-personal', icon: Sparkles },
  { name: 'Juguetes y Niños', slug: 'juguetes-y-ninos', icon: Gamepad2 },
  { name: 'Abarrotes y Alimentos', slug: 'abarrotes-y-alimentos', icon: ShoppingBag },
  { name: 'Salud y Farmacia', slug: 'salud-y-farmacia', icon: HeartPulse },
  { name: 'Automotriz y Accesorios', slug: 'automotriz-y-accesorios', icon: Car },
  { name: 'Mascotas', slug: 'mascotas', icon: Dog },
];

export function CategoriesSidebar({ activeCategory }: { activeCategory?: string }) {
  return (
    <aside className="w-64 bg-white rounded-2xl border border-gray-200 p-3 shadow-xs hidden lg:block shrink-0">
      <h3 className="text-xs font-black text-gray-950 px-3 py-2 uppercase tracking-wider">
        Categorías
      </h3>
      <nav className="mt-1 space-y-0.5 text-xs font-semibold">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/?category=${cat.slug}`}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
                isActive
                  ? 'bg-amber-100 text-amber-950 font-black border border-amber-400'
                  : 'text-gray-800 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-800' : 'text-gray-600 group-hover:text-amber-700'} transition-colors`} />
                <span className="truncate">{cat.name}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-amber-800' : 'text-gray-400 group-hover:text-gray-700'} transition-transform group-hover:translate-x-0.5`} />
            </Link>
          );
        })}
      </nav>
      <div className="mt-3 pt-3 border-t border-gray-200 px-2">
        <Link
          href="/"
          className="text-xs font-black text-amber-700 hover:text-amber-800 block text-center py-1 hover:underline"
        >
          Ver todas las categorías
        </Link>
      </div>
    </aside>
  );
}
