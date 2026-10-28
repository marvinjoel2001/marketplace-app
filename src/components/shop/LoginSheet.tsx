'use client';

import React, { useState } from 'react';
import { Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Sheet } from './Sheet';
import { GoogleIcon, TikTokIcon } from '@/components/common/TikTokIcon';

export function LoginSheet() {
  const { loginRequest, closeLogin, loginWithProvider, loginWithPhone, providers } = useAuth();
  const [mode, setMode] = useState<'options' | 'phone'>('options');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const close = () => {
    setMode('options');
    setError('');
    setBusy(null);
    closeLogin();
  };

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    setError('');
    try {
      await action();
      setMode('options');
      setPhone('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const demo = providers && !providers.google.enabled && !providers.tiktok.enabled;

  return (
    <Sheet open={Boolean(loginRequest)} onClose={close} title="Inicia sesión">
      {loginRequest?.reason && <p className="mb-5 text-[15px] leading-relaxed text-ink-soft">{loginRequest.reason}</p>}

      {mode === 'options' ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="btn btn-ghost w-full justify-start"
            disabled={Boolean(busy)}
            onClick={() => run('google', () => loginWithProvider('GOOGLE'))}
          >
            {busy === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
            Continuar con Google
          </button>
          <button type="button" className="btn btn-ghost w-full justify-start" disabled={Boolean(busy)} onClick={() => setMode('phone')}>
            <Phone className="h-5 w-5 text-verde" />
            Usar mi número de celular
          </button>
          <button
            type="button"
            className="btn w-full justify-start bg-ink text-white hover:bg-ink-soft"
            disabled={Boolean(busy)}
            onClick={() => run('tiktok', () => loginWithProvider('TIKTOK'))}
          >
            {busy === 'tiktok' ? <Loader2 className="h-5 w-5 animate-spin" /> : <TikTokIcon />}
            Continuar con TikTok
          </button>
          {demo && (
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Modo de prueba: Google y TikTok entran con una cuenta demo hasta que se configuren sus llaves.
            </p>
          )}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run('phone', () => loginWithPhone(phone));
          }}
          className="flex flex-col gap-4"
        >
          <button type="button" onClick={() => setMode('options')} className="-ml-1 flex w-fit items-center gap-1 text-sm font-semibold text-muted">
            <ArrowLeft className="h-4 w-4" /> Otras opciones
          </button>
          <div>
            <label htmlFor="login-phone" className="field-label">
              Tu número de celular
            </label>
            <div className="flex items-center gap-2">
              <span className="field w-auto shrink-0 bg-paper font-semibold text-ink-soft">+591</span>
              <input
                id="login-phone"
                className="field"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="71234567"
                maxLength={8}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={phone.length !== 8 || Boolean(busy)}>
            {busy === 'phone' && <Loader2 className="h-5 w-5 animate-spin" />}
            Entrar
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </Sheet>
  );
}
