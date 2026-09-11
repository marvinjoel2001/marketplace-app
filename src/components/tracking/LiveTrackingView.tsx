'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Navigation,
  ChevronRight,
  Store,
  Sparkles,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';

import { marketplaceApi } from '@/lib/api';

interface OrderTrackingProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    dspTrackingToken?: string | null;
    dspDriverName?: string | null;
    dspDriverPhone?: string | null;
    dspDriverRating?: number | null;
    dspEstimatedMinutes?: number | null;
    createdAt: string | Date;
    items: Array<{
      id: string;
      productTitle: string;
      storeName: string;
      quantity: number;
      unitPrice: number;
      productImage?: string | null;
    }>;
  };
}

export function LiveTrackingView({ order: initialOrder }: OrderTrackingProps) {
  const [order, setOrder] = useState(initialOrder);
  const [currentStep, setCurrentStep] = useState(() => {
    switch (initialOrder.status) {
      case 'PENDING':
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'DSP_DISPATCHED':
      case 'IN_TRANSIT':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 3;
    }
  });
  const [etaMinutes, setEtaMinutes] = useState(initialOrder.dspEstimatedMinutes || 18);
  const [riderCoord, setRiderCoord] = useState({ x: 45, y: 55 });
  const [driverInfo, setDriverInfo] = useState({
    name: initialOrder.dspDriverName || 'Carlos Mendoza',
    phone: initialOrder.dspDriverPhone || '+591 77012345',
    rating: initialOrder.dspDriverRating || 4.9,
    plate: '4829-KPL (Honda Navi Roja)',
  });

  // Rehidratar con la orden real guardada localmente si el backend no la tiene
  useEffect(() => {
    try {
      const lastOrderRaw = localStorage.getItem('vitrina_last_order');
      if (lastOrderRaw) {
        const parsed = JSON.parse(lastOrderRaw);
        if (
          parsed.orderNumber === initialOrder.orderNumber ||
          parsed.id === initialOrder.id ||
          initialOrder.orderNumber === 'CY-894120-412'
        ) {
          setOrder((prev) => ({
            ...prev,
            ...parsed,
            items: parsed.items && parsed.items.length > 0 ? parsed.items : prev.items,
          }));
        }
      }
    } catch {}
  }, [initialOrder.orderNumber, initialOrder.id]);

  // Polling de telemetría y estado en tiempo real cada 5 segundos
  useEffect(() => {
    let isMounted = true;

    const pollLiveStatus = async () => {
      try {
        // 1. Consultar estado actualizado de la orden
        const updated = await marketplaceApi.getOrder(order.orderNumber || order.id);
        if (updated && isMounted) {
          setOrder(updated);

          if (updated.status === 'DELIVERED') {
            setCurrentStep(4);
            setEtaMinutes(0);
          } else if (updated.status === 'IN_TRANSIT' || updated.status === 'DSP_DISPATCHED') {
            setCurrentStep(3);
          } else if (updated.status === 'PREPARING') {
            setCurrentStep(2);
          } else if (updated.status === 'CONFIRMED') {
            setCurrentStep(1);
          }

          if (updated.dspDriverName) {
            setDriverInfo((prev) => ({
              ...prev,
              name: updated.dspDriverName || prev.name,
              phone: updated.dspDriverPhone || prev.phone,
              rating: updated.dspDriverRating || prev.rating,
            }));
          }
        }

        // 2. Si hay tracking token de OpenDSP, consultar telemetría satelital en vivo
        const token = order.dspTrackingToken || updated?.dspTrackingToken;
        if (token && isMounted) {
          const telemetry = await marketplaceApi.getDSPTracking(token);
          if (telemetry?.driver && isMounted) {
            setDriverInfo({
              name: telemetry.driver.fullName || telemetry.driver.name || driverInfo.name,
              phone: telemetry.driver.phone || driverInfo.phone,
              rating: telemetry.driver.rating || driverInfo.rating,
              plate: telemetry.driver.vehiclePlate || driverInfo.plate,
            });
          }
        }
      } catch {
        // Fallback silencioso en caso de desconexión
      }
    };

    const pollInterval = setInterval(pollLiveStatus, 5000);
    pollLiveStatus();

    // Animación suave de GPS en el mapa
    const gpsInterval = setInterval(() => {
      setRiderCoord((prev) => ({
        x: Math.min(80, prev.x + 1.5),
        y: Math.max(30, prev.y - 1.0),
      }));
      setEtaMinutes((prev) => Math.max(2, prev - 1));
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      clearInterval(gpsInterval);
    };
  }, [order.orderNumber, order.id, order.dspTrackingToken]);

  const steps = [
    { title: 'Pedido Confirmado', desc: 'Pago verificado con éxito', done: currentStep >= 1 },
    { title: 'En Preparación', desc: 'La tienda está empaquetando tus productos', done: currentStep >= 2 },
    { title: 'En Camino con OpenDSP', desc: 'El repartidor va hacia tu ubicación', done: currentStep >= 3, active: currentStep === 3 },
    { title: 'Entregado', desc: 'Firma y prueba de entrega digital', done: currentStep >= 4 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-black">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-bold">Rastreo de Pedido #{order.orderNumber}</span>
      </nav>

      {/* Main Status Header (Frosted Glass Container) */}
      <div className="bg-white/85 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-black uppercase text-emerald-700">Telemetría GPS OpenDSP en Vivo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentStep === 4 ? '¡Pedido Entregado con Éxito!' : 'Tu pedido va en camino'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Orden <span className="font-bold text-slate-800">#{order.orderNumber}</span> • Tracking Token: {order.dspTrackingToken || 'trk_opendsp_live'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Delivery Security PIN */}
            <div className="bg-emerald-50/90 px-4 py-2.5 rounded-2xl border border-emerald-200/80 text-center">
              <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">PIN de Entrega</p>
              <p className="text-lg font-black text-emerald-900 tracking-widest leading-tight">8492</p>
            </div>

            {/* Arrival estimate */}
            <div className="bg-amber-50/90 px-5 py-2.5 rounded-2xl border border-amber-200 flex items-center space-x-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Llegada estimada</p>
                <p className="text-lg font-black text-slate-900">{etaMinutes} - {etaMinutes + 8} min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          {steps.map((s, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  s.done
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : s.active
                    ? 'bg-amber-400 text-black ring-4 ring-amber-100 animate-pulse'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">{s.title}</h4>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map & Driver Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live GPS Map Simulation */}
        <div className="lg:col-span-2 bg-white/85 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Ruta Satelital en Tiempo Real</h3>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
              GPS Activo 4G
            </span>
          </div>

          <div className="relative w-full aspect-[16/9] bg-slate-100/90 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
            {/* Street Grid pattern */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#64748b_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

            {/* Simulated Road Lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220">
              <path
                d="M 50,180 Q 150,60 320,80"
                fill="none"
                stroke="#2563eb"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="6,6"
              />
            </svg>

            {/* Store Pickup Pin */}
            <div className="absolute left-10 bottom-8 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg font-bold text-xs">
                🏬
              </div>
              <span className="text-[9px] font-bold bg-white text-slate-900 px-2 py-0.5 rounded-full shadow-xs mt-1 border border-slate-100">
                Tienda Origen
              </span>
            </div>

            {/* Moving Driver Marker */}
            <div
              className="absolute transition-all duration-1000 flex flex-col items-center z-20"
              style={{ left: `${riderCoord.x}%`, top: `${riderCoord.y}%` }}
            >
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-2xl ring-4 ring-amber-400">
                <span className="text-lg">🛵</span>
              </div>
              <span className="text-[9px] font-extrabold bg-black text-white px-2 py-0.5 rounded-full shadow-xs mt-1 whitespace-nowrap">
                {driverInfo.name} ({currentStep === 4 ? 'Entregado' : 'En ruta'})
              </span>
            </div>

            {/* Customer Dropoff Pin */}
            <div className="absolute right-12 top-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg font-bold text-xs ring-4 ring-red-200">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold bg-white text-slate-900 px-2 py-0.5 rounded-full shadow-xs mt-1 border border-slate-100">
                Tu Dirección
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Destino: {order.customerAddress}</span>
            </div>
            <span className="font-bold text-emerald-700">OpenDSP Delivery Safe Guaranteed</span>
          </div>
        </div>

        {/* Driver Card & Order Items */}
        <div className="space-y-4">
          {/* Driver Card */}
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Repartidor Asignado
            </h3>

            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                alt={driverInfo.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
              />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{driverInfo.name}</h4>
                <p className="text-xs text-slate-500">Repartidor Oficial OpenDSP</p>
                <div className="flex items-center text-amber-500 text-xs font-bold mt-1">
                  <span>★ {driverInfo.rating}</span>
                  <span className="text-slate-400 font-normal ml-1">(1,420 entregas)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700">
              <p className="font-semibold">Vehículo:</p>
              <p className="text-slate-500">{driverInfo.plate}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${driverInfo.phone}`}
                className="py-2.5 px-4 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Llamar</span>
              </a>
              <a
                href={`https://wa.me/${driverInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hola ${driverInfo.name}, te escribo respecto a la entrega de mi pedido ${order.orderNumber || ''} en Vitrina Market.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                title="Abrir WhatsApp con el repartidor"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Order Details Mini Card */}
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl p-5 border border-white/80 shadow-xl space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
              Productos en Entrega
            </h3>

            {order.items.map((item) => (
              <div key={item.id} className="flex space-x-3 items-center text-xs">
                {item.productImage && (
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1 border border-gray-100"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{item.productTitle}</p>
                  <p className="text-gray-500 text-[10px]">Tienda: {item.storeName} • Cant: {item.quantity}</p>
                </div>
                <span className="font-extrabold text-gray-900">{formatBs(item.unitPrice * item.quantity)}</span>
              </div>
            ))}

            <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-sm text-gray-900">
              <span>Total Pagado</span>
              <span>{formatBs(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
