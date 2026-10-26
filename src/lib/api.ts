import {
  MOCK_STORES,
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  getMockStore,
  getMockProduct,
  getMockProducts,
} from './mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
      const err = await res.json().catch(() => ({ error: 'Error en la petición' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    // Suppress repeated verbose connection error logs in dev
    if (error?.cause?.code !== 'ECONNREFUSED') {
      console.warn(`API [${endpoint}] fetch failed:`, error.message);
    }
    throw error;
  }
}

export const marketplaceApi = {
  // Products
  async getProducts(params: { category?: string; flashSale?: boolean; q?: string; slug?: string } = {}) {
    try {
      const query = new URLSearchParams();
      if (params.category) query.set('category', params.category);
      if (params.flashSale) query.set('flashSale', 'true');
      if (params.q) query.set('q', params.q);
      if (params.slug) query.set('slug', params.slug);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await fetchFromAPI(`/products${qs}`);
      if (Array.isArray(data)) return data;
    } catch {
      // Graceful offline fallback
    }
    return [];
  },

  async getProduct(idOrSlug: string) {
    try {
      const data = await fetchFromAPI(`/products/${encodeURIComponent(idOrSlug)}`);
      if (data && data.id) return data;
    } catch {
      // Product not found in database
    }
    return null;
  },

  async createProduct(data: any) {
    return fetchFromAPI('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: any) {
    return fetchFromAPI(`/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateProductStock(id: string, data: { storeId: string; stock: number; price?: number }) {
    return fetchFromAPI(`/products/${encodeURIComponent(id)}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return fetchFromAPI(`/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getCategories() {
    try {
      const data = await fetchFromAPI('/categories');
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // API not reachable
    }
    return [];
  },

  // Stores
  async getStores(params: { isLive?: boolean } = {}) {
    try {
      const query = new URLSearchParams();
      if (params.isLive) query.set('isLive', 'true');
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await fetchFromAPI(`/stores${qs}`);
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

  async getStore(idOrSlug: string) {
    try {
      const data = await fetchFromAPI(`/stores/${encodeURIComponent(idOrSlug)}`);
      if (data && data.id) return data;
    } catch {
      // Store not found in database
    }
    return null;
  },

  async createStore(data: any) {
    return fetchFromAPI('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Store Offers & Promotions
  async getStoreOffers(storeId: string) {
    try {
      return await fetchFromAPI(`/stores/${encodeURIComponent(storeId)}/offers`);
    } catch {
      return [];
    }
  },

  async createFlashOffer(storeId: string, data: any) {
    return fetchFromAPI(`/stores/${encodeURIComponent(storeId)}/offers/flash`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleOfferPromo(storeId: string, offerId: string) {
    return fetchFromAPI(`/stores/${encodeURIComponent(storeId)}/offers/${encodeURIComponent(offerId)}/toggle`, {
      method: 'PATCH',
    });
  },

  // Store Coupons
  async getStoreCoupons(storeId: string) {
    try {
      return await fetchFromAPI(`/stores/${encodeURIComponent(storeId)}/coupons`);
    } catch {
      return [];
    }
  },

  async createStoreCoupon(storeId: string, data: any) {
    return fetchFromAPI(`/stores/${encodeURIComponent(storeId)}/coupons`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteStoreCoupon(storeId: string, couponId: string) {
    return fetchFromAPI(`/stores/${encodeURIComponent(storeId)}/coupons/${encodeURIComponent(couponId)}`, {
      method: 'DELETE',
    });
  },

  async validateCoupon(code: string, storeId?: string, amount?: number) {
    const query = new URLSearchParams({ code });
    if (storeId) query.set('storeId', storeId);
    if (amount) query.set('amount', amount.toString());
    return fetchFromAPI(`/stores/coupons/validate?${query.toString()}`);
  },

  // Live Streams
  async getLiveStreams(storeId?: string) {
    try {
      const query = new URLSearchParams();
      if (storeId) query.set('storeId', storeId);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await fetchFromAPI(`/live-streams${qs}`);
      if (Array.isArray(data)) return data;
    } catch {
      // API not reachable
    }
    return [];
  },

  async createLiveStream(data: any) {
    return fetchFromAPI('/live-streams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async startLiveStream(id: string) {
    return fetchFromAPI(`/live-streams/${encodeURIComponent(id)}/start`, {
      method: 'POST',
    });
  },

  async endLiveStream(id: string) {
    return fetchFromAPI(`/live-streams/${encodeURIComponent(id)}/end`, {
      method: 'POST',
    });
  },

  async featureLiveProduct(id: string, productId: string) {
    return fetchFromAPI(`/live-streams/${encodeURIComponent(id)}/feature`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Orders
  async getOrders(limit: number = 20) {
    try {
      return await fetchFromAPI(`/orders?limit=${limit}`);
    } catch {
      return [];
    }
  },

  async getOrder(idOrNumber: string) {
    try {
      return await fetchFromAPI(`/orders/${encodeURIComponent(idOrNumber)}`);
    } catch {
      return null;
    }
  },

  async createOrder(data: any) {
    return fetchFromAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrderStatus(id: string, status: string) {
    return fetchFromAPI(`/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // OpenDSP Integration
  async getDSPQuote(data: { pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number }) {
    return fetchFromAPI('/dsp/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getDSPTracking(token: string) {
    try {
      return await fetchFromAPI(`/dsp/track/${encodeURIComponent(token)}`);
    } catch {
      return null;
    }
  },

  // Caja y Arqueo (Cash Register)
  async openCashShift(data: { storeId: string; cashierName: string; initialCash: number; notes?: string }) {
    return fetchFromAPI('/cash-register/shifts/open', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCurrentCashShift(storeId: string) {
    return fetchFromAPI(`/cash-register/shifts/current/${encodeURIComponent(storeId)}`);
  },

  async addCashMovement(shiftId: string, data: { type: string; amount: number; description: string; referenceId?: string }) {
    return fetchFromAPI(`/cash-register/shifts/${encodeURIComponent(shiftId)}/movements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async closeCashShift(shiftId: string, data: { actualCash: number; notes?: string }) {
    return fetchFromAPI(`/cash-register/shifts/${encodeURIComponent(shiftId)}/close`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Subida de Imágenes (Media Upload)
  async uploadImage(data: { base64Data: string; fileName?: string; folder?: string }) {
    return fetchFromAPI('/upload/image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  async updateStoreStatus(id: string, status: string) {
    return fetchFromAPI(`/admin/stores/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async updateStoreAdmin(id: string, data: any) {
    return fetchFromAPI(`/admin/stores/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteStoreAdmin(id: string) {
    return fetchFromAPI(`/admin/stores/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Admin Users Management
  async getAdminUsers() {
    return fetchFromAPI('/admin/users');
  },

  async updateUserRole(id: string, role: string) {
    return fetchFromAPI(`/admin/users/${encodeURIComponent(id)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async updateUserStatus(id: string, status: string) {
    return fetchFromAPI(`/admin/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteUserAdmin(id: string) {
    return fetchFromAPI(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Admin Orders Management
  async getAdminOrders(params?: { storeId?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.storeId) query.set('storeId', params.storeId);
    if (params?.status) query.set('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchFromAPI(`/admin/orders${qs}`);
  },

  async cancelOrderAdmin(id: string, reason?: string) {
    return fetchFromAPI(`/admin/orders/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Admin Products Moderation
  async getAdminProducts() {
    return fetchFromAPI('/admin/products');
  },

  async moderateProductAdmin(id: string, status: string) {
    return fetchFromAPI(`/admin/products/${encodeURIComponent(id)}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteProductAdmin(id: string) {
    return fetchFromAPI(`/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // Admin Payment Configs
  async getPaymentConfigs() {
    return fetchFromAPI('/admin/payment-configs');
  },

  async updatePaymentConfig(key: string, data: any) {
    return fetchFromAPI(`/admin/payment-configs/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Auth & Progressive Profiling
  async socialLogin(data: {
    email: string;
    name: string;
    avatar?: string;
    provider?: string;
    visitorId?: string;
    interestProfile?: string;
    cart?: string;
  }) {
    return fetchFromAPI('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async enrichProfile(data: {
    userId: string;
    phone: string;
    city?: string;
    zone?: string;
    address: string;
    addressReference?: string;
    nitOrCi?: string;
  }) {
    return fetchFromAPI('/auth/enrich-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async syncInterests(data: {
    userId: string;
    interestProfile: string;
    cart?: string;
  }) {
    return fetchFromAPI('/auth/sync-interests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getUser(id: string) {
    return fetchFromAPI(`/auth/me/${encodeURIComponent(id)}`);
  },
};
