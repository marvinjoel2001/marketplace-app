'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Home, LogOut, MapPin, Menu, Radio, Search, ShoppingBag, Store, Tag, User, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { marketplaceApi, type Category } from '@/lib/api';
import { TikTokIcon } from '@/components/common/TikTokIcon';
import { Logo } from './Logo';
import { Footer } from './Footer';

const TABS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/ofertas', label: 'Ofertas', icon: Tag },
  { href: '/live', label: 'En vivo', icon: Radio },
  { href: '/cart', label: 'Carrito', icon: ShoppingBag },
  { href: '/cuenta', label: 'Cuenta', icon: User },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function SearchBar() {
  return (
    <Suspense fallback={<div className="glass-input h-11 w-full rounded-full" />}>
      <SearchForm />
    </Suspense>
  );
}

function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
      }}
      className="glass-input relative flex w-full items-center rounded-full transition-all"
    >
      <Search className="pointer-events-none absolute left-4 h-4 w-4 text-slate-400" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar productos, marcas o tiendas en Bolivia..."
        aria-label="Buscar productos"
        className="h-11 w-full rounded-full bg-transparent pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
    </form>
  );
}

function CartBadge() {
  const { totalItems, lastAddedAt } = useCart();
  const [bounce, setBounce] = useState(false);
  useEffect(() => {
    if (!lastAddedAt) return;
    const start = setTimeout(() => setBounce(true), 0);
    const stop = setTimeout(() => setBounce(false), 650);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [lastAddedAt]);
  return (
    <span className={`relative inline-flex ${bounce ? 'animate-cart-bounce' : ''}`}>
      <ShoppingBag className="w-[18px] h-[18px]" />
      {totalItems > 0 && (
        <span
          className={`absolute -top-2 -right-2.5 bg-emerald-600 text-white font-black text-[9px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs border-2 border-white ${bounce ? 'animate-badge-pop' : ''}`}
        >
          {totalItems}
        </span>
      )}
    </span>
  );
}

function AccountButton() {
  const { user, requestLogin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!user) {
    return (
      <button type="button" onClick={() => requestLogin()} aria-label="Iniciar sesión" className="p-2 text-slate-700 hover:text-emerald-700 transition-colors">
        <User className="w-[18px] h-[18px]" />
      </button>
    );
  }

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Menú de usuario"
        aria-expanded={open}
        className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-emerald-200 transition-all"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">{user.name[0]}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-in">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.phone || user.email}</p>
          </div>
          <Link href="/cuenta" onClick={() => setOpen(false)} className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
            <ShoppingBag className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Mis pedidos
          </Link>
          <Link href="/cuenta" onClick={() => setOpen(false)} className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
            <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Mi dirección de entrega
          </Link>
          <div className="border-t border-slate-100 my-1" />
          <Link href="/vendor" onClick={() => setOpen(false)} className="flex items-center px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
            <Store className="w-3.5 h-3.5 mr-2 text-emerald-600" /> {user.storeId ? 'Mi tienda' : 'Vender en Vitrina Market'}
          </Link>
          <div className="border-t border-slate-100 my-1" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left flex items-center px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

function LivePill({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/live"
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs group whitespace-nowrap"
      title="Tiendas en vivo"
    >
      <span className="w-4 h-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
        <TikTokIcon className="w-3.5 h-3.5" size={16} />
      </span>
      {!compact && <span className="font-extrabold text-xs text-white hidden sm:inline">TikTok Live</span>}
      <span className="px-1.5 py-0.5 rounded-full bg-[#FE2C55] text-[8px] font-black text-white uppercase tracking-wider animate-pulse leading-none">LIVE</span>
    </Link>
  );
}

/** Customer navigation: Vitrina Market header and footer, plus a tab bar on phones. Hidden in the store panel. */
export function ShopChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLive = pathname.startsWith('/live');
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsOpen, setCatsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    marketplaceApi.getCategories().then((list) => active && setCategories(list));
    return () => {
      active = false;
    };
  }, []);

  if (pathname.startsWith('/vendor') || pathname.startsWith('/admin')) return <>{children}</>;

  return (
    <>
      <header data-marketplace-nav className="sticky top-0 z-40 bg-white/75 backdrop-blur-2xl border-b border-white/60 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menú"
                aria-expanded={menuOpen}
                className="lg:hidden p-1.5 text-slate-700 hover:bg-white/80 rounded-xl"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Logo />
            </div>

            <div className="hidden sm:flex flex-1 max-w-xl mx-2 lg:mx-6">
              <SearchBar />
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <span className="sm:hidden">
                <LivePill compact />
              </span>
              <span className="hidden sm:inline-flex">
                <LivePill />
              </span>
              <Link
                href="/vendor"
                style={isLive ? { backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a' } : undefined}
                className={`hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs whitespace-nowrap border ${
                  user?.storeId
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200/90 hover:bg-slate-100'
                }`}
              >
                <Store
                  style={isLive ? { color: user?.storeId ? '#047857' : '#4f46e5' } : undefined}
                  className={`w-3.5 h-3.5 shrink-0 ${user?.storeId ? 'text-emerald-700' : 'text-indigo-600'}`}
                />
                <span style={isLive ? { color: user?.storeId ? '#065f46' : '#0f172a' } : undefined}>
                  {user?.storeId ? 'Mi Tienda' : 'Vender'}
                </span>
              </Link>
              <Link href="/cart" aria-label="Carrito de compras" className="hidden md:inline-flex p-2 text-slate-700 hover:text-emerald-700 transition-all">
                <CartBadge />
              </Link>
              <span className="hidden md:inline-flex">
                <AccountButton />
              </span>
            </div>
          </div>

          <div className="sm:hidden mt-2.5">
            <SearchBar />
          </div>
        </div>

        {/* Sub-barra de navegación y categorías */}
        <div data-marketplace-secondary-row className="hidden lg:block border-t border-white/40 bg-white/60 backdrop-blur-xl shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center text-xs font-semibold text-slate-700">
            <nav className="flex items-center space-x-4 xl:space-x-6" aria-label="Secciones">
              <div className="relative" onMouseEnter={() => setCatsOpen(true)} onMouseLeave={() => setCatsOpen(false)}>
                <button
                  type="button"
                  onClick={() => setCatsOpen(!catsOpen)}
                  aria-expanded={catsOpen}
                  className="flex items-center space-x-2 px-3.5 py-1.5 bg-white/80 hover:bg-white text-slate-800 font-bold rounded-full border border-white/80 shadow-xs hover:shadow-sm transition-all text-xs whitespace-nowrap cursor-pointer"
                >
                  <Menu className="w-3.5 h-3.5 text-slate-700" />
                  <span>Categorías</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                {catsOpen && categories.length > 0 && (
                  <div className="absolute top-full left-0 pt-2 w-60 z-50 animate-scale-in">
                    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/80 p-2 space-y-0.5">
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/?category=${c.slug}`}
                          onClick={() => setCatsOpen(false)}
                          className="block px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition-colors"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/"
                className={`transition-colors whitespace-nowrap font-bold text-xs relative py-1 ${
                  pathname === '/'
                    ? 'text-emerald-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                Inicio
              </Link>

              <Link
                href="/live"
                className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/90 hover:bg-white border border-white/80 shadow-2xs hover:shadow-xs transition-all group whitespace-nowrap"
              >
                <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform shrink-0 p-0.5">
                  <TikTokIcon className="w-3.5 h-3.5" size={14} />
                </span>
                <span className="font-extrabold text-slate-900 text-xs">Tiendas en vivo</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#FE2C55] text-[8px] font-black text-white tracking-widest uppercase animate-pulse shadow-xs leading-none">LIVE</span>
              </Link>

              <Link href="/ofertas" className="hover:text-amber-600 text-slate-700 transition-colors flex items-center space-x-1 whitespace-nowrap font-semibold">
                <span className="text-amber-500">⚡</span>
                <span>Ofertas</span>
              </Link>

              <Link href="/cuenta" className="hover:text-emerald-700 text-slate-700 transition-colors whitespace-nowrap font-semibold">
                Mis pedidos
              </Link>
            </nav>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2 text-xs font-semibold">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-900">
              Inicio
            </Link>
            <Link href="/ofertas" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700">
              ⚡ Ofertas
            </Link>
            <Link href="/live" onClick={() => setMenuOpen(false)} className="py-1.5 text-slate-900 font-extrabold flex items-center space-x-2.5">
              <span className="w-7 h-7 rounded-full bg-black flex items-center justify-center shadow-xs shrink-0 p-1">
                <TikTokIcon className="w-4 h-4" size={18} />
              </span>
              <span>Tiendas en vivo</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#FE2C55] text-[8px] font-black text-white tracking-widest uppercase animate-pulse shadow-xs">LIVE</span>
            </Link>
            {categories.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Categorías</p>
                {categories.map((c) => (
                  <Link key={c.id} href={`/?category=${c.slug}`} onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-700">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            <Link href="/vendor" onClick={() => setMenuOpen(false)} className="pt-2 border-t border-slate-100 text-emerald-700 font-extrabold flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              <span>{user?.storeId ? 'Mi Tienda' : 'Vender en Vitrina Market'}</span>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      <Footer />

      {/* Barra inferior en celulares */}
      <nav aria-label="Principal" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/85 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(15,23,42,0.06)] md:hidden">
        <ul className="grid grid-cols-5">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10.5px] font-bold ${active ? 'text-[#5B4DF0]' : 'text-slate-500'}`}
                >
                  {href === '/cart' ? <CartBadge /> : <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />}
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
