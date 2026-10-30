import { marketplaceApi, type Condition, type Offer, type PhotoSuggestion, type Product, type ProductInput, type Variant } from '@/lib/api';
import { parseDetails, parseVariants } from '@/lib/variants';
import { compressPhoto } from '../ImagePicker';

export type QtyMode = 'one' | 'many' | 'options';
export type AiState = 'off' | 'working' | 'done' | 'failed' | 'unrecognized';

/** Fields the photo assistant can fill; each one shows "Sugerido" until the seller edits it. */
export type SuggestedField = 'title' | 'categoryId' | 'audience' | 'condition' | 'colors' | 'description' | 'details' | 'variants' | 'price' | 'bulky';

/** A product being prepared in the upload sheet, before it is published. */
export interface Draft {
  key: string;
  /** Local preview of the first photo, shown while it uploads. */
  preview: string;
  images: string[];
  uploading: number;
  uploadError: string;
  ai: AiState;
  aiError: string;
  suggested: SuggestedField[];
  title: string;
  categoryId: string;
  audience: string;
  condition: Condition;
  colors: string[];
  description: string;
  details: { name: string; value: string }[];
  qtyMode: QtyMode;
  quantity: number;
  variantAxis: string;
  variantOptions: string[];
  variants: Variant[];
  price: string;
  priceRange: { low: number; high: number } | null;
  bulky: boolean;
}

let counter = 0;

export function emptyDraft(preview = ''): Draft {
  counter += 1;
  return {
    key: `d${Date.now().toString(36)}${counter}`,
    preview,
    images: [],
    uploading: 0,
    uploadError: '',
    ai: 'off',
    aiError: '',
    suggested: [],
    title: '',
    categoryId: '',
    audience: '',
    condition: 'NUEVO',
    colors: [],
    description: '',
    details: [],
    qtyMode: 'one',
    quantity: 1,
    variantAxis: '',
    variantOptions: [],
    variants: [],
    price: '',
    priceRange: null,
    bulky: false,
  };
}

/** Same product with another photo: keeps everything but the photos and the stock answers. */
export function duplicateDraft(source: Draft, preview: string): Draft {
  return { ...source, key: emptyDraft().key, preview, images: [], uploading: 0, uploadError: '', ai: 'off', aiError: '', suggested: [], variants: source.variants.map((v) => ({ ...v, stock: v.stock > 0 ? 1 : 0 })) };
}

export function draftFromOffer(offer: Offer & { product: Product }): Draft {
  const product = offer.product;
  let images: string[] = [];
  try {
    const list = JSON.parse(product.images || '[]');
    images = Array.isArray(list) ? list : [];
  } catch {}
  const variants = parseVariants(offer);
  return {
    ...emptyDraft(),
    images,
    title: product.title,
    categoryId: product.category?.id ?? '',
    audience: product.audience ?? '',
    condition: product.condition ?? 'NUEVO',
    colors: (product.color || '').split(',').map((c) => c.trim()).filter(Boolean),
    description: product.description ?? '',
    details: parseDetails(product.specifications),
    qtyMode: variants.length ? 'options' : offer.stock === 1 ? 'one' : 'many',
    quantity: Math.max(offer.stock, 0),
    variantAxis: offer.variantAxis ?? '',
    variants,
    price: String(offer.price),
    bulky: Boolean(product.bulky),
  };
}

/** Fills the empty fields from the photo; anything the seller already typed stays. */
export function applySuggestion(d: Draft, s: PhotoSuggestion): Draft {
  if (!s.recognized) return { ...d, ai: 'unrecognized' };
  const suggested = new Set<SuggestedField>(d.suggested);
  const next: Draft = { ...d, ai: 'done', priceRange: s.priceRangeBs };
  const fill = <K extends keyof Draft>(field: K & SuggestedField, value: Draft[K], isEmpty: boolean) => {
    if (!isEmpty) return;
    (next as unknown as Record<string, unknown>)[field] = value;
    suggested.add(field);
  };
  fill('title', s.title, !d.title.trim() && Boolean(s.title));
  fill('categoryId', s.categoryId ?? '', !d.categoryId && Boolean(s.categoryId));
  fill('audience', s.audience, !d.audience && Boolean(s.audience));
  fill('condition', s.condition, !d.suggested.includes('condition') && d.condition === 'NUEVO' && s.condition !== 'NUEVO');
  fill('colors', s.colors, d.colors.length === 0 && s.colors.length > 0);
  fill('description', s.description, !d.description.trim() && Boolean(s.description));
  fill('details', s.details, d.details.length === 0 && s.details.length > 0);
  fill('bulky', s.bulky, !d.bulky && s.bulky);
  if (s.variantAxis && !d.variantAxis) {
    next.variantAxis = s.variantAxis;
    next.variantOptions = s.variantOptions;
    suggested.add('variants');
  }
  if (s.priceRangeBs) suggested.add('price');
  next.suggested = [...suggested];
  return next;
}

