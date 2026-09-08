'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Truck,
  CreditCard,
  Radio,
  RotateCcw,
  Store,
  Phone,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FAQItem {
  id: string;
  category: 'shipping' | 'payments' | 'live' | 'returns' | 'seller';
  questionEs: string;
  questionEn: string;
  answerEs: string;
  answerEn: string;
}

const faqs: FAQItem[] = [
  {
    id: 'f-1',
    category: 'shipping',
    questionEs: '¿Cómo funcionan los envíos express de última milla con OpenDSP?',
    questionEn: 'How do last-mile express deliveries with OpenDSP work?',
    answerEs:
      'Vitrina Market está directamente integrado con la red de despachos inteligentes OpenDSP. Cuando confirmas tu orden, el sistema asigna automáticamente al conductor más cercano. Puedes ver la ruta en tiempo real, el nombre del chofer, placas de la motocicleta y tiempo estimado de llegada vía GPS satelital.',
    answerEn:
      'Vitrina Market is directly integrated with the OpenDSP intelligent dispatch network. When you confirm your order, the system automatically assigns the nearest driver. You can track their route in real time, view driver details, license plate, and estimated arrival time via satellite GPS.',
  },
  {
    id: 'f-2',
    category: 'shipping',
    questionEs: '¿Cuánto tardan en entregar mi pedido y cuál es el costo?',
    questionEn: 'How long does delivery take and what is the shipping cost?',
    answerEs:
      'Las entregas dentro del radio urbano (Santa Cruz, La Paz y Cochabamba) se realizan en un promedio de 25 a 45 minutos. Las compras mayores a Bs. 150 tienen ENVÍO GRATIS. Para pedidos menores, la tarifa se calcula por distancia kilométrica exacta y se muestra antes de pagar.',
    answerEn:
      'Urban deliveries (Santa Cruz, La Paz, and Cochabamba) are completed in an average of 25 to 45 minutes. Orders over Bs. 150 qualify for FREE SHIPPING. For smaller orders, the fee is calculated based on exact distance and shown transparently before checkout.',
  },
  {
    id: 'f-3',
    category: 'payments',
    questionEs: '¿Qué métodos de pago son aceptados en Vitrina Market?',
    questionEn: 'What payment methods are accepted on Vitrina Market?',
    answerEs:
      'Aceptamos código QR Simple (interoperable con Banco Unión, BCP, BNB, Banco Mercantil Santa Cruz, Banco FIE, Banco Sol y todas las entidades de ASOBAN), tarjetas de débito/crédito Visa y Mastercard, y billeteras móviles como Tigo Money.',
    answerEn:
      'We accept QR Simple (compatible with Banco Union, BCP, BNB, Mercantil Santa Cruz, Banco FIE, Banco Sol and all ASOBAN entities), Visa and Mastercard debit/credit cards, and mobile wallets like Tigo Money.',
  },
  {
    id: 'f-4',
    category: 'payments',
    questionEs: '¿Emiten factura legal y recibo oficial de compra?',
    questionEn: 'Do you provide official legal invoices and tax receipts?',
    answerEs:
      'Sí. Todas las tiendas oficiales y vendedores verificados en Vitrina Market emiten factura computarizada o electrónica con validez tributaria del SIN (Servicio de Impuestos Nacionales). Puedes ingresar tu NIT/CI y Razón Social en el checkout.',
    answerEn:
      'Yes. All official stores and verified sellers on Vitrina Market provide computerized or electronic invoices valid with the Bolivian National Tax Service (SIN). You can enter your NIT/CI and Company Name during checkout.',
  },
  {
    id: 'f-5',
    category: 'live',
    questionEs: '¿Cómo funciona la compra durante transmisiones en vivo de TikTok Live?',
    questionEn: 'How does shopping during TikTok Live broadcasts work?',
    answerEs:
      'En nuestra sección "Tiendas en TikTok Live" puedes ver a los vendedores transmitiendo en tiempo real. Al ingresar a la sala de Live, verás los productos que el presentador muestra con botones de "Comprar en vivo". Al añadirlos al carrito, conservas los cupones y descuentos exclusivos de la transmisión.',
    answerEn:
      'In our "Stores on TikTok Live" section you can watch sellers streaming in real time. Upon entering the Live Room, you will see the products shown by the host with instant "Buy on Live" buttons. Adding them to your cart preserves the exclusive broadcast discounts and coupons.',
  },
  {
    id: 'f-6',
    category: 'live',
    questionEs: '¿Puedo interactuar y hacer preguntas en vivo al vendedor?',
    questionEn: 'Can I interact and ask live questions to the seller?',
    answerEs:
      '¡Totalmente! La sala de Live cuenta con chat interactivo en tiempo real donde puedes preguntar sobre tallas, colores, especificaciones y solicitar que muestren el producto en cámara antes de comprarlo.',
    answerEn:
      'Absolutely! The Live Room features real-time interactive chat where you can ask about sizes, colors, technical specs, and request the host to showcase the product on camera before buying.',
  },
  {
    id: 'f-7',
    category: 'returns',
    questionEs: '¿Cuál es la política de garantía y devoluciones?',
    questionEn: 'What is the warranty and return policy?',
    answerEs:
      'Cuentas con la Garantía de Satisfacción Vitrina Market: hasta 7 días calendario para solicitar cambio o devolución si el producto no coincide con la descripción, presenta defectos de fábrica o no es de tu agrado.',
    answerEn:
      'You are covered by the Vitrina Market Satisfaction Guarantee: up to 7 calendar days to request an exchange or full refund if the item does not match the description, has manufacturing defects, or does not meet your expectations.',
  },
  {
    id: 'f-8',
    category: 'seller',
    questionEs: '¿Cómo puedo registrar mi tienda y empezar a vender?',
    questionEn: 'How can I register my store and start selling?',
    answerEs:
      'Ingresa a la sección "Registrar mi Tienda" en el menú inferior. Completa los datos de tu negocio, vincula tu cuenta de TikTok si realizas transmisiones en vivo, y nuestro equipo activará tu catálogo en menos de 24 horas.',
    answerEn:
      'Go to "Register My Store" in the footer. Fill in your business details, link your TikTok account if you stream, and our merchant team will review and approve your catalog within 24 hours.',
  },
];

