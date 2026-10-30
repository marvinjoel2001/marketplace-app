'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { CalendarDays, ChevronLeft, ChevronRight, Map as MapIcon } from 'lucide-react';
import { ErrorBox, Loading, Modal, PageHeader, StatusBadge, bs, useAdminData } from '@/components/admin/ui';
import { AdminOrder, storeColor } from '@/components/admin/types';
import { OrderCard } from '@/components/admin/OrderCard';

const PointsMap = dynamic(() => import('@/components/admin/PointsMap').then((m) => m.PointsMap), { ssr: false });

type Shipment = AdminOrder & { pickup: { id: string; name: string; latitude: number; longitude: number; address: string } | null };

const TZ = 'America/La_Paz';
const DAY_MS = 86_400_000;
const FIRST_HOUR = 6;
const LAST_HOUR = 23;

/** "2026-10-29" for a date in Bolivia. */
const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: TZ });
const hourIn = (d: Date) => Number(d.toLocaleString('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: TZ }));

/** Monday 00:00 (Bolivia, UTC-4 all year) of the week that contains `ref`. */
function weekStart(ref: Date) {
  const local = new Date(`${dayKey(ref)}T00:00:00-04:00`);
  const weekday = (new Date(`${dayKey(ref)}T12:00:00-04:00`).getUTCDay() + 6) % 7;
  return new Date(local.getTime() - weekday * DAY_MS);
}

export default function AdminShipmentsPage() {
  const [start, setStart] = useState(() => weekStart(new Date()));
  const [view, setView] = useState<'calendar' | 'map'>('calendar');
  const [open, setOpen] = useState<Shipment[] | null>(null);
  const end = new Date(start.getTime() + 7 * DAY_MS);
  const { data, error, loading, reload } = useAdminData<{ shipments: Shipment[] }>(`shipments?from=${start.toISOString()}&to=${end.toISOString()}`);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * DAY_MS)), [start]);
  const grid = useMemo(() => {
    const cells = new Map<string, Shipment[]>();
    for (const s of data?.shipments ?? []) {
      if (!s.deliveryAt) continue;
      const at = new Date(s.deliveryAt);
      const hour = Math.min(LAST_HOUR, Math.max(FIRST_HOUR, hourIn(at)));
      const key = `${dayKey(at)}|${hour}`;
      cells.set(key, [...(cells.get(key) ?? []), s]);
    }
    return cells;
  }, [data]);

  const shipments = data?.shipments ?? [];
  const stores = [...new Map(shipments.map((s) => [s.storeId, s.storeName])).entries()];
  const today = dayKey(new Date());
  const range = `${days[0].toLocaleDateString('es-BO', { day: 'numeric', month: 'short', timeZone: TZ })} – ${days[6].toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ })}`;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        title="Envíos y calendario"
        subtitle="Qué día y a qué hora sale cada entrega. Toca un bloque para ver el pedido y cambiar su estado."
        actions={
          <>
            <button type="button" className="btn btn-ghost !min-h-10 !px-3" aria-label="Semana anterior" onClick={() => setStart(new Date(start.getTime() - 7 * DAY_MS))}><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" className="btn btn-ghost !min-h-10 text-xs" onClick={() => setStart(weekStart(new Date()))}>Esta semana</button>
            <button type="button" className="btn btn-ghost !min-h-10 !px-3" aria-label="Semana siguiente" onClick={() => setStart(new Date(start.getTime() + 7 * DAY_MS))}><ChevronRight className="h-4 w-4" /></button>
            <div className="flex rounded-xl bg-white p-1" role="group" aria-label="Vista">
              <button type="button" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${view === 'calendar' ? 'bg-[#5b45fa] text-white' : ''}`}><CalendarDays className="h-4 w-4" />Calendario</button>
              <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${view === 'map' ? 'bg-[#5b45fa] text-white' : ''}`}><MapIcon className="h-4 w-4" />Mapa</button>
            </div>
          </>
        }
      />
      <p className="text-sm font-semibold">{range} · {shipments.length} entregas · {bs(shipments.reduce((s, o) => s + o.shippingFee, 0))} en envíos</p>

      {stores.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs">
          {stores.map(([id, name]) => <span key={id ?? 'none'} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: storeColor(id) }} />{name}</span>)}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : view === 'map' ? (
        <PointsMap
          className="h-[560px]"
          points={shipments.map((s) => ({
            id: s.id,
            lat: s.recipient.lat,
            lng: s.recipient.lng,
            label: `${s.orderNumber} · ${s.recipient.name}`,
            detail: `${s.storeName} · ${s.deliveryAt ? new Date(s.deliveryAt).toLocaleString('es-BO', { weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ }) : ''}`,
            color: storeColor(s.storeId),
          }))}
        />
      ) : (
        <div className="vendor-card overflow-x-auto p-2">
          <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="w-14" />
                {days.map((d) => (
                  <th key={d.toISOString()} className={`rounded-lg py-2 font-semibold ${dayKey(d) === today ? 'bg-[#5b45fa] text-white' : 'bg-[#f2f4f9]'}`}>
                    {d.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', timeZone: TZ })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i).map((hour) => (
                <tr key={hour}>
                  <td className="pr-1 text-right align-top text-[11px] text-slate-400">{String(hour).padStart(2, '0')}:00</td>
                  {days.map((d) => {
                    const items = grid.get(`${dayKey(d)}|${hour}`) ?? [];
                    return (
                      <td key={d.toISOString()} className="h-11 rounded-md bg-[#fafbfd] align-top">
                        {items.length > 0 && (
                          <button type="button" onClick={() => setOpen(items)} className="w-full space-y-0.5 text-left" aria-label={`${items.length} entregas a las ${hour}:00`}>
                            {items.slice(0, 2).map((s) => (
                              <span key={s.id} className="block truncate rounded-md px-1.5 py-1 font-semibold text-white" style={{ background: storeColor(s.storeId), opacity: s.status === 'DELIVERED' ? 0.55 : 1 }}>
                                {s.storeName} → {s.recipient.name}
                              </span>
                            ))}
                            {items.length > 2 && <span className="block px-1 text-[10px] font-semibold text-slate-500">+{items.length - 2} más</span>}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title={`${open.length} ${open.length === 1 ? 'entrega' : 'entregas'}`} onClose={() => setOpen(null)} wide>
          <div className="space-y-3">
            {open.map((s) => (
              <div key={s.id} className="space-y-2">
                {s.pickup && <p className="text-xs text-slate-500">Recojo en {s.pickup.name}: {s.pickup.address} · <StatusBadge status={s.status} /></p>}
                <OrderCard order={s} compact onChanged={() => { setOpen(null); reload(); }} />
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
