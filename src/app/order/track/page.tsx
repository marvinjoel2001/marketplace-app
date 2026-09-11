'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Search,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Phone,
  Store,
  Sparkles,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { marketplaceApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function OrderTrackHubPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();

  const [searchCode, setSearchCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      const combinedOrders: any[] = [];

      // 1. Cargar órdenes locales de localStorage
      try {
        const localList = JSON.parse(localStorage.getItem('vitrina_orders') || '[]');
        if (Array.isArray(localList)) {
          combinedOrders.push(...localList);
        }
        const lastOrderRaw = localStorage.getItem('vitrina_last_order');
        if (lastOrderRaw) {
          const lastOrder = JSON.parse(lastOrderRaw);
          if (!combinedOrders.some((o) => (o.orderNumber && o.orderNumber === lastOrder.orderNumber) || o.id === lastOrder.id)) {
            combinedOrders.unshift(lastOrder);
          }
        }
      } catch {}

      // 2. Consultar pedidos del backend si está conectado
      try {
        const backendOrders = await marketplaceApi.getOrders(20);
        if (Array.isArray(backendOrders)) {
          backendOrders.forEach((bo: any) => {
            if (!combinedOrders.some((o) => (o.orderNumber && o.orderNumber === bo.orderNumber) || o.id === bo.id)) {
              combinedOrders.push(bo);
            }
          });
        }
      } catch {}

      setOrders(combinedOrders);
      setIsLoading(false);
    };

    loadOrders();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchCode.trim().toUpperCase();
    if (!clean) {
      setErrorMsg('Por favor ingresa tu código de pedido (ej: CY-894120-412)');
      return;
    }
    setErrorMsg('');
    router.push(`/order/track/${encodeURIComponent(clean)}`);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Entregado
          </span>
        );
      case 'IN_TRANSIT':
      case 'DSP_DISPATCHED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Truck className="w-3 h-3 mr-1 animate-pulse" />
            En camino (OpenDSP)
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Package className="w-3 h-3 mr-1" />
            Preparando pedido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="w-3 h-3 mr-1" />
            Confirmado
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-black font-medium">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">Rastreo de Pedidos OpenDSP</span>
      </nav>

      {/* Hero Card with Search Input */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telemetría GPS en Vivo • Red OpenDSP Bolivia</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Rastreo de Envíos en Tiempo Real
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Ingresa el número de tu orden para ver la posición exacta del repartidor en el mapa, placas de la motocicleta y tiempo estimado de entrega.
          </p>

          <form onSubmit={handleSearch} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => {
                  setSearchCode(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Ej. CY-894120-412"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-full border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
            >
              <span>Rastrear</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {errorMsg && (
            <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>
          )}

          <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Prueba rápida:</span>
            <button
              type="button"
              onClick={() => router.push('/order/track/CY-894120-412')}
              className="text-emerald-700 hover:underline font-bold"
            >
              CY-894120-412
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => router.push('/order/track/CY-894118-204')}
              className="text-emerald-700 hover:underline font-bold"
            >
              CY-894118-204
            </button>
          </div>
        </div>
      </div>

      {/* Mis Pedidos Recientes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">Mis Pedidos Realizados</h2>
            <p className="text-xs text-slate-500">Historial de compras y entregas asignadas a tu cuenta</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl font-bold">
              📦
            </div>
            <h4 className="text-sm font-bold text-slate-800">No tienes pedidos activos todavía</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Cuando realices una compra en Vitrina Market o en TikTok Live, podrás rastrear al motorizado aquí.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-full transition-all shadow-sm"
            >
              <span>Explorar el Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const code = order.orderNumber || order.id || `CY-${idx}`;
              const total = order.totalAmount || order.total || 189;
              const items = order.items || [];
              const firstItem = items[0];

              return (
                <div
                  key={code}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all bg-[#FAF9F6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {firstItem?.productImage ? (
                        <img
                          src={firstItem.productImage}
                          alt="Producto"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900">{code}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-slate-600 font-medium line-clamp-1">
                        {firstItem?.productTitle || order.customerAddress || 'Compra en Vitrina Market'}
                        {items.length > 1 && ` (+${items.length - 1} más)`}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Total: <strong className="text-slate-900">{formatBs(total)}</strong> • Despacho Express OpenDSP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      href={`/order/track/${encodeURIComponent(code)}`}
                      className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Rastrear en Vivo</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
