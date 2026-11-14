'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Bike, CalendarClock, Check, Copy, Home, Loader2, MapPin, MessageCircle, Phone, Store as StoreIcon } from 'lucide-react';
import { marketplaceApi, type Tracking, type TrackingStep } from '@/lib/api';
import { commonDays, deliveryDays, describeWindow } from '@/lib/schedule';
import { formatBs } from '@/lib/utils';
import { PAYMENT_LABEL } from '@/lib/orderStatus';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Bone, PanelSkeleton } from './Skeleton';

const PointsMap = dynamic(() => import('@/components/admin/PointsMap').then((m) => m.PointsMap), { ssr: false });

const REFRESH_SECONDS = 20;
const STEP_TEXT: Record<TrackingStep, string> = {
  IN_STORE: 'La tienda prepara tu pedido',
  SEARCHING_DRIVER: 'Esperando a un repartidor',
  DRIVER_TO_STORE: 'El repartidor va a recogerlo',
  PICKED_UP: 'Recogido por el repartidor',
  DELIVERED: 'Recogido por el repartidor',
  CANCELLED: 'Cancelado por la tienda',
};
type Mark = 'done' | 'now' | 'next' | 'off';
const pickedUp = (step: TrackingStep) => step === 'PICKED_UP' || step === 'DELIVERED';

