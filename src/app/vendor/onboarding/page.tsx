'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { marketplaceApi } from '@/lib/api';
import { Logo } from '@/components/shop/Logo';
import { BasicsFields, draftFromStore, draftToPayload, LocationFields, missingFor, PayoutFields, ScheduleFields, type StoreDraft } from '@/components/vendor/StoreFields';

const STEPS = [
  { key: 'basics', title: 'Crea tu tienda', description: 'Completa la información básica para empezar a vender en Vitrina Market.', Fields: BasicsFields },
  { key: 'location', title: '¿Dónde está tu tienda?', description: 'Ayuda a los clientes y repartidores a encontrarte más fácil.', Fields: LocationFields },
  { key: 'schedule', title: '¿A qué hora entregas?', description: 'Indica los días y horarios en los que puedes entregar tus pedidos al repartidor.', Fields: ScheduleFields },
  { key: 'payout', title: '¿Dónde te pagamos?', description: 'Agrega tu QR o cuenta bancaria para recibir el dinero de tus ventas.', Fields: PayoutFields },
] as const;

export default function VendorOnboardingPage() {
  const router = useRouter();
  const { user, setStoreId } = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<StoreDraft>(() => draftFromStore({ phone: user?.phone ?? '' }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const set = (patch: Partial<StoreDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  const move = (to: number) => { setError(''); setStep(to); requestAnimationFrame(() => heading.current?.focus()); };

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return;
    const missing = missingFor(current.key, draft);
    if (missing) return setError(missing);
    setError('');
    if (!last) return move(step + 1);
    if (!user) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const store = await marketplaceApi.createStore(draftToPayload(draft));
      setStoreId(store.id);
    } catch (err) {
      setError((err as Error).message);
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-3 py-6 sm:py-8">
      <div className="vendor-onboarding">
        <div className="flex items-center justify-between gap-3">
          <Logo href="/vendor" suffix="Marketplace Bolivia" />
          <span className="shrink-0 rounded-xl bg-[#f0f1f8] px-3 py-2 text-xs font-bold" aria-live="polite">Paso {step + 1} de 4</span>
        </div>
        <div className="mb-8 mt-7 grid grid-cols-4 gap-2" aria-label={`Registro completado al ${step * 25}%`}>
          {STEPS.map((s, i) => <span key={s.key} className={`h-1.5 rounded-full ${i <= step ? 'bg-[#6248ff]' : 'bg-[#e9ecf5]'}`} />)}
        </div>
        <form onSubmit={next} className="flex min-h-[650px] flex-col gap-5">
          <div>
            <h1 ref={heading} tabIndex={-1} className="text-[29px] font-extrabold leading-tight tracking-tight outline-none sm:text-[32px]">{current.title}</h1>
            <p className="mt-2 text-[15px] leading-6 text-slate-500">{current.description}</p>
          </div>
          <current.Fields draft={draft} set={set} />
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="mt-auto flex gap-3 pt-3">
            <button type="button" className="btn btn-ghost !h-14 !w-16 !rounded-full" disabled={saving} onClick={() => step > 0 ? move(step - 1) : router.push('/vendor')} aria-label={step > 0 ? 'Paso anterior' : 'Volver'}><ArrowLeft className="h-5 w-5" /></button>
            <button type="submit" className="btn btn-primary !h-14 flex-1 !rounded-full" disabled={saving}>
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}{last ? 'Abrir mi tienda' : 'Continuar'}{!saving && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

