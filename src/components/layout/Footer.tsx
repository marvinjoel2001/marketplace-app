'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, Headphones, Truck, QrCode, CreditCard, Smartphone, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-[#EAEAEA] mt-16 text-gray-700">
      {/* 4 Feature Pillars */}
      <div className="border-b border-gray-100 py-6 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">{t('trust_delivery_title', 'Envíos a todo el país')}</h4>
                <p className="text-[11px] text-gray-500">{t('trust_delivery_desc', 'Rastreo satelital GPS con OpenDSP')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">{t('trust_returns_title', 'Devoluciones fáciles')}</h4>
                <p className="text-[11px] text-gray-500">{t('trust_returns_desc', 'Tienes hasta 7 días de garantía')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">{t('trust_secure_title', 'Compra protegida')}</h4>
                <p className="text-[11px] text-gray-500">{t('trust_secure_desc', 'Tus datos y dinero seguros')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">{t('trust_support_title', 'Atención al cliente')}</h4>
                <p className="text-[11px] text-gray-500">{t('trust_support_desc', '24/7 para ayudarte en tus compras')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0 p-0.5 shadow-xs">
                <img
                  src="/pulpo-icon.png"
                  alt="Vitrina Market Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-2xl font-black text-gray-900">
                Vitrina Market<span className="text-emerald-600">.</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">
              {t('footer_desc', 'El primer marketplace en Bolivia con Live Shopping en vivo de TikTok, comparador inteligente de precios entre tiendas y entregas express de última milla con OpenDSP.')}
            </p>
            <div className="flex items-center space-x-3 text-gray-400 flex-wrap gap-y-2">
              <span className="text-[11px] font-semibold text-gray-600">{t('footer_accepted_methods', 'Métodos aceptados:')}</span>
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
            <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">
              {t('footer_col_shop', 'Comprar')}
            </h5>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/?flashSale=true" className="hover:text-amber-600">{t('footer_flash_deals', 'Ofertas Relámpago')}</Link></li>
              <li><Link href="/live" className="hover:text-amber-600">{t('footer_live_shopping', 'TikTok Live Shopping')}</Link></li>
              <li><Link href="/compare" className="hover:text-amber-600">{t('footer_price_compare', 'Comparar Precios')}</Link></li>
              <li><Link href="/#tiendas" className="hover:text-amber-600">{t('footer_official_stores', 'Tiendas Oficiales')}</Link></li>
              <li><Link href="/#envios" className="hover:text-amber-600">{t('footer_order_tracking', 'Rastreo de Envíos')}</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">
              {t('footer_col_sell', 'Vender')}
            </h5>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/vendor/onboarding" className="hover:text-amber-600 font-semibold text-amber-600">{t('footer_register_store', 'Registrar mi Tienda')}</Link></li>
              <li><Link href="/vendor/inventory" className="hover:text-amber-600">{t('footer_vendor_dashboard', 'Panel del Vendedor')}</Link></li>
              <li><Link href="/vendor/live" className="hover:text-amber-600">{t('footer_broadcast_live', 'Transmitir en TikTok Live')}</Link></li>
              <li><Link href="/vendor/orders" className="hover:text-amber-600">{t('footer_dsp_orders', 'Gestión de Pedidos DSP')}</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">
              {t('footer_col_support', 'Soporte')}
            </h5>
            <ul className="space-y-2 text-gray-500">
              <li>
                <Link href="/help" className="hover:text-emerald-700 font-bold text-emerald-800 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t('footer_help_center', 'Centro de Ayuda y FAQ')}</span>
                </Link>
              </li>
              <li><Link href="/billing" className="hover:text-emerald-700 font-medium">{t('footer_billing', 'Facturación Electrónica (SIAT)')}</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-700">{t('footer_terms', 'Términos y Condiciones')}</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-700">{t('footer_privacy', 'Política de Privacidad')}</Link></li>
              <li><Link href="/order/track/CY-894120-412" className="hover:text-emerald-700">Rastrear mi pedido</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-700">{t('footer_admin_portal', 'Portal Administrativo')}</Link></li>
              <li><a href="tel:+591380026677" className="hover:text-emerald-700">+591 3 800-VITRINA</a></li>
              <li><span className="text-gray-400">Santa Cruz, Bolivia</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>{t('footer_copyright', '© 2026 Vitrina Market Bolivia S.R.L. Todos los derechos reservados. Desarrollado para OpenDSP Delivery Ecosystem.')}</p>
          <div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
            <Link href="/help" className="hover:text-emerald-700 hover:underline transition-colors">{t('footer_help_center', 'Ayuda / FAQ')}</Link>
            <Link href="/terms" className="hover:text-emerald-700 hover:underline transition-colors">{t('footer_terms', 'Términos y Condiciones')}</Link>
            <Link href="/privacy" className="hover:text-emerald-700 hover:underline transition-colors">{t('footer_privacy', 'Privacidad')}</Link>
            <Link href="/billing" className="hover:text-emerald-700 hover:underline transition-colors">{t('footer_billing', 'Facturación Electrónica')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
