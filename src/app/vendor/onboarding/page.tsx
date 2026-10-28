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
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-10 pt-4">
      <div className="flex items-center justify-between">
        <Logo href="/vendor" suffix="Tiendas" />
        <span className="text-sm font-semibold text-muted">
          Paso {step + 1} de {STEPS.length}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span key={s.key} className={`h-1.5 rounded-full ${i <= step ? 'bg-verde' : 'bg-line'}`} />
        ))}
      </div>

      <form onSubmit={next} className="mt-6 flex flex-1 flex-col gap-5">
        <h1 className="type-sign text-2xl font-extrabold">{current.title}</h1>
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
