'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, Receipt, Tag, Settings, ArrowLeft, ArrowRight, Bell, Eye, Search, Radio, Users, ChartNoAxesCombined, LogOut, Menu, X, Store as StoreIcon, Plus, Headphones, Loader2, MessageCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { VendorContext } from '@/context/VendorContext';
import { API_URL, marketplaceApi, type Order, type Store } from '@/lib/api';
import { describeWindow } from '@/lib/schedule';
import { Logo } from '@/components/shop/Logo';
import { mediaUrl } from '@/lib/catalog';
import { Bone, ListSkeleton, PanelSkeleton } from '@/components/shop/Skeleton';
import { TikTokIcon } from '@/components/common/TikTokIcon';
import './vendor.css';

const NAV = [
  { href: '/vendor', label: 'Inicio', icon: Home },
  { href: '/vendor/productos', label: 'Productos', icon: Package },
  { href: '/vendor/tiktok', label: 'Live de TikTok', icon: Radio },
  { href: '/vendor/ventas', label: 'Pedidos', icon: Receipt },
  { href: '/vendor/clientes', label: 'Clientes', icon: Users },
  { href: '/vendor/estadisticas', label: 'Estadísticas', icon: ChartNoAxesCombined },
  { href: '/vendor/mensajes', label: 'Mensajes', icon: MessageCircle },
  { href: '/vendor/ofertas', label: 'Promociones', icon: Tag },
  { href: '/vendor/ajustes', label: 'Configuración', icon: Settings },
];
const MOBILE_NAV = [NAV[0], NAV[1], NAV[2], NAV[3], NAV[8]];

function saleText(order: Order) {
  const units = order.items.reduce((s, it) => s + it.quantity, 0);
  return `Vendiste ${units} ${units === 1 ? 'producto' : 'productos'}. Entrega ${describeWindow(order.deliveryAt, order.deliveryWindow)}: el repartidor pasa a recogerlo a esa hora.`;
}

