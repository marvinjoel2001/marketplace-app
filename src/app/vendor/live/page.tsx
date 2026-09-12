'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Video,
  Radio,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  ArrowRight,
  ExternalLink,
  Copy,
  Pin,
  Flame,
  ShieldCheck,
  Package,
  Layers,
} from 'lucide-react';
import { marketplaceApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatBs } from '@/lib/utils';
import { buildTikTokEmbedLiveUrl } from '@/lib/tiktokLiveService';

interface LiveProductConfig {
  id: string;
  title: string;
  image: string;
  basePrice: number;
  livePrice: number;
  stockReserved: number;
  stockSold: number;
  isSelected: boolean;
  isFeatured: boolean;
}

export default function VendorLiveManagerPage() {
  const { user } = useAuth();
  const [activeStore, setActiveStore] = useState<any>(null);

  // Form State
  const [streamTitle, setStreamTitle] = useState('Gran Venta Flash de Tecnología y Accesorios');
  const [streamerName, setStreamerName] = useState(user?.name || 'Vendedor Oficial');
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [offerExpiryMode, setOfferExpiryMode] = useState<'during' | 'plus2h' | 'plus24h'>('during');
  
  // Live State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStartedAt, setLiveStartedAt] = useState<string | null>(null);
  const [featuredProductId, setFeaturedProductId] = useState<string | null>(null);
  
  // Products
  const [products, setProducts] = useState<LiveProductConfig[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // 1. Cargar datos de la tienda activa y catálogo
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vitrina_active_store');
      let currentStore: any = null;
      if (stored) {
        currentStore = JSON.parse(stored);
        setActiveStore(currentStore);
        if (currentStore.tiktokUsername) {
          setTiktokUsername(currentStore.tiktokUsername.replace(/^@/, ''));
        }
        if (currentStore.name) {
          setStreamTitle(`Venta en Vivo de ${currentStore.name}`);
        }
        if (currentStore.isLiveNow || currentStore.isLive) {
          setIsLiveActive(true);
        }
      }

      // Cargar productos de la tienda
      loadStoreProducts(currentStore?.id || 's-1');
    } catch {}
  }, []);

  const loadStoreProducts = async (storeId: string) => {
    setIsLoadingProducts(true);
    try {
      const apiProds = await marketplaceApi.getProducts();
      // Mapear a LiveProductConfig con precios de oferta sugeridos (15% - 25% OFF)
      const mapped: LiveProductConfig[] = (apiProds || []).slice(0, 8).map((p: any, idx: number) => {
        let img = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
        try {
          const parsed = JSON.parse(p.images);
          if (Array.isArray(parsed) && parsed[0]) img = parsed[0];
          else if (typeof p.images === 'string' && p.images.startsWith('http')) img = p.images;
        } catch {
          if (typeof p.images === 'string' && p.images.startsWith('http')) img = p.images;
        }

        const base = Number(p.basePrice) || 150;
        const discountRate = 0.82; // 18% descuento en Live
        const calculatedLivePrice = Math.round(base * discountRate);

        return {
          id: p.id || `prod-${idx}`,
          title: p.title || 'Producto de Catálogo',
          image: img,
          basePrice: base,
          livePrice: calculatedLivePrice,
          stockReserved: 10,
          stockSold: idx === 0 ? 3 : 0,
          isSelected: idx < 4, // primeros 4 preseleccionados
          isFeatured: idx === 0,
        };
      });

      setProducts(mapped);
      if (mapped.length > 0) {
        setFeaturedProductId(mapped[0].id);
      }
    } catch {
      console.warn('Error al cargar productos para el live');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleToggleProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    );
  };

  const handleUpdatePrice = (id: string, newLivePrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, livePrice: Math.max(1, newLivePrice) } : p))
    );
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stockReserved: Math.max(1, newStock) } : p))
    );
  };

  const handleFeatureProduct = (id: string) => {
    setFeaturedProductId(id);
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        isFeatured: p.id === id,
      }))
    );
    const prod = products.find((p) => p.id === id);
    setToast({
      type: 'info',
      message: `🌟 ¡Producto Destacado en Pantalla! "${prod?.title || 'Producto'}" aparece como banner flotante para los espectadores.`,
    });
    setTimeout(() => setToast(null), 4000);
  };

  // Iniciar Live Manualmente (CERO SCRAPING)
  const handleStartLiveNow = async () => {
    const selectedCount = products.filter((p) => p.isSelected).length;
    if (selectedCount === 0) {
      alert('Debes seleccionar al menos 1 producto para vender durante el Live.');
      return;
    }

    const currentStore = activeStore || { id: 's-1', slug: 'techplus-bolivia', name: 'TechPlus Bolivia' };
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIsLiveActive(true);
    setLiveStartedAt(now);

    try {
      const updatedStore = {
        ...currentStore,
        isLiveNow: true,
        isLive: true,
        tiktokUsername,
        streamTitle,
        streamerName,
      };
      localStorage.setItem('vitrina_active_store', JSON.stringify(updatedStore));
      setActiveStore(updatedStore);
    } catch {}

    try {
      await marketplaceApi.createLiveStream({
        storeId: currentStore.id,
        title: streamTitle,
        streamerName,
        tiktokUrl: `https://www.tiktok.com/@${tiktokUsername.replace('@', '')}/live`,
        featuredProductIds: products.filter((p) => p.isSelected).map((p) => p.id),
      });
    } catch {}

    setToast({
      type: 'success',
      message: '🔴 ¡Transmisión en Vivo INICIADA en Vitrina! Tu sala pública ya está activa con ofertas exclusivas y checkout express.',
    });
    setTimeout(() => setToast(null), 5000);
  };

  // Finalizar Live Manualmente
  const handleEndLiveNow = () => {
    if (!confirm('¿Deseas finalizar la transmisión en vivo? Los productos no vendidos se liberarán de vuelta al inventario regular.')) {
      return;
    }

    setIsLiveActive(false);
    setLiveStartedAt(null);

    try {
      const updatedStore = {
        ...activeStore,
        isLiveNow: false,
        isLive: false,
      };
      localStorage.setItem('vitrina_active_store', JSON.stringify(updatedStore));
      setActiveStore(updatedStore);
    } catch {}

    setToast({
      type: 'info',
      message: '⏹️ Sesión de Live Finalizada. El stock reservado no vendido ha retornado al catálogo regular de tu tienda.',
    });
    setTimeout(() => setToast(null), 5000);
  };

  const publicLiveUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/live/${activeStore?.slug || 'techplus-bolivia'}`
    : `https://vitrina.bo/live/${activeStore?.slug || 'techplus-bolivia'}`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(publicLiveUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const selectedProducts = products.filter((p) => p.isSelected);
  const totalReservedUnits = selectedProducts.reduce((acc, p) => acc + p.stockReserved, 0);
  const totalSoldUnits = selectedProducts.reduce((acc, p) => acc + p.stockSold, 0);
  const totalLiveRevenueBob = selectedProducts.reduce((acc, p) => acc + p.stockSold * p.livePrice, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-900 text-white'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="p-1 hover:bg-white/20 rounded-full">
            ✕
          </button>
        </div>
      )}

      {/* Header Principal del Command Center */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950 text-white text-xs font-black">
              <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-red-500 animate-ping' : 'bg-slate-400'}`}></span>
              <span>{isLiveActive ? '🔴 EN VIVO AHORA EN VITRINA' : '⚪ SESIÓN PREPARADA (OFFLINE)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Consola de TikTok LIVE Shopping
            </h1>
            <p className="text-xs text-slate-500">
              Vende en vivo desde tu celular en TikTok y sincroniza tus productos para que tus clientes compren con QR Simple y delivery en Santa Cruz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace Público'}</span>
            </button>
            <Link
              href={`/live/${activeStore?.slug || 'techplus-bolivia'}`}
              target="_blank"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Sala en Vivo (Comprador)</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Módulo 1: Conexión Oficial TikTok (CERO SCRAPING) */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
              🎵
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">
                Cuenta TikTok Vinculada: @{tiktokUsername || 'techplus_bo'}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Integración oficial con TikTok Embed LIVE Player (Sin scraping ni bots)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tiktokUsername}
              onChange={(e) => setTiktokUsername(e.target.value.replace(/^@/, ''))}
              placeholder="usuario_tiktok"
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-hidden focus:border-emerald-600 bg-white"
            />
            <span className="text-xs font-bold text-slate-400">@tiktok</span>
          </div>
        </div>

        {/* Métricas en Tiempo Real durante la Sesión */}
        {isLiveActive && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
              <span className="text-[10px] font-black text-red-700 uppercase tracking-wider block">Estado</span>
              <span className="text-base font-black text-red-900 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                Transmitiendo
              </span>
              <span className="text-[10px] text-red-600 mt-1 block">Desde {liveStartedAt || 'hace instantes'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Ventas en el Live</span>
              <span className="text-base font-black text-emerald-900 mt-0.5 block">{formatBs(totalLiveRevenueBob)}</span>
              <span className="text-[10px] text-emerald-700 mt-1 block">{totalSoldUnits} órdenes confirmadas</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">Stock Reservado</span>
              <span className="text-base font-black text-blue-900 mt-0.5 block">{totalReservedUnits} piezas</span>
              <span className="text-[10px] text-blue-700 mt-1 block">{selectedProducts.length} productos activos</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">Producto en Pantalla</span>
              <span className="text-xs font-black text-amber-950 truncate block mt-1">
                {products.find((p) => p.id === featuredProductId)?.title || 'Ninguno'}
              </span>
              <span className="text-[10px] text-amber-800 mt-1 block">Visible para todos</span>
            </div>
          </div>
        )}
      </div>

      {/* Contenido en Dos Columnas: Configuración vs Control de Productos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Parámetros del Stream & Botón de Control */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>1. Configurar Transmisión</span>
            </h2>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Título de la Sesión *</label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Ej. Ofertas Flash de Tecnología y Accesorios"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Nombre del Presentador / Host</label>
              <input
                type="text"
                value={streamerName}
                onChange={(e) => setStreamerName(e.target.value)}
                placeholder="Ej. Marvin (TechPlus Oficial)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Vigencia de Precios Especiales Live</label>
              <select
                value={offerExpiryMode}
                onChange={(e: any) => setOfferExpiryMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 outline-hidden focus:border-emerald-600 bg-white"
              >
                <option value="during">Vigente solo durante la transmisión en vivo</option>
                <option value="plus2h">Mantener precios especiales por 2 horas posteriores</option>
                <option value="plus24h">Mantener precios por 24 horas</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Al vencerse el tiempo, Vitrina restaura automáticamente los precios normales de catálogo.
              </span>
            </div>

            {/* BOTÓN MANUAL DE ACTIVACIÓN / FINALIZACIÓN */}
            <div className="pt-2">
              {!isLiveActive ? (
                <button
                  type="button"
                  onClick={handleStartLiveNow}
                  className="w-full py-4 bg-[#FE2C55] hover:bg-[#E0264B] text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-rose-200 active:scale-98 flex items-center justify-center space-x-2"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>🔴 INICIAR LIVE AHORA EN VITRINA</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEndLiveNow}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black text-sm rounded-2xl transition-all shadow-lg active:scale-98 flex items-center justify-center space-x-2"
                >
                  <span>⏹️ FINALIZAR LIVE & LIBERAR STOCK</span>
                </button>
              )}
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Inicia tu transmisión en la app de TikTok desde tu teléfono y pulsa este botón para sincronizar la sala de ventas.
              </p>
            </div>
          </div>

          {/* Tarjeta de Información de Envíos Express OpenDSP */}
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-base">🛵</span>
              <span className="font-black text-emerald-900">Despacho Express OpenDSP Bolivia</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Cada pedido generado en tu Live se despacha punto a punto en Santa Cruz de la Sierra en 15 a 45 minutos. Los clientes pueden pagar con QR Simple bancario o en efectivo al recibir.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Catálogo & Precios Especiales para el Live */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>2. Productos Seleccionados para el Live</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Marca los productos que venderás, define el precio de oferta y el stock apartado exclusivamente.
                </p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 shrink-0">
                {selectedProducts.length} seleccionados
              </span>
            </div>

            {/* Lista de Productos Interactiva */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {products.map((item) => {
                const discount = Math.round(((item.basePrice - item.livePrice) / item.basePrice) * 100);
                const isItemFeatured = featuredProductId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.isSelected
                        ? isItemFeatured
                          ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-300/60 shadow-xs'
                          : 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-100 opacity-60'
                    }`}
                  >
                    {/* Checkbox y Foto */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.isSelected}
                        onChange={() => handleToggleProduct(item.id)}
                        className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 border-slate-300 shrink-0 cursor-pointer"
                      />
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-black text-slate-900 text-xs block truncate max-w-[220px]">
                          {item.title}
                        </span>
                        <div className="flex items-center space-x-2 mt-0.5 text-[11px]">
                          <span className="text-slate-400 line-through">{formatBs(item.basePrice)}</span>
                          <span className="font-extrabold text-emerald-700">{formatBs(item.livePrice)}</span>
                          {discount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-black text-[9px]">
                              {discount}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inputs de Precio Live & Stock Reservado */}
                    {item.isSelected && (
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Precio Live</span>
                          <div className="flex items-center">
                            <span className="text-[10px] text-slate-500 font-bold mr-1">Bs.</span>
                            <input
                              type="number"
                              min={1}
                              value={item.livePrice}
                              onChange={(e) => handleUpdatePrice(item.id, Number(e.target.value))}
                              className="w-16 px-2 py-1 rounded-lg border border-slate-200 font-black text-xs text-slate-900 bg-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Cupo Live</span>
                          <input
                            type="number"
                            min={1}
                            value={item.stockReserved}
                            onChange={(e) => handleUpdateStock(item.id, Number(e.target.value))}
                            className="w-14 px-2 py-1 rounded-lg border border-slate-200 font-black text-xs text-slate-900 bg-white text-center"
                          />
                        </div>

                        {/* Botón Pin / Destacar Producto */}
                        <button
                          type="button"
                          onClick={() => handleFeatureProduct(item.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1 shrink-0 ${
                            isItemFeatured
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600'
                          }`}
                          title="Fijar este producto en la pantalla de los clientes"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isItemFeatured ? 'Mostrando' : 'Destacar'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
