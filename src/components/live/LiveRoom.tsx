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
  Maximize,
  Send,
  Sparkles,
  ShoppingBag,
  Plus,
  Radio,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
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
  const { trackLiveInteraction } = usePersonalization();
  const [activeTab, setActiveTab] = useState<'inicio' | 'productos' | 'en-vivo' | 'opiniones'>('en-vivo');
  const [streamMode, setStreamMode] = useState<'interactive' | 'webview'>('interactive');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChat);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(liveStream?.likeCount || 2140);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);
  const [isLiveOverlayProductOpen, setIsLiveOverlayProductOpen] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Track live shopping view
  useEffect(() => {
    trackLiveInteraction(liveStream?.id || 'live-1', store.slug);
  }, [liveStream?.id, store.slug]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const msg: ChatMessage = {
      id: `c_${Date.now()}`,
      user: 'Juan Pérez',
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

      {/* Store Header (Matches top-right mockup) */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Store Info Left */}
          <div className="flex items-start space-x-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black flex items-center justify-center text-white font-black text-2xl border-2 border-gray-100 shadow-md shrink-0">
              <span className="tracking-tighter">TECH<br />PLUS</span>
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-2xl font-black text-gray-900">{store.name}</h1>
                {store.isOfficial && (
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Tienda oficial
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1 flex-wrap gap-y-1">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span>{store.rating}</span>
                  <span className="text-gray-400 font-normal ml-1">({store.reviewCount.toLocaleString()} opiniones)</span>
                </div>
                <span>•</span>
                <span className="font-semibold text-gray-800">{store.salesCount.toLocaleString()} Ventas</span>
                <span>•</span>
                <span className="text-green-700 font-semibold">98% Recomendado</span>
                <span>•</span>
                <span className="flex items-center text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mr-0.5 text-red-500" />
                  {store.address.split(',')[0]}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2 max-w-xl leading-relaxed">
                {store.description}
              </p>

              <div className="flex items-center space-x-3 mt-4">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-800 border border-gray-300'
                      : 'bg-amber-400 hover:bg-amber-500 text-black font-extrabold'
                  }`}
                >
                  {isFollowing ? '✓ Siguiendo' : 'Seguir tienda'}
                </button>
                <button className="px-5 py-2 rounded-full text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Contactar
                </button>
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
              href={store.tiktokLiveUrl || `https://www.tiktok.com/@${(store.tiktokUsername || 'techplus_bo').replace('@', '')}/live`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-full flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-102"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              <span>Ver TikTok en vivo</span>
              <span className="text-emerald-200">|</span>
              <span>Abrir en TikTok</span>
            </a>
          </div>
        </div>

        {/* Store Tabs */}
        <div className="flex items-center space-x-8 border-t border-gray-100 mt-6 pt-4 text-xs font-bold text-gray-500">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`pb-2 transition-colors ${
              activeTab === 'inicio' ? 'text-black border-b-2 border-black' : 'hover:text-black'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveTab('productos')}
            className={`pb-2 transition-colors ${
              activeTab === 'productos' ? 'text-black border-b-2 border-black' : 'hover:text-black'
            }`}
          >
            Productos ({liveProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('en-vivo')}
            className={`pb-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'en-vivo' ? 'text-emerald-700 border-b-2 border-emerald-600' : 'hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span>En vivo</span>
          </button>
          <button
            onClick={() => setActiveTab('opiniones')}
            className={`pb-2 transition-colors ${
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
          <span>⚡ Modo Interactivo Chiringuito</span>
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
        {/* Left 2 Cols: Live Video Stream / WebView */}
        <div className="lg:col-span-2 space-y-4">
          {streamMode === 'webview' ? (
            /* WebView Mode: Embeds the actual TikTok Live Room page / player */
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-[16/10] sm:aspect-[16/9] shadow-xl border border-gray-800 flex flex-col">
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-bold text-white">WebView TikTok Live</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">@{store.tiktokUsername || store.slug}</span>
                </div>
                <a
                  href={store.tiktokLiveUrl || `https://www.tiktok.com/@${(store.tiktokUsername || 'techplus_bo').replace('@', '')}/live`}
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
                  src={store.tiktokLiveUrl || `https://www.tiktok.com/@${(store.tiktokUsername || 'techplus_bo').replace('@', '')}/live`}
                  title={`TikTok Live - ${store.name}`}
                  className="w-full h-full border-0 min-h-[420px]"
                  allow="autoplay; camera; microphone; fullscreen; clipboard-write; encrypted-media"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>
          ) : (
            /* Interactive Stream Player */
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-[16/10] sm:aspect-[16/9] shadow-xl border border-gray-800">
              {/* Simulated Live Video Background */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80"
                  alt="Presentadora en vivo mostrando iPhone"
                  className="w-full h-full object-cover object-center filter brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
              </div>

              {/* Top Bar inside Stream */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase shadow-md animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>LIVE</span>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                    <Radio className="w-3.5 h-3.5 text-red-400" />
                    <span>{liveStream?.viewerCount || 1240} espectadores</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
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

            {/* Streamer Branding Overlay */}
            <div className="absolute top-16 right-6 hidden sm:block text-right z-10 pointer-events-none opacity-80">
              <div className="text-xl font-black text-white tracking-wider drop-shadow-md">
                TECH<span className="text-amber-400">PLUS</span>
              </div>
              <div className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">
                EN VIVO CON TIKTOK
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

            {/* Chat Overlay in Lower Left of Video (Matching Mockup with WCAG AAA Contrast) */}
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

              {/* Action Buttons: Like, Comment, Share */}
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

        {/* Right Col: Productos en vivo */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-gray-900">Productos en vivo</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full">
                {liveProducts.length} items en oferta
              </span>
            </div>

            {/* List of Live Products */}
            <div className="space-y-3">
              {liveProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-gray-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
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
                      onClick={() =>
                        addToCart({
                          productId: p.id,
                          productTitle: p.title,
                          productSlug: p.slug,
                          storeId: store.id,
                          storeName: store.name,
                          unitPrice: p.price,
                          quantity: 1,
                          productImage: p.image,
                          shippingCost: 0,
                          estimatedDelivery: 'Llega hoy mismo (Express)',
                        })
                      }
                      className="py-2 rounded-full bg-[#111111] hover:bg-black text-white font-extrabold text-xs transition-all shadow-xs active:scale-95 flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Comprar en vivo</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
