'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Maximize,
  Send,
  Sparkles,
  ShoppingBag,
  Plus,
  Radio,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePersonalization } from '@/hooks/usePersonalization';

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

const initialChat: ChatMessage[] = [
  {
    id: 'c1',
    user: 'Mariana Gomez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    text: '¿Qué precio tiene ese iPhone 15 Pro Max en vivo?',
  },
  {
    id: 'c2',
    user: 'TechPlus Bolivia (Oficial)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    text: '¡Hola a todos! Hoy en el live tenemos descuento especial de Bs. 11.999 con envío gratis por OpenDSP!',
    isPinned: true,
  },
  {
    id: 'c3',
    user: 'Rodrigo V.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    text: 'Me interesa el cargador de 20W, ¿viene en la caja?',
  },
  {
    id: 'c4',
    user: 'Carla Morales',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    text: '¿Envían a Cochabamba y La Paz?',
  },
  {
    id: 'c5',
    user: 'Alejandro K.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    text: '¿Aceptan pago con QR Simple de cualquier banco?',
  },
];

export function LiveRoom({ store, liveStream, liveProducts }: LiveRoomProps) {
  const { addToCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { trackLiveInteraction } = usePersonalization();
  const [currentStore, setCurrentStore] = useState(store);
  const [currentProducts, setCurrentProducts] = useState(liveProducts);
  const [activeTab, setActiveTab] = useState<'inicio' | 'productos' | 'en-vivo' | 'opiniones'>('en-vivo');
  const [streamMode, setStreamMode] = useState<'interactive' | 'webview'>('interactive');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);

  const initialChat: ChatMessage[] = [
    {
      id: 'c1',
      user: currentStore.name,
      avatar: currentStore.logo,
      text: `¡Hola a todos! Bienvenidos a la sala de compras de ${currentStore.name}. Si estamos en vivo en TikTok o fuera de línea, puedes adquirir nuestros productos con envío express por OpenDSP.`,
      isPinned: true,
    },
  ];

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChat);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(liveStream?.likeCount || 420);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);
  const [isLiveOverlayProductOpen, setIsLiveOverlayProductOpen] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Rehidratar con datos locales si la tienda fue creada en el cliente
  useEffect(() => {
    try {
      const userStores = JSON.parse(localStorage.getItem('vitrina_user_stores') || '[]');
      const activeStoreRaw = localStorage.getItem('vitrina_active_store');
      let localStores = [...userStores];
      if (activeStoreRaw) {
        localStores.unshift(JSON.parse(activeStoreRaw));
      }
      const match = localStores.find(
        (s) => s.id === store.id || s.slug === store.slug || s.slug === store.id
      );
      if (match) {
        setCurrentStore((prev) => ({ ...prev, ...match }));

        // Cargar productos locales de esta tienda si existen
        const allProds = JSON.parse(localStorage.getItem('vitrina_all_user_products') || '[]');
        const storeProds = allProds.filter((p: any) => p.storeId === match.id || p.storeId === match.slug);
        if (storeProds.length > 0) {
          setCurrentProducts(
            storeProds
              .filter((o: any) => o && (o.product || o.title || o.name))
              .map((o: any) => {
                const prod = o.product || o;
                const title = prod.title || prod.name || 'Producto';
                const slug = prod.slug || o.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const rawImages = prod.images || prod.image || o.images || o.image || '';
                let img = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
                if (rawImages) {
                  if (typeof rawImages === 'string') {
                    try {
                      const arr = JSON.parse(rawImages);
                      if (Array.isArray(arr) && arr[0]) img = arr[0];
                      else if (rawImages.startsWith('http') || rawImages.startsWith('/')) img = rawImages;
                    } catch {
                      if (rawImages.startsWith('http') || rawImages.startsWith('/')) img = rawImages;
                    }
                  } else if (Array.isArray(rawImages) && rawImages[0]) {
                    img = rawImages[0];
                  }
                }
                return {
                  id: o.id || prod.id,
                  title: title,
                  slug: slug,
                  price: typeof o.price === 'number' ? o.price : Number(prod.price || prod.basePrice) || 0,
                  image: img,
                  rating: 5.0,
                };
              })
          );
        }
      }
    } catch {}
  }, [store.id, store.slug]);

  // Consultar estado en vivo con el scraper real de TikTok
  const verifyTikTokLive = useCallback(async () => {
    const handle = currentStore.tiktokUsername || store.tiktokUsername;
    if (!handle) return;
    setIsCheckingLive(true);
    try {
      const res = await fetch(`/api/tiktok/status?username=${encodeURIComponent(handle)}`);
      const data = await res.json();
      setLiveStatus(data);
      setLastCheckTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (data.isLive && data.viewers) {
        setLikeCount((prev) => Math.max(prev, Math.floor(data.viewers * 2.5)));
      }
    } catch (e) {
      console.warn('Error al verificar live en TikTok:', e);
    } finally {
      setIsCheckingLive(false);
    }
  }, [currentStore.tiktokUsername, store.tiktokUsername]);

  useEffect(() => {
    verifyTikTokLive();
    const interval = setInterval(verifyTikTokLive, 25000);
    return () => clearInterval(interval);
  }, [verifyTikTokLive]);

  // Estado live efectivo determinado por el scraper
  const isEffectiveLive = liveStatus
    ? Boolean(liveStatus.isLive)
    : Boolean(currentStore.tiktokUsername ? false : liveStream?.status === 'LIVE');
  const effectiveViewers = liveStatus?.viewers || (isEffectiveLive ? liveStream?.viewerCount || 0 : 0);
  const effectiveLiveTitle = liveStatus?.title || liveStream?.title || `Transmisión en directo de ${currentStore.name}`;
  const cleanTiktokHandle = (currentStore.tiktokUsername || store.tiktokUsername || '').replace(/^@/, '');

  // Track live shopping view
  useEffect(() => {
    trackLiveInteraction(liveStream?.id || 'live-1', currentStore.slug);
  }, [liveStream?.id, currentStore.slug]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const msg: ChatMessage = {
      id: `c_${Date.now()}`,
      user: 'Tú',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-black">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/#tiendas" className="hover:text-black">Tiendas</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-bold">{store.name}</span>
      </nav>

      {/* Store Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Store Info Left */}
          <div className="flex items-start space-x-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-800 font-black text-xl border-2 border-gray-100 shadow-md shrink-0">
              {currentStore.logo ? (
                <img
                  src={currentStore.logo}
                  alt={currentStore.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="tracking-tighter">{currentStore.name.slice(0, 4).toUpperCase()}</span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-2xl font-black text-gray-900">{currentStore.name}</h1>
                {currentStore.isOfficial && (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Tienda oficial
                  </span>
                )}
                {cleanTiktokHandle && (
                  <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span>@{cleanTiktokHandle}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1 flex-wrap gap-y-1">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span>{currentStore.rating || 5.0}</span>
                  <span className="text-gray-400 font-normal ml-1">
                    ({(currentStore.reviewCount || 0).toLocaleString()} opiniones)
                  </span>
                </div>
                <span>•</span>
                <span className="font-semibold text-gray-800">
                  {(currentStore.salesCount || 0).toLocaleString()} Ventas
                </span>
                <span>•</span>
                <span className="text-green-700 font-semibold">98% Recomendado</span>
                <span>•</span>
                <span className="flex items-center text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mr-0.5 text-red-500" />
                  {(currentStore.address || 'Santa Cruz, Bolivia').split(',')[0]}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2 max-w-xl leading-relaxed">
                {currentStore.description || `Tienda oficial de ${currentStore.name} en Vitrina Market`}
              </p>

              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-800 border border-gray-300'
                      : 'bg-amber-400 hover:bg-amber-500 text-black font-extrabold'
                  }`}
                >
                  {isFollowing ? '✓ Siguiendo' : 'Seguir tienda'}
                </button>
                <a
                  href={`https://wa.me/591${(currentStore as any).phone?.replace(/[^0-9]/g, '') || '77000000'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Contactar
                </a>
              </div>
            </div>
          </div>

          {/* Value Props & TikTok Live Button */}
          <div className="flex flex-col items-start lg:items-end space-y-4">
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-bold text-gray-800 text-[11px]">Envíos a todo el país</p>
                  <p className="text-[10px] text-gray-400">Llega a donde estés con OpenDSP</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="font-bold text-gray-800 text-[11px]">Devoluciones fáciles</p>
                  <p className="text-[10px] text-gray-400">Hasta 7 días</p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-bold text-gray-800 text-[11px]">Pago seguro</p>
                  <p className="text-[10px] text-gray-400">Tus datos protegidos</p>
                </div>
              </div>
            </div>

            {/* Big TikTok Live Button */}
            <a
              href={
                currentStore.tiktokLiveUrl ||
                `https://www.tiktok.com/@${cleanTiktokHandle || 'tiktok'}/live`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-950 hover:bg-black text-white font-extrabold text-sm rounded-full flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-102"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              <span>{isEffectiveLive ? 'Ver en TikTok Live' : 'Visitar en TikTok'}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400">@{cleanTiktokHandle || 'tiktok'}</span>
            </a>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="flex items-center space-x-8 border-t border-gray-100 mt-6 pt-4 text-xs font-bold text-gray-500">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTab === 'inicio' ? 'text-black border-b-2 border-black' : 'hover:text-black'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveTab('productos')}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTab === 'productos' ? 'text-black border-b-2 border-black' : 'hover:text-black'
            }`}
          >
            Productos ({currentProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('en-vivo')}
            className={`pb-2 transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'en-vivo' ? 'text-emerald-700 border-b-2 border-emerald-600' : 'hover:text-emerald-700'
            }`}
          >
            {isEffectiveLive && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>}
            <span>{isEffectiveLive ? 'En vivo ahora' : 'Transmisión'}</span>
          </button>
          <button
            onClick={() => setActiveTab('opiniones')}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTab === 'opiniones' ? 'text-black border-b-2 border-black' : 'hover:text-black'
            }`}
          >
            Opiniones
          </button>
        </div>
      </div>

      {/* Mode Switcher: Interactive Stream vs WebView Embed */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setStreamMode('interactive')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            streamMode === 'interactive'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <span>⚡ Modo Interactivo Vitrina Market</span>
        </button>
        <button
          type="button"
          onClick={() => setStreamMode('webview')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
            streamMode === 'webview'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <span>📱 Vista WebView TikTok Live</span>
        </button>
      </div>

      {/* Main Live Experience Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Video Stream / WebView / Offline Standby */}
        <div className="lg:col-span-2 space-y-4">
          {!isEffectiveLive ? (
            /* Standby / Offline Screen when store is not live streaming on TikTok */
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black aspect-[16/10] sm:aspect-[16/9] shadow-xl border border-gray-800 flex flex-col items-center justify-center p-6 sm:p-10 text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-slate-700 to-slate-500 shadow-lg">
                  <img
                    src={currentStore.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentStore.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-bold text-[9px] uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Offline</span>
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentStore.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                @{cleanTiktokHandle || currentStore.slug}
              </p>

              <div className="max-w-md mx-auto mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Esta tienda no está transmitiendo en vivo en TikTok en este momento.
                  Tan pronto inicie directo en la app de TikTok, nuestro servicio de detección en tiempo real activará la transmisión aquí.
                </p>
                {lastCheckTime && (
                  <span className="text-[10px] text-slate-500 mt-2 block">
                    Última comprobación con TikTok Scraper: {lastCheckTime}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={verifyTikTokLive}
                  disabled={isCheckingLive}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingLive ? 'animate-spin' : ''}`} />
                  <span>{isCheckingLive ? 'Verificando con TikTok...' : 'Comprobar Live Ahora'}</span>
                </button>

                <a
                  href={currentStore.tiktokLiveUrl || `https://www.tiktok.com/@${cleanTiktokHandle || 'tiktok'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
                >
                  <span>Ver perfil en TikTok</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : streamMode === 'webview' ? (
            /* WebView Mode: Embeds the actual TikTok Live Room page / player */
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[16/10] sm:aspect-[16/9] shadow-xl border border-gray-800 flex flex-col">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-bold text-white">Transmisión Oficial TikTok Live</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">@{cleanTiktokHandle}</span>
                </div>
                <a
                  href={currentStore.tiktokLiveUrl || `https://www.tiktok.com/@${cleanTiktokHandle}/live`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Abrir en TikTok App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex-1 relative w-full h-full bg-slate-950 flex items-center justify-center">
                <iframe
                  src={liveStatus?.embedUrl || `https://www.tiktok.com/embed/v2/@${cleanTiktokHandle}/live`}
                  title={`TikTok Live - ${currentStore.name}`}
                  className="w-full h-full border-0 min-h-[420px]"
                  allow="autoplay; camera; microphone; fullscreen; clipboard-write; encrypted-media"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>
          ) : (
            /* Interactive Stream Player with live video embed */
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-[16/10] sm:aspect-[16/9] shadow-xl border border-gray-800">
              <iframe
                src={liveStatus?.embedUrl || `https://www.tiktok.com/embed/v2/@${cleanTiktokHandle}/live`}
                title={`TikTok Live - ${currentStore.name}`}
                className="w-full h-full border-0 absolute inset-0"
                allow="autoplay; camera; microphone; fullscreen; clipboard-write; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />

              {/* Top Bar inside Stream */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                <div className="flex items-center space-x-2 pointer-events-auto">
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase shadow-md animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>LIVE</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                    <Radio className="w-3.5 h-3.5 text-red-400" />
                    <span>{effectiveViewers} espectadores</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pointer-events-auto">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Realtime Floating Hearts Animation */}
              {floatingHearts.map((id) => (
                <div
                  key={id}
                  className="absolute bottom-20 right-8 z-30 pointer-events-none text-red-500 animate-float-heart"
                >
                  ❤️
                </div>
              ))}

              {/* Chat Overlay in Lower Left of Video */}
              <div className="absolute bottom-16 left-4 right-20 max-w-md max-h-48 overflow-y-auto space-y-2 z-20 scrollbar-none pr-2">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-2xl text-xs backdrop-blur-md flex items-start space-x-2.5 animate-in fade-in slide-in-from-bottom-2 shadow-md ${
                      msg.isPinned
                        ? 'bg-amber-400 text-gray-950 font-bold border border-amber-300'
                        : 'bg-black/75 text-white border border-white/10 drop-shadow-md'
                    }`}
                  >
                    <img
                      src={msg.avatar}
                      alt={msg.user}
                      className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5 border border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`font-black text-[11px] block ${msg.isPinned ? 'text-gray-950' : 'text-amber-300 drop-shadow-xs'}`}>
                        {msg.user}
                      </span>
                      <p className="text-[11px] leading-tight break-words font-medium">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Live Controls Bottom Bar (Play, Volume, Likes, Share) */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
                <form onSubmit={handleSendComment} className="flex-1 max-w-sm mr-4 flex items-center">
                  <input
                    type="text"
                    placeholder="Escribe tu pregunta en vivo..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-2 rounded-full bg-black/75 backdrop-blur-md text-white text-xs placeholder:text-gray-300 border border-white/25 outline-hidden focus:ring-2 focus:ring-amber-400 shadow-md font-medium"
                  />
                  <button
                    type="submit"
                    aria-label="Enviar comentario"
                    className="ml-1 p-2 bg-amber-400 text-black font-black rounded-full hover:bg-amber-500 transition-all active:scale-95 shrink-0 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Action Buttons: Like, Share */}
                <div className="flex items-center space-x-2 text-white">
                  <button
                    onClick={handleLike}
                    aria-label="Dar like a la transmisión"
                    className="flex flex-col items-center bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-red-600 border border-white/15 transition-all active:scale-125 shadow-md"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    <span className="text-[10px] font-extrabold mt-0.5">{(likeCount / 1000).toFixed(1)}k</span>
                  </button>

                  <button
                    aria-label="Compartir transmisión"
                    className="flex flex-col items-center bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-black/90 border border-white/15 transition-colors shadow-md"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-bold mt-0.5">342</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Productos de la tienda / en vivo */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-gray-900">
                  {isEffectiveLive ? 'Productos en vivo' : 'Catálogo disponible'}
                </h3>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                {currentProducts.length} items
              </span>
            </div>

            {/* List of Live Products */}
            {currentProducts.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No hay productos cargados en este momento</p>
                <p className="text-[11px] text-slate-500">
                  El vendedor puede agregar productos a su tienda desde el panel de inventario.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex space-x-3">
                      <div className="w-20 h-20 rounded-xl bg-white p-2 border border-gray-200/80 shrink-0 flex items-center justify-center">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-contain hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-gray-950 line-clamp-2 mb-1 leading-snug">
                          {p.title}
                        </h4>
                        <p className="text-base font-black text-gray-950">{formatBs(p.price)}</p>
                        <div className="flex items-center text-[10px] text-emerald-800 font-bold mt-1">
                          <Truck className="w-3 h-3 mr-1 text-emerald-700" />
                          <span>Envío Express OpenDSP</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Link
                        href={`/product/${p.slug}`}
                        className="py-2 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 font-bold text-xs text-center transition-colors flex items-center justify-center"
                      >
                        Ver producto
                      </Link>

                      <button
                        onClick={() => {
                          const doAdd = () => {
                            addToCart({
                              productId: p.id,
                              productTitle: p.title,
                              productSlug: p.slug,
                              storeId: currentStore.id,
                              storeName: currentStore.name,
                              unitPrice: p.price,
                              quantity: 1,
                              productImage: p.image,
                              shippingCost: 0,
                              estimatedDelivery: 'Llega hoy mismo (Express)',
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
                        }}
                        className="py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-xs active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                        <span>Comprar {isEffectiveLive ? 'en vivo' : 'ahora'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
