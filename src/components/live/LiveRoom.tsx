'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Truck,
  RotateCcw,
  ShieldCheck,
  Heart,
  Share2,
  MessageCircle,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ShoppingBag,
  Plus,
  Radio,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Flame,
  AlertCircle,
  Clock,
  Eye,
  X,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { buildTikTokEmbedLiveUrl } from '@/lib/tiktokLiveService';

interface LiveRoomProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    banner?: string | null;
    description?: string | null;
    rating: number;
    reviewCount: number;
    salesCount: number;
    isOfficial: boolean;
    address: string;
    tiktokUsername?: string | null;
    tiktokLiveUrl?: string | null;
    isLiveNow?: boolean;
    isLive?: boolean;
    liveTitle?: string;
  };
  liveStream?: {
    id: string;
    title: string;
    streamerName: string;
    viewerCount: number;
    likeCount: number;
    status: string;
  } | null;
  liveProducts: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    image: string;
    rating: number;
  }>;
}

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  isPinned?: boolean;
}

export function LiveRoom({ store, liveStream, liveProducts }: LiveRoomProps) {
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const { user } = useAuth();

  const [currentStore, setCurrentStore] = useState(store);
  const [currentProducts, setCurrentProducts] = useState(liveProducts);
  const [isLiveActive, setIsLiveActive] = useState(
    Boolean(store.isLiveNow || store.isLive || liveStream?.status === 'LIVE')
  );

  // TikTok Embed States
  const [embedState, setEmbedState] = useState<'LOADING' | 'READY' | 'PLAYING' | 'FALLBACK'>('LOADING');
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);
  const [featuredProductIndex, setFeaturedProductIndex] = useState(0);
  const [isFeaturedCardDismissed, setIsFeaturedCardDismissed] = useState(false);

  // Chat & Social States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c1',
      user: store.name,
      avatar: store.logo,
      text: `¡Bienvenidos al Live Shopping oficial de ${store.name}! Puedes comprar cualquier producto en pantalla con precio especial y entrega express en Santa Cruz.`,
      isPinned: true,
    },
    {
      id: 'c2',
      user: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      text: '¿Hacen entregas en Equipetrol y 2do anillo?',
    },
    {
      id: 'c3',
      user: store.name,
      avatar: store.logo,
      text: '¡Sí Carlos! Despachamos en 15 a 45 minutos con motorizados OpenDSP. El pago puede ser por QR Simple o al recibir.',
      isPinned: true,
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(liveStream?.likeCount || 3420);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const cleanTiktokHandle = (currentStore.tiktokUsername || store.tiktokUsername || 'techplus_bo').replace(/^@/, '');

  // 1. Rehidratar estado local de la tienda si fue modificada en el cliente
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vitrina_active_store');
      if (stored) {
        const local = JSON.parse(stored);
        if (local.id === store.id || local.slug === store.slug) {
          setCurrentStore((prev) => ({ ...prev, ...local }));
          if (local.isLiveNow || local.isLive) {
            setIsLiveActive(true);
          }
        }
      }
    } catch {}
  }, [store.id, store.slug]);

  // 2. Timeout de resiliencia del Embed LIVE Player (3.5 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Si tras 3.5s el iframe no notificó 'onPlayerReady' o estamos en localhost sin allowlist de TikTok,
      // activamos suavemente el modo fallback sin bloquear el catálogo.
      if (embedState === 'LOADING') {
        setEmbedState('FALLBACK');
        setShowFallbackBanner(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [embedState]);

  // 3. Listener seguro de postMessage del TikTok Embed LIVE oficial
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin || !event.origin.includes('tiktok.com')) return;

      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (payload.type === 'onPlayerReady') {
          setEmbedState('READY');
        } else if (payload.type === 'onStateChange') {
          if (payload.value === 1) setEmbedState('PLAYING');
        } else if (payload.type === 'onPlayerError') {
          setEmbedState('FALLBACK');
          setShowFallbackBanner(true);
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 4. Auto-scroll de chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const msg: ChatMessage = {
      id: `c_${Date.now()}`,
      user: user?.name || 'Espectador',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      text: newComment.trim(),
    };

    setChatMessages((prev) => [...prev, msg]);
    setNewComment('');
  };

  const handleLike = () => {
    setLikeCount((prev) => prev + 1);
    setFloatingHearts((prev) => [...prev, Date.now()]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.slice(1));
    }, 2000);
  };

  // Producto actualmente destacado ("Ahora Mostrando")
  const featuredProduct = currentProducts[featuredProductIndex] || currentProducts[0];

  const handleBuyNow = (product: any) => {
    addToCart({
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug || 'producto-en-oferta',
      unitPrice: product.price,
      quantity: 1,
      productImage: product.image,
      storeId: currentStore.id,
      storeName: currentStore.name,
      shippingCost: 0,
    });
    setIsCartDrawerOpen(true);
  };

  const domain = typeof window !== 'undefined' ? window.location.hostname : 'vitrina.bo';
  const officialEmbedUrl = buildTikTokEmbedLiveUrl(cleanTiktokHandle, domain);
  const directTikTokLiveUrl = `https://www.tiktok.com/@${cleanTiktokHandle}/live`;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-6 pb-12">
      {/* Barra de Notificación / Estado en Vivo */}
      <div className="bg-slate-950 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={currentStore.logo}
              alt={currentStore.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-red-500 shadow-xs"
            />
            {isLiveActive && (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-950 animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-[#FE2C55] text-white text-[9px] font-black uppercase tracking-wider">
                {isLiveActive ? '🔴 EN VIVO' : '⚪ REPLAY / CATÁLOGO'}
              </span>
              <h1 className="text-sm font-black text-white">{currentStore.name}</h1>
              <span className="text-xs text-slate-400">@{cleanTiktokHandle}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentStore.liveTitle || 'Sesión Oficial de Live Shopping con Precios Especiales y Envío Express OpenDSP'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-400">
            ❤️ {likeCount.toLocaleString()} Me gusta
          </span>
          <a
            href={directTikTokLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#FE2C55] hover:bg-[#E0264B] text-white font-extrabold text-xs rounded-full flex items-center space-x-1.5 transition-all shadow-xs active:scale-95"
          >
            <span>Ver en TikTok App</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Grid Principal: Video / Player Embed vs Catálogo y Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: REPRODUCTOR TIKTOK EMBED + BANNER AHORA MOSTRANDO */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[9/16] sm:aspect-[16/10] lg:aspect-[16/11] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
            {/* Si está en Fallback o el dominio no está en allowlist de TikTok */}
            {embedState === 'FALLBACK' ? (
              <div className="w-full h-full p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-900 via-slate-950 to-black relative">
                <div className="w-20 h-20 rounded-full bg-black border-2 border-red-500/80 p-1 mb-4 shadow-xl relative">
                  <img
                    src={currentStore.logo}
                    alt={currentStore.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#FE2C55] text-[9px] font-black text-white uppercase tracking-wider">
                    LIVE
                  </div>
                </div>

                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">
                  Transmisión Oficial en TikTok LIVE
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentStore.name}
                </h2>
                <p className="text-xs text-slate-300 max-w-sm mt-1 leading-relaxed">
                  Esta tienda está transmitiendo en vivo en TikTok. Puedes sintonizar la transmisión en TikTok y comprar tus productos con precios especiales aquí en Vitrina.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={directTikTokLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-[#FE2C55] hover:bg-[#E0264B] text-white font-black text-xs rounded-full flex items-center space-x-2 transition-all shadow-lg active:scale-95"
                  >
                    <span>🔴 Sintonizar en App / Web de TikTok</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setEmbedState('LOADING')}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-full transition-all border border-white/10"
                  >
                    Reintentar Reproductor Embebido
                  </button>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-center">
                  <span className="text-[10px] text-slate-500">
                    🔒 Checkout protegido por Vitrina Market con despacho express OpenDSP (15-45 min en Santa Cruz).
                  </span>
                </div>
              </div>
            ) : (
              /* REPRODUCTOR OFICIAL EMBEBIDO DE TIKTOK */
              <iframe
                id="tiktok-live-player"
                src={officialEmbedUrl}
                loading="lazy"
                allow="autoplay; fullscreen"
                title={`TikTok LIVE oficial de ${currentStore.name}`}
                className="w-full h-full border-0"
              />
            )}

            {/* BANNER FLOTANTE: "🌟 AHORA MOSTRANDO EN VIVO" (Pin de Producto) */}
            {featuredProduct && !isFeaturedCardDismissed && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-2xl text-white flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-300 z-30">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative">
                    <img
                      src={featuredProduct.image}
                      alt={featuredProduct.title}
                      className="w-14 h-14 rounded-xl object-contain bg-white p-1 shrink-0"
                    />
                    <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-[8px] font-black text-slate-950 uppercase tracking-wider flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" />
                      EN VIVO
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                      ¡AHORA MOSTRANDO EN PANTALLA!
                    </span>
                    <span className="text-xs font-black text-white truncate block max-w-[200px] sm:max-w-[280px]">
                      {featuredProduct.title}
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-sm font-black text-emerald-400">
                        {formatBs(featuredProduct.price)}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatBs(Math.round(featuredProduct.price * 1.25))}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                        ⚡ Oferta Live
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleBuyNow(featuredProduct)}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center space-x-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Comprar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFeaturedCardDismissed(true)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg"
                    title="Cerrar aviso"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Aviso Informativo de Despacho y Pagos */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="text-lg">🛵</span>
              <div>
                <span className="font-extrabold text-emerald-900 block">
                  Checkout Seguro en Vitrina Market • Santa Cruz
                </span>
                <span className="text-[11px] text-emerald-800">
                  Paga con QR Simple ASFI o efectivo contra entrega. Despacho express con OpenDSP en 15-45 minutos.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLike}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 flex items-center space-x-1 shadow-2xs transition-all active:scale-90 shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-600" />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: CATÁLOGO EN VIVO + CHAT DE COMPRADORES */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Catálogo de Ofertas del Live */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <h2 className="font-black text-sm text-slate-900">Productos Disponibles en el Live</h2>
              </div>
              <span className="text-[11px] font-extrabold text-slate-500">
                {currentProducts.length} ofertas activas
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {currentProducts.map((prod, idx) => (
                <div
                  key={prod.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    featuredProductIndex === idx
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-slate-50/50 hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-xs block truncate max-w-[180px]">
                        {prod.title}
                      </span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="font-black text-emerald-700 text-xs">
                          {formatBs(prod.price)}
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatBs(Math.round(prod.price * 1.25))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedProductIndex(idx);
                        setIsFeaturedCardDismissed(false);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold"
                      title="Ver en pantalla"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuyNow(prod)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Comprar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Chat de la Sala en Vivo */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-xs text-slate-900">Chat en Vivo de la Sala</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700">● En directo</span>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl ${
                    msg.isPinned
                      ? 'bg-amber-50 border border-amber-200/80 text-amber-950'
                      : 'bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-black text-[11px] text-slate-900">{msg.user}</span>
                    {msg.isPinned && (
                      <span className="text-[9px] font-black uppercase text-amber-700">📌 Fijado</span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed">{msg.text}</p>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input para comentar */}
            <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Pregunta sobre los productos en vivo..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-hidden focus:border-emerald-600"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
