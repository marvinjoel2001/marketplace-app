import React from 'react';
import Link from 'next/link';
import { Radio, Eye, Heart, Share2, Sparkles, ChevronRight, ShoppingBag, Truck, ExternalLink } from 'lucide-react';
import { MOCK_STORES, MOCK_PRODUCTS } from '@/lib/mockData';
import { formatBs } from '@/lib/utils';
import { AddToCartButton } from '@/components/common/AddToCartButton';

export const dynamic = 'force-dynamic';

export default function LiveShoppingDirectoryPage() {
  const liveStores = MOCK_STORES.filter((s) => s.isLive);
  const featuredStore = liveStores[0] || MOCK_STORES[0];

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-black font-medium">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">TikTok Live Shopping</span>
      </nav>

      {/* Hero Banner for TikTok Live (Clean Light Style) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#F4F9F5] via-[#FAFCFA] to-[#F1F7F3] p-6 sm:p-10 text-slate-900 shadow-xs border border-emerald-100/70">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs rounded-full uppercase tracking-wider mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>EN VIVO AHORA</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Compra en vivo con <span className="text-emerald-600">TikTok Live Shopping</span>
          </h1>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed font-normal">
            Descubre productos en tiempo real, interactúa con vendedores autorizados, aprovecha cupones exclusivos de la transmisión y recibe tu pedido en minutos con la logística express de <strong>OpenDSP</strong>.
          </p>

          <div className="flex items-center gap-3 mt-6 flex-wrap text-xs text-slate-600">
            <div className="flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-2xs">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-900">{liveStores.length} Tiendas</span> en vivo
            </div>
            <div className="flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-900">+8.8K</span> espectadores simultáneos
            </div>
            <div className="flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Despacho seguro OpenDSP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Stream Spotlight */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-black text-slate-900">Transmisión Destacada</h2>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            ● Transmitiendo Ahora
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-video shadow-lg bg-black group">
            <img
              src={featuredStore.banner}
              alt={featuredStore.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white font-black text-xs rounded-full uppercase">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>LIVE</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1 bg-black/60 backdrop-blur-md text-white font-bold text-xs rounded-full">
                <Eye className="w-3.5 h-3.5 text-red-400" />
                <span>{featuredStore.viewers} viendo</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{featuredStore.category}</span>
              <h3 className="text-base sm:text-lg font-black leading-snug">{featuredStore.liveTitle}</h3>
              <p className="text-xs text-slate-300 mt-1">Presentado por {featuredStore.streamerName} ({featuredStore.tiktokUsername})</p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3.5">
              <img
                src={featuredStore.logo}
                alt={featuredStore.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
              />
              <div>
                <h4 className="text-lg font-black text-slate-900">{featuredStore.name}</h4>
                <p className="text-xs text-slate-500">{featuredStore.address}</p>
                <div className="flex items-center space-x-2 text-xs text-amber-500 font-bold mt-0.5">
                  <span>★ {featuredStore.rating}</span>
                  <span className="text-slate-400">({featuredStore.reviewCount} opiniones)</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {featuredStore.description}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/live/${featuredStore.slug}`}
                className="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-extrabold text-xs text-center shadow-md transition-all transform hover:scale-102 flex items-center justify-center space-x-2"
              >
                <Radio className="w-4 h-4" />
                <span>Entrar a la Sala En Vivo</span>
              </Link>

              <a
                href={featuredStore.tiktokLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs text-center transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Ver en TikTok</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of All Live Stores */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">Todas las Tiendas Transmitiendo</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecciona una tienda para interactuar en el chat en vivo y comprar productos en directo
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {liveStores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col group"
            >
              {/* Card Image Banner */}
              <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                <img
                  src={store.banner}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Live Pill */}
                <div className="absolute top-3 left-3 flex items-center space-x-1 px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-full uppercase shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span>LIVE</span>
                </div>

                {/* Viewers */}
                <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
                  <Eye className="w-3 h-3 text-red-400" />
                  <span>{store.viewers}</span>
                </div>

                {/* Category & Streamer */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md">
                    {store.category}
                  </span>
                  <p className="text-xs font-bold mt-1 line-clamp-1 text-slate-200">
                    Host: {store.streamerName}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="flex items-start space-x-3">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-100 shrink-0 mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {store.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">{store.tiktokUsername}</p>
                    <p className="text-xs font-medium text-slate-700 mt-1 line-clamp-2 leading-snug">
                      {store.liveTitle}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/live/${store.slug}`}
                  className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs text-center transition-all shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-pink-400" />
                  <span>Ver Transmisión en Vivo</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Live Deals Products */}
      <section className="bg-[#FAF5FF] rounded-3xl p-6 sm:p-8 border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-purple-700 text-[10px] font-bold uppercase tracking-wider mb-1 border border-purple-100">
              <ShoppingBag className="w-3 h-3 text-purple-700" />
              <span>Descuentos Exclusivos de Live</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">Productos en Oferta Durante las Transmisiones</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_PRODUCTS.slice(0, 4).map((product) => {
            let img = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300';
            try {
              img = JSON.parse(product.images)[0];
            } catch {
              img = product.images;
            }
            const offer = product.offers[0];

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 border border-purple-100/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-square rounded-xl bg-slate-50 p-2 mb-3 overflow-hidden flex items-center justify-center">
                    <img src={img} alt={product.title} className="w-full h-full object-contain hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    {offer?.store.name || 'Tienda Oficial'}
                  </span>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mt-1.5 hover:text-purple-700 transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-base font-black text-slate-900">{formatBs(product.basePrice)}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Envío Hoy
                    </span>
                  </div>

                  <AddToCartButton
                    item={{
                      productOfferId: offer?.id || 'off-1',
                      productId: product.id,
                      productTitle: product.title,
                      productSlug: product.slug,
                      storeId: offer?.store.id || 'store-1',
                      storeName: offer?.store.name || 'Tienda Oficial',
                      unitPrice: product.basePrice,
                      quantity: 1,
                      productImage: img,
                      shippingCost: 0,
                      estimatedDelivery: 'Llega hoy con OpenDSP',
                    }}
                    size="sm"
                    variant="pill"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