function Welcome({ signedIn, onLogin, onRegister, onLogout }: { signedIn: boolean; onLogin: () => void; onRegister: () => void; onLogout: () => void }) {
  return <div className="flex min-h-dvh items-center justify-center px-4 py-10">
    <div className="vendor-card w-full max-w-[510px] !rounded-[28px] p-7 sm:p-10">
      <Logo suffix="Tu negocio empieza aquí" />
      <span className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#eeebff] px-3 py-1.5 text-xs font-semibold text-[#5b45fa]"><StoreIcon className="h-4 w-4" />Vende en Vitrina Market</span>
      <h1 className="mt-4 text-[34px] font-extrabold leading-[1.15] tracking-tight">Tu tienda.<br /><span className="text-[#5b45fa]">Todo en un solo lugar.</span></h1>
      <p className="mb-7 mt-4 text-[15px] leading-6 text-slate-500">Publica tus productos, recibe pedidos y organiza tus entregas. Nosotros te ayudamos a llegar a más clientes.</p>
      {signedIn && <p className="mb-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">Esta cuenta todavía no tiene una tienda. Puedes registrar la tuya o entrar con otra cuenta.</p>}
      <button type="button" onClick={onRegister} className="btn btn-primary !min-h-14 w-full justify-between !rounded-2xl"><span className="flex items-center gap-3"><Plus className="h-5 w-5" />Registrar mi tienda</span><ArrowRight className="h-5 w-5" /></button>
      <button type="button" onClick={signedIn ? onLogout : onLogin} className="btn btn-ghost !min-h-14 mt-3 w-full justify-between !rounded-2xl"><span className="flex items-center gap-3"><LogOut className="h-5 w-5" />{signedIn ? 'Cambiar de cuenta' : 'Iniciar sesión en mi tienda'}</span><ArrowRight className="h-5 w-5" /></button>
      <p className="mt-6 text-center text-xs text-slate-400">Tu catálogo, tus pedidos y tus ventas de TikTok, conectados.</p>
      <Link href="/" className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600"><ArrowLeft className="h-3.5 w-3.5" />Volver al marketplace</Link>
    </div>
  </div>;
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, requestLogin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [resolved, setResolved] = useState<{ owner: string; store: Store | null } | null>(null);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [unseenSales, setUnseenSales] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const lastCheck = useRef<string>(new Date().toISOString());
  useEffect(() => {
    const closeMenus = (e: KeyboardEvent) => { if (e.key === 'Escape') { setAccountOpen(false); setMobileMenu(false); } };
    document.addEventListener('keydown', closeMenus);
    return () => document.removeEventListener('keydown', closeMenus);
  }, []);
  const userId = user?.id;
  const knownStoreId = user?.storeId;
  const store = resolved?.owner === userId ? resolved?.store : undefined;
  const onboarding = pathname.startsWith('/vendor/onboarding');

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    fetch(`${API_URL}/stores/owner/${encodeURIComponent(userId)}`, { signal: controller.signal, cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error('No pudimos cargar tu tienda. Comprueba tu conexión e inténtalo otra vez.');
        return res.json() as Promise<Store>;
      })
      .then((s) => { if (!controller.signal.aborted) { setResolved({ owner: userId, store: s }); setLoadError(''); } })
      .catch((err: Error) => { if (!controller.signal.aborted) setLoadError(err.message); });
    return () => controller.abort();
  }, [userId, knownStoreId, retry]);

  useEffect(() => { if (store && onboarding) router.replace('/vendor'); }, [store, onboarding, router]);
  const storeId = store?.id;
  useEffect(() => {
    if (!storeId) return;
    lastCheck.current = new Date().toISOString();
    const timer = setTimeout(() => setUnseenSales(0), 0);
    return () => clearTimeout(timer);
  }, [storeId]);
  useEffect(() => {
    if (!storeId) return;
    let alive = true;
    let checking = false;
    const check = async () => {
      if (checking || document.hidden) return;
      checking = true;
      try {
        const fresh = await marketplaceApi.getStoreOrders(storeId, lastCheck.current);
        if (!alive || fresh.length === 0) return;
        lastCheck.current = fresh.reduce((latest, o) => o.createdAt > latest ? o.createdAt : latest, lastCheck.current);
        setUnseenSales((n) => n + fresh.length);
        for (const order of fresh) {
          toast(saleText(order), 'info');
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification('Nueva venta en Vitrina', { body: saleText(order), icon: '/pulpo-icon.png', tag: order.id });
        }
      } catch {} finally { checking = false; }
    };
    const timer = setInterval(check, 20_000);
    return () => { alive = false; clearInterval(timer); };
  }, [storeId, toast]);
  const markSalesSeen = useCallback(() => setUnseenSales(0), []);
  const setStore = useCallback((s: Store) => { if (userId) setResolved({ owner: userId, store: s }); }, [userId]);
  const signOut = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setResolved(null);
      setAccountOpen(false);
      setMobileMenu(false);
      router.replace('/vendor');
      router.refresh();
      toast('Cerraste sesión correctamente');
    } catch { toast('No se pudo cerrar la sesión. Inténtalo otra vez.', 'error'); }
    finally { setLoggingOut(false); }
  };
  const register = () => {
    router.push('/vendor/onboarding');
    if (!user) requestLogin({ title: 'Registra tu tienda', reason: 'Crea tu acceso para guardar tu tienda y administrar tus ventas.', onComplete: () => router.push('/vendor/onboarding') });
  };
  const active = (href: string) => href === '/vendor' ? pathname === href : pathname.startsWith(href);
  const navLink = ({ href, label, icon: Icon }: typeof NAV[number]) => <Link key={href} href={href} onClick={() => setMobileMenu(false)} aria-current={active(href) ? 'page' : undefined} className={`flex min-h-11 items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-medium transition-colors ${active(href) ? 'bg-[#5b3fff] text-white shadow-sm' : 'text-[#252e4c] hover:bg-[#e9e6fa]'}`}><Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} /><span>{label}</span>{href === '/vendor/ventas' && unseenSales > 0 && <span className="ml-auto rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{unseenSales}</span>}</Link>;

  let content;
  if (!ready || (user && store === undefined && !loadError)) content = <div className="mx-auto max-w-7xl space-y-4 p-8"><Bone className="h-14 w-full rounded-2xl" /><PanelSkeleton lines={3} /><ListSkeleton rows={3} /></div>;
  else if (user && loadError) content = <div className="flex min-h-dvh items-center justify-center p-5"><div className="vendor-card max-w-md space-y-4 p-8"><h1 className="text-xl font-bold">No pudimos abrir tu tienda</h1><p role="alert" className="text-sm text-slate-500">{loadError}</p><button className="btn btn-primary" onClick={() => { setLoadError(''); setRetry((n) => n + 1); }}>Reintentar</button><button className="btn btn-ghost ml-2" onClick={signOut} disabled={loggingOut}>Cerrar sesión</button></div></div>;
  else if (!user || (!store && !onboarding)) content = <Welcome signedIn={Boolean(user)} onRegister={register} onLogin={() => requestLogin({ title: 'Entra a tu tienda', reason: 'Usa la misma cuenta con la que registraste tu tienda.' })} onLogout={signOut} />;
  else if (!store) content = children;
  else if (onboarding) content = <div className="mx-auto max-w-7xl p-8"><PanelSkeleton lines={3} /></div>;
  else content = <VendorContext.Provider value={{ store, setStore, unseenSales, markSalesSeen }}>
    <header className="sticky top-0 z-40 flex h-[76px] items-center gap-2 border-b sm:gap-5 border-[#e5e8f1] bg-[#f8f9fc] px-4 sm:px-6">
      <button type="button" className="rounded-xl p-2 lg:hidden" aria-label={mobileMenu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      <div className="vendor-brand lg:w-[214px]"><Logo href="/vendor" suffix="Panel de tienda" /></div>
      <form action="/vendor/productos" role="search" className="relative hidden max-w-[470px] flex-1 md:block"><Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" /><input type="search" name="q" aria-label="Buscar productos de mi tienda" placeholder="Buscar en mis productos..." className="h-11 w-full rounded-2xl border border-[#e9ecf3] bg-[#eff1f7] pl-11 pr-4 text-xs outline-none" /></form>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Link href="/vendor/tiktok" className="hidden items-center gap-2 rounded-2xl bg-[#111b39] px-4 py-2.5 text-xs font-semibold text-white xl:flex"><TikTokIcon className="h-4 w-4" />TikTok Live</Link>
        <Link href={`/en-vivo/${store.slug}`} className="hidden items-center gap-2 rounded-2xl bg-[#edf0f7] px-4 py-2.5 text-xs font-semibold sm:flex"><Eye className="h-4 w-4" />Ver tienda</Link>
        <Link href="/vendor/ventas" aria-label={`${unseenSales} pedidos nuevos`} className="relative hidden rounded-full bg-white p-2.5 sm:block"><Bell className="h-5 w-5" />{unseenSales > 0 && <span className="absolute right-0 top-0 rounded-full bg-rose-500 px-1 text-[9px] text-white">{unseenSales}</span>}</Link>
        <div className="relative">
          <button type="button" aria-label="Menú de mi cuenta" aria-expanded={accountOpen} onClick={() => setAccountOpen(!accountOpen)} className="flex items-center gap-2 rounded-xl p-1.5">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#e9e4ff] text-[#5b45fa]">{store.logo ? <Image unoptimized width={640} height={640} src={mediaUrl(store.logo)} alt="" className="h-full w-full object-cover" /> : <StoreIcon className="h-5 w-5" />}</span><span className="hidden max-w-32 truncate text-xs font-bold xl:block">{store.name}</span><ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
          </button>
          {accountOpen && <><button className="fixed inset-0 z-40 cursor-default" onClick={() => setAccountOpen(false)} aria-label="Cerrar menú de cuenta" /><div className="absolute right-0 top-14 z-50 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl"><p className="truncate px-3 py-2 text-sm font-bold">{user?.name}</p><Link onClick={() => setAccountOpen(false)} href="/vendor/ajustes" className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm hover:bg-slate-50"><Settings className="h-4 w-4" />Configurar tienda</Link><Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Ir al marketplace</Link><button onClick={signOut} disabled={loggingOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm text-red-600 hover:bg-red-50">{loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}Cerrar sesión</button></div></>}
        </div>
      </div>
    </header>
    <div className="flex">
      {mobileMenu && <button className="fixed inset-0 top-[76px] z-30 bg-slate-900/20 lg:hidden" aria-label="Cerrar navegación" onClick={() => setMobileMenu(false)} />}
      <aside className={`${mobileMenu ? 'flex' : 'hidden'} fixed bottom-16 left-0 top-[76px] z-30 w-[238px] flex-col gap-2 overflow-y-auto bg-[#f2f4f9] px-5 pb-7 pt-6 lg:bottom-0 lg:flex`}>
        <nav aria-label="Panel de la tienda" className="flex flex-col gap-2">{NAV.map(navLink)}</nav>
        <div className="mt-auto space-y-3 pt-8"><Link href="/vendor/ayuda" onClick={() => setMobileMenu(false)} className="vendor-card flex items-center gap-3 p-3"><Headphones className="h-5 w-5" /><span className="text-xs"><strong className="block">¿Necesitas ayuda?</strong><span className="text-slate-500">Guía para tu tienda</span></span><ArrowRight className="ml-auto h-3.5 w-3.5" /></Link><button type="button" onClick={signOut} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-white hover:text-red-600">{loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}Cerrar sesión</button></div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:ml-[238px] lg:pb-8">{children}</main>
    </div>
    <nav aria-label="Accesos rápidos de tienda" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-[#e5e8f1] bg-white lg:hidden"><div className="grid grid-cols-5">{MOBILE_NAV.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active(href) ? 'text-[#5b45fa]' : 'text-slate-500'}`}><Icon className="h-5 w-5" />{label === 'Configuración' ? 'Ajustes' : label === 'Live de TikTok' ? 'TikTok' : label}</Link>)}</div></nav>
  </VendorContext.Provider>;
  return <div className="vendor-surface">{content}</div>;
}


