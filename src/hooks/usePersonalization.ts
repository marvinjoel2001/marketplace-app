'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface SearchKeywordItem {
  keyword: string;
  timestamp: number;
}

export interface ViewedProductItem {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  basePrice: number;
  image: string;
  storeName: string;
  timestamp: number;
}

export interface InterestProfile {
  visitorId: string;
  recentCategories: Record<string, number>;
  searchKeywords: SearchKeywordItem[];
  priceAffinity: {
    min: number;
    max: number;
    avg: number;
    count: number;
  };
  recentlyViewed: ViewedProductItem[];
  liveInteractions: Array<{ streamId: string; storeSlug: string; timestamp: number }>;
}

const STORAGE_KEY = 'compraya_interest_profile';

const DEFAULT_PROFILE: InterestProfile = {
  visitorId: '',
  recentCategories: {},
  searchKeywords: [],
  priceAffinity: { min: 0, max: 0, avg: 0, count: 0 },
  recentlyViewed: [],
  liveInteractions: [],
};

// Mapeo semántico para inferir categorías desde palabras clave de búsqueda
const KEYWORD_CATEGORY_MAP: Record<string, string> = {
  audifonos: 'electronica-y-tecnologia',
  auriculares: 'electronica-y-tecnologia',
  earbuds: 'electronica-y-tecnologia',
  chompa: 'moda-y-accesorios',
  ropa: 'moda-y-accesorios',
  zapatillas: 'moda-y-accesorios',
  polera: 'moda-y-accesorios',
  iphone: 'celulares-y-telefonia',
  celular: 'celulares-y-telefonia',
  samsung: 'celulares-y-telefonia',
  redmi: 'celulares-y-telefonia',
  tv: 'electronica-y-tecnologia',
  smartwatch: 'electronica-y-tecnologia',
  freidora: 'hogar-y-muebles',
  sofa: 'hogar-y-muebles',
  mueble: 'hogar-y-muebles',
};

