'use client';

import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth, type UserProfile } from '@/context/AuthContext';
import { MapPicker, type LatLng } from './MapPicker';

/** Delivery address picked on the map, plus references for the driver. Saved to the account. */
export function AddressForm({ onSaved, submitLabel = 'Guardar dirección' }: { onSaved: (user: UserProfile) => void; submitLabel?: string }) {
  const { user, saveAddress } = useAuth();
  const [pos, setPos] = useState<LatLng | null>(user?.lat != null && user?.lng != null ? { lat: user.lat, lng: user.lng } : null);
  const [address, setAddress] = useState(user?.address ?? '');
  const [reference, setReference] = useState(user?.addressReference ?? '');
  const [phone, setPhone] = useState((user?.phone ?? '').replace(/\D/g, '').slice(-8));
  const [name, setName] = useState(user?.name && !/^Cliente /.test(user.name) ? user.name : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // The map suggests a street name until the person writes their own.
  const typed = useRef(Boolean(user?.address));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pos) return setError('Mueve el mapa hasta tu dirección.');
    setSaving(true);
    setError('');
    try {
      const saved = await saveAddress({
        lat: pos.lat,
        lng: pos.lng,
        address: address.trim(),
        addressReference: reference.trim(),
        phone,
        name: name.trim() || undefined,
      });
      onSaved(saved);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <MapPicker
        value={pos}
        onChange={setPos}
        onAddress={(suggested) => {
          if (!typed.current) setAddress(suggested);
        }}
      />
      <div>
        <label htmlFor="addr" className="field-label">
          Dirección
        </label>
        <input
          id="addr"
          className="field"
          required
          value={address}
          onChange={(e) => {
            typed.current = true;
            setAddress(e.target.value);
          }}
          placeholder="Calle y número"
          autoComplete="street-address"
        />
      </div>
      <div>
        <label htmlFor="ref" className="field-label">
          Referencias para encontrarte
        </label>
        <textarea
          id="ref"
          className="field min-h-[76px]"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ej.: portón negro, frente a la farmacia, 2do piso"
          maxLength={300}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            ¿A nombre de quién?
          </label>
          <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Celular para el repartidor
          </label>
          <input
            id="phone"
            className="field"
            inputMode="numeric"
            maxLength={8}
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            placeholder="71234567"
            autoComplete="tel-national"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={saving}>
        {saving && <Loader2 className="h-5 w-5 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
