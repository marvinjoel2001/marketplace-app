'use client';

import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react';

export interface LatLng {
  lat: number;
  lng: number;
}

interface Place {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

// Plaza 24 de Septiembre, Santa Cruz de la Sierra.
export const SANTA_CRUZ: LatLng = { lat: -17.7834, lng: -63.1821 };
const NOMINATIM = 'https://nominatim.openstreetmap.org';

/** "Calle Libertad 123, Equipetrol" from a Nominatim address. */
function shortAddress(place: Place): string {
  const a = place.address ?? {};
  const street = [a.road || a.pedestrian || a.footway, a.house_number].filter(Boolean).join(' ');
  const area = a.neighbourhood || a.suburb || a.quarter || a.city_district;
  const text = [street, area].filter(Boolean).join(', ');
  return text || place.display_name.split(',').slice(0, 2).join(',');
}

function Pin({ kind }: { kind: 'home' | 'store' }) {
  return (
    <svg viewBox="0 0 48 60" className="h-14 w-11 drop-shadow-[0_4px_6px_rgb(18_36_28/0.35)]" aria-hidden>
      <path d="M24 59S4 36.5 4 22a20 20 0 0 1 40 0c0 14.5-20 37-20 37z" fill={kind === 'store' ? 'var(--color-verde)' : 'var(--color-ink)'} />
      <circle cx="24" cy="22" r="13" fill="#fff" />
      {kind === 'store' ? (
        // Shop front with awning
        <g fill="none" stroke="var(--color-verde)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M15.5 18.5h17l-1.6-4.5H17.1z" fill="var(--color-tag)" />
          <path d="M17 18.5v9.5h14v-9.5" />
          <path d="M21.5 28v-5h5v5" />
        </g>
      ) : (
        <g fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M16 22.5 24 15.5l8 7" />
          <path d="M18.5 21v8h11v-8" />
          <path d="M22.5 29v-4.5h3V29" />
        </g>
      )}
    </svg>
  );
}

/**
 * Move the map under a fixed pin, like delivery apps do. Reports the center on every move and,
 * when it can, a readable street address for it.
 */
export function MapPicker({
  value,
  onChange,
  onAddress,
  kind = 'home',
  className = 'h-72',
}: {
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
  onAddress?: (address: string) => void;
  kind?: 'home' | 'store';
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const callbacks = useRef({ onChange, onAddress });
  const initial = useRef(value ?? SANTA_CRUZ);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    callbacks.current = { onChange, onAddress };
  }, [onChange, onAddress]);

  useEffect(() => {
    let cancelled = false;
    const reverseController = new AbortController();
    let reverseTimer: ReturnType<typeof setTimeout> | undefined;
    let leaflet: LeafletMap | null = null;

    import('leaflet').then((L) => {
      if (cancelled || !container.current) return;
      leaflet = L.map(container.current, { zoomControl: false }).setView([initial.current.lat, initial.current.lng], 16);
      L.control.zoom({ position: 'bottomright' }).addTo(leaflet);
      // OpenStreetMap's public tiles suit light use; switch to a tile provider with a key before heavy traffic.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(leaflet);
      map.current = leaflet;

      leaflet.on('moveend', () => {
        if (cancelled || !leaflet) return;
        const c = leaflet!.getCenter();
        callbacks.current.onChange({ lat: c.lat, lng: c.lng });
        clearTimeout(reverseTimer);
        // Nominatim allows about one request per second; wait until the map settles.
        reverseTimer = setTimeout(() => {
          fetch(`${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${c.lat}&lon=${c.lng}`, {
            signal: reverseController.signal,
            headers: { 'Accept-Language': 'es' },
          })
            .then((r) => r.json())
            .then((place: Place) => !cancelled && place?.display_name && callbacks.current.onAddress?.(shortAddress(place)))
            .catch(() => {});
        }, 900);
      });
      // Report the starting point too, so a pin that is already right counts as chosen.
      leaflet.fire('moveend');
    });

    return () => {
      cancelled = true;
      reverseController.abort();
      clearTimeout(reverseTimer);
      leaflet?.off('moveend');
      leaflet?.remove();
      map.current = null;
    };
  }, []);

  const flyTo = (pos: LatLng) => map.current?.setView([pos.lat, pos.lng], 17);

  const search = async () => {
    if (query.trim().length < 3) return;
    setSearching(true);
    setNotice('');
    try {
      const c = map.current?.getCenter() ?? SANTA_CRUZ;
      // Prefer results near where the map is, inside Bolivia.
      const box = [c.lng - 0.35, c.lat + 0.35, c.lng + 0.35, c.lat - 0.35].join(',');
      const res = await fetch(
        `${NOMINATIM}/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=bo&viewbox=${box}&q=${encodeURIComponent(query)}`,
        { headers: { 'Accept-Language': 'es' } },
      );
      const places: Place[] = await res.json();
      setResults(places);
      if (places.length === 0) setNotice('No encontramos ese lugar. Prueba con la calle o un lugar conocido cerca.');
    } catch {
      setNotice('No pudimos buscar ahora. Mueve el mapa hasta tu ubicación.');
    } finally {
      setSearching(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return setNotice('Tu navegador no comparte la ubicación. Mueve el mapa hasta el lugar.');
    setLocating(true);
    setNotice('');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        flyTo({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {
        setLocating(false);
        setNotice('No pudimos obtener tu ubicación. Revisa el permiso o mueve el mapa.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Not a <form>: the picker lives inside the address form. */}
      <div role="search" className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              search();
            }
          }}
          placeholder="Busca tu calle, barrio o un lugar cerca"
          aria-label="Buscar dirección en el mapa"
          className="field pl-10 pr-24"
        />
        <button type="button" onClick={search} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-paper px-3 py-2 text-sm font-semibold" disabled={searching}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="panel divide-y divide-line overflow-hidden">
          {results.map((place) => (
            <li key={`${place.lat},${place.lon}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-paper"
                onClick={() => {
                  flyTo({ lat: Number(place.lat), lng: Number(place.lon) });
                  setResults([]);
                  setQuery('');
                }}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-verde" />
                <span>
                  <span className="font-semibold">{shortAddress(place)}</span>
                  <span className="block truncate text-xs text-muted">{place.display_name}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={`relative overflow-hidden rounded-[var(--radius-card)] border border-line ${className}`}>
        <div ref={container} className="h-full w-full" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full">
          <Pin kind={kind} />
        </div>
        <button
          type="button"
          onClick={locate}
          className="absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-sm font-semibold shadow-md"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4 text-verde" />}
          Usar mi ubicación
        </button>
      </div>
      <p className="text-xs text-muted">{notice || 'Mueve el mapa hasta que el pin quede justo en la puerta.'}</p>
    </div>
  );
}
