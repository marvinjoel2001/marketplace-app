'use client';

import React, { useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import { marketplaceApi } from '@/lib/api';
import {
  BasicsFields,
  draftFromStore,
  draftToPayload,
  LocationFields,
  missingFor,
  PayoutFields,
  ScheduleFields,
  type StoreDraft,
} from '@/components/vendor/StoreFields';

const SECTIONS = [
  { key: 'basics', title: 'Tienda', Fields: BasicsFields },
  { key: 'location', title: 'Ubicación', Fields: LocationFields },
  { key: 'schedule', title: 'Horario de entregas', Fields: ScheduleFields },
  { key: 'payout', title: 'Cobros', Fields: PayoutFields },
] as const;

export default function VendorSettingsPage() {
  const { store, setStore } = useVendor();
  const { logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState<(typeof SECTIONS)[number]['key']>('basics');
  const [draft, setDraft] = useState<StoreDraft>(() => draftFromStore(store));
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const signOut = async () => {
    setLoggingOut(true);
    try { await logout(); router.replace('/vendor'); router.refresh(); toast('Cerraste sesión correctamente'); }
    catch (err) { toast((err as Error).message, 'error'); }
    finally { setLoggingOut(false); }
  };

  const set = (patch: Partial<StoreDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const section = SECTIONS.find((s) => s.key === open)!;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = missingFor(section.key, draft);
    if (missing) return toast(missing, 'error');
    setSaving(true);
    try {
      const updated = await marketplaceApi.updateStore(store.id, draftToPayload(draft));
      setStore(updated);
      toast('Cambios guardados');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Configuración de la tienda</h1><p className="mt-2 text-sm text-slate-500">Actualiza tus datos, entregas y formas de cobro.</p></div>
      <nav className="scroll-row -mx-4 px-4" aria-label="Secciones de ajustes">
        {SECTIONS.map((s) => (
          <button key={s.key} type="button" className="chip" aria-pressed={open === s.key} onClick={() => setOpen(s.key)}>
            {s.title}
          </button>
        ))}
      </nav>

      <form onSubmit={save} className="panel flex flex-col gap-5 p-4 sm:p-5">
        <h2 className="font-bold">{section.title}</h2>
        <section.Fields draft={draft} set={set} />
        <button type="submit" className="btn btn-primary w-full" disabled={saving}>
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          Guardar cambios
        </button>
      </form>

      <button type="button" onClick={signOut} disabled={loggingOut} className="btn btn-ghost w-full text-danger">
        {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </div>
  );
}
