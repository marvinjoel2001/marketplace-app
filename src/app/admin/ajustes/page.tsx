'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Card, ErrorBox, Loading, PageHeader, adminFetch, useAdminData } from '@/components/admin/ui';
import { ChangePassword } from '@/components/admin/AdminShell';
import { useToast } from '@/context/ToastContext';

interface WhatsApp {
  settings: { driver: 'LOG' | 'WAHA' | 'EVOLUTION'; baseUrl: string; session: string; hasApiKey: boolean };
  status: { configured: boolean; connected: boolean; detail: string };
}

const DRIVERS = [
  { key: 'LOG', label: 'Modo de prueba', help: 'No envía nada: el código aparece en el registro del servidor (y en pantalla, solo en desarrollo). En producción el login por celular queda desactivado.' },
  { key: 'WAHA', label: 'WAHA', help: 'Servidor open source (github.com/devlikeapro/waha). Docker: devlikeapro/waha, puerto 3000. Escanea el QR en su panel con el WhatsApp de Vitrina.' },
  { key: 'EVOLUTION', label: 'Evolution API', help: 'Servidor open source (github.com/EvolutionAPI/evolution-api). Crea una instancia, escanea el QR y usa aquí su nombre y la API key.' },
] as const;

export default function AdminSettingsPage() {
  const [admin, setAdmin] = useState<{ username: string; mustChangePassword: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/admin/session').then((r) => r.json()).then((d) => setAdmin(d.admin)).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHeader title="Ajustes" subtitle="Tu acceso de administrador y el envío de códigos por WhatsApp." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Usuario y contraseña">
          {admin ? <ChangePassword admin={admin} onDone={setAdmin} /> : <Loading />}
        </Card>
        <WhatsAppSettings />
      </div>
    </div>
  );
}

function WhatsAppSettings() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminData<WhatsApp>('whatsapp');
  const [driver, setDriver] = useState<WhatsApp['settings']['driver']>('LOG');
  const [baseUrl, setBaseUrl] = useState('');
  const [session, setSession] = useState('default');
  const [apiKey, setApiKey] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState<'save' | 'test' | null>(null);

  useEffect(() => {
    if (!data) return;
    // Fill the form once the saved settings arrive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDriver(data.settings.driver);
    setBaseUrl(data.settings.baseUrl);
    setSession(data.settings.session);
  }, [data]);

  if (loading) return <Card title="WhatsApp"><Loading /></Card>;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('save');
    try {
      await adminFetch('whatsapp', { method: 'PUT', json: { driver, baseUrl, session, apiKey } });
      setApiKey('');
      toast('Configuración de WhatsApp guardada');
      await reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const test = async () => {
    setBusy('test');
    try {
      const r = await adminFetch<{ sent: boolean; devOnly: boolean }>('whatsapp/test', { method: 'POST', json: { phone } });
      toast(r.sent ? 'Mensaje de prueba enviado: revisa ese WhatsApp' : 'Modo de prueba: el mensaje quedó en el registro del servidor', r.sent ? 'ok' : 'info');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const help = DRIVERS.find((d) => d.key === driver)?.help;

  return (
    <Card title="Códigos por WhatsApp">
      <p className={`mb-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${data.status.connected ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
        {data.status.connected ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
        {data.status.detail}
      </p>
      <form onSubmit={save} className="space-y-4">
        <fieldset>
          <legend className="field-label">Cómo se envían</legend>
          <div className="flex flex-wrap gap-2">
            {DRIVERS.map((d) => <button key={d.key} type="button" className="chip" aria-pressed={driver === d.key} onClick={() => setDriver(d.key)}>{d.label}</button>)}
          </div>
          <p className="mt-2 text-xs text-slate-500">{help}</p>
        </fieldset>
        {driver !== 'LOG' && (
          <>
            <div>
              <label htmlFor="wa-url" className="field-label">Dirección del servidor</label>
              <input id="wa-url" className="field" placeholder={driver === 'WAHA' ? 'https://waha.tudominio.com' : 'https://evolution.tudominio.com'} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wa-session" className="field-label">{driver === 'WAHA' ? 'Sesión' : 'Instancia'}</label>
                <input id="wa-session" className="field" value={session} onChange={(e) => setSession(e.target.value)} />
              </div>
              <div>
                <label htmlFor="wa-key" className="field-label">API key</label>
                <input id="wa-key" className="field" type="password" autoComplete="off" placeholder={data.settings.hasApiKey ? 'Guardada (deja vacío para mantenerla)' : 'Opcional'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              </div>
            </div>
          </>
        )}
        <button type="submit" className="btn btn-primary w-full" disabled={busy !== null}>{busy === 'save' && <Loader2 className="h-5 w-5 animate-spin" />}Guardar</button>
      </form>
      <div className="mt-5 border-t border-slate-100 pt-4">
        <label htmlFor="wa-test" className="field-label">Probar con un celular</label>
        <div className="flex gap-2">
          <input id="wa-test" className="field" inputMode="numeric" maxLength={8} placeholder="71234567" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
          <button type="button" className="btn btn-ghost shrink-0" disabled={phone.length !== 8 || busy !== null} onClick={test}>{busy === 'test' && <Loader2 className="h-4 w-4 animate-spin" />}Enviar prueba</button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Usa un número dedicado para Vitrina: WhatsApp puede bloquear números que envían muchos mensajes automáticos.</p>
      </div>
    </Card>
  );
}
