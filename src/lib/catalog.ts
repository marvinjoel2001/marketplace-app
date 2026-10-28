import { API_URL, type Offer, type Product } from './api';

const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

/** Uploaded photos are served by the backend under /uploads; other images are absolute URLs. */
export function mediaUrl(src?: string | null): string {
  if (!src) return '';
  return src.startsWith('/uploads/') ? `${API_ORIGIN}${src}` : src;
}

export function productImages(product: Pick<Product, 'images'>): string[] {
  try {
    const parsed = JSON.parse(product.images || '[]');
    return (Array.isArray(parsed) ? parsed : [parsed]).filter(Boolean).map(String).map(mediaUrl);
  } catch {
    return product.images ? [mediaUrl(product.images)] : [];
  }
}

export function isPromoActive(offer: Offer, now = Date.now()): boolean {
  if (!offer.isFlashSale || !offer.salePrice || offer.salePrice >= offer.price) return false;
  return !offer.flashSaleEnd || new Date(offer.flashSaleEnd).getTime() > now;
}

export function offerPrice(offer: Offer, now = Date.now()): number {
  return isPromoActive(offer, now) ? Number(offer.salePrice) : offer.price;
}

export function discountOf(offer: Offer): number {
  return Math.round((1 - offerPrice(offer) / offer.price) * 100);
}

/** The cheapest active offer; in this marketplace each product usually has one store. */
export function mainOffer(product: Product): Offer | undefined {
  const offers = (product.offers ?? []).filter((o) => o.isActive);
  return offers.sort((a, b) => offerPrice(a) - offerPrice(b))[0];
}

export function promoEndsLabel(end?: string | null): string {
  if (!end) return '';
  const date = new Date(end);
  const hours = (date.getTime() - Date.now()) / 3_600_000;
  if (hours < 1) return 'Termina en minutos';
  if (hours < 24) return `Termina hoy ${date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/La_Paz' })}`;
  return `Hasta el ${date.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', timeZone: 'America/La_Paz' })}`;
}
