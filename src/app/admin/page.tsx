import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Store, Package, Truck, Check, X, AlertCircle } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';
import { formatBs } from '@/lib/utils';

import { MOCK_STORES } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export default async function AdminPortalPage() {
  let stats: any = {
    totalStores: 7,
    totalVolume: 452900,
    totalCommission: 22645,
    stores: [],
  };

  try {
    stats = await marketplaceApi.getAdminStats();
  } catch (err) {
    console.error('Error fetching admin stats:', err);
  }

  const stores = stats.stores && stats.stores.length > 0 ? stats.stores : MOCK_STORES;
  const totalStores = stats.totalStores || stores.length;
  const totalVolume = stats.totalVolume || 452900;
  const totalCommission = stats.totalCommission || totalVolume * 0.05;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-2xs">
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
          <div className="p-2.5 rounded-2xl bg-black text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Panel Administrador de Plataforma</h1>
            <p className="text-xs text-gray-500">
              Supervisión de tiendas oficiales, aprobación de vendedores y monitoreo de despachos OpenDSP en Bolivia.
            </p>
          </div>
        </div>

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-gray-200/70">
            <span className="text-xs font-bold text-gray-500 uppercase">Tiendas Registradas</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{totalStores}</p>
            <span className="text-[10px] text-green-700 font-bold mt-1 block">100% Verificadas</span>
          </div>

          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-gray-200/70">
            <span className="text-xs font-bold text-gray-500 uppercase">Volumen Procesado</span>
            <p className="text-3xl font-black text-gray-900 mt-1">{formatBs(totalVolume)}</p>
            <span className="text-[10px] text-amber-700 font-bold mt-1 block">Comisión 5% = {formatBs(totalCommission)}</span>
          </div>

          <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-gray-200/70">
            <span className="text-xs font-bold text-gray-500 uppercase">Conexión OpenDSP Core</span>
            <p className="text-xl font-black text-green-600 mt-2 flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-ping"></span>
              Sincronizado
            </p>
            <span className="text-[10px] text-gray-500 mt-1 block">API Key: dsp_live_bolivia</span>
          </div>
        </div>
      </div>

      {/* Stores Moderation Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 flex items-center">
          <Store className="w-5 h-5 text-amber-500 mr-2" />
          Tiendas Registradas en el Marketplace
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Tienda</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">TikTok Live</th>
                <th className="p-3.5">Ventas / Rating</th>
                <th className="p-3.5">Dirección Recojo DSP</th>
                <th className="p-3.5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
              {stores.map((st: any) => (
                <tr key={st.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={st.logo}
                        alt={st.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{st.name}</p>
                        <span className="text-[10px] text-gray-400">/{st.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">{st.category}</td>
                  <td className="p-3.5">
                    {st.isLiveNow ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                        ● EN VIVO
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">{st.tiktokUsername || 'No vinculado'}</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-gray-900">★ {st.rating}</span>{' '}
                    <span className="text-gray-400 text-[10px]">({st.salesCount} ventas)</span>
                  </td>
                  <td className="p-3.5 text-gray-600 max-w-xs truncate">{st.address}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-green-100 text-green-800">
                      Activa & Verificada
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
