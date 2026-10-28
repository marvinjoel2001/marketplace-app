'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, Receipt, Tag, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { VendorContext } from '@/context/VendorContext';
import { marketplaceApi, type Order, type Store } from '@/lib/api';
import { describeWindow } from '@/lib/schedule';
import { Logo } from '@/components/shop/Logo';

const NAV = [
  { href: '/vendor', label: 'Inicio', icon: Home },
  { href: '/vendor/productos', label: 'Productos', icon: Package },
  { href: '/vendor/ventas', label: 'Ventas', icon: Receipt },
  { href: '/vendor/ofertas', label: 'Ofertas', icon: Tag },
  { href: '/vendor/ajustes', label: 'Ajustes', icon: Settings },
];
const POLL_MS = 20_000;

function saleText(order: Order) {
  const units = order.items.reduce((s, it) => s + it.quantity, 0);
  return `Vendiste ${units} ${units === 1 ? 'producto' : 'productos'}. Entrega ${describeWindow(order.deliveryAt, order.deliveryWindow)}: el repartidor pasa a recogerlo a esa hora.`;
}

function Welcome({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-10">
      <Logo suffix="Tiendas" />
      <div>
        <h1 className="type-sign text-3xl font-extrabold leading-tight">Vende tus productos en Vitrina</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Sube tus productos con una foto, recibe pedidos y elige a qué hora entregas. Nosotros llevamos el pedido al cliente.
        </p>
      </div>
      <button type="button" className="btn btn-primary w-full" onClick={onLogin}>
        Entrar a mi tienda
      </button>
      <Link href="/" className="text-center text-sm font-semibold text-muted">
        Volver a la tienda para compradores
      </Link>
    </div>
  );
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, requestLogin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [store, setStore] = useState<Store | null | undefined>(undefined);
  const [unseenSales, setUnseenSales] = useState(0);
  const lastCheck = useRef<string>(new Date().toISOString());

  const userId = user?.id;
  const knownStoreId = user?.storeId;
  useEffect(() => {
    if (!userId) return;
    let active = true;
    marketplaceApi.getStoreByOwner(userId).then((s) => active && setStore(s));
    return () => {
      active = false;
    };
  }, [userId, knownStoreId]);

  const onboarding = pathname.startsWith('/vendor/onboarding');
  useEffect(() => {
    if (store === null && !onboarding) router.replace('/vendor/onboarding');
    if (store && onboarding) router.replace('/vendor');
  }, [store, onboarding, router]);

  // New sales: poll while the panel is open and announce each one.
  const storeId = store?.id;
  useEffect(() => {
    if (!storeId) return;
    const check = async () => {
      try {
        const since = lastCheck.current;
        const fresh = await marketplaceApi.getStoreOrders(storeId, since);
        if (fresh.length === 0) return;
        lastCheck.current = fresh[0].createdAt;
        setUnseenSales((n) => n + fresh.length);
        for (const order of fresh) {
          const text = saleText(order);
          toast(text, 'info');
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('Nueva venta en Vitrina', { body: text, icon: '/pulpo-icon.png', tag: order.id });
          }
        }
      } catch {
        // Offline for a moment; the next poll catches up.
      }
    };
    const timer = setInterval(check, POLL_MS);
    return () => clearInterval(timer);
  }, [storeId, toast]);

  const markSalesSeen = useCallback(() => setUnseenSales(0), []);

  if (!ready || (user && store === undefined)) {
    return <p className="py-20 text-center text-muted">Cargando tu tienda…</p>;
  }
  if (!user) {
    return <Welcome onLogin={() => requestLogin({ reason: 'Entra con la cuenta que usarás para tu tienda.' })} />;
  }
  if (!store) {
    return onboarding ? <>{children}</> : null;
  }

  const active = (href: string) => (href === '/vendor' ? pathname === '/vendor' : pathname.startsWith(href));

  return (
    <VendorContext.Provider value={{ store, setStore, unseenSales, markSalesSeen }}>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Logo href="/vendor" suffix="Tiendas" />
          <nav className="ml-6 hidden gap-1 md:flex" aria-label="Panel de la tienda">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href) ? 'page' : undefined}
                className="relative rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-paper aria-[current=page]:bg-verde-tint aria-[current=page]:text-verde-dark"
              >
                {label}
                {href === '/vendor/ventas' && unseenSales > 0 && (
                  <span className="ml-1.5 rounded-full bg-live px-1.5 text-[11px] font-bold text-white">{unseenSales}</span>
                )}
              </Link>
            ))}
          </nav>
          <Link href="/" className="ml-auto flex items-center gap-1 text-sm font-semibold text-muted">
            <ArrowLeft className="h-4 w-4" /> Ver tienda
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 md:pb-12">{children}</main>

      <nav aria-label="Panel de la tienda" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const on = active(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={on ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${on ? 'text-verde' : 'text-muted'}`}
                >
                  <span className="relative">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={on ? 2.4 : 1.8} />
                    {href === '/vendor/ventas' && unseenSales > 0 && (
                      <span className="absolute -right-2 -top-1 min-w-[17px] rounded-full bg-live px-1 text-center text-[10px] font-bold leading-[17px] text-white">
                        {unseenSales}
                      </span>
                    )}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </VendorContext.Provider>
  );
}
