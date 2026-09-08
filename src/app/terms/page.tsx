'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  Truck,
  CreditCard,
  Video,
  Scale,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Phone,
  Printer,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsPage() {
  const { language, t } = useLanguage();
  const [activeSection, setActiveSection] = useState('ambito');

  const sections = [
    {
      id: 'ambito',
      titleEs: '1. Ámbito de Aplicación y Rol del Marketplace',
      titleEn: '1. Scope of Application & Marketplace Role',
      icon: Scale,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Bienvenido a <strong>Vitrina Market</strong> (operado legalmente por Vitrina Market Bolivia S.R.L. en el ecosistema logístico OpenDSP). 
            Estos Términos y Condiciones regulan el acceso y uso de nuestra plataforma de comercio electrónico, transmisiones de TikTok Live Shopping y servicios de entrega de última milla.
          </p>
          <p>
            Vitrina Market actúa como una plataforma tecnológica intermediaria que conecta a compradores con tiendas y vendedores autorizados en el territorio del Estado Plurinacional de Bolivia. Cada transacción se realiza bajo el estricto cumplimiento de la Ley N° 453 (Ley General de los Derechos de las Usuarias y los Usuarios y de las Consumidoras y los Consumidores).
          </p>
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 text-xs">
            <strong>Nota importante:</strong> Al crear una cuenta, realizar un pedido o interactuar en las transmisiones de TikTok Live Shopping, el usuario acepta de manera expresa y sin reservas las presentes condiciones de servicio.
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Welcome to <strong>Vitrina Market</strong> (legally operated by Vitrina Market Bolivia S.R.L. in the OpenDSP delivery ecosystem). 
            These Terms and Conditions govern access to and use of our e-commerce platform, TikTok Live Shopping broadcasts, and last-mile delivery services.
          </p>
          <p>
            Vitrina Market acts as an intermediary technology platform connecting buyers with verified merchants throughout the Plurinational State of Bolivia under Bolivian Consumer Protection Law No. 453.
          </p>
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 text-xs">
            <strong>Important note:</strong> By creating an account, placing an order, or engaging in TikTok Live Shopping streams, the user expressly accepts these terms without reservation.
          </div>
        </div>
      ),
    },
    {
      id: 'tiktok-live',
      titleEs: '2. TikTok Live Shopping y Ofertas en Tiempo Real',
      titleEn: '2. TikTok Live Shopping & Real-Time Deals',
      icon: Video,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Nuestra funcionalidad exclusiva de <strong>Live Shopping</strong> permite a tiendas verificadas transmitir en vivo demostraciones de productos a través de TikTok y sincronizar su catálogo en tiempo real con Vitrina Market.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li><strong>Disponibilidad de Cupones en Vivo:</strong> Los cupones y precios flash mostrados durante un live son de stock limitado y válidos únicamente durante la duración de la transmisión o hasta agotar existencias reservadas.</li>
            <li><strong>Transparencia de Contenido:</strong> Los presentadores y tiendas son responsables de mostrar información fidedigna de las características, especificaciones y estado de los artículos ofrecidos.</li>
            <li><strong>Compra en 1-Clic:</strong> Al hacer clic en "Comprar en vivo" desde el visor interactivo o WebView de TikTok, el producto se añade con el precio promocional asegurado al carrito de compras.</li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Our signature <strong>Live Shopping</strong> capability allows verified stores to broadcast live product demonstrations via TikTok and synchronize inventory in real time with Vitrina Market.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li><strong>Live Coupon Availability:</strong> Flash prices and coupon codes displayed during live streams are limited in quantity and valid exclusively while the broadcast is active or until reserved inventory depletes.</li>
            <li><strong>Content Integrity:</strong> Broadcasters and merchants must display accurate specifications and condition of the items shown.</li>
            <li><strong>1-Click Purchase:</strong> Clicking "Buy Live" from the interactive player or TikTok WebView locks in the promotional price in your cart.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'pagos',
      titleEs: '3. Precios en Bolivianos y Métodos de Pago Regulados',
      titleEn: '3. Pricing in Bolivianos & Regulated Payment Methods',
      icon: CreditCard,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Todos los precios publicados en Vitrina Market están expresados en <strong>Bolivianos (Bs.)</strong> e incluyen obligatoriamente el Impuesto al Valor Agregado (IVA - 13%) según la normativa tributaria del Servicio de Impuestos Nacionales (SIN).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">QR Simple Interbancario</h4>
              <p className="text-[11px] text-slate-500">Sin comisiones adicionales. Compatible con Banco Unión, BNB, BCP, Banco Sol, Mercantil y todas las entidades de la red ASOBAN.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Tarjetas Débito / Crédito</h4>
              <p className="text-[11px] text-slate-500">Transacciones protegidas con protocolo 3D-Secure y cifrado bancario TLS 256-bit bajo supervisión de ASFI.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Billeteras Móviles</h4>
              <p className="text-[11px] text-slate-500">Tigo Money y Billetera Móvil BNB para confirmación instantánea sin necesidad de tarjeta física.</p>
            </div>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            All prices on Vitrina Market are stated in <strong>Bolivianos (Bs.)</strong> and legally include the 13% Value Added Tax (IVA) in accordance with the Bolivian National Tax Service (SIN).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">QR Simple Interbank</h4>
              <p className="text-[11px] text-slate-500">Zero additional fees. Compatible with all major Bolivian banks (BNB, BCP, Union, Sol, Mercantil, etc.).</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Debit & Credit Cards</h4>
              <p className="text-[11px] text-slate-500">Processed with 3D-Secure protocols and 256-bit TLS bank-grade encryption monitored by ASFI.</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Mobile Wallets</h4>
              <p className="text-[11px] text-slate-500">Instant confirmation via Tigo Money and BNB Mobile Wallet without requiring a physical card.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'envios',
      titleEs: '4. Envíos de Última Milla con OpenDSP Express',
      titleEn: '4. Last-Mile Logistics with OpenDSP Express',
      icon: Truck,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            La logística y transporte de pedidos se ejecuta mediante la red descentralizada de repartidores de <strong>OpenDSP Express</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li><strong>Tiempos de Entrega:</strong> Entregas express urbanas en Santa Cruz, La Paz y Cochabamba se realizan entre 15 a 45 minutos para productos con badge "OpenDSP Hoy". Envíos interdepartamentales toman entre 24 a 48 horas hábiles.</li>
            <li><strong>Geolocalización Satelital:</strong> El comprador puede visualizar en vivo la ruta del motorizado desde el panel de rastreo satelital.</li>
            <li><strong>Envíos Gratuitos:</strong> Compras mayores a Bs. 150 califican automáticamente para despacho gratuito cubierto por Vitrina Market y OpenDSP.</li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Fulfillment and transportation are powered by the <strong>OpenDSP Express</strong> decentralized courier network.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li><strong>Delivery Windows:</strong> Intra-city express deliveries in Santa Cruz, La Paz, and Cochabamba arrive in 15 to 45 minutes for "OpenDSP Hoy" products. Interdepartmental shipments take 24 to 48 business hours.</li>
            <li><strong>Live GPS Tracking:</strong> Buyers can monitor the courier in real time on the live tracking dashboard.</li>
            <li><strong>Free Delivery:</strong> Orders exceeding Bs. 150 automatically qualify for complimentary express shipping.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'garantias',
      titleEs: '5. Garantías, Devoluciones y Reembolsos',
      titleEn: '5. Warranty, Returns & Refund Policy',
      icon: ShieldCheck,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Todos los productos comercializados en Vitrina Market cuentan con una <strong>Garantía de Satisfacción de 7 días</strong> a partir de la fecha de entrega certificada por OpenDSP.
          </p>
          <p>
            Si el producto recibido presenta fallas de fábrica, discrepancias con la descripción o daños durante el transporte, el comprador tiene derecho a solicitar:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
            <li>Reemplazo inmediato del artículo sin costo de envío adicional.</li>
            <li>Reparación certificada por el servicio técnico oficial de la marca.</li>
            <li>Reembolso total del dinero mediante transferencia bancaria o reversión a tarjeta en un plazo máximo de 72 horas hábiles.</li>
          </ol>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            All products sold on Vitrina Market come with a mandatory <strong>7-Day Satisfaction Warranty</strong> starting from the certified delivery timestamp by OpenDSP.
          </p>
          <p>
            If the delivered product suffers from manufacturing defects, description discrepancy, or transit damage, the buyer may claim:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
            <li>Immediate item replacement with zero extra delivery charges.</li>
            <li>Certified repair through the brand's authorized service center.</li>
            <li>Full monetary refund via direct bank transfer or card reversal within 72 business hours.</li>
          </ol>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700">{t('nav_home', 'Inicio')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">{language === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#F4F9F5] via-[#FAFCFA] to-[#F1F7F3] rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'es' ? 'Marco Legal y Protección al Consumidor' : 'Legal Framework & Consumer Rights'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {language === 'es' ? 'Términos y Condiciones de Uso' : 'Terms and Conditions of Use'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'es'
              ? 'Transparencia total para compradores, tiendas oficiales y transmisiones de TikTok Live Shopping en Bolivia.'
              : 'Complete transparency for buyers, official merchants, and TikTok Live Shopping broadcasts across Bolivia.'}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold pt-1">
            {language === 'es' ? 'Última actualización: Septiembre 2026 • Versión 3.2' : 'Last updated: September 2026 • Version 3.2'}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-2 shadow-2xs transition-colors shrink-0"
        >
          <Printer className="w-4 h-4 text-emerald-600" />
          <span>{language === 'es' ? 'Imprimir Términos' : 'Print Terms'}</span>
        </button>
      </div>

      {/* Main Layout: Sticky Section Nav + Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Navigation Tabs */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-1.5 sticky top-24">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-3 py-2">
            {language === 'es' ? 'Secciones' : 'Sections'}
          </h3>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const title = language === 'es' ? sec.titleEs : sec.titleEn;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  const el = document.getElementById(sec.id);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="line-clamp-1">{title}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100 mt-4 px-3 space-y-2">
            <Link
              href="/privacy"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center justify-between"
            >
              <span>{language === 'es' ? 'Ver Política de Privacidad' : 'View Privacy Policy'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/billing"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center justify-between"
            >
              <span>{language === 'es' ? 'Portal de Facturación Electrónica' : 'Electronic Invoicing Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Col: Full Structured Articles */}
        <div className="lg:col-span-8 space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const title = language === 'es' ? sec.titleEs : sec.titleEn;
            const content = language === 'es' ? sec.contentEs : sec.contentEn;

            return (
              <section
                key={sec.id}
                id={sec.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4 scroll-mt-24"
              >
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {title}
                  </h2>
                </div>
                {content}
              </section>
            );
          })}

          {/* Assistance Footer Card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {language === 'es' ? '¿Dudas sobre estos términos?' : 'Questions about these terms?'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'es'
                    ? 'Nuestro equipo legal y de atención al cliente atiende consultas las 24 horas.'
                    : 'Our legal and support team is available 24/7.'}
                </p>
              </div>
            </div>
            <Link
              href="/help"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md transition-all shrink-0 active:scale-95"
            >
              {language === 'es' ? 'Ir al Centro de Ayuda' : 'Go to Help Center'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
