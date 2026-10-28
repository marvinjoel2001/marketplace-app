'use client';

import React from 'react';
import type { Store } from '@/lib/api';
import { parseDays, WEEKDAYS_SHORT } from '@/lib/schedule';
import { MapPicker, SANTA_CRUZ } from '@/components/shop/MapPicker';
import { ImagePicker } from './ImagePicker';

export const STORE_CATEGORIES = ['Ropa', 'Calzado', 'Accesorios', 'Belleza', 'Electrónica', 'Hogar', 'Juguetes', 'Comida', 'Otros'];
export const BANKS = [
  'Banco Unión',
  'BNB',
  'Banco Mercantil Santa Cruz',
  'Banco de Crédito BCP',
  'Banco Económico',
  'Banco Ganadero',
  'Banco Fassil',
  'BancoSol',
  'Banco FIE',
  'Banco Bisa',
  'Tigo Money',
  'Otro',
];
const HOURS = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`); // 06:00 – 23:00

export interface StoreDraft {
  name: string;
  category: string;
  phone: string;
  logo: string;
  address: string;
  addressReference: string;
  latitude: number;
  longitude: number;
  deliveryDays: number[];
  deliveryStart: string;
  deliveryEnd: string;
  payoutQr: string;
  bank: { bank: string; account: string; holder: string; document: string };
}

export function draftFromStore(store?: Partial<Store> | null): StoreDraft {
  let bank = { bank: '', account: '', holder: '', document: '' };
  try {
    bank = { ...bank, ...JSON.parse(store?.bankAccountInfo || '{}') };
  } catch {}
  return {
    name: store?.name ?? '',
    category: store?.category ?? '',
    phone: (store?.phone ?? '').replace(/\D/g, '').slice(-8),
    logo: store?.logo ?? '',
    address: store?.address ?? '',
    addressReference: store?.addressReference ?? '',
    latitude: store?.latitude ?? SANTA_CRUZ.lat,
    longitude: store?.longitude ?? SANTA_CRUZ.lng,
    deliveryDays: parseDays(store?.deliveryDays ?? '1,2,3,4,5,6'),
    deliveryStart: store?.deliveryStart ?? '09:00',
    deliveryEnd: store?.deliveryEnd ?? '18:00',
    payoutQr: store?.payoutQr ?? '',
    bank,
  };
}

export function draftToPayload(d: StoreDraft) {
  return {
    name: d.name.trim(),
    category: d.category,
    phone: d.phone,
    logo: d.logo,
    address: d.address.trim(),
    addressReference: d.addressReference.trim(),
    latitude: d.latitude,
    longitude: d.longitude,
    deliveryDays: d.deliveryDays.join(','),
    deliveryStart: d.deliveryStart,
    deliveryEnd: d.deliveryEnd,
    payoutQr: d.payoutQr,
    bankAccountInfo: d.bank,
  };
}

type FieldsProps = { draft: StoreDraft; set: (patch: Partial<StoreDraft>) => void };

export function BasicsFields({ draft, set }: FieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="store-name" className="field-label">
          Nombre de la tienda
        </label>
        <input id="store-name" className="field" required maxLength={80} value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ej.: Moda Lupita" />
      </div>
      <div>
        <p className="field-label">¿Qué vendes?</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Rubro de la tienda">
          {STORE_CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={draft.category === c} className="chip" onClick={() => set({ category: c })}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="store-phone" className="field-label">
          Celular de la tienda
        </label>
        <input
          id="store-phone"
          className="field"
          inputMode="numeric"
          maxLength={8}
          value={draft.phone}
          onChange={(e) => set({ phone: e.target.value.replace(/\D/g, '') })}
          placeholder="71234567"
        />
      </div>
      <ImagePicker label="Logo o foto de la tienda (opcional)" value={draft.logo ? [draft.logo] : []} onChange={(urls) => set({ logo: urls[0] ?? '' })} max={1} folder="stores" />
    </div>
  );
}

export function LocationFields({ draft, set }: FieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <MapPicker
        kind="store"
        className="h-80"
        value={{ lat: draft.latitude, lng: draft.longitude }}
        onChange={(p) => set({ latitude: p.lat, longitude: p.lng })}
        onAddress={(a) => !draft.address && set({ address: a })}
      />
      <div>
        <label htmlFor="store-address" className="field-label">
          Dirección
        </label>
        <input id="store-address" className="field" required value={draft.address} onChange={(e) => set({ address: e.target.value })} placeholder="Calle y número" />
      </div>
      <div>
        <label htmlFor="store-ref" className="field-label">
          Referencias para el repartidor
        </label>
        <textarea
          id="store-ref"
          className="field min-h-[76px]"
          maxLength={300}
          value={draft.addressReference}
          onChange={(e) => set({ addressReference: e.target.value })}
          placeholder="Ej.: puesto 14 del pasillo B, al lado de la heladería"
        />
      </div>
    </div>
  );
}

export function ScheduleFields({ draft, set }: FieldsProps) {
  const toggle = (day: number) =>
    set({ deliveryDays: draft.deliveryDays.includes(day) ? draft.deliveryDays.filter((d) => d !== day) : [...draft.deliveryDays, day].sort() });
  const endOptions = HOURS.filter((h) => h > draft.deliveryStart);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">
        Los clientes eligen una hora dentro de este horario y el repartidor pasa a recoger el pedido a esa hora.
      </p>
      <div>
        <p className="field-label">Días que entregas</p>
        <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Días de entrega">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={draft.deliveryDays.includes(d)}
              onClick={() => toggle(d)}
              className="rounded-lg border border-line bg-surface py-2.5 text-sm font-semibold aria-pressed:border-verde aria-pressed:bg-verde aria-pressed:text-white"
            >
              {WEEKDAYS_SHORT[d]}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start" className="field-label">
            Desde
          </label>
          <select
            id="start"
            className="field"
            value={draft.deliveryStart}
            onChange={(e) => {
              const start = e.target.value;
              set({ deliveryStart: start, deliveryEnd: draft.deliveryEnd > start ? draft.deliveryEnd : HOURS[HOURS.indexOf(start) + 1] ?? '23:00' });
            }}
          >
            {HOURS.slice(0, -1).map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="end" className="field-label">
            Hasta
          </label>
          <select id="end" className="field" value={draft.deliveryEnd} onChange={(e) => set({ deliveryEnd: e.target.value })}>
            {endOptions.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function PayoutFields({ draft, set }: FieldsProps) {
  const bank = (patch: Partial<StoreDraft['bank']>) => set({ bank: { ...draft.bank, ...patch } });
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-soft">Aquí te depositamos el dinero de tus ventas. Puedes dejar tu QR, tu cuenta o los dos.</p>
      <ImagePicker label="Tu QR de cobro" value={draft.payoutQr ? [draft.payoutQr] : []} onChange={(urls) => set({ payoutQr: urls[0] ?? '' })} max={1} folder="stores" />
      <div>
        <label htmlFor="bank" className="field-label">
          Banco
        </label>
        <select id="bank" className="field" value={draft.bank.bank} onChange={(e) => bank({ bank: e.target.value })}>
          <option value="">Elige tu banco</option>
          {BANKS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="account" className="field-label">
          Número de cuenta
        </label>
        <input id="account" className="field" inputMode="numeric" value={draft.bank.account} onChange={(e) => bank({ account: e.target.value.replace(/[^\d-]/g, '') })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="holder" className="field-label">
            Titular de la cuenta
          </label>
          <input id="holder" className="field" value={draft.bank.holder} onChange={(e) => bank({ holder: e.target.value })} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="doc" className="field-label">
            Carnet de identidad
          </label>
          <input id="doc" className="field" value={draft.bank.document} onChange={(e) => bank({ document: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

/** Which onboarding steps still block publishing. */
export function missingFor(step: 'basics' | 'location' | 'schedule' | 'payout', d: StoreDraft): string | null {
  if (step === 'basics') return !d.name.trim() ? 'Escribe el nombre de tu tienda.' : !d.category ? 'Elige qué vendes.' : null;
  if (step === 'location') return !d.address.trim() ? 'Escribe la dirección de tu tienda.' : null;
  if (step === 'schedule') return d.deliveryDays.length === 0 ? 'Elige al menos un día de entrega.' : null;
  const hasBank = d.bank.bank && d.bank.account && d.bank.holder;
  return !d.payoutQr && !hasBank ? 'Sube tu QR o completa tu cuenta para recibir tus pagos.' : null;
}
