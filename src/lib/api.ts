import {
  MOCK_STORES,
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  getMockStore,
  getMockProduct,
  getMockProducts,
} from './mockData';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Graceful offline/backend-less fallback
    }
    return getMockProducts(params);
  },

  async getProduct(idOrSlug: string) {
    try {
      const data = await fetchFromAPI(`/products/${encodeURIComponent(idOrSlug)}`);
      if (data && data.id) return data;
    } catch {
      // Graceful offline/backend-less fallback
    }
    return getMockProduct(idOrSlug);
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
      // Graceful offline fallback
    }
    return MOCK_CATEGORIES;
  },

  // Stores
  async getStores(params: { isLive?: boolean } = {}) {
    try {
      const query = new URLSearchParams();
      if (params.isLive) query.set('isLive', 'true');
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await fetchFromAPI(`/stores${qs}`);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Graceful offline fallback
    }
    if (params.isLive) {
      return MOCK_STORES.filter((s) => s.isLive);
    }
    return MOCK_STORES;
  },

  async getStore(idOrSlug: string) {
    try {
      const data = await fetchFromAPI(`/stores/${encodeURIComponent(idOrSlug)}`);
      if (data && data.id) return data;
    } catch {
      // Graceful offline fallback
    }
    return getMockStore(idOrSlug);
  },

  async createStore(data: any) {
    return fetchFromAPI('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Live Streams
  async getLiveStreams(storeId?: string) {
    try {
      const query = new URLSearchParams();
      if (storeId) query.set('storeId', storeId);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await fetchFromAPI(`/live-streams${qs}`);
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {
      // Graceful offline fallback
    }
    return MOCK_STORES.filter((s) => s.isLive).flatMap((s) => s.liveStreams || []);
  },

  async createLiveStream(data: any) {
    return fetchFromAPI('/live-streams', {
      method: 'POST',
      body: JSON.stringify(data),
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
        totalOrders: 1284,
        totalSales: 452900,
        activeDrivers: 18,
        activeStores: 42,
        liveStreamsNow: 7,
      };
    }
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
