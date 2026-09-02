'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Clock,
  X,
  TrendingUp,
  Sparkles,
  Store,
  ArrowRight,
  Radio,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { usePersonalization } from '@/hooks/usePersonalization';

interface SearchSuggestionItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
  category: string;
  storeName: string;
  isLive?: boolean;
}

// Catálogo base de búsqueda instantánea client-side + fallback para UX inmediata
const searchCatalog: SearchSuggestionItem[] = [
  {
    id: '1',
    title: 'Chompa Oversize Beige - Talla M',
    slug: 'chompa-oversize-beige-talla-m',
    price: 189,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300',
    category: 'Moda y Ropa',
    storeName: 'ModaBol (Tienda Oficial)',
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max 256GB Titanio Natural',
    slug: 'iphone-15-pro-max-256gb',
    price: 11999,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300',
    category: 'Celulares',
    storeName: 'TechPlus Bolivia',
    isLive: true,
  },
  {
    id: '3',
    title: 'Xiaomi Redmi Buds 5 Pro ANC 52dB',
    slug: 'xiaomi-redmi-buds-5-pro',
    price: 399,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300',
    category: 'Electrónica',
    storeName: 'TechPlus Bolivia',
  },
  {
    id: '4',
    title: 'Smartwatch Galaxy Watch 6 44mm Bluetooth',
    slug: 'samsung-galaxy-watch-6',
    price: 1299,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300',
    category: 'Electrónica',
    storeName: 'TechPlus Bolivia',
  },
  {
    id: '5',
    title: 'Zapatillas Deportivas Running Air Zoom',
    slug: 'zapatillas-deportivas-air-zoom',
    price: 304,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
    category: 'Moda y Ropa',
    storeName: 'ModaBol',
  },
  {
    id: '6',
    title: 'Freidora de Aire Digital 5.5L Touch',
    slug: 'freidora-de-aire-digital-5-5l',
    price: 364,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300',
    category: 'Hogar y Muebles',
    storeName: 'Hogar Feliz',
  },
];

const popularTrends = [
  'Chompa Oversize',
  'iPhone 15 Pro Max',
  'Air Zoom Zapatillas',
  'Xiaomi Buds 5',
  'Smartwatch Galaxy',
];

export function SearchBar() {
  const router = useRouter();
  const { trackSearch } = usePersonalization();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar historial de búsqueda de localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('compraya_search_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory(['Chompa Oversize', 'iPhone 15', 'Redmi Buds']);
      }
    } catch {
      setHistory(['Chompa Oversize', 'iPhone 15', 'Redmi Buds']);
    }
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Guardar término en historial
  const saveToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('compraya_search_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const removeHistoryItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem('compraya_search_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    try {
      localStorage.removeItem('compraya_search_history');
    } catch {
      // ignore
    }
  };

  const executeSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (term) {
      saveToHistory(term);
      trackSearch(term);
      setIsFocused(false);
      router.push(`/?q=${encodeURIComponent(term)}`);
    } else {
      setIsFocused(false);
      router.push('/');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  // Filtrado de sugerencias de productos
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const qLower = query.toLowerCase();
    return searchCatalog.filter(
      (item) =>
        item.title.toLowerCase().includes(qLower) ||
        item.category.toLowerCase().includes(qLower) ||
        item.storeName.toLowerCase().includes(qLower)
    );
  }, [query]);

  // Resaltado de texto coincidente
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 text-gray-950 font-extrabold rounded-xs px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input Capsule (Matching image design: Search products... 🔍) */}
      <form onSubmit={handleSubmit} className="flex items-center">
        <div
          className={`relative flex items-center w-48 sm:w-60 lg:w-68 rounded-full border px-3.5 py-1.5 transition-all duration-200 ${
            isFocused
              ? 'bg-white border-indigo-600 ring-3 ring-indigo-100/70 shadow-sm w-72'
              : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsFocused(false);
            }}
            className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-transparent outline-hidden pr-6"
            aria-label="Buscar productos"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-7 p-0.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
          <button
            type="submit"
            aria-label="Buscar"
            className="absolute right-2.5 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Floating Suggestions Dropdown */}
      {isFocused && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
          {/* 1. When query is empty: Recent Search History & Popular Trends */}
          {!query.trim() && (
            <div className="p-4 space-y-4">
              {/* Recent searches */}
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-500" /> Búsquedas recientes
                    </span>
                    <button
                      type="button"
                      onClick={clearAllHistory}
                      className="text-[11px] font-bold text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Borrar historial
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map((term, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setQuery(term);
                          executeSearch(term);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-amber-50 hover:border-amber-300 border border-transparent text-xs font-semibold text-gray-800 cursor-pointer transition-all group"
                      >
                        <Clock className="w-3 h-3 text-gray-500 group-hover:text-amber-600" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeHistoryItem(e, term)}
                          className="text-gray-400 hover:text-gray-700 ml-1 rounded-full p-0.5"
                          title="Eliminar de historial"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center mb-2">
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> Tendencias en Bolivia
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {popularTrends.map((trend, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(trend);
                        executeSearch(trend);
                      }}
                      className="text-left px-3 py-2 rounded-xl text-xs font-medium text-gray-800 hover:bg-amber-50 hover:text-amber-900 flex items-center justify-between group transition-colors"
                    >
                      <span className="flex items-center">
                        <Tag className="w-3 h-3 mr-2 text-gray-400 group-hover:text-amber-500" />
                        {trend}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-amber-500 transform group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Real-time Search Suggestions (Query >= 1 char) */}
          {query.trim() && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  Productos y Tiendas sugeridas ({suggestions.length})
                </span>
                <span className="text-[10px] text-gray-500">Presiona Enter para buscar todo</span>
              </div>

              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    onClick={() => {
                      saveToHistory(query);
                      setIsFocused(false);
                    }}
                    className="flex items-center justify-between p-3 hover:bg-amber-50/60 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 p-1 shrink-0 border border-gray-200/80 flex items-center justify-center overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-amber-700">
                          {renderHighlightedText(item.title, query)}
                        </p>
                        <div className="flex items-center space-x-2 text-[11px] text-gray-600 mt-0.5">
                          <span className="flex items-center">
                            <Store className="w-3 h-3 mr-1 text-amber-600" />
                            {item.storeName}
                          </span>
                          <span>•</span>
                          <span className="text-gray-500">{item.category}</span>
                          {item.isLive && (
                            <span className="bg-red-100 text-red-700 font-extrabold px-1.5 py-0.2 text-[9px] rounded-full flex items-center space-x-1">
                              <Radio className="w-2.5 h-2.5" />
                              <span>LIVE</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="text-sm font-black text-gray-900 block">
                        {formatBs(item.price)}
                      </span>
                      <span className="text-[10px] text-green-800 font-bold">OpenDSP</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="w-full py-1.5 text-xs font-extrabold text-gray-800 hover:text-black flex items-center justify-center space-x-1 hover:underline"
                >
                  <span>Ver todos los resultados para &quot;{query}&quot;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 3. Empty State (No suggestions found) */}
          {query.trim() && suggestions.length === 0 && (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <Search className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-900">
                  No encontramos productos para &quot;{query}&quot;
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Verifica que esté bien escrito o prueba con un término más general.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-gray-700 block mb-2">
                  💡 Te sugerimos buscar:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {popularTrends.slice(0, 4).map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        executeSearch(term);
                      }}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-amber-100 text-gray-800 text-xs font-bold rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
