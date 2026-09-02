'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Video, Sparkles, CheckCircle2, Radio, ShoppingBag, Plus, Eye, ArrowRight } from 'lucide-react';

import { marketplaceApi } from '@/lib/api';

export default function VendorLiveManagerPage() {
  const [streamTitle, setStreamTitle] = useState('Lanzamiento Exclusivo y Ofertas en Vivo');
  const [streamerName, setStreamerName] = useState('Equipo TechPlus Bolivia');
  const [tiktokUrl, setTiktokUrl] = useState('https://www.tiktok.com/@techplus_bolivia/live');
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    'iPhone 15 Pro Max 256GB Titanio Natural',
    'Xiaomi Redmi Buds 5 Pro ANC',
    'Smartwatch Galaxy Watch 6 44mm',
  ]);

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketplaceApi.createLiveStream({
        storeId: 'cmtkeznup000bov0hhhjubzo3', // TechPlus Bolivia store id
        title: streamTitle,
        streamerName,
        tiktokUrl,
      });

      setIsLiveActive(true);
      alert('¡Transmisión TikTok Live iniciada con éxito en el backend! Aparece en la portada de CompraYa.');
    } catch {
      setIsLiveActive(true);
      alert('¡Live activado en modo demostración!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-200/70 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-xs font-black text-red-600 uppercase">TikTok Live Shopping Hub</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">
              Gestor de Transmisiones en Vivo
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Transmite en TikTok y sincroniza tus productos para que los compradores añadan al carrito en tiempo real.
            </p>
          </div>

          <Link
            href="/live/techplus-bolivia"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-full flex items-center space-x-2 shadow-md transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>Ver mi Live como Comprador</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Config form */}
          <form onSubmit={handleStartLive} className="space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-gray-900">Configuración del Stream</h3>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Título de la Transmisión *</label>
              <input
                type="text"
                required
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Nombre del Presentador / Host</label>
              <input
                type="text"
                value={streamerName}
                onChange={(e) => setStreamerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Enlace del Live en TikTok</label>
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
              <p className="font-bold">✨ Sincronización Automática</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Los clientes que sintonicen el Live verán el botón de compra instantánea con envío por OpenDSP.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-black text-xs rounded-full flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
            >
              <Radio className="w-4 h-4 text-red-500" />
              <span>{isLiveActive ? 'Actualizar Sesión Live' : 'Iniciar TikTok Live'}</span>
            </button>
          </form>

          {/* Products featured in Live */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center">
                <ShoppingBag className="w-4 h-4 text-amber-500 mr-1.5" />
                Productos Destacados en Cámara
              </h3>
              <span className="text-[10px] bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                {selectedProducts.length} fijados
              </span>
            </div>

            <div className="space-y-2.5">
              {selectedProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-900">{p}</span>
                  </div>
                  <span className="text-[10px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                    En Pantalla
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('Selecciona más productos desde tu inventario')}
              className="w-full py-2.5 rounded-full border border-dashed border-gray-300 text-gray-600 hover:border-black hover:text-black font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vincular otro producto al Live</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
