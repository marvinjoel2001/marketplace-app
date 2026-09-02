'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Clock, ChevronRight } from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { AddToCartButton } from '@/components/common/AddToCartButton';

interface FlashProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  storeName: string;
  storeId: string;
}

const mockFlashProducts: FlashProduct[] = [
  {
    id: 'fp-1',
    title: 'Zapatillas Deportivas Running Air Zoom',
    slug: 'zapatillas-deportivas-air-zoom',
    price: 304,
    originalPrice: 380,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    storeName: 'ModaBol',
    storeId: 'modabol',
  },
  {
    id: 'fp-2',
    title: 'Smart TV 55" 4K UHD Crystal HDR',
    slug: 'smart-tv-55-4k-uhd',
    price: 2796,
    originalPrice: 3290,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&auto=format&fit=crop&q=80',
    storeName: 'TechPlus Bolivia',
    storeId: 'techplus-bolivia',
  },
  {
    id: 'fp-3',
    title: 'Auriculares Inalámbricos Headphone Pro ANC',
    slug: 'auriculares-headphone-pro-anc',
    price: 337,
    originalPrice: 450,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    storeName: 'TecnoShop',
    storeId: 'tecnoshop',
  },
  {
    id: 'fp-4',
    title: 'Freidora de Aire Digital 5.5L 1700W Touch',
    slug: 'freidora-de-aire-digital-5-5l',
    price: 364,
    originalPrice: 520,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80',
    storeName: 'Hogar Feliz',
    storeId: 'hogar-feliz',
  },
  {
    id: 'fp-5',
    title: 'Smartphone Galaxy A54 5G 128GB Lime',
    slug: 'samsung-galaxy-a54-5g',
    price: 1935,
    originalPrice: 2150,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80',
    storeName: 'TechPlus Bolivia',
    storeId: 'techplus-bolivia',
  },
  {
    id: 'fp-6',
    title: 'Sofá Seccional Nórdico 3 Cuerpos Beige',
    slug: 'sofa-seccional-nordico-3-cuerpos',
    price: 2312,
    originalPrice: 2890,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80',
    storeName: 'Hogar Feliz',
    storeId: 'hogar-feliz',
  },
];

export function FlashDeals() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2 = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs shadow-xs">
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>Ofertas relámpago</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-gray-800 bg-gray-100 px-3 py-1 rounded-full font-mono font-extrabold border border-gray-200">
            <Clock className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-700">Termina en:</span>
            <span className="text-red-700 font-black">
              {format2(timeLeft.hours)}:{format2(timeLeft.minutes)}:{format2(timeLeft.seconds)}
            </span>
          </div>
        </div>

        <Link
          href="/?flashSale=true"
          className="text-xs font-black text-amber-700 hover:text-amber-800 flex items-center hover:underline"
        >
          <span>Ver todas las ofertas</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 stroke-[2.5]" />
        </Link>
      </div>

      {/* Grid of Flash Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {mockFlashProducts.map((p) => (
          <div
            key={p.id}
            className="group relative bg-[#FAF9F6] rounded-xl p-3 border border-gray-200/90 hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col justify-between"
          >
            {/* Discount Badge with AAA Contrast */}
            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-xs">
              -{p.discount}%
            </div>

            <Link href={`/product/${p.slug}`} className="block overflow-hidden rounded-lg bg-white mb-2 aspect-square flex items-center justify-center p-2 border border-gray-100">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            <div>
              <p className="text-[11px] font-bold text-gray-600 truncate mb-1">Por: {p.storeName}</p>
              <Link href={`/product/${p.slug}`}>
                <h4 className="text-xs font-bold text-gray-950 line-clamp-2 group-hover:text-amber-700 transition-colors mb-2 leading-tight">
                  {p.title}
                </h4>
              </Link>
              <div className="flex items-baseline space-x-1.5 mb-2">
                <span className="text-sm font-black text-gray-950">{formatBs(p.price)}</span>
                <span className="text-[11px] font-bold text-gray-600 line-through">{formatBs(p.originalPrice)}</span>
              </div>
            </div>

            <div className="mt-2">
              <AddToCartButton
                item={{
                  productId: p.id,
                  productTitle: p.title,
                  productSlug: p.slug,
                  storeId: p.storeId,
                  storeName: p.storeName,
                  unitPrice: p.price,
                  quantity: 1,
                  productImage: p.image,
                  shippingCost: 0,
                  estimatedDelivery: 'Llega mañana con OpenDSP',
                }}
                size="sm"
                text="Agregar"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
