'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Radio, ShoppingBag, Store, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useDataMode } from '@/context/DataModeContext';
import { marketplaceApi } from '@/lib/api';

export function HomeHighlightSection() {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { isRealMode } = useDataMode();

  const [realStores, setRealStores] = useState<any[]>([]);
  const [realOffers, setRealOffers] = useState<any[]>([]);
  const [liveStatusMap, setLiveStatusMap] = useState<Record<string, { isLive: boolean; viewers?: number; avatarUrl?: string; title?: string }>>({});
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [lastLiveCheck, setLastLiveCheck] = useState<string | null>(null);

  // Stores in live with vibrant colored ring gradients for DEMO mode (matching user mockup)
  const demoLiveStores = [
    {
      id: 'store-1',
      name: 'Victrina Mar...',
      subname: 'Electrónica',
      slug: 'techplus-bolivia',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      ringColor: 'from-purple-500 via-pink-500 to-rose-500',
    },
    {
      id: 'store-2',
      name: 'Victrina Mar...',
      subname: 'Ropa deportiva',
      slug: 'outfit-bolivia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      ringColor: 'from-pink-500 via-purple-500 to-indigo-500',
    },
    {
      id: 'store-3',
      name: 'Victrina Mar...',
      subname: 'Hogar',
      slug: 'novagaming',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      ringColor: 'from-rose-500 via-amber-500 to-pink-500',
    },
    {
      id: 'store-4',
      name: 'Victrina Mar...',
      subname: 'Belleza',
      slug: 'belleza-natural',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      ringColor: 'from-pink-500 via-rose-500 to-purple-500',
    },
    {
      id: 'store-5',
      name: 'Victrina Mar...',
      subname: 'Tecnología',
      slug: 'hogar-feliz',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
      ringColor: 'from-indigo-500 via-purple-500 to-sky-400',
    },
    {
      id: 'store-6',
      name: 'Victrina Mar...',
      subname: 'Accesorios',
      slug: 'abarrotes-del-dia',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      ringColor: 'from-purple-500 via-pink-500 to-rose-400',
    },
  ];

  // Best Offers for DEMO mode matching user mockup (Headphones, Earbuds, Phone, Watch)
  const demoFeaturedOffers = [
    {
      id: 'offer-1',
      title: 'Roco Wireless H...',
      fullTitle: 'Roco Wireless Headphones Yellow Edition',
      price: 89.0,
      discount: '-20%',
      bgTint: 'bg-[#FFF8E7]/90 border-amber-200/60',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&auto=format&fit=crop&q=80',
      slug: 'roco-wireless-headphones',
    },
    {
      id: 'offer-2',
      title: 'Roco Wireless H...',
      fullTitle: 'Roco Wireless Earbuds Pods Pro',
      price: 89.0,
      discount: '-20%',
      bgTint: 'bg-[#F0F4FF]/90 border-indigo-200/60',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
      slug: 'wireless-game-controller',
    },
    {
      id: 'offer-3',
      title: 'Roco Wireless H...',
      fullTitle: 'Roco Phone 15 Pro Max',
      price: 89.0,
      discount: '-15%',
      bgTint: 'bg-[#F4F6F8]/90 border-sky-200/60',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80',
      slug: 'celulares-y-telefonia',
    },
    {
      id: 'offer-4',
      title: 'Roco Wireless H...',
      fullTitle: 'Roco Smartwatch Sport Edition',
      price: 89.0,
      discount: '-10%',
      bgTint: 'bg-[#F8FAFC]/90 border-slate-200/60',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
      slug: 'electronica-y-tecnologia',
    },
  ];

  // Scraping en tiempo real del estado de TikTok Live para las tiendas registradas
  const checkAllStoresLiveStatus = useCallback(async (storesToCheck: any[]) => {
    const handles = storesToCheck
      .map((s) => s.tiktokUsername)
      .filter(Boolean)
      .map((h: string) => (h.startsWith('@') ? h : `@${h}`));

    if (handles.length === 0) return;

    setIsCheckingLive(true);
    try {
      const res = await fetch('/api/tiktok/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: handles }),
      });
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        const map: Record<string, any> = {};
        data.results.forEach((r: any) => {
          const key = r.username?.toLowerCase();
          const cleanKey = r.cleanUsername?.toLowerCase();
          if (key) map[key] = r;
          if (cleanKey) map[cleanKey] = r;
        });
        setLiveStatusMap((prev) => ({ ...prev, ...map }));
        setLastLiveCheck(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    } catch (err) {
      console.warn('Error al verificar live con scraper TikTok:', err);
    } finally {
      setIsCheckingLive(false);
    }
  }, []);

  // Cargar tiendas y productos creados por el usuario para el MODO REAL
  useEffect(() => {
    if (!isRealMode) return;

    const loadRealData = async () => {
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

        // Consultar también tiendas registradas en el backend
        try {
          const backendStores = await marketplaceApi.getStores({});
          if (Array.isArray(backendStores)) {
            backendStores.forEach((bs: any) => {
              if (!combinedStores.some((s) => s.id === bs.id || s.slug === bs.slug)) {
                combinedStores.push(bs);
              }
            });
          }
        } catch {}

        setRealStores(combinedStores);

        const allUserProds = JSON.parse(localStorage.getItem('vitrina_all_user_products') || '[]');
        setRealOffers(allUserProds);

        // Lanzar scraping en tiempo real de las tiendas cargadas
        if (combinedStores.length > 0) {
          checkAllStoresLiveStatus(combinedStores);
        }
      } catch {}
    };

    loadRealData();

    // Polling periódico cada 30 segundos para detectar inicio de directos en TikTok
    const interval = setInterval(() => {
      if (realStores.length > 0) {
        checkAllStoresLiveStatus(realStores);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isRealMode, checkAllStoresLiveStatus]);

  // Transformar tiendas reales en formato compatible con los aros de historias
  const ringColors = [
    'from-emerald-400 via-teal-500 to-cyan-500',
    'from-purple-500 via-indigo-500 to-purple-600',
    'from-rose-500 via-red-500 to-amber-500',
    'from-pink-500 via-rose-500 to-purple-500',
    'from-blue-500 via-indigo-500 to-sky-400',
  ];

  const storesToDisplay = isRealMode
    ? realStores.map((s, idx) => {
        const handle = s.tiktokUsername ? s.tiktokUsername.toLowerCase().replace(/^@/, '') : '';
        const liveData = handle ? (liveStatusMap[handle] || liveStatusMap[`@${handle}`]) : null;
        const isLive = Boolean(liveData?.isLive);
        const viewers = liveData?.viewers || 0;
        const avatar = liveData?.avatarUrl || s.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

        return {
          id: s.id || `store-${idx}`,
          name: s.name,
          subname: s.tiktokUsername || s.category || 'Tienda Oficial',
          slug: s.slug || s.id,
          avatar,
          ringColor: isLive
            ? 'from-rose-500 via-red-500 to-amber-500'
            : ringColors[idx % ringColors.length],
          isLive,
          viewers,
          href: isLive ? `/live/${encodeURIComponent(s.slug || s.id)}` : `/vendor/inventory?storeId=${encodeURIComponent(s.id || s.slug)}`,
        };
      })
    : demoLiveStores.map((s) => ({ ...s, isLive: true, viewers: 1420, href: `/live/${s.slug}` }));

  const offersToDisplay = isRealMode
    ? realOffers
        .filter((o) => o && (o.product || o.title || o.name))
        .map((o: any) => {
          const prod = o.product || o;
          const title = prod.title || prod.name || 'Producto';
          const price = typeof o.price === 'number' ? o.price : typeof prod.basePrice === 'number' ? prod.basePrice : Number(prod.price) || 0;
          const rawImages = prod.images || prod.image || o.images || o.image || '';

          let parsedImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
          if (rawImages) {
            if (typeof rawImages === 'string') {
              try {
                const arr = JSON.parse(rawImages);
                if (Array.isArray(arr) && arr[0]) {
                  parsedImg = arr[0];
                } else if (rawImages.startsWith('http') || rawImages.startsWith('/')) {
                  parsedImg = rawImages;
                }
              } catch {
                if (rawImages.startsWith('http') || rawImages.startsWith('/')) {
                  parsedImg = rawImages;
                }
              }
            } else if (Array.isArray(rawImages) && rawImages[0]) {
              parsedImg = rawImages[0];
            }
          }

          const slug = prod.slug || o.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'producto');

          return {
            id: o.id || prod.id || `offer-${Math.random()}`,
            title: title.length > 18 ? `${title.slice(0, 18)}...` : title,
            fullTitle: title,
            price: price,
            image: parsedImg,
            slug: slug,
            discount: o.discount || undefined,
            bgTint: o.bgTint || 'bg-[#FAF9F6] border-amber-100/80',
          };
        })
    : demoFeaturedOffers;

  const handleQuickAdd = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const doAdd = () => {
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

    if (!isAuthenticated) {
      openAuthModal({
        onComplete: () => {
          doAdd();
        },
      });
      return;
    }

    doAdd();
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
      {/* Columna Izquierda: En Vivo Ahora: Tiendas Destacadas (Glassmorphism Frosted Card) */}
      <div className="lg:col-span-5 xl:col-span-5 rounded-[2rem] bg-white/80 backdrop-blur-2xl p-5 sm:p-6 border border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                EN VIVO
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {language === 'es' ? 'En Vivo Ahora: Tiendas Destacadas' : 'Live Now: Featured Stores'}
              </h2>
            </div>
            <Link
              href="/#tiendas"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
            >
              {language === 'es' ? 'Ver todas las tiendas' : 'View all stores'} <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Estado vacío en modo real si no hay tiendas creadas */}
          {isRealMode && storesToDisplay.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-white/50 border border-white/60 my-3 space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Radio className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">
                  {language === 'es' ? 'No hay transmisiones en vivo ahora' : 'No live streams right now'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  {language === 'es'
                    ? 'Las tiendas oficiales transmitirán en directo próximamente con ofertas exclusivas.'
                    : 'Official stores will broadcast live soon with exclusive deals.'}
                </p>
              </div>
            </div>
          ) : (
            /* Fila de historias en vivo */
            <div className="flex items-start space-x-3.5 sm:space-x-4 overflow-x-auto pb-3 pt-1 scrollbar-none">
              {storesToDisplay.map((store) => (
                <Link
                  key={store.id}
                  href={store.href}
                  className="group shrink-0 flex flex-col items-center text-center transition-transform duration-200 hover:scale-105"
                  title={`Ver tienda ${store.name} (${store.isLive ? '🔴 EN VIVO AHORA' : 'Catálogo'})`}
                >
                  {/* Avatar con aro de degradado y badge + LIVE dinámico */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2">
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

                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-[7px] uppercase tracking-wider shadow-xs border border-white whitespace-nowrap">
                      EN VIVO
                    </div>
                  </div>

                  <div className="w-14 sm:w-16">
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
        <div className="mt-3 pt-3 border-t border-white/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>{storesToDisplay.length} {language === 'es' ? 'tiendas destacadas' : 'featured stores'}</span>
          </span>
          <Link
            href="/#tiendas"
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            {language === 'es' ? 'Ver catálogo' : 'View catalog'} <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Columna Derecha: Nuestras Mejores Ofertas (Glassmorphism Frosted Card) */}
      <div className="lg:col-span-7 xl:col-span-7 rounded-[2rem] bg-white/80 backdrop-blur-2xl p-5 sm:p-6 border border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
        <div>
          {/* Header Row: Title & "Ver todas" Button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {language === 'es' ? 'Nuestras Mejores Ofertas' : 'Our Best Deals'}
            </h2>
            <Link
              href="/#catalogo"
              className="px-3.5 py-1 rounded-full bg-white/90 hover:bg-white text-indigo-600 border border-indigo-100 text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1 hover:scale-102"
            >
              <span>{language === 'es' ? 'Ver todas' : 'View all'}</span>
              <span>→</span>
            </Link>
          </div>

          {/* 4 Mini Product Cards Grid with pastel backgrounds matching mockup */}
          {isRealMode && offersToDisplay.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-white/50 border border-white/60 my-3 space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">
                  {language === 'es' ? 'No hay ofertas publicadas aún' : 'No offers published yet'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  {language === 'es'
                    ? 'Los vendedores oficiales publicarán nuevos productos y ofertas relámpago pronto.'
                    : 'Official vendors will publish new products and flash deals soon.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
              {offersToDisplay.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl p-2.5 border ${item.bgTint || 'bg-white/90 border-white/80'} hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group cursor-pointer`}
                onClick={(e) => handleQuickAdd(item, e)}
              >
                <div>
                  {/* Product Image Container */}
                  <div className="aspect-square w-full rounded-xl overflow-hidden mb-2 p-1.5 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.fullTitle}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & Price & Discount */}
                  <h3 className="text-xs font-bold text-slate-900 truncate" title={item.fullTitle}>
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-slate-900">
                      Bs. {Number(item.price).toFixed(2)}
                    </span>
                    {item.discount && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#5B4DF0] text-white text-[10px] font-black leading-none shadow-2xs">
                        {item.discount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Dispatch assurance notice */}
        <div className="mt-3 pt-3 border-t border-white/60 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>⚡ Precios promocionales exclusivos por tiempo limitado</span>
          <span className="text-emerald-700 font-bold">OpenDSP Express</span>
        </div>
      </div>
    </section>
  );
}
