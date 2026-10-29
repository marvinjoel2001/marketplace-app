'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Eye, MapPin, Radio } from 'lucide-react';
import type { TikTokLivesResponse } from '@/lib/api';
import { liveFreshness } from '@/lib/liveFreshness';
import { LivePreview } from './LivePreview';

const CATEGORIES = ['Ropa', 'Electrónica', 'Hogar', 'Belleza', 'Otros'];

/** Selling lives, refreshed quietly in the background. */
export function LiveDirectory({ initialData, category, page, initialNow }: {
  initialData: TikTokLivesResponse | null;
  category?: string;
  page: number;
  initialNow: number;
}) {
  const [data, setData] = useState(initialData);
  const [now, setNow] = useState(initialNow);
  const request = useRef<AbortController | null>(null);
  const query = useMemo(() => new URLSearchParams({ ...(category ? { category } : {}), page: String(page) }).toString(), [category, page]);
  const storageKey = `vitrina:live-directory:${query}`;

  const refresh = useCallback(async () => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`/api/tiktok/lives?${query}`, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('No se pudo actualizar');
      const result: TikTokLivesResponse = await response.json();
      if (!Array.isArray(result.data) || !result.meta || !result.pagination) throw new Error('Respuesta incompleta');
      setData(result);
      setNow(Date.now());
      try { sessionStorage.setItem(storageKey, JSON.stringify(result)); } catch { /* Optional short-lived recovery. */ }
    } catch {
      // A failed request keeps the last list; cards still expire by their own verified_at.
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) request.current = null;
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
  // Rooms waiting for re-verification still show as live: shoppers don't need that detail.
  const cards = (data?.data ?? []).filter((live) => liveFreshness(live, now, freshSeconds, retention) !== 'expired');
  const viewers = cards.reduce((sum, live) => sum + live.viewer_count, 0);

  return (
    <div className="live-content">
      <section className="live-hero" aria-labelledby="live-heading">
        <Image src="/images/tiktok-live-hero.png" alt="" fill priority sizes="(min-width: 1280px) 80vw, 100vw" className="live-hero-art" />
        <div className="live-hero-copy">
          <span className="live-eyebrow"><Radio aria-hidden="true" size={15} /> En vivo ahora</span>
          <h1 id="live-heading">Lives de venta en Bolivia</h1>
          <p>Entra, mira lo que muestran y pregunta en el chat.</p>
          {cards.length > 0 && (
            <div className="live-stats">
              <span><Radio aria-hidden="true" size={17} /><strong>{cards.length}</strong> en vivo</span>
              {viewers > 0 && <span><Eye aria-hidden="true" size={17} /><strong>{viewers.toLocaleString('es-BO')}</strong> mirando</span>}
            </div>
          )}
        </div>
      </section>

      <section id="transmisiones" className="live-list-section" aria-labelledby="live-list-heading">
        <div className="live-list-toolbar">
          <h2 id="live-list-heading">Transmisiones</h2>
          <nav className="live-category-nav" aria-label="Categorías de transmisiones">
            {[undefined, ...CATEGORIES].map((name) => (
              <Link key={name ?? 'all'} href={name ? `/live?category=${encodeURIComponent(name)}` : '/live'}
                className={category === name ? 'live-category selected' : 'live-category'} aria-current={category === name ? 'page' : undefined}>
                {name ?? 'Todos'}
              </Link>
            ))}
          </nav>
        </div>

        {cards.length === 0 ? (
          <div className="live-empty" role="status">
            <Radio size={30} />
            <h3>{category ? `Nadie vende ${category.toLowerCase()} en vivo ahora` : 'No hay lives de venta en este momento'}</h3>
            <p>{category ? 'Mira las otras categorías o vuelve en un rato.' : 'Vuelve en un rato: esta página se actualiza sola.'}</p>
            {category && <Link href="/live" className="live-primary-button">Ver todos los lives</Link>}
          </div>
        ) : (
          <div className="live-grid">
            {cards.map((live) => (
              <article className="live-card" key={`${live.username}:${live.room_id}`}>
                <div className="live-card-media">
                  <LivePreview roomId={live.room_id} hlsUrl={live.stream_hls_url ?? null} flvUrl={live.stream_flv_url ?? null}
                    coverUrl={live.cover_image_url} avatarUrl={live.avatar_url} href={`/live/${live.username}`} alt={live.title || `@${live.username}`} />
                  <span className="live-card-badge">LIVE</span>
                  {live.viewer_count > 0 && <span className="live-card-viewers"><Eye size={12} />{live.viewer_count.toLocaleString('es-BO')}</span>}
                  <span className="live-card-category">{live.category}</span>
                </div>
                <Link href={`/live/${live.username}`} className="live-card-copy block">
                  <div className="live-card-account">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {live.avatar_url && <img src={live.avatar_url} alt="" referrerPolicy="no-referrer" loading="lazy" />}
                    <span title={`@${live.username}`}>@{live.username}</span>
                  </div>
                  <p className="live-card-title">{live.title || 'Mira lo que está mostrando'}</p>
                  {(live.price_text || live.city) && (
                    <div className="live-card-footer">
                      {live.city && <span><MapPin size={11} />{live.city}</span>}
                      {live.price_text && <span>{live.price_text}</span>}
                    </div>
                  )}
                </Link>
              </article>
            ))}
          </div>
        )}

        {data && data.pagination.total_pages > 1 && <nav aria-label="Páginas de transmisiones" className="live-pagination">
          {page > 1 && <Link href={`/live?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page - 1) })}`}>Anterior</Link>}
          <span>{page} / {data.pagination.total_pages}</span>
          {page < data.pagination.total_pages && <Link href={`/live?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page + 1) })}`}>Siguiente <ArrowRight size={14} /></Link>}
        </nav>}
      </section>
    </div>
  );
}
