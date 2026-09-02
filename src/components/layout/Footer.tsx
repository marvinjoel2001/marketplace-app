import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, Headphones, Truck, QrCode, CreditCard, Smartphone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#EAEAEA] mt-16 text-gray-700">
      {/* 4 Feature Pillars (As shown on mockup) */}
      <div className="border-b border-gray-100 py-6 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Envíos a todo el país</h4>
                <p className="text-[11px] text-gray-500">Llega a donde estés con OpenDSP</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Devoluciones fáciles</h4>
                <p className="text-[11px] text-gray-500">Tienes hasta 7 días de garantía</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Compra protegida</h4>
                <p className="text-[11px] text-gray-500">Tus datos y dinero seguros</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Atención al cliente</h4>
                <p className="text-[11px] text-gray-500">24/7 para ayudarte en tus compras</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl font-black text-gray-900">
                Compra<span className="text-amber-500">Ya</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">
              El primer marketplace en Bolivia con Live Shopping en vivo de TikTok, comparador inteligente de precios entre tiendas y entregas express de última milla con OpenDSP.
            </p>
            <div className="flex items-center space-x-3 text-gray-400">
              <span className="text-[11px] font-semibold text-gray-600">Métodos aceptados:</span>
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                <QrCode className="w-3 h-3 mr-1 text-blue-600" /> QR Simple
              </span>
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                <CreditCard className="w-3 h-3 mr-1 text-gray-800" /> Tarjetas
              </span>
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                <Smartphone className="w-3 h-3 mr-1 text-amber-600" /> Tigo / BNB
              </span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Comprar</h5>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/?flashSale=true" className="hover:text-amber-600">Ofertas Relámpago</Link></li>
              <li><Link href="/live/techplus-bolivia" className="hover:text-amber-600">TikTok Live Shopping</Link></li>
              <li><Link href="/compare/chompa-oversize-beige-talla-m" className="hover:text-amber-600">Comparar Precios</Link></li>
              <li><Link href="/#tiendas" className="hover:text-amber-600">Tiendas Oficiales</Link></li>
              <li><Link href="/#envios" className="hover:text-amber-600">Rastreo de Envíos</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Vender</h5>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/vendor/onboarding" className="hover:text-amber-600 font-semibold text-amber-600">Registrar mi Tienda</Link></li>
              <li><Link href="/vendor/inventory" className="hover:text-amber-600">Panel del Vendedor</Link></li>
              <li><Link href="/vendor/live" className="hover:text-amber-600">Transmitir en TikTok Live</Link></li>
              <li><Link href="/vendor/orders" className="hover:text-amber-600">Gestión de Pedidos DSP</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Soporte</h5>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/order/track/CY-894120-412" className="hover:text-amber-600">Rastrear mi pedido</Link></li>
              <li><Link href="/admin" className="hover:text-amber-600">Portal Administrativo</Link></li>
              <li><a href="tel:+591380026677" className="hover:text-amber-600">+591 3 800-COMPRA</a></li>
              <li><span className="text-gray-400">Santa Cruz, Bolivia</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© 2026 CompraYa Bolivia S.R.L. Todos los derechos reservados. Desarrollado para OpenDSP Delivery Ecosystem.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span className="hover:underline cursor-pointer">Términos y Condiciones</span>
            <span className="hover:underline cursor-pointer">Privacidad</span>
            <span className="hover:underline cursor-pointer">Facturación</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
