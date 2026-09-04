'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Loader2,
  Sparkles,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalStep,
    closeAuthModal,
    socialLogin,
    emailLogin,
    enrichProfile,
    providersConfig,
    user,
  } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'social' | 'direct'>('social');
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [isSubmittingEnrich, setIsSubmittingEnrich] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Direct login form
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingInDirect, setIsLoggingInDirect] = useState(false);

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
    setErrorMessage('');
    try {
      await socialLogin(provider);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage(language === 'es' ? 'Ingresa tu teléfono o correo' : 'Enter your phone or email');
      return;
    }
    setIsLoggingInDirect(true);
    setErrorMessage('');
    try {
      await emailLogin(identifier.trim(), password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al autenticar');
    } finally {
      setIsLoggingInDirect(false);
    }
  };

  const handleEnrichSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhoneDigits = phone.replace(/\D/g, '');
    if (cleanPhoneDigits.length !== 8) {
      setPhoneError(
        language === 'es'
          ? 'Por favor ingresa un número de 8 dígitos válido de Bolivia (ej. 77012345).'
          : 'Please enter a valid 8-digit Bolivian phone number (e.g. 77012345).'
      );
      return;
    }

    if (!address.trim()) {
      setPhoneError(
        language === 'es'
          ? 'Por favor ingresa tu dirección exacta de entrega.'
          : 'Please enter your exact delivery address.'
      );
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Cerrar modal de autenticación"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PASO 1: LOGIN (SOCIAL O DIRECTO) */}
        {authModalStep === 'login' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center text-xl shadow-2xs">
                🛍️
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {language === 'es' ? 'Acceso a' : 'Sign in to'}{' '}
                <span className="text-emerald-700">Chiringuito</span>
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {language === 'es'
                  ? 'Accede para finalizar tu compra con despacho express OpenDSP y guardar tus tiendas de TikTok Live.'
                  : 'Sign in to complete checkout with OpenDSP express delivery and save your TikTok Live stores.'}
              </p>
            </div>

            {/* Mode Switcher Tabs: Social vs Direct */}
            <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  activeTab === 'social'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'es' ? 'TikTok / Google' : 'TikTok / Google'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  activeTab === 'direct'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'es' ? 'Teléfono / Correo' : 'Phone / Email'}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: SOCIAL AUTH */}
            {activeTab === 'social' && (
              <div className="space-y-3 pt-1">
                {/* TikTok Login (Priority for Live Shopping) */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('TIKTOK')}
                  disabled={Boolean(loadingProvider)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-950 hover:bg-black text-white font-extrabold text-sm flex items-center justify-between shadow-md transition-all active:scale-98 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                      </svg>
                    </div>
                    <span>{language === 'es' ? 'Continuar con TikTok' : 'Continue with TikTok'}</span>
                  </div>
                  {loadingProvider === 'TIKTOK' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      LIVE
                    </span>
                  )}
                </button>

                {/* Google Auth */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('GOOGLE')}
                  disabled={Boolean(loadingProvider)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-between shadow-2xs transition-all active:scale-98"
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
                    <span>{language === 'es' ? 'Continuar con Google' : 'Continue with Google'}</span>
                  </div>
                  {loadingProvider === 'GOOGLE' && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  )}
                </button>

                {/* Facebook Login */}
                <button
                  type="button"
                  onClick={() => handleSocialClick('FACEBOOK')}
                  disabled={Boolean(loadingProvider)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-sm flex items-center justify-between shadow-2xs transition-all active:scale-98"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>{language === 'es' ? 'Continuar con Facebook' : 'Continue with Facebook'}</span>
                  </div>
                  {loadingProvider === 'FACEBOOK' && (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: DIRECT PHONE OR EMAIL AUTH */}
            {activeTab === 'direct' && (
              <form onSubmit={handleDirectSubmit} className="space-y-3 pt-1 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {language === 'es' ? 'Teléfono / WhatsApp o Correo Electrónico' : 'Phone / WhatsApp or Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={language === 'es' ? 'ej. 77012345 o tu@correo.com' : 'e.g. 77012345 or you@email.com'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {language === 'es' ? 'Contraseña (Opcional)' : 'Password (Optional)'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {language === 'es'
                      ? 'Si es tu primera vez, crearemos tu cuenta automáticamente.'
                      : 'If this is your first time, we will create your account automatically.'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingInDirect}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
                >
                  {isLoggingInDirect ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{language === 'es' ? 'Ingresar a Chiringuito' : 'Sign in to Chiringuito'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Guest Policy Note */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-600 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 block">
                  {language === 'es' ? 'Compra Segura con OpenDSP' : 'Secure Shopping with OpenDSP'}
                </span>
                <span className="text-[11px]">
                  {language === 'es'
                    ? 'Tus datos están protegidos bajo estricto cifrado. Solo solicitamos teléfono y dirección para la entrega de tus paquetes.'
                    : 'Your information is secured under strict encryption. We only request phone and address for delivery.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: ENRIQUECIMIENTO OBLIGATORIO DE DATOS DE ENTREGA */}
        {authModalStep === 'enrich' && (
          <form onSubmit={handleEnrichSubmit} className="p-6 sm:p-8 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center text-lg">
                📍
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {language === 'es' ? 'Datos de Entrega Express' : 'Express Delivery Details'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'es'
                  ? 'Completa tu dirección una sola vez para que el repartidor OpenDSP localice tu pedido.'
                  : 'Enter your delivery address once for OpenDSP courier navigation.'}
              </p>
            </div>

            {phoneError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{phoneError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'Teléfono / WhatsApp de Contacto *' : 'Phone / WhatsApp *'}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 font-bold text-xs">
                    🇧🇴 +591
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={8}
                    placeholder="77012345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2.5 rounded-r-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {language === 'es' ? 'Ciudad *' : 'City *'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium bg-white"
                  >
                    {bolivianCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {language === 'es' ? 'Zona / Barrio' : 'Zone / Neighborhood'}
                  </label>
                  <input
                    type="text"
                    placeholder="Equipetrol / Sopocachi"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'Dirección Exacta (Calle y Número) *' : 'Exact Address (Street & Number) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Av. San Martín #450, Edif. Torre 1"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'Punto de Referencia' : 'Address Landmark / Reference'}
                </label>
                <input
                  type="text"
                  placeholder="Frente al supermercado, portón negro"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {language === 'es' ? 'NIT o C.I. para Factura (Opcional)' : 'NIT / ID for Invoice (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="1028475019"
                  value={nitOrCi}
                  onChange={(e) => setNitOrCi(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingEnrich}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 mt-2"
            >
              {isSubmittingEnrich ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'es' ? 'Guardar y Continuar' : 'Save & Continue'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
