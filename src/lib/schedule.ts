// Mirrors marketplace-backend/src/modules/stores/delivery-schedule.ts: the backend re-checks every window.
const BOLIVIA_OFFSET_MS = 4 * 60 * 60 * 1000;
const MIN_LEAD_MINUTES = 60;
const SLOT_MINUTES = 60;
const BOOKING_DAYS = 7;

export const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export interface DeliverySchedule {
  deliveryDays: string;
  deliveryStart: string;
  deliveryEnd: string;
}

export interface DeliverySlot {
  at: string; // ISO start of the window
  label: string; // "10:00 - 11:00"
}

export interface DeliveryDay {
  key: string; // YYYY-MM-DD in Bolivia
  title: string; // "Hoy", "Mañana", "Jueves 6"
  slots: DeliverySlot[];
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};
const fmt = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export function parseDays(days: string): number[] {
  return days
    .split(',')
    .filter((d) => d.trim() !== '')
    .map(Number)
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
}

/** "Lun a Sáb, 09:00 a 18:00" */
export function describeSchedule(s: DeliverySchedule): string {
  const days = parseDays(s.deliveryDays).sort();
  const consecutive = days.length > 2 && days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  const dayText =
    days.length === 7
      ? 'Todos los días'
      : consecutive
        ? `${WEEKDAYS_SHORT[days[0]]} a ${WEEKDAYS_SHORT[days[days.length - 1]]}`
        : days.map((d) => WEEKDAYS_SHORT[d]).join(', ');
  return `${dayText}, ${s.deliveryStart} a ${s.deliveryEnd}`;
}

/** One-hour windows the store offers over the next week, grouped by day. */
export function deliveryDays(s: DeliverySchedule, now = new Date()): DeliveryDay[] {
  const allowed = parseDays(s.deliveryDays);
  const start = toMinutes(s.deliveryStart);
  const end = toMinutes(s.deliveryEnd);
  const localNow = new Date(now.getTime() - BOLIVIA_OFFSET_MS);
  const out: DeliveryDay[] = [];

  for (let i = 0; i <= BOOKING_DAYS; i++) {
    const day = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate() + i));
    if (!allowed.includes(day.getUTCDay())) continue;
    const slots: DeliverySlot[] = [];
    for (let m = start; m + SLOT_MINUTES <= end; m += SLOT_MINUTES) {
      const at = new Date(day.getTime() + m * 60_000 + BOLIVIA_OFFSET_MS);
      const lead = at.getTime() - now.getTime();
      if (lead < MIN_LEAD_MINUTES * 60_000 || lead > BOOKING_DAYS * 86_400_000) continue;
      slots.push({ at: at.toISOString(), label: `${fmt(m)} - ${fmt(m + SLOT_MINUTES)}` });
    }
    if (slots.length === 0) continue;
    const title = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : `${WEEKDAYS[day.getUTCDay()]} ${day.getUTCDate()}`;
    out.push({ key: day.toISOString().slice(0, 10), title, slots });
  }
  return out;
}

/** "Mañana, 10:00 - 11:00" for a stored window start. */
export function describeWindow(at?: string | null, window?: string | null, now = new Date()): string {
  if (!at) return window ?? '';
  const date = new Date(at);
  const local = new Date(date.getTime() - BOLIVIA_OFFSET_MS);
  const localNow = new Date(now.getTime() - BOLIVIA_OFFSET_MS);
  const dayDiff = Math.round(
    (Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) -
      Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate())) /
      86_400_000,
  );
  const day =
    dayDiff === 0 ? 'Hoy' : dayDiff === 1 ? 'Mañana' : dayDiff === -1 ? 'Ayer' : `${WEEKDAYS[local.getUTCDay()]} ${local.getUTCDate()}`;
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
  return `${day}, ${window ?? `${fmt(minutes)} - ${fmt(minutes + SLOT_MINUTES)}`}`;
}
