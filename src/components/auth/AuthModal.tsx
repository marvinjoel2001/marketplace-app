'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalStep,
    closeAuthModal,
    socialLogin,
    enrichProfile,
    user,
  } = useAuth();

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [isSubmittingEnrich, setIsSubmittingEnrich] = useState(false);

  // Formulario de enriquecimiento
  const [phone, setPhone] = useState(user?.phone?.replace(/\D/g, '').slice(-8) || '');
  const [city, setCity] = useState(user?.city || 'Santa Cruz de la Sierra');
  const [zone, setZone] = useState(user?.zone || 'Equipetrol');
  const [address, setAddress] = useState(user?.address || '');
  const [reference, setReference] = useState(user?.addressReference || '');
  const [nitOrCi, setNitOrCi] = useState(user?.nitOrCi || '');
  const [phoneError, setPhoneError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSocialClick = async (provider: 'TIKTOK' | 'GOOGLE' | 'FACEBOOK') => {
    setLoadingProvider(provider);
    try {
      await socialLogin(provider);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEnrichSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length !== 8) {
      setPhoneError('Por favor ingresa un número de 8 dígitos válido de Bolivia (ej. 77012345).');
      return;
    }

    if (!address.trim()) {
      setPhoneError('Por favor ingresa tu dirección exacta.');
      return;
    }

    setIsSubmittingEnrich(true);
    try {
      await enrichProfile({
        phone: cleanPhoneDigits,
        city,
        zone,
        address: address.trim(),
        addressReference: reference.trim(),
        nitOrCi: nitOrCi.trim(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingEnrich(false);
    }
  };

  const bolivianCities = [
    'Santa Cruz de la Sierra',
    'La Paz / El Alto',
    'Cochabamba',
    'Sucre',
    'Tarija',
    'Oruro',
    'Potosí',
    'Trinidad',
    'Cobija',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Cerrar modal de autenticación"
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PASO 1: LOGIN SOCIAL RÁPIDO */}
        {authModalStep === 'login' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 mx-auto flex items-center justify-center text-2xl shadow-sm">
                🛍️
              </div>
              <h2 className="text-2xl font-black text-gray-950 tracking-tight">
                Iniciar Sesión en <span className="text-amber-600">CompraYa</span>
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
                Accede en un clic para proceder al checkout seguro, guardar tus tiendas favoritas y
                recibir despacho express con OpenDSP.
              </p>
            </div>

            {/* Provider Buttons */}
            <div className="space-y-3 pt-2">
              {/* TikTok Login (Priority for Live Shopping) */}
              <button
                type="button"
                onClick={() => handleSocialClick('TIKTOK')}
                disabled={Boolean(loadingProvider)}
                className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-gray-900 text-white font-extrabold text-sm flex items-center justify-between shadow-md transition-all active:scale-98 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </div>
                  <span>Continuar con TikTok</span>
                </div>
                {loadingProvider === 'TIKTOK' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <span className="text-[10px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Recomendado
                  </span>
                )}
              </button>

              {/* Google Auth */}
              <button
                type="button"
                onClick={() => handleSocialClick('GOOGLE')}
                disabled={Boolean(loadingProvider)}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-sm flex items-center justify-between shadow-xs transition-all active:scale-98"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </div>
                {loadingProvider === 'GOOGLE' && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                )}
              </button>

              {/* Facebook Login */}
              <button
                type="button"
                onClick={() => handleSocialClick('FACEBOOK')}
                disabled={Boolean(loadingProvider)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-sm flex items-center justify-between shadow-xs transition-all active:scale-98"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Continuar con Facebook</span>
                </div>
                {loadingProvider === 'FACEBOOK' && (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                )}
              </button>
            </div>

            {/* Guest Policy Explanation Note */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-gray-200 text-xs text-gray-600 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-gray-900 block">Navegación Libre y Segura</span>
                <span>
                  Puedes explorar tiendas, TikTok Live y comparar precios libremente. El acceso solo
                  es requerido para procesar pagos y coordinar repartidores en tiempo real.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: ENRIQUECIMIENTO OBLIGATORIO DE DATOS */}
        {authModalStep === 'enrich' && (
          <form onSubmit={handleEnrichSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Datos para Despacho OpenDSP</span>
              </div>
              <h2 className="text-xl font-black text-gray-950">Completa tu Información</h2>
              <p className="text-xs text-gray-600">
                Para entregar tu pedido en tu ciudad y notificarte vía WhatsApp al llegar.
              </p>
            </div>

            {/* User identification badge */}
            {user && (
              <div className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-400 font-bold flex items-center justify-center text-xs">
                    {user.name[0]}
                  </div>
                )}
                <div className="text-xs min-w-0">
                  <p className="font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {phoneError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{phoneError}</span>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-3.5 text-xs">
              {/* Phone with +591 Bolivia */}
              <div>
                <label className="font-extrabold text-gray-900 block mb-1">
                  Número de Celular / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-gray-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/30 overflow-hidden">
                  <span className="bg-gray-100 text-gray-800 px-3 py-2.5 font-black flex items-center border-r border-gray-300">
                    🇧🇴 +591
                  </span>
                  <input
                    type="tel"
                    maxLength={8}
                    placeholder="77012345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 text-gray-900 font-bold outline-hidden placeholder:text-gray-400"
                    required
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Requerido para que el repartidor motorizado te contacte al llegar.
                </span>
              </div>

              {/* City selector */}
              <div>
                <label className="font-extrabold text-gray-900 block mb-1">
                  Ciudad de Entrega <span className="text-red-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-gray-900 font-bold bg-white outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  {bolivianCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone / Barrio */}
              <div>
                <label className="font-extrabold text-gray-900 block mb-1">
                  Zona / Barrio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Equipetrol, Calacoto, San Pedro"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-gray-900 font-medium outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              {/* Main Address */}
              <div>
                <label className="font-extrabold text-gray-900 block mb-1">
                  Dirección Exacta (Calle y Número) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. San Martín #142, entre 2do y 3er Anillo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-gray-900 font-medium outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              {/* Reference */}
              <div>
                <label className="font-extrabold text-gray-900 block mb-1">
                  Referencia de Entrega (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Portón blanco frente a Farmacia Chávez"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-gray-900 font-medium outline-hidden focus:border-amber-500"
                />
              </div>

              {/* NIT / CI (Optional) */}
              <div>
                <label className="font-extrabold text-gray-900 block mb-1">
                  NIT o Carnet de Identidad (Para Facturación)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 847291012 o 'Sin factura'"
                  value={nitOrCi}
                  onChange={(e) => setNitOrCi(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-gray-900 font-medium outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingEnrich}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-black font-black text-sm rounded-full shadow-md transition-all active:scale-98 flex items-center justify-center space-x-2"
            >
              {isSubmittingEnrich ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Guardando datos...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Confirmar y Continuar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
