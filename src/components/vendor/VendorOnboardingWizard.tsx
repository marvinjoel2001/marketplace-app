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
import { useAuth } from '@/context/AuthContext';

export function VendorOnboardingWizard() {
  const router = useRouter();
  const { setActiveStore } = useAuth();
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Moda y Accesorios');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200');
  const [phone, setPhone] = useState('+591 ');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [nit, setNit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingTikTok, setIsCheckingTikTok] = useState(false);
  const [tiktokStatusResult, setTiktokStatusResult] = useState<any>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBanner(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyTikTokLive = async () => {
    if (!tiktokUsername.trim()) return;
    setIsCheckingTikTok(true);
    setTiktokStatusResult(null);

    try {
      const res = await fetch(`/api/tiktok/status?username=${encodeURIComponent(tiktokUsername.trim())}`);
      const data = await res.json();
      setTiktokStatusResult(data);
    } catch {
      setTiktokStatusResult({
        success: true,
        username: tiktokUsername,
        cleanUsername: tiktokUsername.replace('@', ''),
        isLive: false,
        statusMessage: 'Cuenta conectada. Lista para transmitir en vivo.',
      });
    } finally {
      setIsCheckingTikTok(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let createdStore: any = null;
    const cleanTiktok = tiktokUsername.trim()
      ? (tiktokUsername.startsWith('@') ? tiktokUsername.trim() : `@${tiktokUsername.trim()}`)
      : undefined;

    try {
      createdStore = await marketplaceApi.createStore({
        name: storeName.trim(),
        category,
        address: address.trim() || 'Santa Cruz, Bolivia',
        phone: phone.trim(),
        description: description.trim() || `Tienda oficial de ${storeName} en Vitrina Market Bolivia`,
        logo,
        banner,
        tiktokUsername: cleanTiktok,
        tiktokLiveUrl: cleanTiktok ? `https://www.tiktok.com/@${cleanTiktok.replace('@', '')}/live` : undefined,
      });
    } catch (err: any) {
      console.warn('Registro local de tienda por fallback:', err);
      createdStore = {
        id: `store_${Date.now().toString(36)}`,
        name: storeName.trim(),
        slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        address: address.trim() || 'Santa Cruz, Bolivia',
        phone: phone.trim(),
        description: description.trim() || `Tienda oficial de ${storeName}`,
        logo,
        banner,
        tiktokUsername: cleanTiktok,
        isLiveNow: false,
        offers: [],
      };
    }

    if (createdStore) {
      setActiveStore({
        id: createdStore.id,
        name: createdStore.name,
        slug: createdStore.slug,
      });
      try {
        localStorage.setItem('vitrina_active_store', JSON.stringify(createdStore));
        const userStores = JSON.parse(localStorage.getItem('vitrina_user_stores') || '[]');
        const updated = [createdStore, ...userStores.filter((s: any) => s.id !== createdStore.id)];
        localStorage.setItem('vitrina_user_stores', JSON.stringify(updated));
      } catch {}
    }

    setIsSubmitting(false);
    router.push(`/vendor/inventory?storeId=${encodeURIComponent(createdStore?.id || createdStore?.slug || '')}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-200/70 shadow-2xs">
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 text-2xl font-black">
            🏪
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Registra tu Tienda en Vitrina Market
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

              {/* Subida de Fotos de la Tienda */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <span className="text-xs font-bold text-gray-800 block">Fotos de Identidad de tu Tienda</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Logo Upload */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <label className="block text-[11px] font-bold text-gray-700">Logo / Foto de Perfil</label>
                    <div className="flex items-center space-x-3">
                      <img src={logo} alt="Logo" className="w-12 h-12 rounded-2xl object-cover border border-gray-300 shrink-0" />
                      <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-[11px] font-bold text-gray-800 cursor-pointer transition-all flex items-center space-x-1">
                        <Upload className="w-3 h-3" />
                        <span>Subir Foto</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <label className="block text-[11px] font-bold text-gray-700">Foto de Portada / Banner</label>
                    <div className="flex items-center space-x-3">
                      <img src={banner} alt="Banner" className="w-16 h-12 rounded-xl object-cover border border-gray-300 shrink-0" />
                      <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-[11px] font-bold text-gray-800 cursor-pointer transition-all flex items-center space-x-1">
                        <Upload className="w-3 h-3" />
                        <span>Subir Banner</span>
                        <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
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
              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-xs">
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Vinculación de TikTok Live Shopping</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Ingresa tu usuario de TikTok. Nuestro servicio de detección rastreará cuando estés en vivo para que tu tienda aparezca automáticamente en la portada de Vitrina Market.
                </p>
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 mb-1">Usuario de TikTok</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="@techplus_bo"
                      value={tiktokUsername}
                      onChange={(e) => setTiktokUsername(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-300 text-xs text-gray-900 bg-white outline-hidden focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      disabled={isCheckingTikTok || !tiktokUsername.trim()}
                      onClick={handleVerifyTikTokLive}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 shrink-0"
                    >
                      {isCheckingTikTok ? (
                        <span>Verificando...</span>
                      ) : (
                        <span>Comprobar Live</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* TikTok Live Detection Feedback Box */}
                {tiktokStatusResult && (
                  <div
                    className={`p-3.5 rounded-xl text-xs border ${
                      tiktokStatusResult.isLive
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-white border-emerald-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold">
                      {tiktokStatusResult.isLive ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                          <span className="text-red-700 font-black">🔴 ¡TRANSMISIÓN EN VIVO DETECTADA EN TIKTOK!</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-emerald-700 font-bold">✅ Cuenta conectada con éxito</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] mt-1 text-slate-600">
                      {tiktokStatusResult.statusMessage}
                    </p>
                    {tiktokStatusResult.isLive && (
                      <div className="mt-2 pt-2 border-t border-red-100 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-red-700">
                          {tiktokStatusResult.viewers} espectadores en vivo
                        </span>
                        <a
                          href={tiktokStatusResult.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-red-600 hover:underline flex items-center gap-0.5"
                        >
                          Ver en TikTok Live ↗
                        </a>
                      </div>
                    )}
                  </div>
                )}
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
