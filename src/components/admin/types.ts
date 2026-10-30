export interface AdminStore {
  id: string;
  name: string;
  slug: string;
  logo: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  tiktokUsername: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  statusReason: string | null;
  createdAt: string;
  products: number;
  paymentMethods: string[];
  rates: { baseFare: number; perKm: number; custom: boolean };
  customCommissionRate: number | null;
  walletBalance: number;
  driverOwed: number;
  owner: { name: string; email: string; phone: string | null; phoneVerified: boolean; provider: string } | null;
  orders: number;
  inProgress: number;
  deliveredOrders: number;
  cancelledOrders: number;
  sales: number;
  commission: number;
  shippingDelivered: number;
  lastOrderAt: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  storeId: string | null;
  storeName: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  deliveryAt: string | null;
  deliveryWindow: string | null;
  createdAt: string;
  recipient: { name: string; phone: string; address: string; reference: string | null; lat: number; lng: number };
  driver: { name: string; phone: string | null } | null;
  items: { title: string; quantity: number; unitPrice: number }[];
}

export interface ShippingRates {
  baseFare: number;
  perKm: number;
  minDistanceKm: number;
}

export const STORE_STATUS: Record<AdminStore['status'], { label: string; tone: 'green' | 'amber' | 'red' }> = {
  ACTIVE: { label: 'Activa', tone: 'green' },
  SUSPENDED: { label: 'Suspendida', tone: 'amber' },
  BANNED: { label: 'Bloqueada', tone: 'red' },
};

/** Stable color per store, so the same store keeps its color on the map and in the calendar. */
const PALETTE = ['#5b45fa', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#64748b'];
export function storeColor(id: string | null | undefined) {
  let h = 0;
  for (const c of id ?? '') h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
