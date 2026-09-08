'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Radio, ShoppingBag, Store, Plus, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useDataMode } from '@/context/DataModeContext';

export function HomeHighlightSection() {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { isRealMode } = useDataMode();

  const [realStores, setRealStores] = useState<any[]>([]);
  const [realOffers, setRealOffers] = useState<any[]>([]);

  // Stores in live with vibrant colored ring gradients for DEMO mode
  const demoLiveStores = [
    {
      id: 'store-1',
      name: 'Vitrina Market',
      subname: 'Marketplace',
      slug: 'techplus-bolivia',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      ringColor: 'from-purple-500 via-indigo-500 to-purple-600',
    },
    {
      id: 'store-2',
      name: 'Vitrina Market',
      subname: 'Marketplace',
      slug: 'outfit-bolivia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      ringColor: 'from-cyan-400 via-teal-500 to-emerald-500',
    },
    {
      id: 'store-3',
      name: 'Vitrina Market',
      subname: 'Desmalaarae',
      slug: 'novagaming',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      ringColor: 'from-rose-500 via-red-500 to-amber-500',
    },
    {
      id: 'store-4',
      name: 'Vitrina Market',
      subname: 'Savconlonia',
      slug: 'belleza-natural',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      ringColor: 'from-pink-500 via-rose-500 to-purple-500',
    },
    {
      id: 'store-5',
      name: 'Vitrina Market',
      subname: 'Alsinda',
      slug: 'hogar-feliz',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      ringColor: 'from-blue-500 via-indigo-500 to-sky-400',
    },
    {
      id: 'store-6',
      name: 'Vitrina Market',
      subname: 'Bolivia VIP',
      slug: 'abarrotes-del-dia',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      ringColor: 'from-emerald-400 via-teal-500 to-cyan-500',
    },
  ];

  // Best Offers for DEMO mode matching mockup
  const demoFeaturedOffers = [
    {
      id: 'offer-1',
      title: 'Roco Wireless H...',
      fullTitle: 'Roco Wireless Headphones Pro ANC',
      price: 89.0,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
      slug: 'roco-wireless-headphones',
    },
    {
      id: 'offer-2',
      title: 'Roco Wireless H...',
      fullTitle: 'Roco Wireless Mouse & Desk Setup',
      price: 89.0,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&auto=format&fit=crop&q=80',
      slug: 'wireless-game-controller',
    },
    {
      id: 'offer-3',
      title: 'Roco Versitonin...',
      fullTitle: 'Roco Versitonin Phone Titanium',
      price: 89.0,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80',
      slug: 'celulares-y-telefonia',
    },
    {
      id: 'offer-4',
      title: 'Roco Wireless H...',
      fullTitle: 'Roco Wireless 4K Digital Camera Pro',
      price: 89.0,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80',
      slug: 'electronica-y-tecnologia',
    },
  ];

  // Cargar tiendas y productos creados por el usuario para el MODO REAL
  useEffect(() => {
    try {
      const userStores = JSON.parse(localStorage.getItem('vitrina_user_stores') || '[]');
      const activeStoreRaw = localStorage.getItem('vitrina_active_store');
      let combinedStores = [...userStores];

      if (activeStoreRaw) {
        const parsed = JSON.parse(activeStoreRaw);
        if (!combinedStores.some((s) => s.id === parsed.id)) {
          combinedStores.unshift(parsed);
        }
      }

      setRealStores(combinedStores);

      const allUserProds = JSON.parse(localStorage.getItem('vitrina_all_user_products') || '[]');
      setRealOffers(allUserProds);
    } catch {}
  }, [isRealMode]);

  // Transformar tiendas reales en formato compatible con los aros de historias
  const ringColors = [
    'from-emerald-400 via-teal-500 to-cyan-500',
    'from-purple-500 via-indigo-500 to-purple-600',
    'from-rose-500 via-red-500 to-amber-500',
    'from-pink-500 via-rose-500 to-purple-500',
    'from-blue-500 via-indigo-500 to-sky-400',
  ];

  const storesToDisplay = isRealMode
    ? realStores.map((s, idx) => ({
        id: s.id || `store-${idx}`,
        name: s.name,
        subname: s.tiktokUsername || s.category || 'Tienda Oficial',
        slug: s.slug || s.id,
        avatar: s.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        ringColor: ringColors[idx % ringColors.length],
      }))
    : demoLiveStores;

  const offersToDisplay = isRealMode
    ? realOffers.map((o) => {
        let parsedImg = o.product.images;
        try {
          const arr = JSON.parse(o.product.images);
          if (Array.isArray(arr) && arr[0]) parsedImg = arr[0];
        } catch {}
        return {
          id: o.id,
          title: o.product.title.length > 18 ? `${o.product.title.slice(0, 18)}...` : o.product.title,
          fullTitle: o.product.title,
          price: o.price,
          image: parsedImg,
          slug: o.product.slug,
        };
      })
    : demoFeaturedOffers;

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      productTitle: product.fullTitle,
      productSlug: product.slug,
      unitPrice: product.price,
      productImage: product.image,
      storeName: 'Vitrina Market Oficial',
      storeId: 'vitrina-oficial',
      shippingCost: 0,
      quantity: 1,
    });
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
      {/* Columna Izquierda: En Vivo Ahora: Tiendas Destacadas */}
      <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{language === 'es' ? 'En Vivo Ahora: Tiendas Destacadas' : 'Live Now: Featured Stores'}</span>
              {isRealMode && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  Real
                </span>
              )}
            </h2>
          </div>

          {/* Estado vacío en modo real si no hay tiendas creadas */}
          {isRealMode && storesToDisplay.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200/60 my-3 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
                🏪
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  {language === 'es' ? 'Aún no has registrado tu tienda' : 'No stores registered yet'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'es'
                    ? 'En el Modo Real sólo se muestran tus tiendas creadas. ¡Sé el primero!'
                    : 'Real mode only shows your created stores. Register yours now!'}
                </p>
              </div>
              <Link
                href="/vendor/onboarding"
                className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Registrar Mi Tienda' : 'Register My Store'}</span>
              </Link>
            </div>
          ) : (
            /* Fila de historias en vivo */
            <div className="flex items-start space-x-4 sm:space-x-5 overflow-x-auto pb-3 pt-1 scrollbar-none">
              {storesToDisplay.map((store) => (
                <Link
                  key={store.id}
                  href={`/vendor/inventory?storeId=${encodeURIComponent(store.id || store.slug)}`}
                  className="group shrink-0 flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
                  title={`Ver tienda ${store.name} (${store.subname})`}
                >
                  {/* Avatar con aro de degradado y badge + LIVE */}
                  <div className="relative w-15 h-15 sm:w-16 sm:h-16 mb-2">
                    <div
                      className={`w-full h-full rounded-full p-[2.5px] bg-gradient-to-tr ${store.ringColor} shadow-sm group-hover:rotate-6 transition-all duration-300`}
                    >
                      <div className="w-full h-full rounded-full p-0.5 bg-white overflow-hidden">
                        <img
                          src={store.avatar}
                          alt={store.name}
                          className="w-full h-full rounded-full object-cover object-center"
                        />
                      </div>
                    </div>

                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-[8px] uppercase tracking-wider shadow-xs border border-white whitespace-nowrap animate-pulse">
                      + LIVE
                    </div>
                  </div>

                  <div className="w-16 sm:w-18">
                    <p className="text-[11px] font-extrabold text-slate-900 truncate leading-tight">
                      {store.name}
                    </p>
                    <p className="text-[9px] font-medium text-slate-400 truncate leading-tight mt-0.5">
                      {store.subname}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Live bottom indicator hint */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {storesToDisplay.length}{' '}
            {language === 'es' ? 'tiendas disponibles' : 'stores available'}
          </span>
          <Link
            href="/vendor/onboarding"
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
          >
            {language === 'es' ? '+ Crear Tienda' : '+ New Store'} <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Columna Derecha: Nuestras Mejores Ofertas */}
      <div className="lg:col-span-7 xl:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
        <div>
          {/* Header Row: Title & "Ver todas" Button */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{language === 'es' ? 'Nuestras Mejores Ofertas' : 'Our Best Deals'}</span>
              {isRealMode && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  Real
                </span>
              )}
            </h2>
            <Link
              href={isRealMode ? '/vendor/inventory' : '/?flashSale=true'}
              className="px-3.5 py-1 rounded-full border border-emerald-600/80 text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold transition-all hover:scale-102"
            >
              {isRealMode ? '+ Añadir Producto' : (language === 'es' ? 'Ver todas' : 'View all')}
            </Link>
          </div>

          {/* Estado vacío en modo real si no hay productos creados aún */}
          {isRealMode && offersToDisplay.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/60 my-2 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-black">
                📦
              </div>
              <h4 className="text-xs font-black text-slate-900">
                {language === 'es' ? 'Sin productos en tu catálogo real aún' : 'No products in your real catalog yet'}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                {language === 'es'
                  ? 'En el Modo Real no mostramos productos inventados. Entra a tu panel y publica tus productos con fotos y precios.'
                  : 'Real mode only shows actual products. Go to your vendor dashboard to publish items.'}
              </p>
              <Link
                href="/vendor/inventory"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Publicar Mi Primer Producto' : 'Publish First Product'}</span>
              </Link>
            </div>
          ) : (
            /* 4 Mini Product Cards Grid */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {offersToDisplay.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-2.5 border border-slate-100 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    {/* Product Image Container */}
                    <div className="aspect-square w-full rounded-xl bg-slate-50 p-2 overflow-hidden mb-2">
                      <img
                        src={item.image}
                        alt={item.fullTitle}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Title & Price */}
                    <h3 className="text-xs font-bold text-slate-900 truncate" title={item.fullTitle}>
                      {item.title}
                    </h3>
                    <p className="text-xs font-black text-slate-900 mt-0.5">
                      Bs. {Number(item.price).toFixed(2)}
                    </p>
                  </div>

                  {/* Add to cart pill button */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(item, e)}
                    className="mt-3 w-full py-1.5 px-2 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-[11px] font-extrabold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>{language === 'es' ? 'Añadir' : 'Add'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dispatch assurance notice */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>⚡ Precios promocionales exclusivos por tiempo limitado</span>
          <span className="text-emerald-700 font-bold">OpenDSP Express</span>
        </div>
      </div>
    </section>
  );
}
