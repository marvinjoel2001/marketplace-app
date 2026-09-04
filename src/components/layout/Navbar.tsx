'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MapPin,
  ShoppingBag,
  Heart,
  User,
  Radio,
  Store,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  Truck,
  Sparkles,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { SearchBar } from './SearchBar';

export function Navbar() {
  const { totalItems, setIsCartDrawerOpen, savedCity, setSavedCity, cartAnimationTrigger } = useCart();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const pathname = usePathname();

  // Cart bounce animation trigger when item is added
  useEffect(() => {
    if (cartAnimationTrigger > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 650);
      return () => clearTimeout(timer);
    }
  }, [cartAnimationTrigger]);

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

  const categories = [
    { name: 'Phones & Celulares', slug: 'celulares-y-telefonia' },
    { name: 'Computers & PC', slug: 'electronica-y-tecnologia' },
    { name: 'Accessories & Audio', slug: 'electronica-y-tecnologia' },
    { name: 'Laptops', slug: 'electronica-y-tecnologia' },
    { name: 'Moda y Ropa', slug: 'moda-y-accesorios' },
    { name: 'Hogar y Muebles', slug: 'hogar-y-muebles' },
  ];

  return (
    <>
      {/* Top Banner with Free Shipping & Language Switcher */}
      <div className="bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold py-1.5 px-4 border-b border-[#E0E7FF]/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Free Shipping & Live notice */}
          <div className="flex-1 flex items-center justify-center sm:justify-start space-x-2 text-center truncate">
            <Truck className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
            <span className="truncate">{t('free_shipping_notice', 'Envíos Gratis en compras mayores a Bs. 150 con OpenDSP Express')}</span>
            <span className="text-[#A5B4FC] hidden sm:inline">•</span>
            <Link href="/live" className="font-bold hover:underline hidden sm:flex items-center text-[#4338CA]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse"></span>
              <span>TikTok Live Shopping</span>
            </Link>
          </div>

          {/* Right: Language Switcher and Help link */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/help"
              className="hover:underline flex items-center space-x-1 text-slate-600 hover:text-indigo-700 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('nav_help', 'Ayuda')}</span>
            </Link>

            {/* Language Selector Pill */}
            <div className="inline-flex items-center bg-white rounded-full p-0.5 border border-indigo-200/80 shadow-2xs text-[11px] font-bold">
              <Globe className="w-3 h-3 ml-1.5 mr-1 text-indigo-500" />
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'es'
                    ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        {/* Fila 1: Logo + Barra de Búsqueda Centrada y Proporcional + Acciones de Usuario */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menú móvil"
                className="lg:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/" className="flex items-center space-x-2.5 group">
                {/* Chiringuito Logo Emblem (Clean Green) */}
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <span className="font-black text-lg">CH</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                    Chiringuito
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                    Marketplace Bolivia
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Search Bar (Fluid, Proportional & Centered) */}
            <div className="hidden sm:flex flex-1 max-w-xl mx-2 lg:mx-6">
              <SearchBar />
            </div>

            {/* Right: Mi Tienda Pill, Wishlist, Cart, Profile */}
            <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0">
              {/* Direct Store Portal Pill */}
              <Link
                href="/vendor"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90 hover:bg-emerald-100 text-xs font-bold transition-all shadow-2xs whitespace-nowrap"
              >
                <Store className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{language === 'es' ? 'Mi Tienda' : 'My Store'}</span>
              </Link>

              {/* Favorites / Wishlist */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal();
                  }
                }}
                aria-label="Wishlist"
                className="p-2 text-slate-700 hover:text-emerald-700 transition-colors relative"
              >
                <Heart className="w-4.5 h-4.5" />
              </button>

              {/* Shopping Bag / Cart */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label={`Carrito de compras, ${totalItems} productos`}
                className={`relative p-2 text-slate-700 hover:text-emerald-700 transition-all select-none ${
                  isCartBouncing ? 'animate-cart-bounce' : ''
                }`}
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 bg-emerald-600 text-white font-black text-[9px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs border-2 border-white ${
                      isCartBouncing ? 'animate-badge-pop scale-125' : ''
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Account / Login */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    aria-label="Menú de usuario"
                    className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-emerald-200 transition-all"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        {user.name[0]}
                      </div>
                    )}
                  </button>

                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/order/track/demo-order-id"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Mis Pedidos
                      </Link>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          openAuthModal({ initialStep: 'enrich' });
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Datos de Entrega
                      </button>
                      <div className="border-t border-slate-100 my-1"></div>
                      <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {language === 'es' ? 'Portal de Tienda' : 'Store Portal'}
                      </div>
                      <Link
                        href="/vendor"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center px-4 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
                      >
                        <Store className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Mi Tienda (Hub)
                      </Link>
                      <Link
                        href="/vendor/profile"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Store className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Perfil & Fotos de Tienda
                      </Link>
                      <Link
                        href="/vendor/orders"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Truck className="w-3.5 h-3.5 mr-2 text-blue-600" /> Ventas & Despacho OpenDSP
                      </Link>
                      <Link
                        href="/vendor/inventory"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Radio className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Catálogo & Stock
                      </Link>
                      <Link
                        href="/vendor/live"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2.5 animate-pulse"></span> TikTok Live Studio
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        {language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  aria-label="Acceder"
                  className="p-2 text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  <User className="w-4.5 h-4.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search bar on mobile */}
          <div className="sm:hidden mt-2.5">
            <SearchBar />
          </div>
        </div>

        {/* Fila 2: Sub-barra de Navegación y Categorías (Espaciosa, sin cortes de línea) */}
        <div className="hidden lg:block border-t border-slate-100/90 bg-[#FAFAF9]/80 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-semibold text-slate-600">
            <nav className="flex items-center space-x-6">
              {/* Categorías Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  className="flex items-center space-x-1.5 py-1 text-slate-800 font-bold hover:text-emerald-700 transition-colors whitespace-nowrap"
                >
                  <Menu className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('nav_categories', 'Categorías')}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isCategoriesDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2 w-56 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-0.5">
                      {categories.map((c) => (
                        <Link
                          key={c.name}
                          href={`/?category=${c.slug}`}
                          onClick={() => setIsCategoriesDropdownOpen(false)}
                          className="block px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-slate-200">|</span>

              <Link
                href="/"
                className={`transition-colors whitespace-nowrap ${
                  pathname === '/' ? 'text-emerald-700 font-bold' : 'hover:text-slate-950'
                }`}
              >
                {t('nav_home', 'Inicio')}
              </Link>

              <Link
                href="/live"
                className="hover:text-red-700 transition-colors flex items-center space-x-1.5 whitespace-nowrap font-bold text-red-600"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                <span>TikTok Live Shopping</span>
              </Link>

              <Link
                href="/?flashSale=true"
                className="hover:text-emerald-700 transition-colors flex items-center space-x-1 whitespace-nowrap font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('nav_deals', 'Ofertas Flash')}</span>
              </Link>

              <Link
                href="/#tiendas"
                className="hover:text-slate-950 transition-colors whitespace-nowrap"
              >
                {language === 'es' ? 'Tiendas Oficiales' : 'Official Stores'}
              </Link>

              <Link
                href="/compare"
                className="hover:text-slate-950 transition-colors whitespace-nowrap"
              >
                {t('nav_compare', 'Comparador de Precios')}
              </Link>

              <Link
                href="/help"
                className="hover:text-slate-950 transition-colors whitespace-nowrap"
              >
                {t('nav_help', 'Centro de Ayuda')}
              </Link>
            </nav>

            {/* Right side info pill */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 whitespace-nowrap">
              <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Despacho Express OpenDSP Bolivia (15 - 45 min)</span>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2 text-xs font-semibold">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-slate-900"
            >
              {t('nav_home', 'Home')}
            </Link>
            <Link
              href="/#tiendas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-slate-700"
            >
              {t('nav_shop', 'Shop')}
            </Link>
            <Link
              href="/?flashSale=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-slate-700"
            >
              {t('nav_deals', 'Deals')}
            </Link>
            <Link
              href="/live"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-red-600"
            >
              {t('nav_live', 'TikTok Live')}
            </Link>
            <Link
              href="/compare"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-slate-700"
            >
              {t('nav_compare', 'Comparador')}
            </Link>
            <Link
              href="/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-indigo-600 font-bold"
            >
              {t('nav_help', 'Centro de Ayuda y FAQ')}
            </Link>
            <Link
              href="/vendor"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-emerald-700 font-extrabold flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>{language === 'es' ? 'Mi Tienda (Portal Vendedor)' : 'Store Portal'}</span>
            </Link>

            {/* Mobile Language Switcher */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Idioma / Language:</span>
              <div className="inline-flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`px-3 py-1 rounded-full ${
                    language === 'es' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                  }`}
                >
                  Español
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full ${
                    language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
