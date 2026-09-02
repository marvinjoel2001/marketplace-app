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
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { SearchBar } from './SearchBar';

export function Navbar() {
  const { totalItems, setIsCartDrawerOpen, savedCity, setSavedCity, cartAnimationTrigger } = useCart();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
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
      {/* Top Banner (Identical to reference image: Free Shipping on Orders Over $99) */}
      <div className="bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold py-2 px-4 border-b border-[#E0E7FF]/60">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-center">
          <Truck className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span>Envíos Gratis en compras mayores a Bs. 150 con OpenDSP Express</span>
          <span className="text-[#A5B4FC] mx-1.5">•</span>
          <Link href="/live/techplus-bolivia" className="font-bold hover:underline flex items-center text-[#4338CA]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1 animate-pulse"></span>
            TikTok Live Shopping
          </Link>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menú móvil"
                className="lg:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/" className="flex items-center space-x-2.5 group">
                {/* NovaTech Geometric Gradient Mark */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4F46E5] via-[#7C3AED] to-[#F97316] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                    Nova<span className="text-indigo-600">Tech</span>
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                    CompraYa Bolivia
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Navigation Links with subtle hover/active indicator */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-600">
              <Link
                href="/"
                className={`transition-colors pb-1 relative ${
                  pathname === '/'
                    ? 'text-slate-950 font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-indigo-600 after:rounded-full'
                    : 'hover:text-slate-950'
                }`}
              >
                Home
              </Link>

              <Link
                href="/#tiendas"
                className="hover:text-slate-950 transition-colors"
              >
                Shop
              </Link>

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  className="flex items-center space-x-1 hover:text-slate-950 transition-colors"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isCategoriesDropdownOpen && (
                  <div className="absolute top-full -left-4 pt-2 w-52 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-0.5">
                      {categories.map((c) => (
                        <Link
                          key={c.name}
                          href={`/?category=${c.slug}`}
                          onClick={() => setIsCategoriesDropdownOpen(false)}
                          className="block px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/?flashSale=true"
                className="hover:text-slate-950 transition-colors"
              >
                Deals
              </Link>

              <Link
                href="/live/techplus-bolivia"
                className="hover:text-slate-950 transition-colors flex items-center space-x-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>TikTok Live</span>
              </Link>

              <Link
                href="/compare/chompa-oversize-beige-talla-m"
                className="hover:text-slate-950 transition-colors"
              >
                Comparador
              </Link>
            </nav>

            {/* Right: Search, Wishlist, Cart, Profile */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Sleek Capsule Search Bar */}
              <SearchBar />

              {/* Favorites / Wishlist */}
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal();
                  }
                }}
                aria-label="Wishlist"
                className="p-2 text-slate-700 hover:text-indigo-600 transition-colors relative"
              >
                <Heart className="w-4.5 h-4.5" />
              </button>

              {/* Shopping Bag / Cart */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                aria-label={`Carrito de compras, ${totalItems} productos`}
                className={`relative p-2 text-slate-700 hover:text-indigo-600 transition-all select-none ${
                  isCartBouncing ? 'animate-cart-bounce' : ''
                }`}
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 bg-[#4F46E5] text-white font-black text-[9px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs border-2 border-white ${
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
                    className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-indigo-200 transition-all"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {user.name[0]}
                      </div>
                    )}
                  </button>

                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/order/track/demo-order-id"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Mis Pedidos
                      </Link>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          openAuthModal({ initialStep: 'enrich' });
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Datos de Entrega
                      </button>
                      <Link
                        href="/vendor/inventory"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Store className="w-3.5 h-3.5 mr-2 text-blue-600" /> Portal Vendedor
                      </Link>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal()}
                  aria-label="Acceder"
                  className="p-2 text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4.5 h-4.5" />
                </button>
              )}
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
              Home
            </Link>
            <Link
              href="/#tiendas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-slate-700"
            >
              Shop
            </Link>
            <Link
              href="/?flashSale=true"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-slate-700"
            >
              Deals
            </Link>
            <Link
              href="/live/techplus-bolivia"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-red-600"
            >
              TikTok Live Shopping
            </Link>
            <Link
              href="/compare/chompa-oversize-beige-talla-m"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 text-slate-700"
            >
              Comparar Precios
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
