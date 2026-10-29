'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

/** Calls the backend /admin API through the same-origin proxy (the token lives in an httpOnly cookie). */
export async function adminFetch<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/api/admin/data/${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(rest.headers || {}) },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) window.dispatchEvent(new Event('admin-unauthorized'));
  if (!res.ok) throw new Error(data.error || 'No se pudo completar la acción');
  return data as T;
}

export function useAdminData<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(path));

  const load = useCallback(async () => {
    if (!path) return;
    try {
      setData(await adminFetch<T>(path));
      setError('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    setLoading(Boolean(path));
    // The fetch resolves asynchronously; state is set from its result, not synchronously in the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, path]);

  return { data, error, loading, reload: load };
}

export const bs = (n: number | null | undefined) =>
  `Bs. ${(n ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const dateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/La_Paz' }) : '—';

export const dateOnly = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/La_Paz' }) : '—';

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: 'Pendiente', tone: 'amber' },
  SCHEDULED: { label: 'Programado', tone: 'indigo' },
  CONFIRMED: { label: 'Confirmado', tone: 'indigo' },
  PREPARING: { label: 'Preparando', tone: 'amber' },
  DSP_DISPATCHED: { label: 'Repartidor asignado', tone: 'indigo' },
  IN_TRANSIT: { label: 'En camino', tone: 'indigo' },
  DELIVERED: { label: 'Entregado', tone: 'green' },
  CANCELLED: { label: 'Cancelado', tone: 'red' },
};

export const PAYMENT_LABEL: Record<string, string> = {
  CASH_ON_DELIVERY: 'Efectivo al recibir',
  QR_ON_DELIVERY: 'QR al recibir',
};

export type Tone = 'green' | 'red' | 'amber' | 'indigo' | 'slate';

const TONES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-800',
  indigo: 'bg-indigo-50 text-indigo-700',
  slate: 'bg-slate-100 text-slate-600',
};

export function Badge({ tone = 'slate', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${TONES[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] ?? { label: status, tone: 'slate' as Tone };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, detail, tone }: { label: string; value: React.ReactNode; detail?: string; tone?: Tone }) {
  return (
    <div className="vendor-card p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-extrabold tracking-tight ${tone === 'red' ? 'text-rose-600' : ''}`}>{value}</p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
    </div>
  );
}

export function Card({ title, action, className = '', children }: { title?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`vendor-card p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-16 text-slate-500" role="status">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando…
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="vendor-card flex flex-wrap items-center gap-3 p-5 text-sm text-rose-700">
      {message}
      {onRetry && (
        <button type="button" className="btn btn-ghost !min-h-9 !px-3 text-xs" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="vendor-card p-8 text-center text-sm text-slate-500">{children}</p>;
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Cerrar" onClick={onClose} />
      <div className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Bars for a daily series; the value axis is scaled to the largest bar. */
export function BarChart({ data, valueKey, format }: { data: { date: string; [key: string]: number | string }[]; valueKey: string; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey])));
  const fmt = format ?? ((n: number) => String(n));
  return (
    <div>
      <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Gráfico de barras por día">
        {data.map((d) => {
          const value = Number(d[valueKey]);
          return (
            <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${d.date}: ${fmt(value)}`}>
              <div className="w-full rounded-t-md bg-[#5b45fa]/80 transition-colors group-hover:bg-[#5b45fa]" style={{ height: `${Math.max(value > 0 ? 4 : 1, (value / max) * 100)}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
        <span>{data[0]?.date.slice(5)}</span>
        <span>máx. {fmt(max)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export function whatsappLink(phone: string | null | undefined) {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits.startsWith('591') ? digits : `591${digits}`}` : null;
}