/** One row of the route: a dot that says done, happening now or still to come. */
function RouteStep({ mark, icon: Icon, title, detail, last }: { mark: Mark; icon: React.ElementType; title: string; detail?: string; last?: boolean }) {
  const dot =
    mark === 'done' ? 'bg-verde text-white' : mark === 'now' ? 'bg-ink text-white ring-4 ring-verde-tint' : mark === 'off' ? 'bg-red-50 text-danger' : 'bg-paper text-muted';
  return (
    <li className="flex gap-3" aria-current={mark === 'now' ? 'step' : undefined}>
      <span className="flex flex-col items-center">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${dot}`}>
          {mark === 'done' ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </span>
        {!last && <span className={`my-1 w-0.5 flex-1 ${mark === 'done' ? 'bg-verde' : 'bg-line'}`} />}
      </span>
      <span className={`pb-5 ${mark === 'next' ? 'text-muted' : ''}`}>
        <span className="block font-semibold">{title}</span>
        {detail && <span className="block text-sm text-ink-soft">{detail}</span>}
      </span>
    </li>
  );
}

/** Follow an order (or a purchase from several stores): a map on one side, the route step by step on the other. */
export function TrackingView({ code }: { code: string }) {
  const toast = useToast();
  const { user, requestLogin } = useAuth();
  const [data, setData] = useState<Tracking | null | undefined>(undefined);
  const [changing, setChanging] = useState(false);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [saving, setSaving] = useState('');

  const load = useCallback(() => marketplaceApi.getTracking(code).then(setData), [code]);
  const finished = data ? data.stops.every((s) => s.step === 'DELIVERED' || s.step === 'CANCELLED') : false;
  useEffect(() => {
    void load();
    if (finished) return;
    // Keeps the page current while the order moves; paused in a background tab.
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, REFRESH_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [load, finished]);

  const days = useMemo(
    () => commonDays((data?.stops ?? []).filter((s) => s.store && s.step !== 'CANCELLED').map((s) => deliveryDays(s.store!))),
    [data],
  );

  if (data === undefined) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1.15fr_1fr]" aria-busy="true" aria-label="Cargando seguimiento">
        <Bone className="h-64 w-full rounded-3xl lg:h-[520px]" />
        <div className="space-y-4">
          <PanelSkeleton lines={2} />
          <PanelSkeleton lines={4} />
        </div>
      </div>
    );
  }
  if (data === null) {
    return (
      <div className="mx-auto my-8 max-w-xl panel p-8 text-center">
        <h1 className="type-sign text-2xl font-extrabold">No encontramos este seguimiento</h1>
        <p className="mt-2 text-muted">Revisa que el enlace esté completo, o búscalo en tus pedidos.</p>
        <Link href="/cuenta" className="btn btn-primary mt-6">
          Ver mis pedidos
        </Link>
      </div>
    );
  }

  const open = data.stops.filter((s) => s.step !== 'CANCELLED');
  const allPicked = open.length > 0 && open.every((s) => pickedUp(s.step));
  const delivered = open.length > 0 && open.every((s) => s.step === 'DELIVERED');
  const nowStop = open.find((s) => s.step === 'DRIVER_TO_STORE');
  const day = days.find((d) => d.key === dayKey) ?? days[0];
  const link = typeof window === 'undefined' ? '' : window.location.href;

  const points = [
    ...data.stops
      .filter((s) => s.store)
      .map((s) => ({ id: s.orderNumber, lat: s.store!.latitude, lng: s.store!.longitude, label: s.storeName, detail: STEP_TEXT[s.step], color: pickedUp(s.step) ? '#94a3b8' : '#5b45fa' })),
    { id: 'destino', lat: data.destination.lat, lng: data.destination.lng, label: 'Entrega', detail: data.destination.address, color: '#0e9f6e' },
    ...(data.driver?.position ? [{ id: 'repartidor', lat: data.driver.position.lat, lng: data.driver.position.lng, label: `Repartidor: ${data.driver.name}`, color: '#fe2c55' }] : []),
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast('Enlace copiado');
    } catch {
      toast('No se pudo copiar. Cópialo desde la barra del navegador.', 'error');
    }
  };

  const startChange = () => {
    if (!user) return requestLogin({ reason: 'Inicia sesión con la cuenta que hizo el pedido para cambiar la hora.' });
    setChanging(true);
  };

  const reschedule = async (at: string) => {
    setSaving(at);
    try {
      setData(await marketplaceApi.rescheduleDelivery(code, at));
      setChanging(false);
      toast('Listo, cambiamos la hora de entrega');
    } catch (err) {
      toast((err as Error).message || 'No pudimos cambiar la hora. Inténtalo otra vez.', 'error');
    } finally {
      setSaving('');
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface lg:sticky lg:top-24">
        <PointsMap points={points} className="h-64 lg:h-[520px]" />
        <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#5b45fa]" />Tienda</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0e9f6e]" />Entrega</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#fe2c55]" />Repartidor</span>
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <section className="panel p-5" aria-live="polite">
          <h1 className="type-sign text-2xl font-extrabold leading-tight">{data.headline}</h1>
          {!delivered && open.length > 0 && (
            <p className="mt-3 flex items-start gap-2.5 text-sm">
              <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
              <span>
                <span className="block font-semibold">Llega {describeWindow(data.deliveryAt, data.deliveryWindow)}</span>
                <span className="text-ink-soft">
                  {PAYMENT_LABEL[data.paymentMethod] ?? 'Pago al recibir'}: {formatBs(data.total)}
                  {data.paid && <span className="ml-1.5 font-semibold text-verde-dark">Pagado</span>}
                </span>
              </span>
            </p>
          )}

          {!delivered && open.length > 0 && !changing && (
            data.reschedule.allowed ? (
              <button type="button" className="btn btn-ghost mt-4 w-full sm:w-auto" onClick={startChange}>
                <CalendarClock className="h-4 w-4" />
                Cambiar la hora de entrega
              </button>
            ) : (
              data.reschedule.reason && <p className="mt-3 text-xs text-muted">{data.reschedule.reason}.</p>
            )
          )}

          {changing && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-sm font-semibold">Elige el nuevo día y hora</p>
              {days.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">No hay otros horarios disponibles esta semana.</p>
              ) : (
                <>
                  <div className="scroll-row mt-3" role="group" aria-label="Día de entrega">
                    {days.map((d) => (
                      <button key={d.key} type="button" className="chip" aria-pressed={d.key === day?.key} onClick={() => setDayKey(d.key)}>
                        {d.title}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Hora de entrega">
                    {day?.slots.map((s) => {
                      const current = s.at === data.deliveryAt;
                      return (
                        <button
                          key={s.at}
                          type="button"
                          disabled={current || Boolean(saving)}
                          onClick={() => reschedule(s.at)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-3 text-sm font-semibold tabular-nums disabled:opacity-50"
                        >
                          {saving === s.at && <Loader2 className="h-4 w-4 animate-spin" />}
                          {current ? 'Hora actual' : s.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              <button type="button" className="mt-3 text-sm font-semibold text-ink-soft" onClick={() => setChanging(false)}>
                No cambiar
              </button>
            </div>
          )}
        </section>

        <section className="panel p-5" aria-label="Recorrido del pedido">
          <ol>
            {data.stops.map((s) => (
              <RouteStep
                key={s.orderNumber}
                icon={StoreIcon}
                mark={s.step === 'CANCELLED' ? 'off' : pickedUp(s.step) ? 'done' : s === nowStop || (s.step === 'IN_STORE' && !nowStop) ? 'now' : 'next'}
                title={s.storeName}
                detail={`${STEP_TEXT[s.step]} · ${s.items.map((it) => `${it.quantity} × ${it.title}`).join(', ')}`}
              />
            ))}
            <RouteStep
              icon={Bike}
              mark={delivered ? 'done' : allPicked ? 'now' : 'next'}
              title="En camino a tu dirección"
              detail={data.driver ? `Lo lleva ${data.driver.name}` : undefined}
            />
            <RouteStep icon={Home} mark={delivered ? 'done' : 'next'} title="Entregado" detail={data.destination.address} last />
          </ol>
        </section>

        {data.driver && !delivered && (
          <section className="panel flex items-center gap-3 p-4 text-sm" aria-label="Repartidor">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-tint text-verde-dark">
              <Bike className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{data.driver.name}</span>
              <span className="text-ink-soft">Tu repartidor</span>
            </span>
            {data.driver.phone && (
              <a href={`tel:${data.driver.phone.replace(/\s/g, '')}`} className="btn btn-ghost !min-h-10">
                <Phone className="h-4 w-4" />
                Llamar
              </a>
            )}
          </section>
        )}

        <section className="panel p-4" aria-label="Compartir seguimiento">
          <p className="flex items-start gap-2.5 text-sm">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-verde" />
            <span>
              <span className="block font-semibold">{data.destination.address}</span>
              {data.destination.reference && <span className="text-ink-soft">{data.destination.reference}</span>}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
            <button type="button" className="btn btn-ghost !min-h-10 flex-1" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              Copiar enlace
            </button>
            <a
              className="btn btn-ghost !min-h-10 flex-1"
              href={`https://wa.me/?text=${encodeURIComponent(`Sigue el pedido de Vitrina aquí: ${link}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar por WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
