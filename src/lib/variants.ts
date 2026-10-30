import type { Offer, Variant } from './api';

/** Options stored on an offer (sizes, shoe numbers, voltages, bottle sizes, ...). Empty when it has a single version. */
export function parseVariants(offer: Pick<Offer, 'variants'> | null | undefined): Variant[] {
  if (!offer?.variants) return [];
  try {
    const list = JSON.parse(offer.variants);
    return Array.isArray(list) ? list.filter((v) => v && typeof v.label === 'string').map((v) => ({ label: v.label, stock: Number(v.stock) || 0 })) : [];
  } catch {
    return [];
  }
}

/** Key/value details saved in Product.specifications. */
export function parseDetails(raw: string | null | undefined): { name: string; value: string }[] {
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];
    return Object.entries(obj)
      .filter(([, v]) => typeof v === 'string' || typeof v === 'number')
      .map(([name, value]) => ({ name, value: String(value) }));
  } catch {
    return [];
  }
}

/** Names sellers use for options, from clothing to tools and perfume. */
export const AXIS_SUGGESTIONS = ['Talla', 'Número', 'Edad', 'Color', 'Medida', 'Capacidad', 'Voltaje', 'Presentación', 'Modelo'];

/** Common options for each axis, used when the photo assistant is off. */
export const AXIS_OPTIONS: Record<string, string[]> = {
  Talla: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  Número: ['35', '36', '37', '38', '39', '40', '41', '42', '43'],
  Edad: ['0-3 meses', '3-6 meses', '6-12 meses', '1 año', '2 años', '4 años', '6 años', '8 años', '10 años'],
  Voltaje: ['110 V', '220 V'],
  Presentación: ['30 ml', '50 ml', '100 ml', '200 ml'],
};

export const CONDITIONS = [
  { key: 'NUEVO', label: 'Nuevo' },
  { key: 'SEMINUEVO', label: 'Seminuevo' },
  { key: 'USADO', label: 'Usado' },
] as const;

export const AUDIENCES = ['Mujer', 'Hombre', 'Unisex', 'Niños', 'Bebés', 'Todos'];

/** Days without the seller confirming stock before we ask "¿Sigues teniendo esto?". */
export const STALE_DAYS = 14;

export function isStale(offer: Pick<Offer, 'stockCheckedAt' | 'isActive' | 'stock'>, now = Date.now()) {
  if (!offer.isActive || offer.stock <= 0 || !offer.stockCheckedAt) return false;
  return now - new Date(offer.stockCheckedAt).getTime() > STALE_DAYS * 86_400_000;
}
