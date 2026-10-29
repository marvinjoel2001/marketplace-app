'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Radio, RefreshCw } from 'lucide-react';

type PlaybackState = 'loading' | 'playing' | 'unavailable';

/**
 * Live video from TikTok's signed pull URLs: FLV first (lower delay), native/hls.js HLS as fallback.
 * In `expanded` mode it reports problems and offers a retry; in cards it stays silent behind the cover.
 */
export function LiveVideo({ roomId, hlsUrl, flvUrl, enabled, expanded = false, muted = true, alt, onState }: {
  roomId: string;
  hlsUrl: string | null;
  flvUrl: string | null;
  enabled: boolean;
  expanded?: boolean;
  muted?: boolean;
  alt: string;
  onState?: (state: PlaybackState) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const sources = useRef({ hlsUrl, flvUrl });
  const retryPlayback = useRef<(() => void) | null>(null);
  const [state, setState] = useState<PlaybackState>('loading');

  useEffect(() => {
    onState?.(state);
  }, [state, onState]);

  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    sources.current = { hlsUrl, flvUrl };
    // Renewed signed URLs can recover a failed player without interrupting
    // a healthy stream or resetting the viewer's sound/volume every refresh.
    retryPlayback.current?.();
  }, [hlsUrl, flvUrl]);

  useEffect(() => {
    const el = video.current;
    if (!enabled || !el) return;
    let stopped = false;
    let attempt = 0;
    let unavailable = false;
    let dispose = () => {};
    setState('loading');

    const start = async (format: 'hls' | 'flv' | null): Promise<void> => {
      const currentAttempt = ++attempt;
      dispose();
      dispose = () => {};
      if (stopped) return;
      if (!format) {
        unavailable = true;
        setState('unavailable');
        return;
      }
      unavailable = false;
      setState('loading');
      const { hlsUrl, flvUrl } = sources.current;
      const current = () => !stopped && attempt === currentAttempt;
      // FLV first: it trails the broadcast by ~2s and starts faster than HLS (10–20s behind).
      // Without MSE (iPhone) mpegts is unsupported and native HLS takes over.
      const next = () => {
        if (current()) void start(format === 'flv' ? 'hls' : null);
      };
      const deadline = () => setTimeout(next, 10000);
      let timeout = deadline();
      let destroyPlayer = () => {};
      const playing = () => {
        if (!current()) return;
        clearTimeout(timeout);
        setState('playing');
      };
      const waiting = () => {
        if (!current()) return;
        setState('loading');
        clearTimeout(timeout);
        timeout = deadline();
      };
      el.addEventListener('playing', playing);
      el.addEventListener('waiting', waiting);
      el.addEventListener('stalled', waiting);
      el.addEventListener('error', next);
      dispose = () => {
        clearTimeout(timeout);
        el.removeEventListener('playing', playing);
        el.removeEventListener('waiting', waiting);
        el.removeEventListener('stalled', waiting);
        el.removeEventListener('error', next);
        destroyPlayer();
        el.pause();
        el.removeAttribute('src');
        el.load();
      };
      // play() also rejects for benign reasons (AbortError when Chrome pauses muted background
      // video, or a newer load interrupts it); stream errors and the deadline decide failure.
      const play = () => {
        if (current()) void el.play().catch(() => undefined);
      };
      try {
        if (format === 'hls') {
          if (!hlsUrl) return next();
          if (el.canPlayType('application/vnd.apple.mpegurl')) {
            el.src = hlsUrl;
            play();
          } else {
            const { default: Hls } = await import('hls.js');
            if (!current()) return;
            if (!Hls.isSupported()) return next();
            const player = new Hls({ maxBufferLength: 10, liveSyncDurationCount: 2 });
            destroyPlayer = () => player.destroy();
            player.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) next(); });
            player.on(Hls.Events.MANIFEST_PARSED, play);
            player.attachMedia(el);
            player.loadSource(hlsUrl);
          }
        } else {
          if (!flvUrl) return next();
          const { default: mpegts } = await import('mpegts.js');
          if (!current()) return;
          if (!mpegts.getFeatureList().mseLivePlayback) return next();
          const player = mpegts.createPlayer(
            { type: 'flv', isLive: true, url: flvUrl },
            { enableStashBuffer: false, liveBufferLatencyChasing: true },
          );
          destroyPlayer = () => player.destroy();
          player.on(mpegts.Events.ERROR, next);
          player.attachMediaElement(el);
          player.load();
          Promise.resolve(player.play()).catch(() => undefined);
        }
      } catch {
        next();
      }
    };
    retryPlayback.current = () => { if (unavailable) void start('flv'); };
    void start('flv');
    return () => {
      stopped = true;
      attempt++;
      retryPlayback.current = null;
      dispose();
    };
  }, [enabled, roomId]);

  return (
    <>
      <video
        ref={video}
        muted
        playsInline
        autoPlay
        aria-label={`Transmisión en vivo de ${alt}`}
        data-playback-state={enabled ? state : 'idle'}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${enabled && state === 'playing' ? 'opacity-100' : 'opacity-0'}`}
      />
      {expanded && enabled && state === 'unavailable' && (
        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
          <span className="rounded-xl bg-black/70 px-3 py-2 text-sm font-medium text-white">El video no carga por ahora.</span>
          <button
            type="button"
            onClick={() => retryPlayback.current?.()}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900"
          >
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      )}
    </>
  );
}

/** Card preview: muted video while the card is on screen; tapping opens the live room. */
export function LivePreview({ roomId, hlsUrl, flvUrl, coverUrl, avatarUrl, href, alt }: {
  roomId: string;
  hlsUrl: string | null;
  flvUrl: string | null;
  coverUrl: string | null;
  avatarUrl: string | null;
  href: string;
  alt: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const poster = coverUrl && !failedImages.includes(coverUrl) ? coverUrl
    : avatarUrl && !failedImages.includes(avatarUrl) ? avatarUrl : null;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Connect slightly before the card scrolls in, so the video is already playing when seen.
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
      rootMargin: '300px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="absolute inset-0">
      <div className="absolute inset-0 flex items-center justify-center bg-[#182127] text-white">
        <Radio className="h-12 w-12 opacity-30" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {poster && <img src={poster} alt="" referrerPolicy="no-referrer" onError={() => setFailedImages((failed) => [...failed, poster])} className="absolute inset-0 w-full h-full object-cover" />}
      </div>
      <LiveVideo roomId={roomId} hlsUrl={hlsUrl} flvUrl={flvUrl} alt={alt} enabled={visible} />
      <Link href={href} aria-label={`Entrar al live de ${alt}`} className="live-preview-open absolute inset-0 flex items-end justify-end p-3 focus-visible:outline-4 focus-visible:outline-emerald-400">
        <span className="live-preview-action inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
          <Play className="h-3.5 w-3.5" /> Entrar al live
        </span>
      </Link>
    </div>
  );
}
