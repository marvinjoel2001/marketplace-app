'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell, Calendar, CreditCard, KeyRound, LayoutDashboard, Loader2, LogOut, Menu, Package, Radio, Receipt, Settings, ShieldCheck,
  Store, Truck, Users, Wallet, X,
} from 'lucide-react';
import { Logo } from '@/components/shop/Logo';
import { adminFetch } from './ui';

interface Admin {
  username: string;
  mustChangePassword: boolean;
}

const NAV = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/tiendas', label: 'Tiendas', icon: Store },
  { href: '/admin/pedidos', label: 'Pedidos', icon: Receipt },
  { href: '/admin/envios', label: 'Envíos y calendario', icon: Calendar },
  { href: '/admin/pagos', label: 'Pagos pendientes', icon: Wallet },
  { href: '/admin/tarifas', label: 'Tarifas de envío', icon: Truck },
  { href: '/admin/metodos-pago', label: 'Métodos de pago', icon: CreditCard },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/notificaciones', label: 'Notificaciones', icon: Bell },
  { href: '/admin/tiktok', label: 'TikTok', icon: Radio },
  { href: '/admin/ajustes', label: 'Ajustes', icon: Settings },
];
const MOBILE_NAV = [NAV[0], NAV[1], NAV[2], NAV[3], NAV[11]];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Admin | null | undefined>(undefined);
  const [error, setError] = useState('');
  const [menu, setMenu] = useState(false);
  const [unread, setUnread] = useState(0);

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdmin(data.admin);
      setError('');
    } catch (err) {
      setError((err as Error).message || 'No pudimos contactar al servidor');
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSession();
    const expired = () => setAdmin(null);
    window.addEventListener('admin-unauthorized', expired);
    return () => window.removeEventListener('admin-unauthorized', expired);
  }, [loadSession]);

  const ready = Boolean(admin && !admin.mustChangePassword);
  useEffect(() => {
    if (!ready) return;
    const read = () => adminFetch<{ unread: number }>('notifications').then((d) => setUnread(d.unread)).catch(() => {});
    read();
    const timer = setInterval(() => !document.hidden && read(), 60_000);
    return () => clearInterval(timer);
  }, [ready, pathname]);

  const logout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' });
    setAdmin(null);
  };

  if (admin === undefined) return <div className="vendor-surface flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
  if (!admin) return <div className="vendor-surface"><LoginForm onDone={setAdmin} initialError={error} /></div>;
  if (admin.mustChangePassword) return <div className="vendor-surface"><ChangePassword admin={admin} forced onDone={setAdmin} onLogout={logout} /></div>;

  const active = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));

  return (
    <div className="vendor-surface">
      <header className="sticky top-0 z-40 flex h-[76px] items-center gap-2 border-b border-[#e5e8f1] bg-[#f8f9fc] px-4 sm:gap-5 sm:px-6">
        <button type="button" className="rounded-xl p-2 lg:hidden" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu} onClick={() => setMenu(!menu)}>
          {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="lg:w-[214px]"><Logo href="/admin" suffix="Administración" /></div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Link href="/" className="hidden rounded-2xl bg-[#edf0f7] px-4 py-2.5 text-xs font-semibold sm:block">Ver Vitrina</Link>
          <Link href="/admin/notificaciones" aria-label={`${unread} notificaciones nuevas`} className="relative rounded-full bg-white p-2.5">
            <Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{unread > 99 ? '99+' : unread}</span>}
          </Link>
          <span className="hidden items-center gap-2 text-xs font-bold sm:flex"><ShieldCheck className="h-4 w-4 text-[#5b45fa]" />{admin.username}</span>
          <button type="button" onClick={logout} className="flex items-center gap-2 rounded-xl p-2 text-xs font-semibold text-slate-600 hover:bg-white" aria-label="Cerrar sesión">
            <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>
      <div className="flex">
        {menu && <button className="fixed inset-0 top-[76px] z-30 bg-slate-900/20 lg:hidden" aria-label="Cerrar navegación" onClick={() => setMenu(false)} />}
        <aside className={`${menu ? 'flex' : 'hidden'} fixed bottom-16 left-0 top-[76px] z-30 w-[238px] flex-col gap-1 overflow-y-auto bg-[#f2f4f9] px-5 pb-7 pt-6 lg:bottom-0 lg:flex`}>
          <nav aria-label="Panel de administración" className="flex flex-col gap-1.5">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenu(false)} aria-current={active(href) ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3.5 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors ${active(href) ? 'bg-[#5b3fff] text-white shadow-sm' : 'text-[#252e4c] hover:bg-[#e9e6fa]'}`}>
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} /><span>{label}</span>
                {href === '/admin/notificaciones' && unread > 0 && <span className="ml-auto rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{unread}</span>}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:ml-[238px] lg:pb-8">{children}</main>
      </div>
      <nav aria-label="Accesos rápidos" className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-[#e5e8f1] bg-white lg:hidden">
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active(href) ? 'text-[#5b3fff]' : 'text-slate-500'}`}>
              <Icon className="h-5 w-5" />{label.split(' ')[0]}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Shell({ children, title, text }: { children: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-5">
      <div className="vendor-card w-full max-w-md space-y-5 p-8">
        <Logo href="/" suffix="Administración" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{text}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginForm({ onDone, initialError }: { onDone: (a: Admin) => void; initialError: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No pudimos iniciar sesión');
      onDone(data.admin);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Administración de Vitrina" text="Entra con tu usuario de administrador.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="admin-user" className="field-label">Usuario</label>
          <input id="admin-user" className="field" autoComplete="username" autoCapitalize="none" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
        </div>
        <div>
          <label htmlFor="admin-pass" className="field-label">Contraseña</label>
          <input id="admin-pass" className="field" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={busy || !username || !password}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}Entrar
        </button>
      </form>
    </Shell>
  );
}

export function ChangePassword({ admin, forced, onDone, onLogout }: { admin: Admin; forced?: boolean; onDone: (a: Admin) => void; onLogout?: () => void }) {
  const [current, setCurrent] = useState('');
  const [username, setUsername] = useState(admin.username);
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    if (next !== again) return setError('Las dos contraseñas nuevas no coinciden');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: current, newPassword: next, username }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo cambiar la contraseña');
      setCurrent(''); setNext(''); setAgain(''); setSaved(true);
      onDone(data.admin);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const form = (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="cp-user" className="field-label">Usuario</label>
        <input id="cp-user" className="field" autoComplete="username" autoCapitalize="none" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label htmlFor="cp-current" className="field-label">Contraseña actual</label>
        <input id="cp-current" className="field" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} autoFocus />
      </div>
      <div>
        <label htmlFor="cp-new" className="field-label">Contraseña nueva (mínimo 8 caracteres)</label>
        <input id="cp-new" className="field" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
      </div>
      <div>
        <label htmlFor="cp-again" className="field-label">Repite la contraseña nueva</label>
        <input id="cp-again" className="field" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} />
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Listo: tu usuario y contraseña se actualizaron.</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary flex-1" disabled={busy || !current || !next || !again}>
          {busy && <Loader2 className="h-5 w-5 animate-spin" />}Guardar
        </button>
        {forced && onLogout && <button type="button" className="btn btn-ghost" onClick={onLogout}>Salir</button>}
      </div>
    </form>
  );

  if (!forced) return form;
  return (
    <Shell title="Cambia tu contraseña" text="Estás usando la contraseña predeterminada (admin). Elige una propia para poder administrar Vitrina.">
      {form}
    </Shell>
  );
}

