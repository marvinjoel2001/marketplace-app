'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role?: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  avatar?: string | null;
  provider: string;
  phone?: string | null;
  address?: string | null;
  addressReference?: string | null;
  lat?: number | null;
  lng?: number | null;
  storeId?: string | null;
}

export interface ProviderConfigInfo {
  google: { enabled: boolean };
  tiktok: { enabled: boolean };
}

export interface SavedAddress {
  address: string;
  addressReference?: string;
  lat: number;
  lng: number;
  phone?: string;
  name?: string;
}

interface LoginRequest {
  title?: string;
  /** Shown at the top of the sheet: why we are asking to sign in. */
  reason?: string;
  onComplete?: (user: UserProfile) => void;
}

interface AuthContextType {
  user: UserProfile | null;
  ready: boolean;
  isAuthenticated: boolean;
  hasAddress: boolean;
  providers: ProviderConfigInfo | null;
  /** True when Google/TikTok buttons fall back to a throwaway account (local development only). */
  demoLogin: boolean;
  loginRequest: LoginRequest | null;
  requestLogin: (request?: LoginRequest) => void;
  closeLogin: () => void;
  loginWithProvider: (provider: 'GOOGLE' | 'TIKTOK') => Promise<void>;
  /** Sends a six-digit code to the number's WhatsApp. `devCode` is only present in local development. */
  requestPhoneCode: (phone: string) => Promise<{ devCode?: string }>;
  verifyPhoneCode: (phone: string, code: string, idToken?: string) => Promise<void>;
  saveAddress: (address: SavedAddress) => Promise<UserProfile>;
  setStoreId: (storeId: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'vitrina_auth_user';

function persist(user: UserProfile | null) {
  try {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  } catch {}
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || 'No se pudo completar la acción');
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [providers, setProviders] = useState<ProviderConfigInfo | null>(null);
  const [demoLogin, setDemoLogin] = useState(false);
  const [loginRequest, setLoginRequest] = useState<LoginRequest | null>(null);
  const requestRef = useRef<LoginRequest | null>(null);

  useEffect(() => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key === USER_STORAGE_KEY && event.newValue === null) {
        setUser(null);
        requestRef.current = null;
        setLoginRequest(null);
      }
    };
    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  useEffect(() => {
    let stored: UserProfile | null = null;
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch {}

    // The cookie session is the source of truth (it also covers returning from Google/TikTok).
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const fresh: UserProfile | null = data.user ?? null;
        setUser(fresh);
        persist(fresh);
      })
      .catch(() => setUser(stored))
      .finally(() => setReady(true));

    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) setProviders(data.providers);
        setDemoLogin(Boolean(data.demo));
      })
      .catch(() => {});
  }, []);

  const finishLogin = useCallback((logged: UserProfile) => {
    setUser(logged);
    persist(logged);
    const request = requestRef.current;
    requestRef.current = null;
    setLoginRequest(null);
    request?.onComplete?.(logged);
  }, []);

  const requestLogin = useCallback((request: LoginRequest = {}) => {
    requestRef.current = request;
    setLoginRequest(request);
  }, []);

  const closeLogin = useCallback(() => {
    requestRef.current = null;
    setLoginRequest(null);
  }, []);

  const loginWithProvider = useCallback(
    async (provider: 'GOOGLE' | 'TIKTOK') => {
      const enabled = provider === 'GOOGLE' ? providers?.google.enabled : providers?.tiktok.enabled;
      if (enabled) {
        const back = window.location.pathname + window.location.search;
        // A full page load: the OAuth route redirects to Google/TikTok.
        const url = new URL(`/api/auth/oauth/${provider.toLowerCase()}`, window.location.origin);
        url.searchParams.set('returnUrl', back);
        window.location.assign(url.href);
        return;
      }
      // Without OAuth keys (local development) sign in with a demo account for that provider.
      const data = await postJson('/api/auth/social-login', {
        provider,
        email: provider === 'GOOGLE' ? 'cliente.demo@gmail.com' : 'cliente.demo@tiktok.vitrina.bo',
        name: provider === 'GOOGLE' ? 'Cliente Google (demo)' : 'Cliente TikTok (demo)',
      });
      finishLogin(data.user);
    },
    [providers, finishLogin],
  );

  const requestPhoneCode = useCallback(async (phone: string) => postJson('/api/auth/otp/request', { phone }), []);

  const verifyPhoneCode = useCallback(
    async (phone: string, code: string, idToken?: string) => {
      const data = await postJson('/api/auth/otp/verify', { phone, code, idToken });
      finishLogin(data.user);
    },
    [finishLogin],
  );

  const saveAddress = useCallback(
    async (address: SavedAddress) => {
      if (!user) throw new Error('Inicia sesión para guardar tu dirección');
      const data = await postJson('/api/auth/enrich-profile', { userId: user.id, ...address });
      const updated: UserProfile = { ...user, ...(data.user ?? address) };
      setUser(updated);
      persist(updated);
      return updated;
    },
    [user],
  );

  const setStoreId = useCallback((storeId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated: UserProfile = { ...prev, storeId, role: 'VENDOR' };
      persist(updated);
      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (!res.ok) throw new Error('No se pudo cerrar sesión. Inténtalo otra vez.');
    requestRef.current = null;
    setLoginRequest(null);
    setUser(null);
    persist(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        isAuthenticated: Boolean(user),
        hasAddress: Boolean(user?.address && user.lat != null && user.lng != null && user.phone),
        providers,
        demoLogin,
        loginRequest,
        requestLogin,
        closeLogin,
        loginWithProvider,
        requestPhoneCode,
        verifyPhoneCode,
        saveAddress,
        setStoreId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