/** The seller changed a field: it no longer counts as a suggestion. */
export function touch(d: Draft, field: SuggestedField): SuggestedField[] {
  return d.suggested.filter((f) => f !== field);
}

export function stockOf(d: Draft) {
  if (d.qtyMode === 'options') return d.variants.reduce((sum, v) => sum + v.stock, 0);
  return d.qtyMode === 'one' ? 1 : d.quantity;
}

export function priceOf(d: Draft) {
  return Number(d.price.replace(',', '.'));
}

/** What still blocks publishing, in the order the seller should fix it. Null when it is ready. */
export function problem(d: Draft): string | null {
  if (d.uploading > 0) return 'Espera a que terminen de subir las fotos';
  if (d.images.length === 0) return 'Agrega al menos una foto';
  if (!d.title.trim()) return 'Escribe el nombre del producto';
  if (!(priceOf(d) > 0)) return 'Escribe el precio';
  if (d.qtyMode === 'options') {
    if (!d.variantAxis.trim()) return 'Escribe cómo se llaman las opciones (por ejemplo Talla)';
    if (d.variants.length === 0) return `Agrega al menos una opción de ${d.variantAxis.toLowerCase()}`;
  } else if (!Number.isInteger(d.quantity) || d.quantity < 0) {
    return 'Revisa la cantidad';
  }
  return null;
}

export function toInput(d: Draft, storeId: string, fallbackCategory: string): ProductInput {
  const options = d.qtyMode === 'options';
  return {
    title: d.title.trim(),
    description: d.description.trim(),
    basePrice: priceOf(d),
    categoryId: d.categoryId || fallbackCategory,
    storeId,
    images: d.images,
    stock: stockOf(d),
    condition: d.condition,
    audience: d.audience || null,
    bulky: d.bulky,
    color: d.colors.join(', '),
    specifications: Object.fromEntries(d.details.filter((x) => x.name.trim() && x.value.trim()).map((x) => [x.name.trim(), x.value.trim()])),
    variantAxis: options ? d.variantAxis.trim() : null,
    variants: options ? d.variants : null,
  };
}

/** Rounded price chips around the usual range, e.g. 80 · 100 · 120. */
export function priceChips(range: { low: number; high: number } | null): number[] {
  if (!range) return [];
  const step = range.high >= 500 ? 50 : range.high >= 100 ? 10 : 5;
  const round = (n: number) => Math.max(step, Math.round(n / step) * step);
  return [...new Set([round(range.low), round((range.low + range.high) / 2), round(range.high)])];
}

/**
 * Uploads the photo and, when the assistant is on, reads it at the same time.
 * `update` receives functional updates so concurrent drafts never overwrite each other.
 */
export async function processPhoto(
  file: File,
  draftKey: string,
  storeId: string,
  ai: boolean,
  update: (key: string, fn: (d: Draft) => Draft) => void,
) {
  const image = await compressPhoto(file);
  update(draftKey, (d) => ({ ...d, preview: d.preview || image, uploading: d.uploading + 1, ai: ai ? 'working' : d.ai }));
  const upload = marketplaceApi
    .uploadImage({ base64Data: image, fileName: 'foto.jpg', folder: 'products' })
    .then(({ url }) => update(draftKey, (d) => ({ ...d, images: [...d.images, url], uploading: d.uploading - 1 })))
    .catch((err: Error) => update(draftKey, (d) => ({ ...d, uploading: d.uploading - 1, uploadError: err.message || 'La foto no se pudo subir' })));
  const analysis = ai
    ? marketplaceApi
        .analyzePhoto(storeId, image)
        .then((s) => update(draftKey, (d) => applySuggestion(d, s)))
        .catch((err: Error) => update(draftKey, (d) => ({ ...d, ai: 'failed', aiError: err.message })))
    : Promise.resolve();
  await Promise.all([upload, analysis]);
}

/** Adds another photo of the same product (no analysis: the form is already filled). */
export async function addPhoto(file: File, draftKey: string, update: (key: string, fn: (d: Draft) => Draft) => void) {
  const image = await compressPhoto(file);
  update(draftKey, (d) => ({ ...d, preview: d.preview || image, uploading: d.uploading + 1 }));
  try {
    const { url } = await marketplaceApi.uploadImage({ base64Data: image, fileName: 'foto.jpg', folder: 'products' });
    update(draftKey, (d) => ({ ...d, images: [...d.images, url], uploading: d.uploading - 1 }));
  } catch (err) {
    update(draftKey, (d) => ({ ...d, uploading: d.uploading - 1, uploadError: (err as Error).message || 'La foto no se pudo subir' }));
  }
}
