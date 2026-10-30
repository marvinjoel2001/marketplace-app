'use client';

import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import { SANTA_CRUZ } from '@/components/shop/MapPicker';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  detail?: string;
  color?: string;
  href?: string;
}

type Leaflet = typeof import('leaflet');

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function drawPoints(L: Leaflet, map: LeafletMap, layer: LayerGroup, points: MapPoint[]) {
  layer.clearLayers();
  const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  for (const p of valid) {
    const html = `<strong>${escapeHtml(p.label)}</strong>${p.detail ? `<br/><span style="color:#64748b">${escapeHtml(p.detail)}</span>` : ''}${
      p.href ? `<br/><a href="${encodeURI(p.href)}" style="color:#5b45fa;font-weight:600">Abrir</a>` : ''
    }`;
    L.circleMarker([p.lat, p.lng], { radius: 9, color: '#fff', weight: 2, fillColor: p.color ?? '#5b45fa', fillOpacity: 0.95 })
      .bindPopup(html)
      .addTo(layer);
  }
  if (valid.length > 1) map.fitBounds(L.latLngBounds(valid.map((p) => [p.lat, p.lng])), { padding: [30, 30], maxZoom: 15 });
  else if (valid.length === 1) map.setView([valid[0].lat, valid[0].lng], 15);
}

/** Read-only OpenStreetMap with one colored dot per point; fits the view to all of them. */
export function PointsMap({ points, className = 'h-[420px]' }: { points: MapPoint[]; className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<{ L: Leaflet; map: LeafletMap; layer: LayerGroup } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    import('leaflet').then((L) => {
      if (cancelled || !container.current) return;
      map = L.map(container.current).setView([SANTA_CRUZ.lat, SANTA_CRUZ.lng], 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
      setLeaflet({ L, map, layer: L.layerGroup().addTo(map) });
    });
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  useEffect(() => {
    if (leaflet) drawPoints(leaflet.L, leaflet.map, leaflet.layer, points);
  }, [leaflet, points]);

  return <div ref={container} className={`z-0 w-full overflow-hidden rounded-2xl border border-[#edf0f6] ${className}`} role="region" aria-label="Mapa" />;
}
