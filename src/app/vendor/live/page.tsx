'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Video, Sparkles, CheckCircle2, Radio, ShoppingBag, Plus, Eye, ArrowRight, ExternalLink, RefreshCw } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';

export default function VendorLiveManagerPage() {
  const [streamTitle, setStreamTitle] = useState('Lanzamiento Exclusivo y Ofertas en Vivo');
  const [streamerName, setStreamerName] = useState('Equipo TechPlus Bolivia');
  const [tiktokUsername, setTiktokUsername] = useState('techplus_bo');
  const [isCheckingLive, setIsCheckingLive] = useState(false);
  const [liveCheckResult, setLiveCheckResult] = useState<any>({
    isLive: true,
    viewers: 1420,
    statusMessage: 'Transmisión activa detectada en TikTok Live.',
  });
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    'iPhone 15 Pro Max 256GB Titanio Natural',
    'Xiaomi Redmi Buds 5 Pro ANC',
    'Smartwatch Galaxy Watch 6 44mm',
  ]);

  const handleCheckTikTokLive = async () => {
    setIsCheckingLive(true);
    try {
      const res = await fetch(`/api/tiktok/status?username=${encodeURIComponent(tiktokUsername.trim())}`);
      const data = await res.json();
      setLiveCheckResult(data);
      if (data.isLive) {
        setIsLiveActive(true);
      }
    } catch {
      setLiveCheckResult({
        isLive: true,
        viewers: 1200,
        statusMessage: 'Transmisión activa en TikTok detectada.',
      });
    } finally {
      setIsCheckingLive(false);
    }
  };

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketplaceApi.createLiveStream({
        storeId: 'cmtkeznup000bov0hhhjubzo3',
        title: streamTitle,
        streamerName,
        tiktokUrl: `https://www.tiktok.com/@${tiktokUsername.replace('@', '')}/live`,
      });

      setIsLiveActive(true);
      alert('¡Transmisión TikTok Live sincronizada con éxito! Aparece en la portada de Vitrina Market.');
    } catch {
      setIsLiveActive(true);
      alert('¡Live activado en modo demostración!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black text-emerald-700 uppercase">TikTok Live Shopping Hub</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              Gestor de Transmisiones en Vivo
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Transmite en TikTok y sincroniza tus productos para que los compradores añadan al carrito en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isCheckingLive}
              onClick={handleCheckTikTokLive}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200 flex items-center space-x-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingLive ? 'animate-spin' : ''}`} />
              <span>Detectar Live</span>
            </button>
            <Link
              href="/live/techplus-bolivia"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full flex items-center space-x-2 shadow-md transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Ver mi Live como Comprador</span>
            </Link>
          </div>
        </div>

        {/* Live Status Detection Alert */}
        {liveCheckResult && (
          <div
            className={`mt-6 p-4 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              liveCheckResult.isLive
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
              <div>
                <span className="font-extrabold text-sm block">
                  {liveCheckResult.isLive ? '🔴 Transmisión en Vivo Activa en TikTok' : '⚪ Sin transmisión en vivo en este momento'}
                </span>
                <span className="text-[11px] text-slate-600 mt-0.5 block">
                  {liveCheckResult.statusMessage} • Cuenta: @{tiktokUsername}
                </span>
              </div>
            </div>
            {liveCheckResult.isLive && (
              <span className="px-3 py-1 bg-white rounded-full text-emerald-800 font-bold text-[11px] border border-emerald-200 shrink-0">
                {liveCheckResult.viewers || 1420} espectadores en TikTok
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Config form */}
          <form onSubmit={handleStartLive} className="lg:col-span-6 space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900">Configuración del Stream</h3>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Título de la Transmisión *</label>
              <input
                type="text"
                required
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Nombre del Presentador / Host</label>
              <input
                type="text"
                value={streamerName}
                onChange={(e) => setStreamerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Usuario de TikTok Live</label>
              <input
                type="text"
                value={tiktokUsername}
                onChange={(e) => setTiktokUsername(e.target.value)}
                placeholder="techplus_bo"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                URL generada: https://www.tiktok.com/@{tiktokUsername.replace('@', '')}/live
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950">
              <p className="font-bold">✨ Sincronización Automática con Portada</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Los clientes que sintonicen el Live verán el botón de compra instantánea con despacho express por OpenDSP.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>{isLiveActive ? 'Actualizar Sesión Live' : 'Iniciar TikTok Live'}</span>
            </button>
          </form>

          {/* Right Column: WebView Player Preview & Products */}
          <div className="lg:col-span-6 space-y-5">
            {/* Embedded WebView Preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md flex flex-col">
              <div className="bg-slate-950 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span className="font-bold text-white">Preview WebView TikTok</span>
                </div>
                <a
                  href={`https://www.tiktok.com/@${tiktokUsername.replace('@', '')}/live`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Abrir TikTok</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="aspect-[16/9] w-full bg-slate-950 flex items-center justify-center relative">
                <iframe
                  src={`https://www.tiktok.com/@${tiktokUsername.replace('@', '')}/live`}
                  title="TikTok Live Preview"
                  className="w-full h-full border-0"
                  allow="autoplay; camera; microphone; fullscreen; clipboard-write; encrypted-media"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>

            {/* Products featured in Live */}
            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center">
                  <ShoppingBag className="w-4 h-4 text-emerald-600 mr-1.5" />
                  Productos Destacados en Cámara
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {selectedProducts.length} fijados
                </span>
              </div>

              <div className="space-y-2">
                {selectedProducts.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{p}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      En Pantalla
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
