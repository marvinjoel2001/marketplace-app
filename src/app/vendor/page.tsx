'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  Package,
  Truck,
  Video,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Users,
  QrCode,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function VendorHubPage() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xs relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'es' ? 'Portal Oficial de Tiendas y Vendedores' : 'Official Stores & Vendors Portal'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {language === 'es'
                ? 'Gestiona tus Ventas, Catálogo y Despacho Express OpenDSP'
                : 'Manage your Sales, Catalog and OpenDSP Express Delivery'}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {language === 'es'
                ? 'Chiringuito te conecta directamente con miles de compradores bolivianos a través de TikTok Live y entrega tus pedidos en 15-45 minutos con motorizados OpenDSP.'
                : 'Chiringuito connects you directly with thousands of Bolivian shoppers via TikTok Live and delivers your orders in 15-45 min with OpenDSP couriers.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                    {user?.name?.[0] || 'T'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{user?.name}</span>
                    <span className="text-[11px] text-emerald-700 font-bold">● Tienda Conectada</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center space-x-2"
                >
                  <Store className="w-4 h-4" />
                  <span>{language === 'es' ? 'Iniciar Sesión como Tienda' : 'Sign In as Store'}</span>
                </button>
              )}

              <Link
                href="/vendor/onboarding"
                className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs transition-all flex items-center space-x-2"
              >
                <span>{language === 'es' ? 'Registrar Nueva Tienda' : 'Register New Store'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars: Catálogo, Perfil & Fotos, Pedidos OpenDSP, TikTok Live */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Catálogo e Inventario */}
          <Link
            href="/vendor/inventory"
            className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 mb-1">
                  {language === 'es' ? 'Catálogo & Inventario' : 'Catalog & Inventory'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'es'
                    ? 'Publica productos, define precios en Bs., controla el stock y activa promociones.'
                    : 'List products, set prices in Bs., manage stock and activate flash sales.'}
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center text-xs font-bold text-emerald-700 space-x-1 group-hover:translate-x-1 transition-transform">
              <span>{language === 'es' ? 'Gestionar productos' : 'Manage products'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2: Perfil & Fotos de la Tienda */}
          <Link
            href="/vendor/profile"
            className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 mb-1">
                  {language === 'es' ? 'Perfil & Fotos de Tienda' : 'Store Profile & Photos'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'es'
                    ? 'Sube tu logo oficial, foto de portada/banner y datos de recogida para motorizados OpenDSP.'
                    : 'Upload your official logo, cover banner and OpenDSP pickup address.'}
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center text-xs font-bold text-amber-700 space-x-1 group-hover:translate-x-1 transition-transform">
              <span>{language === 'es' ? 'Subir fotos y editar' : 'Upload photos'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3: Pedidos y Despacho OpenDSP */}
          <Link
            href="/vendor/orders"
            className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 mb-1">
                  {language === 'es' ? 'Ventas & Despacho OpenDSP' : 'Sales & OpenDSP Dispatch'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'es'
                    ? 'Revisa tus pedidos confirmados, visualiza al repartidor asignado con su placa de moto y rastrea la entrega.'
                    : 'Review orders, check assigned courier motorcycle plate and track GPS delivery.'}
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center text-xs font-bold text-blue-700 space-x-1 group-hover:translate-x-1 transition-transform">
              <span>{language === 'es' ? 'Ver ventas y pedidos' : 'View orders'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 4: TikTok Live Manager */}
          <Link
            href="/vendor/live"
            className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 mb-1">
                  {language === 'es' ? 'TikTok Live Shopping' : 'TikTok Live Shopping'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'es'
                    ? 'Conecta tu usuario de TikTok, detecta automáticamente cuando estés en vivo y fija productos flash.'
                    : 'Connect TikTok username, detect stream automatically and pin flash items.'}
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center text-xs font-bold text-red-700 space-x-1 group-hover:translate-x-1 transition-transform">
              <span>{language === 'es' ? 'Abrir estudio live' : 'Open live studio'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* OpenDSP Integration Explainer Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-lg">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>{language === 'es' ? '¿Cómo funciona la logística entre Chiringuito y OpenDSP?' : 'How logistics work between Chiringuito and OpenDSP?'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs">1</div>
              <p className="font-extrabold text-slate-900">{language === 'es' ? 'El Cliente Compra' : 'Customer Buys'}</p>
              <p className="text-slate-500">{language === 'es' ? 'Paga con QR Simple o tarjeta en Chiringuito o durante tu TikTok Live.' : 'Pays via QR Simple or card in Chiringuito or during your TikTok Live.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs">2</div>
              <p className="font-extrabold text-slate-900">{language === 'es' ? 'OpenDSP Cotiza y Despacha' : 'OpenDSP Quotes & Dispatches'}</p>
              <p className="text-slate-500">{language === 'es' ? 'El sistema calcula la ruta GPS y asigna al repartidor más cercano a tu local.' : 'The system calculates GPS route and assigns the nearest courier to your shop.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs">3</div>
              <p className="font-extrabold text-slate-900">{language === 'es' ? 'Recogida en tu Tienda' : 'Pickup at your Store'}</p>
              <p className="text-slate-500">{language === 'es' ? 'El motorizado llega con su placa verificada y código de retiro para llevar el paquete.' : 'Courier arrives with verified plate and pickup code.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs">4</div>
              <p className="font-extrabold text-slate-900">{language === 'es' ? 'Entrega y Liquidación' : 'Delivery & Settlement'}</p>
              <p className="text-slate-500">{language === 'es' ? 'El cliente recibe su pedido y los fondos se acreditan a tu cuenta bancaria registrada.' : 'Customer receives package and funds settle into your bank account.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
