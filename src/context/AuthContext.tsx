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

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isAuthModalOpen: boolean;
  authModalStep: 'login' | 'enrich';
  openAuthModal: (options?: { onComplete?: () => void; initialStep?: 'login' | 'enrich' }) => void;
  closeAuthModal: () => void;
  socialLogin: (provider: 'TIKTOK' | 'GOOGLE' | 'FACEBOOK') => Promise<void>;
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

const USER_STORAGE_KEY = 'compraya_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState<'login' | 'enrich'>('login');
  const [onCompleteCallback, setOnCompleteCallback] = useState<(() => void) | null>(null);

  // Cargar usuario persistido al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
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

  // Login Social en 1 Clic con Migración de Carrito e Intereses
  const socialLogin = async (provider: 'TIKTOK' | 'GOOGLE' | 'FACEBOOK') => {
    // Generar datos contextuales de demo realistas según el proveedor
    const mockProfiles = {
      TIKTOK: {
        email: 'marvin.tiktok@bolivia.bo',
        name: 'Marvin TikTok Fan',
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

    // Obtener carrito local e intereses para sincronizarlos (Migración Anónimo -> Autenticado)
    let localInterest = '';
    let localCart = '';
    let localVisitorId = '';
    try {
      localInterest = localStorage.getItem('compraya_interest_profile') || '';
      localCart = localStorage.getItem('compraya_cart') || '';
      localVisitorId = localStorage.getItem('compraya_visitor_id') || '';
    } catch {
      // ignore
    }

    try {
      const response = await marketplaceApi.socialLogin({
        email: targetProfile.email,
        name: targetProfile.name,
        avatar: targetProfile.avatar,
        provider,
        visitorId: localVisitorId,
        interestProfile: localInterest,
        cart: localCart,
      });

      const loggedUser = response.user;
      setUser(loggedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));

      // Si el usuario no tiene teléfono y dirección (enriquecimiento obligatorio), avanzar al paso 2
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
      const response = await marketplaceApi.enrichProfile({
        userId: user.id,
        ...data,
      });

      const updatedUser = response.user;
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

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
    } catch {
      // ignore
    }
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
        openAuthModal,
        closeAuthModal,
        socialLogin,
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
