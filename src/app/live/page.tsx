import React from 'react';
import Link from 'next/link';
import { Radio, Eye, Heart, Share2, Sparkles, ChevronRight, ShoppingBag, Truck, ExternalLink } from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { AddToCartButton } from '@/components/common/AddToCartButton';

import { marketplaceApi, type TikTokLiveItem } from '@/lib/api';
import { AutoRefresh } from '@/components/live/AutoRefresh';

export const dynamic = 'force-dynamic';

const LIVE_CATEGORIES = ['Ropa', 'Electrónica', 'Hogar', 'Belleza', 'Otros'];

// geo_evidence is a hint about where the seller is, never a verified location.
function describeGeo(evidence: string): string {
  if (evidence === 'tiktok_country') return 'País informado por TikTok';
  if (evidence === 'registered_store') return 'Tienda registrada en Bolivia';
  if (evidence.startsWith('keyword:')) return `Menciona "${evidence.slice(8)}"`;
  return 'Ubicación no verificada';
}

export default async function LiveShoppingDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawCategory = (await searchParams).category;
  const category = typeof rawCategory === 'string' && LIVE_CATEGORIES.includes(rawCategory) ? rawCategory : undefined;
  const tiktok = await marketplaceApi.getTikTokLives({ category, limit: 24 });
  const detected: TikTokLiveItem[] = tiktok?.data ?? [];
  const detectedViewers = detected.reduce((sum, live) => sum + live.viewer_count, 0);

  let storesList: any[] = [];

  try {
    const res = await marketplaceApi.getStores();
    if (Array.isArray(res) && res.length > 0) {
      storesList = res.map((s: any, idx: number) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        address: s.address || 'Bolivia',
        rating: s.rating || 4.9,
        reviewCount: s.reviewCount || 0,
        salesCount: s.salesCount || 0,
        isOfficial: true,
        logo: s.logoUrl || s.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=10b981&color=fff&size=150`,
        banner: s.bannerUrl || s.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        isLive: s.isLive || false,
        viewers: s.viewers || 0,
        category: s.category || 'Tienda Oficial',
        liveTitle: s.liveTitle || `${s.name} - Tienda en Vitrina Market`,
        streamerName: s.streamerName || s.name,
        tiktokUsername: s.tiktokUsername || `@${s.slug}`,
        tiktokLiveUrl: s.tiktokLiveUrl || `https://www.tiktok.com/@${s.slug}/live`,
        description: s.description || 'Tienda verificada en Vitrina Market con entrega express OpenDSP.',
      }));
    }
  } catch {
    // Backend not reachable - show empty state
  }

  const liveStores = storesList.filter((s) => s.isLive);
  // Only spotlight a store that is actually live; never present an offline store as "Transmitiendo Ahora".
  const featuredStore = liveStores[0];

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
              <span className="font-bold text-slate-900">{detected.length}</span> lives detectados en TikTok
            </div>
            <div className="flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-2xs">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-900">{detectedViewers.toLocaleString('es-BO')}</span> espectadores
            </div>
            <div className="flex items-center space-x-1.5 bg-white px-3.5 py-2 rounded-full border border-slate-200/80 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Despacho seguro OpenDSP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lives detected on TikTok (real data, verified within the last minute) */}
      <section className="space-y-5">
        <AutoRefresh seconds={30} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">Lives de venta en Bolivia ahora</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detectados automáticamente en TikTok y verificados en el último minuto. La ubicación es un indicio, no una garantía.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[undefined, ...LIVE_CATEGORIES].map((name) => (
              <Link
                key={name ?? 'todos'}
                href={name ? `/live?category=${encodeURIComponent(name)}` : '/live'}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  category === name
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {name ?? 'Todos'}
              </Link>
            ))}
          </div>
        </div>

        {tiktok === null ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-xs text-amber-800">
            No se pudo consultar los lives en este momento. Intenta de nuevo en unos segundos.
          </div>
        ) : detected.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Radio className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {category ? `No hay lives de ${category} ahora` : 'No hay lives de venta detectados ahora'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {tiktok.meta.worker_enabled
                ? 'La lista se actualiza sola cada 30 segundos.'
                : 'La detección automática está desactivada en este servidor.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {detected.map((live) => (
              <a
                key={live.username}
                href={live.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col group"
              >
                <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                  {live.cover_image_url && (
                    <img
                      src={live.cover_image_url}
                      alt={live.title || live.username}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center space-x-1 px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-full uppercase shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>LIVE</span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
                    <Eye className="w-3 h-3 text-red-400" />
                    <span>{live.viewer_count.toLocaleString('es-BO')}</span>
                  </div>
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-md">
                    {live.category}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1">
                  <div className="flex items-center space-x-2.5">
                    {live.avatar_url && (
                      <img
                        src={live.avatar_url}
                        alt={live.username}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                      />
                    )}
                    <p className="text-sm font-extrabold text-slate-900 truncate">@{live.username}</p>
                  </div>
                  <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-snug">
                    {live.title || 'Transmisión en vivo'}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <span>{describeGeo(live.geo_evidence)}</span>
                    <span className="inline-flex items-center space-x-1 font-bold text-slate-700">
                      <span>Ver en TikTok</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Featured Stream Spotlight */}
      {featuredStore ? (
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
      ) : (
        <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-2xs text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No hay transmisiones en vivo</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Las tiendas oficiales transmitirán en directo próximamente con ofertas exclusivas y cupones.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <span>Explorar el Catálogo</span>
          </Link>
        </section>
      )}

      {/* Grid of All Live Stores */}
      {storesList.length > 0 && (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">Todas las Tiendas</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecciona una tienda para ver su catálogo y transmisiones en vivo
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {storesList.map((store) => (
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

                  {/* Live Pill - only if live */}
                  {store.isLive && (
                    <div className="absolute top-3 left-3 flex items-center space-x-1 px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-full uppercase shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      <span>LIVE</span>
                    </div>
                  )}

                  {/* Viewers */}
                  {store.viewers > 0 && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full">
                      <Eye className="w-3 h-3 text-red-400" />
                      <span>{store.viewers}</span>
                    </div>
                  )}

                  {/* Category & Streamer */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md">
                      {store.category}
                    </span>
                    <p className="text-xs font-bold mt-1 line-clamp-1 text-slate-200">
                      {store.streamerName}
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
                    href={store.isLive ? `/live/${store.slug}` : `/?category=${store.category}`}
                    className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs text-center transition-all shadow-xs flex items-center justify-center space-x-1.5"
                  >
                    <Radio className="w-3.5 h-3.5 text-pink-400" />
                    <span>{store.isLive ? 'Ver Transmisión en Vivo' : 'Ver Tienda'}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
