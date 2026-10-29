'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { marketplaceApi } from '@/lib/api';
import { Logo } from '@/components/shop/Logo';
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

const STEPS = [
  { key: 'basics', title: 'Tu tienda', Fields: BasicsFields },
  { key: 'location', title: '¿Dónde está tu tienda?', Fields: LocationFields },
  { key: 'schedule', title: '¿A qué hora entregas?', Fields: ScheduleFields },
  { key: 'payout', title: '¿Dónde te pagamos?', Fields: PayoutFields },
] as const;

export default function VendorOnboardingPage() {
  const { user, setStoreId } = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<StoreDraft>(() => draftFromStore({ phone: user?.phone ?? '' }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<StoreDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = missingFor(current.key, draft);
    if (missing) return setError(missing);
    setError('');
    if (!last) return setStep(step + 1);
    if (!user) return;
    setSaving(true);
    try {
      const store = await marketplaceApi.createStore({ ...draftToPayload(draft), ownerId: user.id });
      // The panel layout picks the new store up and leaves onboarding.
      setStoreId(store.id);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <Logo href="/vendor" suffix="Registro de tienda" />
        <span className="px-3 py-1 rounded-full bg-white/80 border border-white/80 text-xs font-bold text-slate-600 shadow-2xs shrink-0">
          Paso {step + 1} de {STEPS.length}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s.key} className={`h-1.5 rounded-full ${i <= step ? 'bg-[#5B4DF0]' : 'bg-white/70'}`} />
        ))}
      </div>

      <form
        onSubmit={next}
        className="mt-5 flex flex-1 flex-col gap-5 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 sm:p-8"
      >
        <div>
          <p className="eyebrow mb-1">Paso {step + 1}</p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{current.title}</h1>
        </div>
        <current.Fields draft={draft} set={set} />
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <div className="mt-auto flex gap-3 pt-2">
          {step > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)} aria-label="Paso anterior">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
            {saving && <Loader2 className="h-5 w-5 animate-spin" />}
            {last ? 'Abrir mi tienda' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
}
