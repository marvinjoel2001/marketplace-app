'use client';

import React, { useEffect, useState } from 'react';
import { Phone, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Sheet } from './Sheet';
import { GoogleIcon, TikTokIcon } from '@/components/common/TikTokIcon';

const RESEND_SECONDS = 30;

export function LoginSheet() {
  const { loginRequest, closeLogin, loginWithProvider, requestPhoneCode, verifyPhoneCode, providers, demoLogin } = useAuth();
  const [mode, setMode] = useState<'options' | 'phone' | 'code'>('options');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [wait, setWait] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const reset = () => {
    setMode('options');
    setPhone('');
    setCode('');
    setDevCode('');
    setWait(0);
    setError('');
    setBusy(null);
  };

  const close = () => {
    reset();
    closeLogin();
  };

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    setError('');
    try {
      await action();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const sendCode = () =>
    run('send', async () => {
      const result = await requestPhoneCode(phone);
      setDevCode(result.devCode ?? '');
      setCode('');
      setWait(RESEND_SECONDS);
      setMode('code');
    });

  const confirmCode = () =>
    run('verify', async () => {
      await verifyPhoneCode(phone, code);
      reset();
    });

  const googleOff = Boolean(providers) && !providers!.google.enabled && !demoLogin;
  const tiktokOff = Boolean(providers) && !providers!.tiktok.enabled && !demoLogin;
  const demo = Boolean(providers) && demoLogin && !providers!.google.enabled && !providers!.tiktok.enabled;

  return (
    <Sheet open={Boolean(loginRequest)} onClose={close} title={loginRequest?.title ?? 'Inicia sesión'}>
      {loginRequest?.reason && <p className="mb-5 text-[15px] leading-relaxed text-ink-soft">{loginRequest.reason}</p>}

      {mode === 'options' && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="btn btn-ghost w-full justify-start"
            disabled={Boolean(busy) || googleOff}
            onClick={() => run('google', () => loginWithProvider('GOOGLE'))}
          >
            {busy === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
            Continuar con Google
            {googleOff && <span className="ml-auto text-xs font-semibold text-muted">Próximamente</span>}
          </button>
          <button type="button" className="btn btn-ghost w-full justify-start" disabled={Boolean(busy)} onClick={() => setMode('phone')}>
            <Phone className="h-5 w-5 text-verde" />
            Usar mi número de celular
          </button>
          <button
            type="button"
            className="btn w-full justify-start bg-ink text-white hover:bg-ink-soft"
            disabled={Boolean(busy) || tiktokOff}
            onClick={() => run('tiktok', () => loginWithProvider('TIKTOK'))}
          >
            {busy === 'tiktok' ? <Loader2 className="h-5 w-5 animate-spin" /> : <TikTokIcon />}
            Continuar con TikTok
            {tiktokOff && <span className="ml-auto text-xs font-semibold text-white/60">Próximamente</span>}
          </button>
          {demo && (
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Modo de prueba: Google y TikTok entran con una cuenta demo hasta que se configuren sus llaves.
            </p>
          )}
        </div>
      )}

      {mode === 'phone' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendCode();
          }}
          className="flex flex-col gap-4"
        >
          <button type="button" onClick={reset} className="-ml-1 flex w-fit items-center gap-1 text-sm font-semibold text-muted">
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
            <p className="mt-2 text-xs text-muted">Te enviaremos un código de 6 dígitos por WhatsApp.</p>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={phone.length !== 8 || Boolean(busy)}>
            {busy === 'send' ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
            Enviar código
          </button>
        </form>
      )}

      {mode === 'code' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirmCode();
          }}
          className="flex flex-col gap-4"
        >
          <button type="button" onClick={() => { setMode('phone'); setError(''); }} className="-ml-1 flex w-fit items-center gap-1 text-sm font-semibold text-muted">
            <ArrowLeft className="h-4 w-4" /> Cambiar número
          </button>
          <div>
            <label htmlFor="login-code" className="field-label">
              Código que te llegó al WhatsApp de +591 {phone}
            </label>
            <input
              id="login-code"
              className="field text-center text-2xl font-bold tracking-[0.5em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="······"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
            {devCode && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                Modo de prueba: WhatsApp no está conectado, tu código es <strong>{devCode}</strong>.
              </p>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={code.length !== 6 || Boolean(busy)}>
            {busy === 'verify' && <Loader2 className="h-5 w-5 animate-spin" />}
            Entrar
          </button>
          <button type="button" className="text-sm font-semibold text-verde-dark disabled:text-muted" disabled={wait > 0 || Boolean(busy)} onClick={sendCode}>
            {wait > 0 ? `Pedir otro código en ${wait} s` : 'Pedir otro código'}
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
