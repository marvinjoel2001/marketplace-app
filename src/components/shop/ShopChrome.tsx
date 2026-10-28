'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Home, Tag, Radio, ShoppingBag, User, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';

const TABS = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/ofertas', label: 'Ofertas', icon: Tag },
  { href: '/en-vivo', label: 'En vivo', icon: Radio },
  { href: '/cart', label: 'Carrito', icon: ShoppingBag },
  { href: '/cuenta', label: 'Cuenta', icon: User },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function SearchBox() {
  return (
    <Suspense fallback={<div className="field min-h-[44px] rounded-full bg-paper" />}>
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
      className="relative w-full"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar productos"
        aria-label="Buscar productos"
        className="field min-h-[44px] rounded-full bg-paper pl-10"
      />
    </form>
  );
}

function CartCount() {
  const { totalItems, lastAddedAt } = useCart();
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (!lastAddedAt) return;
    const start = setTimeout(() => setBump(true), 0);
    const stop = setTimeout(() => setBump(false), 450);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
    };
  }, [lastAddedAt]);
  if (!totalItems) return null;
  return (
    <span
      className={`absolute -right-2 -top-1.5 min-w-[18px] rounded-full bg-tag px-1 text-center text-[11px] font-extrabold leading-[18px] text-ink transition-transform ${bump ? 'scale-125' : ''}`}
    >
      {totalItems}
    </span>
  );
}

/** Customer navigation: top bar everywhere, tab bar at the bottom on phones. Hidden in the store panel. */
export function ShopChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  if (pathname.startsWith('/vendor') || pathname.startsWith('/admin')) return <>{children}</>;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-6">
          <Logo />
          <div className="hidden flex-1 sm:block">
            <SearchBox />
          </div>
          <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Principal">
            {TABS.slice(1).map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(pathname, href) ? 'page' : undefined}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-paper aria-[current=page]:text-verde"
              >
                <Icon className="h-4 w-4" />
                {href === '/cuenta' && user ? user.name.split(' ')[0] : label}
                {href === '/cart' && <CartCount />}
              </Link>
            ))}
          </nav>
          <Link href="/vendor" className="ml-auto hidden text-sm font-semibold text-verde-dark underline-offset-4 hover:underline md:ml-0 md:inline">
            Vender
          </Link>
        </div>
        <div className="px-4 pb-2.5 sm:hidden">
          <SearchBox />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-4 md:pb-12">{children}</main>

      <nav
        aria-label="Principal"
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden"
      >
        <ul className="grid grid-cols-5">
          {TABS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? 'text-verde' : 'text-muted'}`}
                >
                  <span className="relative">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
                    {href === '/cart' && <CartCount />}
                  </span>
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
