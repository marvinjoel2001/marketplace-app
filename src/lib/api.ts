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
    console.error(`API Fetch Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const marketplaceApi = {
  // Products
  async getProducts(params: { category?: string; flashSale?: boolean; q?: string; slug?: string } = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.flashSale) query.set('flashSale', 'true');
    if (params.q) query.set('q', params.q);
    if (params.slug) query.set('slug', params.slug);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchFromAPI(`/products${qs}`);
  },

  async getProduct(idOrSlug: string) {
    return fetchFromAPI(`/products/${encodeURIComponent(idOrSlug)}`);
  },

  async createProduct(data: any) {
    return fetchFromAPI('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Categories
  async getCategories() {
    return fetchFromAPI('/categories');
  },

  // Stores
  async getStores(params: { isLive?: boolean } = {}) {
    const query = new URLSearchParams();
    if (params.isLive) query.set('isLive', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchFromAPI(`/stores${qs}`);
  },

  async getStore(idOrSlug: string) {
    return fetchFromAPI(`/stores/${encodeURIComponent(idOrSlug)}`);
  },

  async createStore(data: any) {
    return fetchFromAPI('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Live Streams
  async getLiveStreams(storeId?: string) {
    const query = new URLSearchParams();
    if (storeId) query.set('storeId', storeId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchFromAPI(`/live-streams${qs}`);
  },

  async createLiveStream(data: any) {
    return fetchFromAPI('/live-streams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Orders
  async getOrders(limit: number = 20) {
    return fetchFromAPI(`/orders?limit=${limit}`);
  },

  async getOrder(idOrNumber: string) {
    return fetchFromAPI(`/orders/${encodeURIComponent(idOrNumber)}`);
  },

  async createOrder(data: any) {
    return fetchFromAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // OpenDSP Integration
  async getDSPQuote(data: { pickupLat: number; pickupLng: number; dropoffLat: number; dropoffLng: number }) {
    return fetchFromAPI('/dsp/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin Stats
  async getAdminStats() {
    return fetchFromAPI('/admin/stats');
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
