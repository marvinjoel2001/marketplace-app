export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface TikTokLiveItem {
  username: string;
  room_id: string;
  live_id: string;
  title: string;
  viewer_count: number;
  avatar_url: string | null;
  cover_image_url: string | null;
  /** Signed, short-lived pull URLs for the in-card preview; null when TikTok didn't provide them. */
  stream_hls_url: string | null;
  stream_flv_url: string | null;
  tags: string[];
  category: string;
  is_selling: boolean;
  country_code: string;
  geo_evidence: string;
  source: string;
  store_id: string | null;
  verified_at: string;
  verification_status?: 'fresh' | 'refreshing';
  live_url: string;
  /** Hints derived from the title: city mentioned, price written, WhatsApp number posted. */
  city: string | null;
  price_text: string | null;
  whatsapp_url: string | null;
  sales_score: number;
}

export interface TikTokLivesResponse {
  data: TikTokLiveItem[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
  meta: {
    cache: string;
    worker_enabled: boolean;
    freshness_seconds: number;
    country_code: string;
    retention_seconds?: number;
    active_count?: number;
    refreshing_count?: number;
    status?: 'live' | 'refreshing' | 'searching' | 'disabled';
    server_time?: string;
    /** Cities with lives in the current category, for the filter chips. */
    cities?: { name: string; count: number }[];
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  logo: string;
  description?: string | null;
  category: string;
  phone?: string | null;
  address: string;
  addressReference?: string | null;
  latitude: number;
  longitude: number;
  tiktokUsername?: string | null;
  tiktokLiveUrl?: string | null;
  payoutQr?: string | null;
  bankAccountInfo?: string | null;
  deliveryDays: string;
  deliveryStart: string;
  deliveryEnd: string;
  /** Checkout methods the admin enabled for this store, comma separated. */
  paymentMethods?: string;
  ownerId?: string | null;
  isLiveNow?: boolean;
}

export interface Offer {
  id: string;
  productId: string;
  storeId: string;
  price: number;
  stock: number;
  isActive: boolean;
  salePrice?: number | null;
  discountPercent?: number | null;
  isFlashSale?: boolean;
  flashSaleEnd?: string | null;
  /** What the options are called (Talla, Voltaje, Presentación, ...). Null when there is a single version. */
  variantAxis?: string | null;
  /** JSON array of { label, stock }; parse with parseVariants. */
  variants?: string | null;
  stockCheckedAt?: string;
  store?: Store;
  product?: Product;
}

export interface Variant {
  label: string;
  stock: number;
}

export type Condition = 'NUEVO' | 'SEMINUEVO' | 'USADO';

/** The form pre-filled from a product photo. */
export interface PhotoSuggestion {
  recognized: boolean;
  title: string;
  categoryId: string | null;
  categoryName: string | null;
  audience: string;
  condition: Condition;
  colors: string[];
  description: string;
  details: { name: string; value: string }[];
  variantAxis: string;
  variantOptions: string[];
  bulky: boolean;
  priceRangeBs: { low: number; high: number } | null;
}

export interface ProductInput {
  title: string;
  description?: string;
  basePrice: number;
  categoryId: string;
  storeId: string;
  images: string[];
  stock: number;
  condition?: Condition;
  audience?: string | null;
  bulky?: boolean;
  specifications?: Record<string, string>;
  color?: string;
  variantAxis?: string | null;
  variants?: Variant[] | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string;
  specifications?: string | null;
  color?: string | null;
  condition?: Condition;
  audience?: string | null;
  bulky?: boolean;
  category?: Category;
  offers?: Offer[];
}

export interface OrderItem {
  id: string;
  productTitle: string;
  variant?: string | null;
  storeName: string;
  storeId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productImage?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerReference?: string | null;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: string;
  storeId?: string | null;
  deliveryAt?: string | null;
  deliveryWindow?: string | null;
  dspDriverName?: string | null;
  dspDriverPhone?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface LiveStore {
  store: Pick<Store, 'id' | 'slug' | 'name' | 'logo' | 'tiktokUsername'>;
  title: string;
  viewerCount: number;
  coverImageUrl: string | null;
  liveUrl: string | null;
  startedAt: string | null;
  offers: (Offer & { product: Product })[];
}

export interface FeedComment {
  id: string;
  name: string;
  handle: string | null;
  avatar: string | null;
  text: string;
  at: number;
}

export interface LiveFeed {
  status: 'connecting' | 'live' | 'ended' | 'unavailable';
  viewers: number | null;
  likes: number | null;
  shares: number;
  comments: FeedComment[];
  pins: { id: string; name: string; text: string; at: number }[];
  products: { title: string; price: string | null; image: string | null; url: string | null }[];
}

/** One seller's live room: the TikTok live, the Vitrina store (if registered) and the chat feed. */
export interface LiveRoomData {
  username: string;
  isLive: boolean;
  live: TikTokLiveItem | null;
  store:
    | (Pick<Store, 'id' | 'slug' | 'name' | 'logo' | 'deliveryDays' | 'deliveryStart' | 'deliveryEnd'> & {
        liveTitle: string | null;
        featuredProductIds: string[];
        offers: (Offer & { product: Product })[];
      })
    | null;
  feed: LiveFeed | null;
}

export interface StoreSummary {
  today: { total: number; count: number };
  week: { total: number; count: number };
  month: { total: number; count: number };
  upcoming: Order[];
  products: number;
  activeOffers: number;
}

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      // Fast fallback / cache control for dynamic Next.js data
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Error en la petición' }));
      const message = Array.isArray(err.message) ? err.message[0] : err.message || err.error;
      throw new Error(message || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    const err = error as Error & { cause?: { code?: string } };
    // Suppress repeated verbose connection error logs in dev
    if (err?.cause?.code !== 'ECONNREFUSED') {
      console.warn(`API [${endpoint}] fetch failed:`, err.message);
    }
    throw error;
  }
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});
const id = encodeURIComponent;

export const marketplaceApi = {
  // Products
  async getProducts(params: { category?: string; flashSale?: boolean; q?: string } = {}): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (params.category) query.set('category', params.category);
      if (params.flashSale) query.set('flashSale', 'true');
      if (params.q) query.set('q', params.q);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await fetchFromAPI(`/products${qs}`);
      if (Array.isArray(data)) return data;
    } catch {
      // Backend unreachable: the page shows its empty state
    }
    return [];
  },

  async getProduct(idOrSlug: string): Promise<Product | null> {
    try {
      const data = await fetchFromAPI(`/products/${id(idOrSlug)}`);
      if (data && data.id) return data;
    } catch {
      // Product not found
    }
    return null;
  },

  async createProduct(data: ProductInput): Promise<Product> {
    return fetchFromAPI('/products', json('POST', data));
  },

  async updateProduct(productId: string, data: Partial<Omit<ProductInput, 'storeId' | 'stock' | 'basePrice' | 'variantAxis' | 'variants'>>) {
    return fetchFromAPI(`/products/${id(productId)}`, json('PUT', data));
  },

  async deleteProduct(productId: string) {
    return fetchFromAPI(`/products/${id(productId)}`, json('DELETE'));
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const data = await fetchFromAPI('/categories');
      if (Array.isArray(data)) return data;
    } catch {
      // API not reachable
    }
    return [];
  },

  // Stores
  async getLiveStores(): Promise<LiveStore[]> {
    try {
      const data = await fetchFromAPI('/stores/live');
      if (Array.isArray(data)) return data;
    } catch {
      // API not reachable
    }
    return [];
  },

  // TikTok LIVE discovery. Returns null when the backend is unreachable or rejects the query,
  // so the UI can tell "no lives right now" ({ data: [] }) apart from "could not check".
  async getTikTokLives(params: { category?: string; city?: string; page?: number; limit?: number } = {}): Promise<TikTokLivesResponse | null> {
    try {
      const query = new URLSearchParams();
      if (params.category) query.set('category', params.category);
      if (params.city) query.set('city', params.city);
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await fetchFromAPI(`/tiktok-lives/active${qs}`, { signal: AbortSignal.timeout(8000) });
      if (data && Array.isArray(data.data) && data.pagination && data.meta) return data;
    } catch {
      // API not reachable or invalid filter
    }
    return null;
  },

  async getLiveRoom(username: string): Promise<LiveRoomData | null> {
    try {
      return await fetchFromAPI(`/tiktok-lives/room/${id(username)}`, { signal: AbortSignal.timeout(8000) });
    } catch {
      return null;
    }
  },

  async getLiveFeed(username: string, after?: string): Promise<LiveFeed> {
    const qs = after ? `?after=${id(after)}` : '';
    return fetchFromAPI(`/tiktok-lives/room/${id(username)}/feed${qs}`);
  },

  async getStore(idOrSlug: string): Promise<(Store & { offers: (Offer & { product: Product })[] }) | null> {
    try {
      const data = await fetchFromAPI(`/stores/${id(idOrSlug)}`);
      if (data && data.id) return data;
    } catch {
      // Store not found
    }
    return null;
  },

  async getStoreByOwner(userId: string): Promise<Store | null> {
    try {
      return await fetchFromAPI(`/stores/owner/${id(userId)}`);
    } catch {
      return null;
    }
  },

  async createStore(data: Omit<Partial<Store>, 'bankAccountInfo'> & { ownerId: string; bankAccountInfo?: unknown }): Promise<Store> {
    return fetchFromAPI('/stores', json('POST', data));
  },

  async updateStore(storeId: string, data: Record<string, unknown>): Promise<Store> {
    return fetchFromAPI(`/stores/${id(storeId)}`, json('PATCH', data));
  },

  async getStoreOffers(storeId: string): Promise<(Offer & { product: Product })[]> {
    return fetchFromAPI(`/stores/${id(storeId)}/offers`);
  },

  async updateOffer(storeId: string, offerId: string, data: { price?: number; stock?: number; isActive?: boolean; variantAxis?: string | null; variants?: Variant[] | null }) {
    return fetchFromAPI(`/stores/${id(storeId)}/offers/${id(offerId)}`, json('PATCH', data));
  },

  /** "Vendí una" (change -1) or "Llegaron más" (change > 0), optionally for one option. */
  async adjustStock(storeId: string, offerId: string, data: { change: number; variant?: string }): Promise<Offer & { product: Product }> {
    return fetchFromAPI(`/stores/${id(storeId)}/offers/${id(offerId)}/stock`, json('POST', data));
  },

  /** Answers "¿Sigues teniendo estos?". */
  async confirmStock(storeId: string, offerIds: string[], stillHave: boolean): Promise<{ updated: number }> {
    return fetchFromAPI(`/stores/${id(storeId)}/offers/confirm`, json('POST', { offerIds, stillHave }));
  },

  async photoAiStatus(): Promise<{ enabled: boolean }> {
    return fetchFromAPI('/products/photo-ai/status');
  },

  async analyzePhoto(storeId: string, image: string): Promise<PhotoSuggestion> {
    return fetchFromAPI('/products/photo-ai/analyze', json('POST', { storeId, image }));
  },

  async applyBulkOffer(storeId: string, data: { offerIds: string[]; discountPercent: number; endsAt: string }) {
    return fetchFromAPI(`/stores/${id(storeId)}/offers/bulk`, json('POST', data));
  },

  async endOffers(storeId: string, offerIds: string[]) {
    return fetchFromAPI(`/stores/${id(storeId)}/offers/end`, json('POST', { offerIds }));
  },

  async getStoreOrders(storeId: string, since?: string): Promise<Order[]> {
    const qs = since ? `?since=${id(since)}` : '';
    return fetchFromAPI(`/stores/${id(storeId)}/orders${qs}`);
  },

  async getStoreSummary(storeId: string): Promise<StoreSummary> {
    return fetchFromAPI(`/stores/${id(storeId)}/summary`);
  },

  // Live from the store panel
  async getLiveStreams(storeId: string) {
    try {
      const data = await fetchFromAPI(`/live-streams?storeId=${id(storeId)}`);
      if (Array.isArray(data)) return data;
    } catch {
      // API not reachable
    }
    return [];
  },

  async createLiveStream(data: { storeId: string; title: string; streamerName?: string; featuredProductIds: string[]; tiktokUrl?: string }) {
    return fetchFromAPI('/live-streams', json('POST', data));
  },

  async endLiveStream(streamId: string) {
    return fetchFromAPI(`/live-streams/${id(streamId)}/end`, json('POST'));
  },

  // Orders
  async getOrder(idOrNumber: string): Promise<Order | null> {
    try {
      return await fetchFromAPI(`/orders/${id(idOrNumber)}`);
    } catch {
      return null;
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return await fetchFromAPI(`/orders/user/${id(userId)}`);
    } catch {
      return [];
    }
  },

  async createOrder(data: {
    userId?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    customerAddress: string;
    customerReference?: string;
    customerLat: number;
    customerLng: number;
    paymentMethod: string;
    deliveryAt: string;
    items: { productOfferId: string; quantity: number }[];
  }): Promise<Order> {
    return fetchFromAPI('/orders', json('POST', data));
  },

  async updateOrderStatus(orderId: string, status: string) {
    return fetchFromAPI(`/orders/${id(orderId)}/status`, json('PATCH', { status }));
  },

  async getShippingQuote(data: { pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number; storeId?: string }): Promise<{ price: number; estimatedMinutes: number }> {
    return fetchFromAPI('/dsp/quote', json('POST', data));
  },

  // Photos
  async uploadImage(data: { base64Data: string; fileName?: string; folder?: 'products' | 'stores' }): Promise<{ url: string }> {
    return fetchFromAPI('/upload/image', json('POST', data));
  },

  // Admin Stats
  async getAdminStats() {
    try {
      return await fetchFromAPI('/admin/stats');
    } catch {
      return {
        totalOrders: 0,
        totalSales: 0,
        activeDrivers: 0,
        activeStores: 0,
        liveStreamsNow: 0,
      };
    }
  },

  // Admin Stores Management
  async getAdminStores() {
    return fetchFromAPI('/admin/stores');
  },

  async updateStoreStatus(storeId: string, status: string) {
    return fetchFromAPI(`/admin/stores/${id(storeId)}/status`, json('PATCH', { status }));
  },

  async updateStoreAdmin(storeId: string, data: Record<string, unknown>) {
    return fetchFromAPI(`/admin/stores/${id(storeId)}`, json('PATCH', data));
  },

  async deleteStoreAdmin(storeId: string) {
    return fetchFromAPI(`/admin/stores/${id(storeId)}`, json('DELETE'));
  },

  // Admin Users Management
  async getAdminUsers() {
    return fetchFromAPI('/admin/users');
  },

  async updateUserRole(userId: string, role: string) {
    return fetchFromAPI(`/admin/users/${id(userId)}/role`, json('PATCH', { role }));
  },

  async updateUserStatus(userId: string, status: string) {
    return fetchFromAPI(`/admin/users/${id(userId)}/status`, json('PATCH', { status }));
  },

  async deleteUserAdmin(userId: string) {
    return fetchFromAPI(`/admin/users/${id(userId)}`, json('DELETE'));
  },

  // Admin Orders Management
  async getAdminOrders(params?: { storeId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.storeId) query.set('storeId', params.storeId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchFromAPI(`/admin/orders${qs}`);
  },

  async cancelOrderAdmin(orderId: string, reason?: string) {
    return fetchFromAPI(`/admin/orders/${id(orderId)}/cancel`, json('POST', { reason }));
  },

  // Admin Products Moderation
  async getAdminProducts() {
    return fetchFromAPI('/admin/products');
  },

  async moderateProductAdmin(productId: string, status: string) {
    return fetchFromAPI(`/admin/products/${id(productId)}/moderate`, json('PATCH', { status }));
  },

  async deleteProductAdmin(productId: string) {
    return fetchFromAPI(`/admin/products/${id(productId)}`, json('DELETE'));
  },

  // Admin Payment Configs
  async getPaymentConfigs() {
    return fetchFromAPI('/admin/payment-configs');
  },

  async updatePaymentConfig(key: string, data: Record<string, unknown>) {
    return fetchFromAPI(`/admin/payment-configs/${id(key)}`, json('PUT', data));
  },

  // Account
  async getUser(userId: string) {
    return fetchFromAPI(`/auth/me/${id(userId)}`);
  },
};
