'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Eye, ExternalLink, MapPin, Radio, RefreshCw } from 'lucide-react';
import type { TikTokLivesResponse } from '@/lib/api';
import { liveFreshness } from '@/lib/liveFreshness';
import { LivePreview } from './LivePreview';

const CATEGORIES = ['Ropa', 'Electrónica', 'Hogar', 'Belleza', 'Otros'];

function describeGeo(evidence: string): string {
  if (evidence === 'registered_store') return 'Tienda registrada en Bolivia';
  if (evidence === 'tiktok_country') return 'País informado por TikTok';
  if (evidence === 'username:bo') return 'Referencia a Bolivia';
  if (evidence === 'phone:bo') return 'Celular boliviano';
  if (evidence.startsWith('keyword:')) {
    const place = evidence.slice(8);
    return place === '🇧🇴' || place === 'bolivia' ? 'Menciona Bolivia' : `Menciona ${place}`;
  }
  return 'Ubicación no verificada';
}

export function LiveDirectory({ initialData, category, page, initialNow }: {
  initialData: TikTokLivesResponse | null;
  category?: string;
  page: number;
  initialNow: number;
}) {
  const [data, setData] = useState(initialData);
  const [now, setNow] = useState(initialNow);
  const [updating, setUpdating] = useState(false);
  const [connectionError, setConnectionError] = useState(!initialData);
  const [lastSuccess, setLastSuccess] = useState(initialData ? initialNow : 0);
  const request = useRef<AbortController | null>(null);
  const query = useMemo(() => new URLSearchParams({ ...(category ? { category } : {}), page: String(page) }).toString(), [category, page]);
  const storageKey = `vitrina:live-directory:${query}`;

  const refresh = useCallback(async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setUpdating(true);
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`/api/tiktok/lives?${query}`, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('No se pudo actualizar');
      const result: TikTokLivesResponse = await response.json();
      if (!Array.isArray(result.data) || !result.meta || !result.pagination) throw new Error('Respuesta incompleta');
      setData(result);
      setConnectionError(false);
      setLastSuccess(Date.now());
      setNow(Date.now());
      try { sessionStorage.setItem(storageKey, JSON.stringify(result)); } catch { /* Optional short-lived recovery. */ }
    } catch {
      // A failed request does not erase the last successful response. Individual
      // cards still expire using their original verified_at timestamps.
      if (request.current === controller) setConnectionError(true);
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setUpdating(false);
      }
    }
  }, [query, storageKey]);

  useEffect(() => {
    if (initialData) {
      try { sessionStorage.setItem(storageKey, JSON.stringify(initialData)); } catch { /* Storage is optional. */ }
    } else {
      // Restore only unexpired public cards if the backend is restarting.
      try {
        const raw = sessionStorage.getItem(storageKey);
        const saved: TikTokLivesResponse | null = raw ? JSON.parse(raw) : null;
        if (saved?.meta && saved.pagination && Array.isArray(saved.data) && saved.data.some((live) =>
          liveFreshness(live, Date.now(), saved.meta.freshness_seconds, saved.meta.retention_seconds ?? 300) !== 'expired',
        )) queueMicrotask(() => setData(saved));
      } catch { /* Ignore unavailable or malformed browser storage. */ }
    }
    const initialRequest = !initialData ? setTimeout(() => void refresh(), 0) : undefined;
    const poll = setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, 30000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const visible = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
      clearTimeout(initialRequest);
      document.removeEventListener('visibilitychange', visible);
      const pending = request.current;
      request.current = null;
      pending?.abort();
    };
  }, [initialData, refresh, storageKey]);

  const freshSeconds = data?.meta.freshness_seconds ?? 60;
  const retention = data?.meta.retention_seconds ?? 300;
  const cards = (data?.data ?? []).map((live) => ({ live, status: liveFreshness(live, now, freshSeconds, retention) }))
    .filter(({ status }) => status !== 'expired');
  const fresh = cards.filter(({ status }) => status === 'fresh');
  const pending = cards.length - fresh.length;
  const liveCount = connectionError || pending ? fresh.length : data?.meta.active_count ?? fresh.length;
  const viewers = fresh.reduce((sum, { live }) => sum + live.viewer_count, 0);
  const updatedAgo = lastSuccess ? Math.max(0, Math.floor((now - lastSuccess) / 1000)) : null;
  const lastUpdateText = updatedAgo === null ? 'Conectando al catálogo' : updatedAgo < 5 ? 'Actualizado ahora'
    : updatedAgo < 60 ? `Actualizado hace ${updatedAgo} s` : `Actualizado hace ${Math.floor(updatedAgo / 60)} min`;

  return (
    <div className="live-content">
      <section className="live-hero" aria-labelledby="live-heading">
        <Image src="/images/tiktok-live-hero.png" alt="" fill priority sizes="(min-width: 1280px) 80vw, 100vw" className="live-hero-art" />
        <div className="live-hero-copy">
          <span className="live-eyebrow"><Radio aria-hidden="true" size={15} /> EN VIVO AHORA</span>
          <h1 id="live-heading">Lives de venta en Bolivia</h1>
          <p>Descubre algo nuevo. Mira, pregunta y compra en vivo.</p>
          <div className="live-stats">
            <span><Radio aria-hidden="true" size={17} /><strong>{liveCount}</strong> en vivo</span>
            <span><Eye aria-hidden="true" size={17} /><strong>{viewers.toLocaleString('es-BO')}</strong> espectadores</span>
          </div>
        </div>
      </section>

      <section id="transmisiones" className="live-list-section" aria-labelledby="live-list-heading">
        <div className="live-list-toolbar">
          <div>
            <h2 id="live-list-heading">Transmisiones activas</h2>
            <div className="live-updated"><span className={connectionError || pending ? 'live-status-dot pending' : 'live-status-dot'} />{lastUpdateText}{pending > 0 ? ` · ${pending} actualizando` : ''}</div>
          </div>
          <div className="live-list-controls">
        <nav className="live-category-nav" aria-label="Categorías de transmisiones">
          {[undefined, ...CATEGORIES].map((name) => (
            <Link key={name ?? 'all'} href={name ? `/live?category=${encodeURIComponent(name)}` : '/live'}
              className={category === name ? 'live-category selected' : 'live-category'} aria-current={category === name ? 'page' : undefined}>
              {name ?? 'Todos'}
            </Link>
          ))}
        </nav>
          <button type="button" onClick={() => void refresh()} disabled={updating} className="live-refresh" aria-label="Actualizar transmisiones" title="Actualizar transmisiones">
            <RefreshCw size={15} className={updating ? 'live-spin' : ''} />
          </button>
          </div>
        </div>

        {connectionError && cards.length > 0 && (
          <div className="live-connection-note" role="status">
            <RefreshCw size={16} />
            <p>La conexión está tardando. Conservamos la última actualización mientras reintentamos.</p>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="live-empty" role="status">
            {connectionError ? <AlertCircle size={30} /> : <Radio size={30} />}
            <h3>{connectionError ? 'Estamos recuperando la conexión' : data?.meta.worker_enabled === false ? 'La detección está desactivada' : 'Buscando nuevas transmisiones'}</h3>
            <p>{connectionError ? 'No pudimos actualizar el catálogo. Reintentamos automáticamente.'
              : category ? `Aún no hay transmisiones verificadas de ${category.toLowerCase()}. Prueba con todas las categorías.`
                : 'Las nuevas emisiones aparecerán aquí cuando se verifiquen.'}</p>
            <button type="button" className="live-primary-button" onClick={() => void refresh()} disabled={updating}>
              <RefreshCw size={16} className={updating ? 'live-spin' : ''} /> {updating ? 'Conectando…' : 'Reintentar'}
            </button>
          </div>
        ) : (
          <div className="live-grid">
            {cards.map(({ live, status }) => (
              <article className="live-card" key={`${live.username}:${live.room_id}`}>
                <div className="live-card-media">
                  <LivePreview roomId={live.room_id} hlsUrl={live.stream_hls_url ?? null} flvUrl={live.stream_flv_url ?? null}
                    coverUrl={live.cover_image_url} avatarUrl={live.avatar_url} liveUrl={live.live_url} alt={live.title || `@${live.username}`} />
                  <span className={status === 'fresh' ? 'live-card-badge' : 'live-card-badge verifying'}>{status === 'fresh' ? 'LIVE' : 'Actualizando'}</span>
                  {status === 'fresh' && <span className="live-card-viewers"><Eye size={12} />{live.viewer_count.toLocaleString('es-BO')}</span>}
                  <span className="live-card-category">{live.category}</span>
                </div>
                <div className="live-card-copy">
                  <div className="live-card-account">
                    {live.avatar_url && <img src={live.avatar_url} alt="" referrerPolicy="no-referrer" loading="lazy" />}
                    <span title={`@${live.username}`}>@{live.username}</span>
                  </div>
                  <p className="live-card-title">{live.title || 'Descubre lo nuevo en esta tienda'}</p>
                  <div className="live-card-footer">
                    <span title={describeGeo(live.geo_evidence)}><MapPin size={11} />{describeGeo(live.geo_evidence)}</span>
                    <a href={live.live_url} target="_blank" rel="noopener noreferrer">TikTok <ExternalLink size={12} /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {data && data.pagination.total_pages > 1 && <nav aria-label="Páginas de transmisiones" className="live-pagination">
          {page > 1 && <Link href={`/live?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page - 1) })}`}>Anterior</Link>}
          <span>{page} / {data.pagination.total_pages}</span>
          {page < data.pagination.total_pages && <Link href={`/live?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page + 1) })}`}>Siguiente <ArrowRight size={14} /></Link>}
        </nav>}
        <p className="live-location-note">Las referencias a Bolivia son indicios del perfil, no una ubicación verificada.</p>
      </section>
    </div>
  );
}
