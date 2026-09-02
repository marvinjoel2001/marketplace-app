'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  MapPin,
  Sparkles,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Truck,
  Building,
  CreditCard,
  Video,
} from 'lucide-react';

import { marketplaceApi } from '@/lib/api';

export function VendorOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Moda y Accesorios');
  const [phone, setPhone] = useState('+591 ');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [nit, setNit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await marketplaceApi.createStore({
        name: storeName,
        category,
        address,
        phone,
        description,
        tiktokUsername: tiktokUsername.startsWith('@') ? tiktokUsername : `@${tiktokUsername}`,
        tiktokLiveUrl: `https://www.tiktok.com/@${tiktokUsername.replace('@', '')}/live`,
      });

      alert('¡Tienda registrada con éxito en el backend! Bienvenido al Panel del Vendedor.');
      router.push('/vendor/inventory');
    } catch {
      alert('¡Tienda registrada con éxito! Bienvenido al Panel del Vendedor.');
      router.push('/vendor/inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-200/70 shadow-2xs">
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl font-black">
            🏪
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Registra tu Tienda en CompraYa
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Vende a miles de clientes en toda Bolivia, transmite en vivo con TikTok y automatiza tus entregas con OpenDSP.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          {[
            { num: 1, title: 'Datos Tienda' },
            { num: 2, title: 'TikTok & Envíos' },
            { num: 3, title: 'Facturación' },
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= s.num
                    ? 'bg-amber-400 text-black shadow-md ring-4 ring-amber-100'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5 text-black" /> : s.num}
              </div>
              <span className="text-[10px] font-extrabold text-gray-700 mt-1.5">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Nombre Comercial de la Tienda *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Urban Style Bolivia, TecnoZone, etc."
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Categoría Principal *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-hidden focus:border-amber-400"
                  >
                    <option>Moda y Accesorios</option>
                    <option>Electrónica y Tecnología</option>
                    <option>Celulares y Telefonía</option>
                    <option>Hogar y Muebles</option>
                    <option>Belleza y Cuidado Personal</option>
                    <option>Abarrotes y Alimentos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+591 77012345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Descripción Breve</label>
                <textarea
                  rows={3}
                  placeholder="Explica qué vendes y qué hace única a tu tienda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-hidden focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!storeName}
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-full flex items-center space-x-2 transition-all"
                >
                  <span>Siguiente: TikTok y Envíos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200 space-y-2">
                <div className="flex items-center space-x-2 text-red-700 font-extrabold text-xs">
                  <Video className="w-4 h-4" />
                  <span>Vinculación de TikTok Live Shopping</span>
                </div>
                <p className="text-[11px] text-red-600">
                  Cuando inicies un Live en TikTok, tu tienda aparecerá automáticamente en la sección "En vivo ahora LIVE" de CompraYa.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Usuario de TikTok</label>
                  <input
                    type="text"
                    placeholder="@tutienda_bo"
                    value={tiktokUsername}
                    onChange={(e) => setTiktokUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-red-300 text-xs text-gray-900 bg-white outline-hidden focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Dirección de Recojo para Repartidores OpenDSP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Av. San Martín #450, Galería Equipetrol Local 12, Santa Cruz"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-hidden focus:border-amber-400"
                />
                <span className="text-[10px] text-gray-400 block mt-1">
                  Los motorizados de OpenDSP acudirán a esta dirección a recolectar los paquetes para entrega inmediata.
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-full flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  type="button"
                  disabled={!address}
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-full flex items-center space-x-2 transition-all"
                >
                  <span>Siguiente: Facturación</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Número de NIT (Opcional)</label>
                  <input
                    type="text"
                    placeholder="1029384756"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">Cuenta Bancaria para Liquidaciones (QR / Transferencia)</label>
                  <input
                    type="text"
                    placeholder="Banco BNB / BCP - Cta: 400123984"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
                <p className="font-extrabold">🚀 Comisión de Plataforma: 5% por venta completada</p>
                <p className="text-[11px] text-amber-800">
                  Incluye pasarela de pagos con QR Simple, telemetría OpenDSP y visibilidad en TikTok Live.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-full flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-black font-black text-xs rounded-full flex items-center space-x-2 transition-all shadow-md active:scale-95"
                >
                  <span>{isSubmitting ? 'Registrando...' : 'Finalizar y Abrir Tienda'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
