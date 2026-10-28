'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, LogIn, RefreshCw } from 'lucide-react';

interface SessionStatus {
  logged_in: boolean;
  login_in_progress: boolean;
  interactive_login: boolean;
  worker_enabled: boolean;
}

// The TikTok account is the operator's (whoever runs the backend): discovery reads the LIVE feed
// TikTok recommends to that account and keeps only sellers. Visitors never sign in here.
export function TikTokConnect({ onConnected }: { onConnected: () => void }) {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const wasWaiting = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/tiktok/session', { cache: 'no-store' });
      if (res.ok) setStatus(await res.json());
    } catch {
      /* status is optional; the directory keeps working without it */
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/tiktok/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: SessionStatus | null) => {
        if (active && body) setStatus(body);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Poll while the sign-in window is open on this machine.
  useEffect(() => {
    if (!status?.login_in_progress) return;
    wasWaiting.current = true;
    const id = setInterval(() => void load(), 3000);
    return () => clearInterval(id);
  }, [status?.login_in_progress, load]);

  useEffect(() => {
    if (wasWaiting.current && status && !status.login_in_progress && status.logged_in) {
      wasWaiting.current = false;
      onConnected();
    }
  }, [status, onConnected]);

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch('/api/tiktok/session', { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) setError(body.error || 'No se pudo abrir el inicio de sesión');
      else setStatus(body);
    } catch {
      setError('No se pudo abrir el inicio de sesión');
    } finally {
      setStarting(false);
    }
  };

  if (!status || !status.interactive_login) return null;

  if (status.login_in_progress)
    return (
      <div className="live-connection-note" role="status">
        <RefreshCw size={16} className="live-spin" />
        <p>
          Se abrió una ventana de Chromium en este equipo con TikTok. Inicia sesión ahí (con tu usuario o con el código QR
          desde la app). Cuando termines, la ventana se cierra sola y buscamos los lives que TikTok te recomienda.
        </p>
      </div>
    );

  if (status.logged_in)
    return (
      <div className="live-connection-note" role="status">
        <CheckCircle2 size={16} />
        <p>
          TikTok conectado: mostramos los lives de venta que TikTok recomienda a tu cuenta.
          {!status.worker_enabled && ' La detección está desactivada en el backend (TIKTOK_LIVES_ENABLED).'}
        </p>
      </div>
    );

  return (
    <div className="live-connection-note" role="status">
      <LogIn size={16} />
      <div>
        <p>
          TikTok solo muestra pocos lives sin una cuenta. Conecta tu cuenta de TikTok para listar los lives de venta que te
          recomienda.
        </p>
        {error && <p>{error}</p>}
        <button type="button" className="live-primary-button" onClick={() => void start()} disabled={starting} style={{ marginTop: 8 }}>
          <LogIn size={14} /> {starting ? 'Abriendo…' : 'Iniciar sesión con TikTok'}
        </button>
      </div>
    </div>
  );
}
