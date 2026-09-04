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
  socialLogin: (provider: 'TIKTOK' | 'GOOGLE' | 'FACEBOOK') => Promise<void>;
  emailLogin: (identifier: string, password?: string) => Promise<void>;
  enrichProfile: (data: {
    phone: string;
    city?: string;
    zone?: string;
    address: string;
    addressReference?: string;
    nitOrCi?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'chiringuito_auth_user';

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
      if (stored) {
        setUser(JSON.parse(stored));
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

  // Login Social en 1 Clic con soporte para variables de entorno reales o modo desarrollo
  const socialLogin = async (provider: 'TIKTOK' | 'GOOGLE' | 'FACEBOOK') => {
    const isGoogleEnabled = providersConfig?.google.enabled;
    const isTikTokEnabled = providersConfig?.tiktok.enabled;

    // Si las variables de entorno de producción están configuradas, redireccionar al OAuth real
    if (provider === 'GOOGLE' && isGoogleEnabled) {
      window.location.href = `/api/auth/oauth/google?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (provider === 'TIKTOK' && isTikTokEnabled) {
      window.location.href = `/api/auth/oauth/tiktok?returnUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    // Perfiles estructurados de demostración / desarrollo seguro
    const mockProfiles = {
      TIKTOK: {
        email: 'marvin.tiktok@chiringuito.bo',
        name: 'Marvin TikTok Live',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      GOOGLE: {
        email: 'marvin.google@gmail.com',
        name: 'Marvin Rivera (Google)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
      FACEBOOK: {
        email: 'marvin.fb@facebook.com',
        name: 'Marvin Rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
    };

    const targetProfile = mockProfiles[provider];

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
          email: targetProfile.email,
          name: targetProfile.name,
          avatar: targetProfile.avatar,
          provider,
          visitorId: localVisitorId,
          interestProfile: localInterest,
          cart: localCart,
        }),
      });

      const response = await res.json();
      if (!res.ok) throw new Error(response.error || 'Error al autenticar');

      const loggedUser = response.user;
      setUser(loggedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch {}

      if (!response.isProfileComplete) {
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
  const emailLogin = async (identifier: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al autenticar');

      const loggedUser = data.user;
      setUser(loggedUser);
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      } catch {}

      if (!data.isProfileComplete) {
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
