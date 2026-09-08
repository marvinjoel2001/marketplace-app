'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Receipt,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Building,
  QrCode,
  Printer,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function BillingPage() {
  const { language, t } = useLanguage();

  // Search state
  const [orderQuery, setOrderQuery] = useState('CY-894120-412');
  const [nitQuery, setNitQuery] = useState('1028475019');
  const [isSearching, setIsSearching] = useState(false);
  const [invoiceFound, setInvoiceFound] = useState<any>({
    invoiceNumber: 'FAC-2026-008941',
    orderNumber: 'CY-894120-412',
    cuf: 'A8B92D14C3E2091F84029471BCDEF01293847192834719283471928347192834',
    authNumber: '29384719283',
    issueDate: '03/09/2026 14:25:10',
    emitterName: 'Vitrina Market Bolivia S.R.L. / OpenDSP Ecosystem',
    emitterNit: '3847291018',
    emitterAddress: 'Av. San Martín #450, Equipetrol, Santa Cruz de la Sierra',
    clientName: 'Juan Carlos Pérez Mendoza',
    clientNit: '1028475019',
    clientEmail: 'juan.perez@ejemplo.bo',
    items: [
      {
        description: 'Roco Wireless Headphones - Noise Cancelling',
        quantity: 1,
        unitPrice: 89.0,
        subtotal: 89.0,
      },
      {
        description: 'Despacho Express OpenDSP de Última Milla',
        quantity: 1,
        unitPrice: 15.0,
        subtotal: 15.0,
      },
    ],
    subtotal: 104.0,
    ivaAmount: 13.52, // 13%
    totalBs: 104.0,
    status: 'VÁLIDA (SIAT EN LÍNEA)',
  });

  // Saved billing profile state
  const [profileNit, setProfileNit] = useState('1028475019');
  const [profileName, setProfileName] = useState('Juan Carlos Pérez Mendoza');
  const [profileEmail, setProfileEmail] = useState('juan.perez@ejemplo.bo');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setInvoiceFound({
        invoiceNumber: `FAC-2026-00${Math.floor(1000 + Math.random() * 9000)}`,
        orderNumber: orderQuery.trim().toUpperCase() || 'CY-894120-412',
        cuf: 'A8B92D14C3E2091F84029471BCDEF01293847192834719283471928347192834',
        authNumber: '29384719283',
        issueDate: new Date().toLocaleString('es-BO'),
        emitterName: 'Vitrina Market Bolivia S.R.L.',
        emitterNit: '3847291018',
        emitterAddress: 'Av. San Martín #450, Equipetrol, Santa Cruz de la Sierra',
        clientName: profileName || 'Cliente Particular',
        clientNit: nitQuery.trim() || '1028475019',
        clientEmail: profileEmail || 'cliente@ejemplo.bo',
        items: [
          {
            description: 'Producto Tecnológico Certificado Vitrina Market',
            quantity: 1,
            unitPrice: 189.0,
            subtotal: 189.0,
          },
          {
            description: 'Envío Express Geolocalizado OpenDSP',
            quantity: 1,
            unitPrice: 0.0,
            subtotal: 0.0,
          },
        ],
        subtotal: 189.0,
        ivaAmount: 24.57,
        totalBs: 189.0,
        status: 'VÁLIDA (SIAT EN LÍNEA)',
      });
    }, 400);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleDownloadPdf = () => {
    alert(
      language === 'es'
        ? 'Descargando Factura Electrónica en PDF con código QR oficial del SIN...'
        : 'Downloading official SIN Electronic Invoice PDF with verified QR code...'
    );
  };

  const handleDownloadXml = () => {
    alert(
      language === 'es'
        ? 'Descargando archivo XML firmado digitalmente para validación SIAT...'
        : 'Downloading digitally signed XML file for SIAT tax validation...'
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700">{t('nav_home', 'Inicio')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">
          {language === 'es' ? 'Facturación Electrónica' : 'Electronic Invoicing'}
        </span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#F4F9F5] via-[#FAFCFA] to-[#F1F7F3] rounded-3xl p-6 sm:p-10 border border-emerald-100 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'es' ? 'SIAT en Línea • Impuestos Nacionales Bolivia' : 'SIAT Online • National Tax Service'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {language === 'es' ? 'Portal de Facturación Electrónica' : 'Electronic Invoicing Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'es'
              ? 'Todas las compras en Vitrina Market emiten factura electrónica con Crédito Fiscal (IVA 13%) válida ante el SIN. Consulta, descarga o actualiza tus datos tributarios.'
              : 'All purchases on Vitrina Market generate valid tax credit electronic invoices (13% IVA) compliant with SIN regulations. Search, download, or update your tax info.'}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-2xs text-xs font-bold text-emerald-800">
          <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{language === 'es' ? 'Factura con QR Oficial' : 'Official QR Verified'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Search & Update Profile Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Search Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>{language === 'es' ? 'Buscar Factura por Pedido' : 'Search Invoice by Order'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'es'
                ? 'Ingresa tu número de pedido de Vitrina Market y tu NIT o C.I. para descargar tu factura.'
                : 'Enter your order ID and NIT/ID to retrieve your invoice.'}
            </p>

            <form onSubmit={handleSearch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'Número de Pedido (ej. CY-894120-412)' : 'Order Number'}
                </label>
                <input
                  type="text"
                  required
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 uppercase outline-hidden focus:border-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'NIT o Cédula de Identidad (C.I.)' : 'Tax ID (NIT) or ID (C.I.)'}
                </label>
                <input
                  type="text"
                  required
                  value={nitQuery}
                  onChange={(e) => setNitQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full transition-all flex items-center justify-center space-x-2 shadow-md active:scale-95"
              >
                {isSearching ? (
                  <span>{language === 'es' ? 'Buscando en SIAT...' : 'Searching SIAT...'}</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{language === 'es' ? 'Consultar Factura' : 'Lookup Invoice'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Update Default Invoicing Profile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>{language === 'es' ? 'Datos Tributarios Predeterminados' : 'Default Tax Billing Info'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'es'
                ? 'Guarda tus datos para que tus próximas compras en Vitrina Market se facturen automáticamente a tu nombre o empresa.'
                : 'Save your tax info for automatic billing on future orders.'}
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'Razón Social o Nombre Completo' : 'Company or Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'Número de NIT / C.I.' : 'Tax NIT / CI'}
                </label>
                <input
                  type="text"
                  required
                  value={profileNit}
                  onChange={(e) => setProfileNit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'Correo Electrónico para Envío de Factura' : 'Email for Invoices'}
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600"
                />
              </div>

              {profileSaved && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === 'es' ? '¡Datos tributarios guardados con éxito!' : 'Tax info saved successfully!'}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-full transition-all shadow-xs"
              >
                {language === 'es' ? 'Guardar Datos de Facturación' : 'Save Tax Info'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Invoice Preview & Official Details */}
        <div className="lg:col-span-7 space-y-6">
          {invoiceFound ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
              {/* Top Invoice Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                      {invoiceFound.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    Factura Electrónica N° {invoiceFound.invoiceNumber}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'es' ? 'Pedido vinculado:' : 'Linked order:'} <strong>{invoiceFound.orderNumber}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {language === 'es' ? 'Fecha de emisión:' : 'Date:'} {invoiceFound.issueDate}
                  </p>
                </div>

                <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-1 shrink-0">
                  <QrCode className="w-14 h-14 text-slate-800" />
                  <span className="text-[8px] font-black text-slate-400 mt-0.5">SIN SIAT</span>
                </div>
              </div>

              {/* Tax Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    {language === 'es' ? 'Datos del Emisor' : 'Issuer Details'}
                  </span>
                  <p className="font-bold text-slate-900">{invoiceFound.emitterName}</p>
                  <p className="text-slate-600">NIT: {invoiceFound.emitterNit}</p>
                  <p className="text-[11px] text-slate-500">{invoiceFound.emitterAddress}</p>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    {language === 'es' ? 'Datos del Comprador' : 'Buyer Details'}
                  </span>
                  <p className="font-bold text-slate-900">{invoiceFound.clientName}</p>
                  <p className="text-slate-600">NIT / CI: {invoiceFound.clientNit}</p>
                  <p className="text-[11px] text-slate-500">{invoiceFound.clientEmail}</p>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">{language === 'es' ? 'Descripción' : 'Description'}</th>
                      <th className="py-2.5 px-3 text-center">{language === 'es' ? 'Cant.' : 'Qty'}</th>
                      <th className="py-2.5 px-3 text-right">{language === 'es' ? 'Precio Unit.' : 'Unit Price'}</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceFound.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-3 px-3 font-semibold text-slate-800">{item.description}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-3 px-3 text-right text-slate-600">Bs. {item.unitPrice.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">Bs. {item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Fiscal Credit */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-950 block">
                    {language === 'es' ? 'Crédito Fiscal IVA (13%):' : 'VAT Tax Credit (13%):'}{' '}
                    <strong>Bs. {invoiceFound.ivaAmount.toFixed(2)}</strong>
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    {language === 'es'
                      ? 'Válido para descargo fiscal ante el Servicio de Impuestos Nacionales (SIN).'
                      : 'Officially deductible with Bolivian SIN.'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">{language === 'es' ? 'Monto Total:' : 'Total Amount:'}</span>
                  <span className="text-2xl font-black text-slate-900">Bs. {invoiceFound.totalBs.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Codes */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[10px] text-slate-500 font-mono break-all space-y-1">
                <div>
                  <strong className="text-slate-700">CUF:</strong> {invoiceFound.cuf}
                </div>
                <div>
                  <strong className="text-slate-700">N° Autorización:</strong> {invoiceFound.authNumber}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadPdf}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full flex items-center justify-center space-x-2 shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'es' ? 'Descargar Factura PDF Oficial' : 'Download Official PDF'}</span>
                </button>

                <button
                  onClick={handleDownloadXml}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-full flex items-center justify-center space-x-2 border border-slate-200 transition-colors"
                >
                  <FileCheck2 className="w-4 h-4 text-slate-600" />
                  <span>{language === 'es' ? 'Descargar XML Firmado (SIN)' : 'Download Signed XML'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
              <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">
                {language === 'es' ? 'No se encontró la factura' : 'Invoice not found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'es'
                  ? 'Verifica el número de orden o tu NIT ingresado en el formulario de la izquierda.'
                  : 'Check your order number and NIT on the left form.'}
              </p>
            </div>
          )}

          {/* Invoicing FAQ Box */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 space-y-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>{language === 'es' ? 'Preguntas Frecuentes sobre Facturación' : 'Invoicing FAQs'}</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">
                  {language === 'es' ? '¿Todos los productos de Vitrina Market tienen factura legal?' : 'Do all products include legal invoices?'}
                </h4>
                <p>
                  {language === 'es'
                    ? 'Sí. Cada tienda y vendedor registrado en Vitrina Market emite factura electrónica en línea con IVA 13% incluido en el precio publicado.'
                    : 'Yes. Every verified merchant issues official electronic invoices with 13% VAT included in the list price.'}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1">
                  {language === 'es' ? '¿Cuándo se envía la factura a mi correo?' : 'When is the invoice sent to my email?'}
                </h4>
                <p>
                  {language === 'es'
                    ? 'En cuanto el repartidor de OpenDSP confirma la entrega física en tu domicilio, el sistema SIAT genera y despacha automáticamente el PDF y XML a tu correo electrónico registrado.'
                    : 'As soon as the OpenDSP courier validates physical delivery, our SIAT engine dispatches the PDF and XML to your email.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