export function usePersonalization() {
  const [profile, setProfile] = useState<InterestProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Inicializar o leer visitor_id y perfil en localStorage
  useEffect(() => {
    try {
      let currentVisitorId = localStorage.getItem('compraya_visitor_id');
      if (!currentVisitorId) {
        currentVisitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('compraya_visitor_id', currentVisitorId);
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          ...parsed,
          visitorId: currentVisitorId,
        });
      } else {
        setProfile({
          ...DEFAULT_PROFILE,
          visitorId: currentVisitorId,
        });
      }
    } catch {
      setProfile(DEFAULT_PROFILE);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar cambios en localStorage
  const saveProfile = useCallback((updated: InterestProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, []);

  // 1. Capturar señal: Búsqueda realizada
  const trackSearch = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim().toLowerCase();
      if (!trimmed) return;

      setProfile((prev) => {
        // Encontrar inferencia de categoría
        const inferredCat = Object.entries(KEYWORD_CATEGORY_MAP).find(([k]) =>
          trimmed.includes(k)
        )?.[1];

        const updatedCategories = { ...prev.recentCategories };
        if (inferredCat) {
          updatedCategories[inferredCat] = (updatedCategories[inferredCat] || 0) + 4;
        }

        const filteredKeywords = prev.searchKeywords.filter(
          (k) => k.keyword.toLowerCase() !== trimmed
        );

        const updated: InterestProfile = {
          ...prev,
          recentCategories: updatedCategories,
          searchKeywords: [{ keyword: trimmed, timestamp: Date.now() }, ...filteredKeywords].slice(0, 10),
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }

        return updated;
      });
    },
    []
  );

  // 2. Capturar señal: Vista de Producto (PDP View)
  const trackProductView = useCallback(
    (product: {
      id: string;
      title: string;
      slug: string;
      categorySlug: string;
      categoryName: string;
      basePrice: number;
      image: string;
      storeName: string;
    }) => {
      setProfile((prev) => {
        const catSlug = product.categorySlug || 'general';
        const updatedCategories = {
          ...prev.recentCategories,
          [catSlug]: (prev.recentCategories[catSlug] || 0) + 3,
        };

        // Recalcular afinidad de precio promedio
        const currentCount = prev.priceAffinity.count;
        const currentAvg = prev.priceAffinity.avg;
        const newAvg = (currentAvg * currentCount + product.basePrice) / (currentCount + 1);
        const newMin = currentCount === 0 ? product.basePrice : Math.min(prev.priceAffinity.min, product.basePrice);
        const newMax = currentCount === 0 ? product.basePrice : Math.max(prev.priceAffinity.max, product.basePrice);

        // Actualizar lista de recientemente vistos
        const filteredRecent = prev.recentlyViewed.filter((p) => p.id !== product.id);
        const newItem: ViewedProductItem = {
          ...product,
          timestamp: Date.now(),
        };

        const updated: InterestProfile = {
          ...prev,
          recentCategories: updatedCategories,
          priceAffinity: {
            min: newMin,
            max: newMax,
            avg: newAvg,
            count: currentCount + 1,
          },
          recentlyViewed: [newItem, ...filteredRecent].slice(0, 10),
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }

        return updated;
      });
    },
    []
  );

  // 3. Capturar señal: Interacción en Live Shopping
  const trackLiveInteraction = useCallback((streamId: string, storeSlug: string) => {
    setProfile((prev) => {
      const updated: InterestProfile = {
        ...prev,
        liveInteractions: [
          { streamId, storeSlug, timestamp: Date.now() },
          ...prev.liveInteractions,
        ].slice(0, 10),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      return updated;
    });
  }, []);

  // 4. Capturar señal: Consulta en Comparador
  const trackCompareQuery = useCallback((slug: string, categorySlug?: string) => {
    if (!categorySlug) return;
    setProfile((prev) => {
      const updatedCategories = {
        ...prev.recentCategories,
        [categorySlug]: (prev.recentCategories[categorySlug] || 0) + 2,
      };
      const updated = {
        ...prev,
        recentCategories: updatedCategories,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Algoritmo de Re-ranking: asigna puntuación por afinidad implícita
  const rerankProducts = useCallback(
    (products: any[]) => {
      if (!products || products.length === 0) return [];

      const totalInteractions =
        Object.values(profile.recentCategories).reduce((a, b) => a + b, 0) +
        profile.searchKeywords.length;

      // Cold start: Si el usuario no tiene historial previo, ordenar por rating & ventas
      if (totalInteractions === 0) {
        return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }

      const topKeywords = profile.searchKeywords.slice(0, 4).map((k) => k.keyword.toLowerCase());
      const avgPrice = profile.priceAffinity.avg;

      return [...products]
        .map((p) => {
          let score = (p.rating || 4.5) * 3;

          const pCat = p.category?.slug || '';
          const catWeight = profile.recentCategories[pCat] || 0;
          score += catWeight * 12;

          // Coincidencia con palabras clave buscadas
          const pTitle = (p.title || '').toLowerCase();
          const pDesc = (p.description || '').toLowerCase();
          for (const kw of topKeywords) {
            if (pTitle.includes(kw)) score += 30;
            else if (pDesc.includes(kw)) score += 15;
          }

          // Afinidad de precio (si está dentro del 30% del precio promedio visto)
          if (avgPrice > 0) {
            const diffRatio = Math.abs(p.basePrice - avgPrice) / avgPrice;
            if (diffRatio <= 0.3) score += 10;
          }

          return { product: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product);
    },
    [profile]
  );

  // Información estructurada para alimentar las secciones de la Home
  const personalizedFeed = useMemo(() => {
    const isColdStart =
      Object.keys(profile.recentCategories).length === 0 &&
      profile.searchKeywords.length === 0 &&
      profile.recentlyViewed.length === 0;

    const lastSearchKeyword = profile.searchKeywords[0]?.keyword || null;

    // Encontrar la categoría con mayor ponderación
    const topCategoryEntry = Object.entries(profile.recentCategories).sort(
      ([, a], [, b]) => b - a
    )[0];
    const topCategorySlug = topCategoryEntry ? topCategoryEntry[0] : null;

    return {
      isColdStart,
      lastSearchKeyword,
      topCategorySlug,
      recentlyViewed: profile.recentlyViewed,
      visitorId: profile.visitorId,
    };
  }, [profile]);

  return {
    profile,
    isLoaded,
    trackSearch,
    trackProductView,
    trackLiveInteraction,
    trackCompareQuery,
    rerankProducts,
    personalizedFeed,
  };
}
