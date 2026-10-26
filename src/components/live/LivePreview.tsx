'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Play, Radio, RefreshCw, X } from 'lucide-react';

interface LivePreviewProps {
  roomId: string;
  hlsUrl: string | null;
  flvUrl: string | null;
  coverUrl: string | null;
  avatarUrl: string | null;
  liveUrl: string;
  alt: string;
}

type PlaybackState = 'loading' | 'playing' | 'unavailable';

function LiveVideo({ roomId, hlsUrl, flvUrl, enabled, expanded = false, alt }: {
  roomId: string;
  hlsUrl: string | null;
  flvUrl: string | null;
  enabled: boolean;
  expanded?: boolean;
  alt: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const sources = useRef({ hlsUrl, flvUrl });
  const retryPlayback = useRef<(() => void) | null>(null);
  const [state, setState] = useState<PlaybackState>('loading');

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
        controls={expanded}
        aria-label={`Transmisión en vivo de ${alt}`}
        data-playback-state={enabled ? state : 'idle'}
        className={`absolute inset-0 w-full h-full ${expanded ? 'object-contain' : 'object-cover pointer-events-none'} ${enabled && state === 'playing' ? 'opacity-100' : 'opacity-0'}`}
      />
      {enabled && state !== 'playing' && (
        <div role="status" className={`live-player-status absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center ${expanded ? '' : 'pointer-events-none'}`}>
          <span className="rounded-xl bg-slate-950/85 px-3 py-2 text-xs font-medium text-white">
            {state === 'loading' ? 'Conectando…' : expanded
              ? 'El video no está disponible por ahora.'
              : 'Abrir transmisión'}
          </span>
          {expanded && state === 'unavailable' && <button type="button" onClick={() => retryPlayback.current?.()} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-400"><RefreshCw size={14} /> Reintentar video</button>}
        </div>
      )}
    </>
  );
}

export function LivePreview({ roomId, hlsUrl, flvUrl, coverUrl, avatarUrl, liveUrl, alt }: LivePreviewProps) {
  const box = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open) el.showModal();
    else if (el.open) el.close();
  }, [open]);

  const playerProps = { roomId, hlsUrl, flvUrl, alt };

  return (
    <div ref={box} className="absolute inset-0">
      <div className="absolute inset-0 flex items-center justify-center bg-[#182127] text-white">
        <Radio className="h-12 w-12 opacity-30" />
        {poster && <img src={poster} alt={alt} referrerPolicy="no-referrer" onError={() => setFailedImages((failed) => [...failed, poster])} className="absolute inset-0 w-full h-full object-cover" />}
      </div>
      <LiveVideo {...playerProps} enabled={visible && !open} />
      <button type="button" aria-label={`Ver LIVE de ${alt}`} onClick={() => setOpen(true)} className="live-preview-open absolute inset-0 flex items-end justify-end p-3 focus-visible:outline-4 focus-visible:outline-emerald-400">
        <span className="live-preview-action inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm">
          <Play className="h-3.5 w-3.5" /> Ver LIVE
        </span>
      </button>

      <dialog ref={dialog} aria-label={`LIVE: ${alt}`} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} className="live-viewer fixed inset-0 m-auto w-[min(94vw,960px)] max-h-[92dvh] overflow-y-auto rounded-2xl bg-slate-950 p-0 text-white shadow-2xl backdrop:bg-black/75">
        <div className="flex items-center justify-between gap-4 p-4">
          <h2 className="truncate font-bold">{alt}</h2>
          <button type="button" aria-label="Cerrar transmisión" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="relative h-[min(62dvh,540px)] bg-black">
          {open && <LiveVideo {...playerProps} enabled expanded />}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-xs text-slate-300">Activa el sonido o la pantalla completa desde los controles del video.</p>
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950">Ver en TikTok <ExternalLink className="h-4 w-4" /></a>
        </div>
      </dialog>
    </div>
  );
}
