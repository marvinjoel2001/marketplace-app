'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Lock,
  Eye,
  MapPin,
  Database,
  UserCheck,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Key,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPage() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('recopilacion');

  const policies = [
    {
      id: 'recopilacion',
      titleEs: '1. Información que Recopilamos',
      titleEn: '1. Information We Collect',
      icon: Database,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            En <strong>Vitrina Market</strong> recopilamos únicamente los datos necesarios para procesar tus compras de forma segura, coordinar entregas express con OpenDSP y permitir tu interacción en TikTok Live Shopping.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Datos de Contacto y Cuenta</h4>
              <p className="text-xs text-slate-500">Nombre, número de WhatsApp / teléfono, correo electrónico y credenciales seguras de acceso (OAuth con TikTok o Google).</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Dirección y Geolocalización</h4>
              <p className="text-xs text-slate-500">Coordenadas GPS y referencias domiciliarias precisas para la ruta del repartidor motorizado de OpenDSP.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Información de Facturación</h4>
              <p className="text-xs text-slate-500">NIT o Cédula de Identidad (CI) y Razón Social requeridos por el Servicio de Impuestos Nacionales (SIN) de Bolivia.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Interacciones de Live Shopping</h4>
              <p className="text-xs text-slate-500">Likes, comentarios en vivos y productos añadidos durante emisiones de TikTok Live para personalizar tus ofertas.</p>
            </div>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            At <strong>Vitrina Market</strong>, we only collect data strictly necessary to fulfill your purchases securely, coordinate express dispatch with OpenDSP, and enable interactive TikTok Live Shopping.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Account & Contact Info</h4>
              <p className="text-xs text-slate-500">Full name, WhatsApp / phone number, email address, and secure OAuth tokens (TikTok or Google).</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Address & Geolocation</h4>
              <p className="text-xs text-slate-500">Precise GPS coordinates and street landmarks to navigate OpenDSP delivery couriers.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Tax & Invoicing Data</h4>
              <p className="text-xs text-slate-500">Tax ID (NIT) or National ID (CI) and Registered Name mandated by the Bolivian National Tax Service (SIN).</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Live Shopping Interactions</h4>
              <p className="text-xs text-slate-500">Live stream likes, chat messages, and products carted during TikTok streams to tailor special deals.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'seguridad-pagos',
      titleEs: '2. Seguridad Bancaria y Cifrado de Pagos (QR Simple)',
      titleEn: '2. Banking Security & Payment Encryption (QR Simple)',
      icon: Lock,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            En Vitrina Market <strong>NUNCA almacenamos números de tarjetas de crédito o débito ni códigos CVV/CVC</strong> en nuestros servidores.
          </p>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Transacciones Seguras con QR Simple y Red ASOBAN</span>
            </p>
            <p>
              Los pagos mediante QR Simple se procesan directamente entre tu aplicación bancaria oficial y la cámara de compensación electrónica, garantizando que tus claves bancarias nunca salgan de tu control.
            </p>
          </div>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Vitrina Market <strong>NEVER stores complete credit or debit card numbers or CVV/CVC security codes</strong> on our servers.
          </p>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Secure Transactions via Interbank QR Simple</span>
            </p>
            <p>
              QR Simple payments are processed directly between your official banking application and the national clearing house, ensuring your credentials remain private and untouched.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'geolocalizacion',
      titleEs: '3. Uso de la Geolocalización para Despachos OpenDSP',
      titleEn: '3. Geolocation Usage for OpenDSP Couriers',
      icon: MapPin,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Cuando realizas un pedido, el sistema satelital de OpenDSP calcula la ruta más eficiente desde la tienda o almacén hasta tu puerta.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li><strong>Acceso Temporal:</strong> La ubicación geográfica solo se comparte con el repartidor asignado durante el tiempo que dure el trayecto de entrega.</li>
            <li><strong>Privacidad del Repartidor:</strong> Ni el repartidor ni terceros tienen acceso a tus datos personales o bancarios más allá de la dirección y el número telefónico para coordinar la llegada.</li>
            <li><strong>Confirmación por Firma o PIN:</strong> La entrega finaliza con una validación digital para proteger tanto al cliente como al comercio.</li>
          </ul>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            When you place an order, the OpenDSP satellite dispatch system computes the most efficient route from the store to your doorstep.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li><strong>Temporary Access:</strong> Your location is only shared with the assigned courier while the delivery is in active transit.</li>
            <li><strong>Courier Privacy:</strong> Drivers only receive the delivery address and phone number to coordinate arrival.</li>
            <li><strong>Digital Validation:</strong> The delivery concludes with a digital signature or PIN confirmation for your peace of mind.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'derechos',
      titleEs: '4. Tus Derechos de Acceso, Rectificación y Olvido',
      titleEn: '4. Your Rights: Access, Correction & Deletion',
      icon: UserCheck,
      contentEs: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            Como usuario registrado de Vitrina Market, tienes control total sobre tu información personal. Puedes en cualquier momento:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li><strong>Acceder y descargar</strong> una copia íntegra de tus datos personales, direcciones guardadas e historial de compras.</li>
            <li><strong>Rectificar o actualizar</strong> tu nombre, dirección de entrega y datos de facturación (NIT / Razón Social).</li>
            <li><strong>Eliminar tu cuenta</strong> y solicitar la desvinculación completa de tu perfil de TikTok y credenciales asociadas.</li>
          </ol>
        </div>
      ),
      contentEn: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
          <p>
            As a registered user, you retain full ownership and sovereignty over your personal information. You can at any time:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li><strong>Access and export</strong> a complete copy of your personal data, saved addresses, and order history.</li>
            <li><strong>Correct or update</strong> your profile details, default shipping address, and tax billing info.</li>
            <li><strong>Delete your account</strong> and request full unlinking of your TikTok profile and stored authentication tokens.</li>
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
        <span className="text-slate-900 font-bold">{language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#F4F9F5] via-[#FAFCFA] to-[#F1F7F3] rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'es' ? 'Confidencialidad y Seguridad Certificada' : 'Certified Privacy & Security'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {language === 'es' ? 'Política de Privacidad y Protección de Datos' : 'Privacy & Data Protection Policy'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'es'
              ? 'Tus datos están protegidos con encriptación de nivel bancario. Conoce cómo cuidamos tu información en Vitrina Market y OpenDSP.'
              : 'Your data is secured with bank-grade encryption. Discover how we protect your personal info across Vitrina Market and OpenDSP.'}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold pt-1">
            {language === 'es' ? 'Vigente desde: Septiembre 2026 • Cumplimiento ASFI & SIN' : 'Effective: September 2026 • ASFI & SIN Compliant'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => alert(language === 'es' ? 'Solicitud de descarga de datos generada. Enviaremos un archivo seguro a tu correo.' : 'Data export request submitted. We will send a secure file to your email.')}
            className="px-5 py-2.5 rounded-full border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center space-x-2 shadow-2xs transition-all"
          >
            <Key className="w-4 h-4 text-emerald-600" />
            <span>{language === 'es' ? 'Descargar Mis Datos' : 'Export My Data'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Navigation + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Navigation Tabs */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-1.5 sticky top-24">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-3 py-2">
            {language === 'es' ? 'Pilares de Privacidad' : 'Privacy Pillars'}
          </h3>
          {policies.map((p) => {
            const Icon = p.icon;
            const title = language === 'es' ? p.titleEs : p.titleEn;
            const isActive = activeTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActiveTab(p.id);
                  const el = document.getElementById(p.id);
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
              href="/terms"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center justify-between"
            >
              <span>{language === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/billing"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center justify-between"
            >
              <span>{language === 'es' ? 'Facturación Electrónica' : 'Electronic Invoicing'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Col: Policies */}
        <div className="lg:col-span-8 space-y-6">
          {policies.map((p) => {
            const Icon = p.icon;
            const title = language === 'es' ? p.titleEs : p.titleEn;
            const content = language === 'es' ? p.contentEs : p.contentEn;

            return (
              <section
                key={p.id}
                id={p.id}
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

          {/* Assistance Footer */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {language === 'es' ? 'Oficial de Privacidad de Datos' : 'Data Privacy Officer'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'es' ? 'Escríbenos a privacidad@vitrinamarket.bo' : 'Email us at privacidad@vitrinamarket.bo'}
                </p>
              </div>
            </div>
            <Link
              href="/help"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md transition-all shrink-0 active:scale-95"
            >
              {language === 'es' ? 'Contactar Soporte' : 'Contact Support'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