export default function HelpPage() {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>('f-1');

  const categories = [
    { id: 'all', labelEs: 'Todas las preguntas', labelEn: 'All questions' },
    { id: 'shipping', labelEs: 'Envíos & OpenDSP', labelEn: 'Shipping & OpenDSP' },
    { id: 'payments', labelEs: 'Pagos & Facturación', labelEn: 'Payments & Invoicing' },
    { id: 'live', labelEs: 'TikTok Live Shopping', labelEn: 'TikTok Live Shopping' },
    { id: 'returns', labelEs: 'Devoluciones & Garantía', labelEn: 'Returns & Warranty' },
    { id: 'seller', labelEs: 'Vender en Vitrina Market', labelEn: 'Selling on Vitrina Market' },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const qText = language === 'es' ? faq.questionEs : faq.questionEn;
    const aText = language === 'es' ? faq.answerEs : faq.answerEn;
    return qText.toLowerCase().includes(q) || aText.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-black font-medium">{t('nav_home', 'Inicio')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">{t('nav_help', 'Centro de Ayuda')}</span>
      </nav>

      {/* Hero Header (Clean Light Style) */}
      <div className="bg-gradient-to-br from-[#F4F9F5] via-[#FAFCFA] to-[#F1F7F3] rounded-3xl p-6 sm:p-10 text-slate-900 shadow-xs border border-emerald-100/80 relative overflow-hidden text-center">
        <div className="max-w-2xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200/70">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'es' ? 'Soporte y Preguntas Frecuentes' : 'Support & FAQ'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            {t('help_page_title', 'Centro de Ayuda y Preguntas Frecuentes')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            {t('help_page_subtitle', 'Todo lo que necesitas saber sobre compras, envíos OpenDSP, pagos con QR Simple y transmisiones de TikTok Live.')}
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-lg mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('help_search_placeholder', 'Escribe tu pregunta o palabra clave (ej. envíos, QR, devolución)...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-sm border border-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {language === 'es' ? cat.labelEs : cat.labelEn}
          </button>
        ))}
      </div>

      {/* FAQs Accordion */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openFaq === faq.id;
          const question = language === 'es' ? faq.questionEs : faq.questionEn;
          const answer = language === 'es' ? faq.answerEs : faq.answerEn;

          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-sm text-slate-900 hover:text-indigo-600 transition-colors"
              >
                <span>{question}</span>
                <span className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 animate-in fade-in duration-150">
                  {answer}
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 text-slate-500 text-xs">
            {language === 'es'
              ? 'No encontramos preguntas que coincidan con tu búsqueda. Prueba con otra palabra clave o contáctanos directamente.'
              : 'No questions matched your search. Try different keywords or reach out directly to support.'}
          </div>
        )}
      </div>

      {/* Fast Action Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Link
          href="/order/track/CY-894120-412"
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex items-center space-x-3.5 group"
        >
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
              {language === 'es' ? 'Rastrear mi Envío' : 'Track My Shipment'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'es' ? 'Seguimiento satelital OpenDSP' : 'OpenDSP GPS Tracking'}
            </p>
          </div>
        </Link>

        <Link
          href="/vendor/onboarding"
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex items-center space-x-3.5 group"
        >
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-600">
              {language === 'es' ? 'Vender en Vitrina Market' : 'Sell on Vitrina Market'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'es' ? 'Registra tu tienda en minutos' : 'Register your store in minutes'}
            </p>
          </div>
        </Link>

        <Link
          href="/live"
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex items-center space-x-3.5 group"
        >
          <div className="p-3 rounded-xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 group-hover:text-red-600">
              {language === 'es' ? 'TikTok Live Shopping' : 'TikTok Live Shopping'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'es' ? 'Ver tiendas transmitiendo' : 'Watch active live streams'}
            </p>
          </div>
        </Link>
      </div>

      {/* Support Direct Contact Card */}
      <div className="bg-[#FAF9F6] rounded-3xl p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {language === 'es' ? 'Soporte Directo' : 'Direct Support'}
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            {t('help_contact_title', '¿Necesitas ayuda personalizada?')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            {t('help_contact_desc', 'Nuestro equipo de atención al cliente está listo para ayudarte todos los días.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://wa.me/59177012345"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp (+591 77012345)</span>
          </a>

          <a
            href="tel:+591380026677"
            className="px-5 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-extrabold text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>+591 3 800-VITRINA</span>
          </a>
        </div>
      </div>
    </div>
  );
}
