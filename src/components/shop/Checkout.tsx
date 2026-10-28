'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Banknote, Loader2, MapPin, QrCode } from 'lucide-react';
import { marketplaceApi, type Store } from '@/lib/api';
import { deliveryDays } from '@/lib/schedule';
import { formatBs } from '@/lib/utils';
import { groupByStore, useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AddressForm } from './AddressForm';

const PAYMENTS = [
  { key: 'CASH_ON_DELIVERY', label: 'Efectivo al recibir', icon: Banknote },
  { key: 'QR_ON_DELIVERY', label: 'QR al recibir', icon: QrCode },
] as const;

function Step({ n, title, children, action }: { n: number; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="panel p-4 sm:p-5" aria-labelledby={`step-${n}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id={`step-${n}`} className="flex items-center gap-2.5 font-bold">
          <span className="type-sign flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm font-extrabold text-white">{n}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Checkout() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { cart, clearStore } = useCart();
  const { user, ready, hasAddress, requestLogin } = useAuth();

  const groups = groupByStore(cart);
  const group = groups.find((g) => g.storeId === params.get('store')) ?? groups[0];

  const [store, setStore] = useState<Store | null>(null);
  const [editingAddress, setEditingAddress] = useState(false);
  const [shipping, setShipping] = useState<number | null>(null);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number]['key']>('CASH_ON_DELIVERY');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const storeId = group?.storeId;
  useEffect(() => {
    if (!storeId) return;
    let active = true;
    marketplaceApi.getStore(storeId).then((s) => active && setStore(s));
    return () => {
      active = false;
    };
  }, [storeId]);

  // Ask to sign in once, as soon as someone reaches checkout without a session.
  const asked = useRef(false);
  const hasItems = Boolean(group);
  useEffect(() => {
    if (ready && !user && hasItems && !asked.current) {
      asked.current = true;
      requestLogin({ reason: 'Para enviarte el pedido necesitamos saber quién eres. Es un paso.' });
    }
  }, [ready, user, hasItems, requestLogin]);

  const lat = user?.lat;
  const lng = user?.lng;
  useEffect(() => {
    if (!store || lat == null || lng == null) return;
    let active = true;
    marketplaceApi
      .getShippingQuote({ pickupLat: store.latitude, pickupLng: store.longitude, dropoffLat: lat, dropoffLng: lng })
      .then((q) => active && setShipping(q.price))
      .catch(() => active && setShipping(null));
    return () => {
      active = false;
    };
  }, [store, lat, lng]);

  const days = useMemo(() => (store ? deliveryDays(store) : []), [store]);
  const day = days.find((d) => d.key === dayKey) ?? days[0];

  if (!group) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <h1 className="type-sign text-2xl font-extrabold">No hay nada para pedir</h1>
        <p className="mt-2 text-muted">Tu carrito está vacío.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Ver productos
        </Link>
      </div>
    );
  }

  const subtotal = group.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const showAddressForm = Boolean(user) && (!hasAddress || editingAddress);

  const placeOrder = async () => {
    if (!user || !slot || user.lat == null || user.lng == null) return;
    setPlacing(true);
    setError('');
    try {
      const order = await marketplaceApi.createOrder({
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone ?? '',
        customerAddress: user.address ?? '',
        customerReference: user.addressReference ?? '',
        customerLat: user.lat,
        customerLng: user.lng,
        paymentMethod: payment,
        deliveryAt: slot,
        items: group.items.map((it) => ({ productOfferId: it.productOfferId, quantity: it.quantity })),
      });
      clearStore(group.storeId);
      toast('Pedido confirmado');
      router.push(`/pedido/${order.orderNumber}`);
    } catch (err) {
      setError((err as Error).message);
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="type-sign text-2xl font-extrabold">Tu pedido</h1>
        <p className="mt-0.5 text-sm text-muted">De {group.storeName}</p>
      </div>

      {!user ? (
        <div className="panel p-5 text-center">
          <p className="font-semibold">Inicia sesión para hacer tu pedido.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => requestLogin({ reason: 'Para enviarte el pedido necesitamos saber quién eres. Es un paso.' })}>
            Iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <Step
            n={1}
            title="¿Dónde lo entregamos?"
            action={
              hasAddress && !editingAddress ? (
                <button type="button" className="text-sm font-semibold text-verde-dark" onClick={() => setEditingAddress(true)}>
                  Cambiar
                </button>
              ) : null
            }
          >
            {showAddressForm ? (
              <AddressForm submitLabel="Usar esta dirección" onSaved={() => setEditingAddress(false)} />
            ) : (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
                <div>
                  <p className="font-semibold">{user.address}</p>
                  {user.addressReference && <p className="text-ink-soft">{user.addressReference}</p>}
                  <p className="mt-1 text-muted">
                    Recibe {user.name}, {user.phone}
                  </p>
                </div>
              </div>
            )}
          </Step>

          <Step n={2} title="¿Cuándo lo quieres?">
            {!store ? (
              <p className="text-sm text-muted">Cargando horarios de la tienda…</p>
            ) : days.length === 0 ? (
              <p className="text-sm text-ink-soft">Esta tienda no tiene horarios libres esta semana.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-ink-soft">
                  {store.name} entrega de {store.deliveryStart} a {store.deliveryEnd}. Elige el día y la hora.
                </p>
                <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Día de entrega">
                  {days.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      className="chip"
                      aria-pressed={d.key === day?.key}
                      onClick={() => {
                        setDayKey(d.key);
                        setSlot(null);
                      }}
                    >
                      {d.title}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Hora de entrega">
                  {day?.slots.map((s) => (
                    <button
                      key={s.at}
                      type="button"
                      aria-pressed={slot === s.at}
                      onClick={() => setSlot(s.at)}
                      className="rounded-xl border border-line bg-surface px-3 py-3 text-sm font-semibold tabular-nums aria-pressed:border-verde aria-pressed:bg-verde-tint aria-pressed:text-verde-dark"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Step>

          <Step n={3} title="¿Cómo pagas?">
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Forma de pago">
              {PAYMENTS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={payment === key}
                  onClick={() => setPayment(key)}
                  className="flex flex-col items-start gap-2 rounded-xl border border-line bg-surface p-3 text-left text-sm font-semibold aria-checked:border-verde aria-checked:bg-verde-tint"
                >
                  <Icon className="h-5 w-5 text-verde" />
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Pagas cuando recibes tu pedido.</p>
          </Step>

          <section className="panel p-4 sm:p-5" aria-label="Resumen">
            <ul className="flex flex-col gap-2 text-sm">
              {group.items.map((it) => (
                <li key={it.productOfferId} className="flex justify-between gap-3">
                  <span className="text-ink-soft">
                    {it.quantity} × {it.productTitle}
                  </span>
                  <span className="tabular-nums">{formatBs(it.unitPrice * it.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-line pt-2">
                <span className="text-ink-soft">Envío</span>
                <span className="tabular-nums">{shipping == null ? (hasAddress ? 'Calculando…' : 'Falta tu dirección') : formatBs(shipping)}</span>
              </li>
              <li className="type-sign flex justify-between gap-3 text-lg font-extrabold">
                <span>Total</span>
                <span className="tabular-nums">{formatBs(subtotal + (shipping ?? 0))}</span>
              </li>
            </ul>
            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <button
              type="button"
              className="btn btn-primary mt-4 w-full"
              disabled={!hasAddress || editingAddress || !slot || placing}
              onClick={placeOrder}
            >
              {placing && <Loader2 className="h-5 w-5 animate-spin" />}
              Confirmar pedido
            </button>
            {(!hasAddress || !slot) && (
              <p className="mt-2 text-center text-xs text-muted">
                {!hasAddress ? 'Guarda tu dirección para continuar.' : 'Elige la hora de entrega para continuar.'}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
