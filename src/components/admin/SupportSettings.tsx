'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { supportChatUrl, type SupportLine } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Card, ErrorBox, Loading, adminFetch, useAdminData } from './ui';

type Saved = Omit<SupportLine, 'available'>;

/** +591 7123 4567 for Bolivian cells, +<digits> otherwise. */
const formatNumber = (digits: string) => {
  const bo = digits.match(/^591(\d{4})(\d{4})$/);
  return bo ? `+591 ${bo[1]} ${bo[2]}` : `+${digits}`;
};

/** The WhatsApp line stores see under "Habla con soporte" in their help page. */
export function SupportSettings() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminData<Saved>('support');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [hours, setHours] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!data) return;
    // Fill the form once the saved settings arrive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWhatsapp(data.whatsapp ? formatNumber(data.whatsapp) : '');
    setMessage(data.message);
    setHours(data.hours);
  }, [data]);

  if (loading) return <Card title="Soporte para tiendas"><Loading /></Card>;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = await adminFetch<Saved>('support', { method: 'PUT', json: { whatsapp, message, hours } });
      toast(saved.whatsapp ? 'Soporte guardado: las tiendas ya ven el botón' : 'Soporte sin número: las tiendas no ven el botón');
      await reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Soporte para tiendas">
      <p className="mb-4 text-sm text-slate-500">
        En la ayuda de su panel, cada tienda ve <strong className="text-slate-800">Habla con soporte</strong> y abre un chat de WhatsApp con este número.
        {data.whatsapp ? '' : ' Mientras no haya número, el botón no aparece.'}
      </p>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label htmlFor="support-wa" className="field-label">WhatsApp de soporte</label>
          <input id="support-wa" className="field" inputMode="tel" placeholder="71234567 o +54 9 11 1234 5678" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          <p className="mt-1.5 text-xs text-slate-500">Celular boliviano de 8 dígitos, o el número completo con + y código de país. Déjalo vacío para quitar el botón.</p>
        </div>
        <div>
          <label htmlFor="support-msg" className="field-label">Primer mensaje</label>
          <textarea id="support-msg" className="field min-h-20" maxLength={300} value={message} onChange={(e) => setMessage(e.target.value)} />
          <p className="mt-1.5 text-xs text-slate-500">Escribe {'{tienda}'} donde quieras el nombre de la tienda. La tienda puede cambiarlo antes de enviarlo.</p>
        </div>
        <div>
          <label htmlFor="support-hours" className="field-label">Horario de atención (opcional)</label>
          <input id="support-hours" className="field" maxLength={80} placeholder="Lunes a sábado, 9:00 a 19:00" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary flex-1" disabled={busy}>{busy && <Loader2 className="h-5 w-5 animate-spin" />}Guardar</button>
          {data.whatsapp && (
            <a href={supportChatUrl(data, 'Tienda de prueba')} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <ExternalLink className="h-4 w-4" /> Probar chat
            </a>
          )}
        </div>
      </form>
    </Card>
  );
}
