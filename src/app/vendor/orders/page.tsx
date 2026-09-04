'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';

interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';
  driverName?: string;
  driverPhone?: string;
  dspTrackingToken?: string;
  total: number;
  itemsCount: number;
  timeAgo: string;
}

const mockOrders: VendorOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'CY-894120-412',
    customerName: 'Juan Pérez',
    customerPhone: '+591 77098765',
    address: 'Av. San Martín, Equipetrol, Santa Cruz',
    status: 'IN_TRANSIT',
    driverName: 'Carlos Mendoza',
    driverPhone: '+591 77012345',
    dspTrackingToken: 'trk_tok_carlos_mendoza',
    total: 189,
    itemsCount: 1,
    timeAgo: 'Hace 12 min',
  },
  {
    id: 'ord-102',
    orderNumber: 'CY-894118-204',
    customerName: 'María Fernanda Ruiz',
    customerPhone: '+591 78456123',
    address: 'Calle 21 de Calacoto, La Paz',
    status: 'IN_TRANSIT',
    driverName: 'Jorge Alarcón',
    driverPhone: '+591 71239847',
    dspTrackingToken: 'trk_tok_jorge_alarcon',
    total: 398,
    itemsCount: 2,
    timeAgo: 'Hace 24 min',
  },
  {
    id: 'ord-103',
    orderNumber: 'CY-894105-119',
    customerName: 'Rodrigo Villarroel',
    customerPhone: '+591 76543210',
    address: 'Av. América #450, Cochabamba',
    status: 'PENDING',
    total: 209,
    itemsCount: 1,
    timeAgo: 'Hace 35 min',
  },
  {
    id: 'ord-104',
    orderNumber: 'CY-893992-881',
    customerName: 'Patricia Morales',
    customerPhone: '+591 70129844',
    address: 'Condominio Sevilla Real, Santa Cruz',
    status: 'DELIVERED',
    driverName: 'Carlos Mendoza',
    driverPhone: '+591 77012345',
    total: 349,
    itemsCount: 1,
    timeAgo: 'Hace 2 horas',
  },
  {
    id: 'ord-105',
    orderNumber: 'CY-893810-743',
    customerName: 'Andrés Hurtado',
    customerPhone: '+591 73344556',
    address: 'Radial 19 y 4to Anillo, Santa Cruz',
    status: 'DELIVERED',
    driverName: 'Marcos Terrazas',
    driverPhone: '+591 72200119',
    total: 249,
    itemsCount: 1,
    timeAgo: 'Hace 4 horas',
  },
];

export default function VendorOrdersPage() {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');
  const [search, setSearch] = useState('');

  const filteredOrders = mockOrders.filter((order) => {
    if (filter !== 'ALL' && order.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-black">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/vendor/inventory" className="hover:text-black">Panel del Vendedor</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">Gestión de Pedidos DSP</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-2 border border-indigo-100">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Despacho Inteligente OpenDSP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Gestión de Pedidos y Envíos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de órdenes en tiempo real, asignación de conductores y seguimiento GPS satelital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vendor/live"
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Transmitir en Live
          </Link>
          <Link
            href="/vendor/inventory"
            className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors"
          >
            Ver Inventario
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Pedidos Hoy</span>
          <p className="text-2xl font-black text-slate-900 mt-1">12</p>
          <span className="text-[10px] text-emerald-600 font-semibold">+33% vs ayer</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">En Ruta (DSP)</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">2</p>
          <span className="text-[10px] text-slate-500">Conductores activos</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Entregados Hoy</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">10</p>
          <span className="text-[10px] text-emerald-700 font-semibold">100% a tiempo</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Facturación</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatBs(1404)}</p>
          <span className="text-[10px] text-slate-500">Cobro QR Simple</span>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            {(['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === status
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' && 'Todos'}
                {status === 'PENDING' && 'Pendientes'}
                {status === 'IN_TRANSIT' && 'En Tránsito'}
                {status === 'DELIVERED' && 'Entregados'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por orden o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-4 border border-slate-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-black text-sm text-slate-900">{order.orderNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      order.status === 'IN_TRANSIT'
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : order.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {order.status === 'IN_TRANSIT' && '● EN RUTA OPENDSP'}
                    {order.status === 'DELIVERED' && '✓ ENTREGADO'}
                    {order.status === 'PENDING' && '⌛ PENDIENTE DESPACHO'}
                  </span>
                  <span className="text-[11px] text-slate-400">{order.timeAgo}</span>
                </div>

                <div className="text-xs text-slate-600 flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                  <span>•</span>
                  <span className="flex items-center text-slate-500">
                    <Phone className="w-3 h-3 mr-1" />
                    {order.customerPhone}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                  {order.address}
                </p>

                {order.driverName && (
                  <p className="text-[11px] text-indigo-700 font-semibold flex items-center pt-1">
                    <Truck className="w-3 h-3 mr-1" />
                    Conductor asignado: {order.driverName} ({order.driverPhone})
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">{order.itemsCount} producto(s)</span>
                  <span className="text-base font-black text-slate-900">{formatBs(order.total)}</span>
                </div>

                <Link
                  href={`/order/track/${order.orderNumber}`}
                  className="px-4 py-2 rounded-full bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 font-bold text-xs transition-all shadow-2xs flex items-center space-x-1.5"
                >
                  <span>Tracking en Vivo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              No se encontraron pedidos con los filtros seleccionados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
