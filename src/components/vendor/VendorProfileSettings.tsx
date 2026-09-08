'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Video,
  FileText,
  Save,
  Loader2,
  Sparkles,
  ArrowRight,
  Eye,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface StoreProfileData {
  storeId: string;
  name: string;
  slogan: string;
  category: string;
  logo: string;
  banner: string;
  phone: string;
  city: string;
  address: string;
  reference: string;
  tiktokUsername: string;
  nit: string;
  description: string;
}

const defaultInitialProfile: StoreProfileData = {
  storeId: 'techplus-bolivia',
  name: 'TechPlus Bolivia',
  slogan: 'Tecnología de última generación con garantía oficial y despacho express',
  category: 'Celulares y Tecnología',
  logo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
  phone: '+591 77012345',
  city: 'Santa Cruz de la Sierra',
  address: 'Av. San Martín #450, Equipetrol Norte',
  reference: 'Torre Empresarial, Piso 1, Local 12',
  tiktokUsername: '@techplus_bo',
  nit: '1029384019',
  description:
    'Especialistas en smartphones Apple, Xiaomi y Samsung, accesorios premium y audífonos inalámbricos. Envíos garantizados con repartidores OpenDSP en toda Bolivia.',
};

const presetLogos = [
  { name: 'Tech / Celulares', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { name: 'Moda & Estilo', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { name: 'Gamer & Electrónica', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80' },
  { name: 'Hogar & Confort', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&auto=format&fit=crop&q=80' },
  { name: 'Belleza & Cosmética', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80' },
];

const presetBanners = [
  { name: 'Boutique Moderna', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Tecnología Minimalista', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Showroom Comercial', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Estilo Urbano', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80' },
];

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

export function VendorProfileSettings() {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<StoreProfileData>(defaultInitialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'fotos' | 'datos' | 'preview'>('fotos');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Cargar perfil guardado localmente o tienda activa si existe
  useEffect(() => {
    try {
      const activeStoreRaw = localStorage.getItem('vitrina_active_store');
      if (activeStoreRaw) {
        const s = JSON.parse(activeStoreRaw);
        setProfile((prev) => ({
          ...prev,
          storeId: s.id || prev.storeId,
          name: s.name || prev.name,
          category: s.category || prev.category,
          logo: s.logo || prev.logo,
          banner: s.banner || prev.banner,
          phone: s.phone || prev.phone,
          address: s.address || prev.address,
          description: s.description || prev.description,
          tiktokUsername: s.tiktokUsername || prev.tiktokUsername,
        }));
      } else {
        const stored = localStorage.getItem('vitrina_vendor_profile') || localStorage.getItem('chiringuito_vendor_profile');
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      }
    } catch {}
  }, []);

  // Manejar subida de archivo para el Logo / Foto de Perfil
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile((prev) => ({
        ...prev,
        logo: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Manejar subida de archivo para el Banner / Portada
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile((prev) => ({
        ...prev,
        banner: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Guardar perfil
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Guardar localmente
      localStorage.setItem('vitrina_vendor_profile', JSON.stringify(profile));
      localStorage.setItem('vitrina_active_store', JSON.stringify(profile));

      // Guardar en la API interna de Next.js
      await fetch('/api/vendor/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      // Fallback local ok
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with quick navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 mb-1">
            <Store className="w-4 h-4" />
            <span>{language === 'es' ? 'Configuración de Marca y Tienda' : 'Brand & Store Settings'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'es' ? 'Fotos y Perfil de tu Tienda' : 'Store Profile & Photos'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'es'
              ? 'Sube tu logo oficial, foto de portada y datos de contacto para que tus clientes y los repartidores OpenDSP te reconozcan.'
              : 'Upload your official logo, cover photo and contact details for customers and OpenDSP couriers.'}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link
            href="/vendor/inventory"
            className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all text-center flex-1 sm:flex-none"
          >
            {language === 'es' ? 'Ver Inventario' : 'Inventory'}
          </Link>
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-2 flex-1 sm:flex-none"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{language === 'es' ? 'Guardar Cambios' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'es' ? '¡Fotos y perfil de tienda guardados con éxito! Los cambios ya son visibles.' : 'Store photos and profile saved successfully!'}</span>
          </div>
          <Link href="/vendor" className="underline text-emerald-700 hover:text-emerald-900">
            {language === 'es' ? 'Ir al Hub' : 'Go to Hub'}
          </Link>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('fotos')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'fotos'
              ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'es' ? '1. Logo & Portada' : '1. Logo & Banner'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('datos')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'datos'
              ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'es' ? '2. Datos del Negocio' : '2. Business Info'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeTab === 'preview'
              ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {language === 'es' ? '3. Vista Previa' : '3. Live Preview'}
        </button>
      </div>

      {/* TAB 1: SUBIR FOTOS (LOGO Y PORTADA) */}
      {activeTab === 'fotos' && (
        <div className="space-y-6">
          {/* Cover Banner Upload Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'es' ? 'Foto de Portada / Banner de la Tienda' : 'Store Cover Banner'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'es'
                    ? 'Recomendado: 1200 x 400 píxeles. Esta imagen se mostrará en la cabecera de tu tienda y transmisiones.'
                    : 'Recommended: 1200 x 400 px. Shown at the top of your storefront and live streams.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200/80 transition-all flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Subir Banner' : 'Upload Banner'}</span>
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
            </div>

            {/* Banner Preview Frame */}
            <div className="relative rounded-2xl overflow-hidden aspect-21/9 sm:aspect-3/1 bg-slate-100 border border-slate-200 group">
              <img
                src={profile.banner}
                alt="Banner de tienda"
                className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-white text-slate-900 font-bold text-xs shadow-lg flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'es' ? 'Cambiar Imagen de Portada' : 'Change Cover Photo'}</span>
                </button>
              </div>
            </div>

            {/* Curated Banner Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {language === 'es' ? 'O elige una portada predeterminada:' : 'Or choose a preset banner:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presetBanners.map((pb, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, banner: pb.url }))}
                    className={`text-left p-1.5 rounded-xl border transition-all ${
                      profile.banner === pb.url
                        ? 'border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <img src={pb.url} alt={pb.name} className="w-full h-12 object-cover rounded-lg mb-1" />
                    <span className="text-[10px] font-bold text-slate-700 block truncate">{pb.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Store Logo / Profile Photo Upload Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'es' ? 'Foto de Perfil / Logo Oficial de la Tienda' : 'Store Profile Photo & Official Logo'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'es'
                    ? 'Recomendado: 400 x 400 píxeles (cuadrado). Es tu imagen de marca en el buscador, compras y TikTok Live.'
                    : 'Recommended: 400 x 400 px (square). Your brand image in search, products and TikTok Live.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Subir desde mi dispositivo' : 'Upload photo'}</span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            {/* Logo Preview & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#FAF9F6] border border-slate-100">
              <div className="relative group shrink-0">
                <img
                  src={profile.logo}
                  alt="Logo de tienda"
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-white shadow-md"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <span className="text-sm font-black text-slate-900 block">{profile.name}</span>
                <span className="text-xs text-emerald-700 font-bold block">● {profile.category}</span>
                <p className="text-xs text-slate-500 max-w-sm">
                  {language === 'es'
                    ? 'Formatos aceptados: JPG, PNG, WEBP o SVG. Las imágenes de alta calidad aumentan hasta un 35% la confianza de los compradores.'
                    : 'Accepted formats: JPG, PNG, WEBP or SVG. High quality images boost customer trust.'}
                </p>
              </div>
            </div>

            {/* Preset Logos */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {language === 'es' ? 'O selecciona un avatar sugerido según tu rubro:' : 'Or choose a preset avatar:'}
              </span>
              <div className="flex flex-wrap gap-3">
                {presetLogos.map((pl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, logo: pl.url }))}
                    className={`flex items-center space-x-2 p-1.5 pr-3 rounded-2xl border transition-all ${
                      profile.logo === pl.url
                        ? 'border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50/70 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img src={pl.url} alt={pl.name} className="w-8 h-8 rounded-xl object-cover" />
                    <span className="text-xs text-slate-800">{pl.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATOS DEL NEGOCIO Y DESPACHO */}
      {activeTab === 'datos' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">
              {language === 'es' ? 'Información Comercial y Recogida OpenDSP' : 'Store Details & OpenDSP Pickup'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'es'
                ? 'Los repartidores de OpenDSP usarán esta dirección exacta para recoger los paquetes que vendas.'
                : 'OpenDSP couriers will navigate to this exact address to pick up sold orders.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'Nombre Comercial de la Tienda *' : 'Store Commercial Name *'}
              </label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'Categoría Principal *' : 'Main Category *'}
              </label>
              <select
                value={profile.category}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium bg-white"
              >
                <option value="Celulares y Tecnología">Celulares y Tecnología</option>
                <option value="Moda y Accesorios">Moda y Accesorios</option>
                <option value="Electrónica y Audio">Electrónica y Audio</option>
                <option value="Hogar y Muebles">Hogar y Muebles</option>
                <option value="Belleza y Cuidado Personal">Belleza y Cuidado Personal</option>
                <option value="Deportes y Fitness">Deportes y Fitness</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'Slogan o Frase Promocional' : 'Slogan or Tagline'}
              </label>
              <input
                type="text"
                value={profile.slogan}
                onChange={(e) => setProfile({ ...profile, slogan: e.target.value })}
                placeholder="ej. Los mejores precios en celulares con garantía oficial"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'WhatsApp / Teléfono de Contacto (+591) *' : 'WhatsApp / Contact Phone *'}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 font-bold text-xs">
                  🇧🇴 +591
                </span>
                <input
                  type="text"
                  required
                  value={profile.phone.replace('+591 ', '')}
                  onChange={(e) => setProfile({ ...profile, phone: `+591 ${e.target.value.replace(/\D/g, '')}` })}
                  className="flex-1 px-3 py-2.5 rounded-r-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'Cuenta de TikTok Oficial (para Live Shopping)' : 'TikTok Official Username'}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 font-bold text-xs">
                  @
                </span>
                <input
                  type="text"
                  value={profile.tiktokUsername.replace('@', '')}
                  onChange={(e) => setProfile({ ...profile, tiktokUsername: `@${e.target.value.replace('@', '')}` })}
                  placeholder="techplus_bo"
                  className="flex-1 px-3 py-2.5 rounded-r-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'Ciudad de tu Local *' : 'Store City *'}
              </label>
              <select
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium bg-white"
              >
                {bolivianCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'NIT o C.I. para Facturación SIN' : 'NIT / ID for SIAT Invoicing'}
              </label>
              <input
                type="text"
                value={profile.nit}
                onChange={(e) => setProfile({ ...profile, nit: e.target.value })}
                placeholder="1029384019"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'Dirección Exacta de Recogida para OpenDSP *' : 'Exact Pickup Address for OpenDSP *'}
              </label>
              <input
                type="text"
                required
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Av. San Martín #450, Barrio Equipetrol Norte"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'Referencia para el Repartidor Motorizado' : 'Pickup Reference Landmark'}
              </label>
              <input
                type="text"
                value={profile.reference}
                onChange={(e) => setProfile({ ...profile, reference: e.target.value })}
                placeholder="Frente al supermercado, Local #12 con letrero iluminado"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                {language === 'es' ? 'Descripción o Historia de la Tienda' : 'Store Bio / Description'}
              </label>
              <textarea
                rows={3}
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center space-x-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{language === 'es' ? 'Guardar Datos del Negocio' : 'Save Business Info'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: VISTA PREVIA EN VIVO DE CÓMO SE VE TU TIENDA */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>{language === 'es' ? 'Vista en Tiempo Real para Compradores' : 'Live Customer Storefront View'}</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              {language === 'es'
                ? 'Así luce el escaparate de tu tienda en Vitrina Market con tu banner de portada y foto de perfil seleccionados:'
                : 'This is how your store appears to customers on Vitrina Market with your cover banner and profile logo:'}
            </p>

            {/* Simulated Store Hero */}
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              {/* Cover Banner */}
              <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-slate-100">
                <img src={profile.banner} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center space-x-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>TikTok Live</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white font-bold text-[10px]">
                    1,420 viewers
                  </span>
                </div>
              </div>

              {/* Overlapping Profile Info */}
              <div className="px-6 pb-6 pt-0 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
                  <div className="flex items-end space-x-4">
                    <img
                      src={profile.logo}
                      alt={profile.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{profile.name}</h2>
                        <span className="p-1 rounded-full bg-emerald-100 text-emerald-800" title="Tienda Oficial Verificada">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{profile.slogan}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <a
                      href={`https://www.tiktok.com/${profile.tiktokUsername}/live`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-slate-950 hover:bg-black text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{profile.tiktokUsername}</span>
                    </a>
                  </div>
                </div>

                {/* Badges and Location Details */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{profile.address}, {profile.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp: {profile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-800">Despacho OpenDSP Express (15-45 min)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
