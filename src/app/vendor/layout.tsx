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
import { Bone, ListSkeleton, PanelSkeleton } from '@/components/shop/Skeleton';

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
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-7 sm:p-10 flex flex-col gap-6">
        <Logo suffix="Panel de tienda" />
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Vende en Vitrina Market
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 leading-tight">
            Tu tienda, <span className="text-[#5B4DF0]">en todos los celulares</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Sube tus productos con una foto, recibe pedidos y elige a qué hora entregas. Nosotros llevamos el pedido al cliente.
          </p>
        </div>
        <button type="button" className="btn btn-primary w-full" onClick={onLogin}>
          Entrar a mi tienda
        </button>
        <Link href="/" className="text-center text-xs font-bold text-indigo-600 hover:text-indigo-800">
          Volver a Vitrina Market
        </Link>
      </div>
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
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4"><Bone className="h-14 w-full rounded-2xl" /><Bone className="h-9 w-64" /><PanelSkeleton lines={3} /><ListSkeleton rows={3} /></div>;
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
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-2xl border-b border-white/60 shadow-lg shadow-black/5">
        {/* Barra del panel de tienda */}
        <div className="bg-slate-950 text-white px-4 py-2 border-b border-slate-800 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-black text-emerald-400 uppercase tracking-widest text-[10px] shrink-0">Panel de tienda</span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-slate-200 truncate">{store.name}</span>
            </div>
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2" aria-label="Panel de la tienda">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={active(href) ? 'page' : undefined}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${active(href) ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  {label}
                  {href === '/vendor/ventas' && unseenSales > 0 && (
                    <span className="ml-1.5 rounded-full bg-[#FE2C55] px-1.5 text-[10px] font-black text-white">{unseenSales}</span>
                  )}
                </Link>
              ))}
              <Link
                href="/vendor/tiktok"
                aria-current={active('/vendor/tiktok') ? 'page' : undefined}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${active('/vendor/tiktok') ? 'bg-[#FE2C55] text-white shadow-xs' : 'bg-[#FE2C55]/20 text-[#FE2C55] hover:bg-[#FE2C55] hover:text-white'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                <span>Vender por TikTok</span>
              </Link>
            </nav>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <Logo href="/vendor" suffix="Panel de tienda" />
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 border border-white/80 font-bold text-xs transition-all shadow-2xs flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Ver Vitrina
          </Link>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto flex-1 px-4 sm:px-6 lg:px-8 pb-28 pt-6 md:pb-12">{children}</main>

      <nav aria-label="Panel de la tienda" className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/85 backdrop-blur-2xl shadow-[0_-8px_24px_rgba(15,23,42,0.06)] md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const on = active(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={on ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10.5px] font-bold ${on ? 'text-[#5B4DF0]' : 'text-slate-500'}`}
                >
                  <span className="relative">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={on ? 2.5 : 2} />
                    {href === '/vendor/ventas' && unseenSales > 0 && (
                      <span className="absolute -right-2.5 -top-2 min-w-[17px] rounded-full bg-[#FE2C55] px-1 text-center text-[9px] font-black leading-[17px] text-white border-2 border-white">
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
