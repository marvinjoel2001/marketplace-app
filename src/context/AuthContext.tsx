'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { marketplaceApi } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  phone?: string;
  city?: string;
  zone?: string;
  address?: string;
  addressReference?: string;
  nitOrCi?: string;
  interestProfile?: string;
  activeStoreId?: string;
  activeStoreName?: string;
  activeStoreSlug?: string;
}

export interface ProviderConfigInfo {
  google: { enabled: boolean; clientId: string };
  tiktok: { enabled: boolean; clientKey: string };
  facebook: { enabled: boolean; appId: string };
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isAuthModalOpen: boolean;
  authModalStep: 'login' | 'enrich';
  providersConfig: ProviderConfigInfo | null;
  openAuthModal: (options?: { onComplete?: () => void; initialStep?: 'login' | 'enrich' }) => void;
  closeAuthModal: () => void;
  socialLogin: (
    provider: 'TIKTOK' | 'GOOGLE' | 'FACEBOOK',
    customProfile?: { email?: string; name?: string; avatar?: string }
  ) => Promise<void>;
  emailLogin: (identifier: string, password?: string, name?: string) => Promise<void>;
  enrichProfile: (data: {
    phone: string;
    city?: string;
    zone?: string;
    address: string;
    addressReference?: string;
    nitOrCi?: string;
  }) => Promise<void>;
  setActiveStore: (store: { id: string; name: string; slug?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'vitrina_auth_user';
const STORE_STORAGE_KEY = 'vitrina_active_store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState<'login' | 'enrich'>('login');
  const [onCompleteCallback, setOnCompleteCallback] = useState<(() => void) | null>(null);
  const [providersConfig, setProvidersConfig] = useState<ProviderConfigInfo | null>(null);

  // Cargar usuario persistido y estado de proveedores al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      const storedStore = localStorage.getItem(STORE_STORAGE_KEY);
      if (stored) {
        const parsedUser = JSON.parse(stored);
        if (storedStore && !parsedUser.activeStoreId) {
          try {
            const parsedStore = JSON.parse(storedStore);
            parsedUser.activeStoreId = parsedStore.id;
            parsedUser.activeStoreName = parsedStore.name;
            parsedUser.activeStoreSlug = parsedStore.slug;
          } catch {}
        }
        setUser(parsedUser);
      }
    } catch {}

    // Consultar proveedores activos según las variables de entorno
    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) {
          setProvidersConfig(data.providers);
        }
      })
      .catch(() => {});
  }, []);

  const openAuthModal = useCallback(
    (options?: { onComplete?: () => void; initialStep?: 'login' | 'enrich' }) => {
      setAuthModalStep(options?.initialStep || 'login');
      if (options?.onComplete) {
        setOnCompleteCallback(() => options.onComplete);
      } else {
        setOnCompleteCallback(null);
      }
      setIsAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setOnCompleteCallback(null);
  }, []);

  const setActiveStore = useCallback((store: { id: string; name: string; slug?: string }) => {
    try {
      localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(store));
    } catch {}

    setUser((prev) => {
      if (!prev) {
        const tempUser: UserProfile = {
          id: `usr_${Date.now().toString(36)}`,
          email: `${store.slug || 'tienda'}@vitrinamarket.bo`,
          name: store.name,
          provider: 'DIRECT',
          activeStoreId: store.id,
          activeStoreName: store.name,
          activeStoreSlug: store.slug,
        };
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tempUser));
        } catch {}
        return tempUser;
      }
      const updated = {
        ...prev,
        activeStoreId: store.id,
        activeStoreName: store.name,
        activeStoreSlug: store.slug,
      };
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Login Social con soporte para OAuth real o inicio directo con cuenta elegida
  const socialLogin = async (
    provider: 'TIKTOK' | 'GOOGLE' | 'FACEBOOK',
    customProfile?: { email?: string; name?: string; avatar?: string }
  ) => {
    const isGoogleEnabled = providersConfig?.google.enabled;
    const isTikTokEnabled = providersConfig?.tiktok.enabled;

    // Si las variables de entorno de producción están configuradas y no se pasa perfil directo, redirigir a OAuth
    if (!customProfile) {
      if (provider === 'GOOGLE' && isGoogleEnabled) {
        window.location.href = `/api/auth/oauth/google?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (provider === 'TIKTOK' && isTikTokEnabled) {
        window.location.href = `/api/auth/oauth/tiktok?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
    }

    // Perfiles con identidad real
    const targetEmail = customProfile?.email || (
      provider === 'GOOGLE'
        ? 'marvin.rivera@gmail.com'
        : provider === 'TIKTOK'
        ? 'marvin.tiktok@vitrinamarket.bo'
        : 'marvin.rivera@facebook.com'
    );

    const targetName = customProfile?.name || (
      provider === 'GOOGLE'
        ? 'Marvin Rivera'
        : provider === 'TIKTOK'
        ? '@marvin_bo (TikTok)'
        : 'Marvin Rivera'
    );

    const targetAvatar = customProfile?.avatar || (
      provider === 'GOOGLE'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
        : provider === 'TIKTOK'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    );

    let localInterest = '';
    let localCart = '';
    let localVisitorId = '';
    try {
      localInterest = localStorage.getItem('compraya_interest_profile') || '';
      localCart = localStorage.getItem('compraya_cart') || '';
      localVisitorId = localStorage.getItem('compraya_visitor_id') || '';
    } catch {}

    try {
      // Llamar al endpoint interno de Next.js
      const res = await fetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
          avatar: targetAvatar,
          provider,
          visitorId: localVisitorId,
          interestProfile: localInterest,
          cart: localCart,
        }),
      });

      const response = await res.json();
      if (!res.ok) throw new Error(response.error || 'Error al autenticar');

      const loggedUser = response.user;

      // Mantener activeStoreId si ya existía
      try {
        const storedStore = localStorage.getItem(STORE_STORAGE_KEY);
        if (storedStore) {
          const parsedStore = JSON.parse(storedStore);
          loggedUser.activeStoreId = parsedStore.id;
          loggedUser.activeStoreName = parsedStore.name;
          loggedUser.activeStoreSlug = parsedStore.slug;
        }
      } catch {}

      setUser(loggedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch {}

      // Si se abrió desde un flujo explícito que requiera enriquecimiento (ej. checkout)
      if (authModalStep === 'enrich' && !response.isProfileComplete) {
        setAuthModalStep('enrich');
      } else {
        closeAuthModal();
        if (onCompleteCallback) {
          onCompleteCallback();
        }
      }
    } catch (error: any) {
      console.error('Error en social login:', error);
      throw error;
    }
  };

  // Login Directo con Correo o Teléfono / WhatsApp
  const emailLogin = async (identifier: string, password?: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al autenticar');

      const loggedUser = data.user;

      // Mantener activeStoreId si ya existía
      try {
        const storedStore = localStorage.getItem(STORE_STORAGE_KEY);
        if (storedStore) {
          const parsedStore = JSON.parse(storedStore);
          loggedUser.activeStoreId = parsedStore.id;
          loggedUser.activeStoreName = parsedStore.name;
          loggedUser.activeStoreSlug = parsedStore.slug;
        }
      } catch {}

      setUser(loggedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch {}

      if (authModalStep === 'enrich' && !data.isProfileComplete) {
        setAuthModalStep('enrich');
      } else {
        closeAuthModal();
        if (onCompleteCallback) {
          onCompleteCallback();
        }
      }
    } catch (error: any) {
      console.error('Error en email login:', error);
      throw error;
    }
  };

  // Enriquecimiento de Datos de Entrega y Contacto
  const enrichProfile = async (data: {
    phone: string;
    city?: string;
    zone?: string;
    address: string;
    addressReference?: string;
    nitOrCi?: string;
  }) => {
    if (!user) return;

    try {
      const res = await fetch('/api/auth/enrich-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...data,
        }),
      });

      const response = await res.json();
      const updatedUser = {
        ...user,
        ...data,
      };

      setUser(updatedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch {}

      closeAuthModal();
      if (onCompleteCallback) {
        onCompleteCallback();
      }
    } catch (error: any) {
      console.error('Error en enriquecimiento de perfil:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(STORE_STORAGE_KEY);
    } catch {}
  };

  const isAuthenticated = Boolean(user);
  const isProfileComplete = Boolean(user && user.phone && user.address);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isProfileComplete,
        isAuthModalOpen,
        authModalStep,
        providersConfig,
        openAuthModal,
        closeAuthModal,
        socialLogin,
        emailLogin,
        enrichProfile,
        setActiveStore,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
