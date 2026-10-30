'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react';
import { Card, ErrorBox, Loading, adminFetch, useAdminData } from './ui';
import { useToast } from '@/context/ToastContext';

interface PhotoAi {
  enabled: boolean;
  model: string;
  models: string[];
  hasApiKey: boolean;
  keyHint: string;
  fromEnv: boolean;
}

const MODEL_INFO: Record<string, { name: string; help: string }> = {
  'claude-opus-5-5': { name: 'Claude Opus 5.5', help: 'El más preciso: reconoce mejor marcas, modelos y etiquetas.' },
  'claude-sonnet-5-5': { name: 'Claude Sonnet 5.5', help: 'Muy bueno y más económico que Opus.' },
  'claude-haiku-5-5': { name: 'Claude Haiku 5.5', help: 'El más rápido y barato. Puede fallar más en marcas y detalles.' },
};

/** Anthropic key that lets sellers publish from a photo. Without it the seller form stays manual. */
export function PhotoAiSettings() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminData<PhotoAi>('vision-ai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [busy, setBusy] = useState<'save' | 'test' | 'remove' | null>(null);
  const [tested, setTested] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!data) return;
    // Fill the form once the saved settings arrive.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModel(data.model);
    setEnabled(data.enabled);
  }, [data]);

  if (loading) return <Card title="Fotos con IA"><Loading /></Card>;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;

  const active = data.enabled && data.hasApiKey;

  const save = async (removeKey = false) => {
    setBusy(removeKey ? 'remove' : 'save');
    try {
      await adminFetch('vision-ai', { method: 'PUT', json: removeKey ? { removeKey: true } : { apiKey, model, enabled } });
      setApiKey('');
      setTested(null);
      toast(removeKey ? 'API key quitada' : 'Reconocimiento de fotos guardado');
      await reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const test = async () => {
    setBusy('test');
    setTested(null);
    try {
      const r = await adminFetch<{ name: string }>('vision-ai/test', { method: 'POST', json: { apiKey, model } });
      setTested({ ok: true, text: `La API key funciona con ${r.name}.` });
    } catch (err) {
      setTested({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card title="Fotos con IA">
      <p className={`mb-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
        {active ? <Sparkles className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
        {active
          ? 'Activo: cuando una tienda sube una foto, recibe el nombre, la categoría, los detalles y un precio de referencia ya llenos.'
          : data.hasApiKey
            ? 'Apagado: las tiendas llenan los datos de sus productos a mano.'
            : 'Falta la API key: mientras tanto las tiendas llenan los datos a mano.'}
      </p>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span id="ai-enabled" className="text-sm font-semibold">Reconocer las fotos de productos</span>
          <button type="button" role="switch" aria-checked={enabled} aria-labelledby="ai-enabled" onClick={() => setEnabled(!enabled)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <div>
          <label htmlFor="ai-key" className="field-label">API key de Anthropic</label>
          <input
            id="ai-key"
            className="field font-mono"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={data.hasApiKey ? `Guardada (${data.keyHint}). Deja vacío para mantenerla` : 'sk-ant-...'}
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setTested(null); }}
          />
          <p className="mt-2 text-xs text-slate-500">
            Créala en <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 underline">console.anthropic.com</a>. Se guarda en el servidor y no se vuelve a mostrar.
            {data.fromEnv && ' Ahora se usa la de la variable ANTHROPIC_API_KEY del servidor.'}
          </p>
        </div>
        <fieldset>
          <legend className="field-label">Modelo</legend>
          <div className="space-y-2">
            {data.models.map((m) => (
              <button key={m} type="button" aria-pressed={model === m} onClick={() => { setModel(m); setTested(null); }} className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors ${model === m ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <span className="block text-sm font-semibold">{MODEL_INFO[m]?.name ?? m}</span>
                <span className="block text-xs text-slate-500">{MODEL_INFO[m]?.help}</span>
              </button>
            ))}
          </div>
        </fieldset>
        {tested && (
          <p role="status" className={`flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${tested.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
            {tested.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            {tested.text}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-ghost" disabled={busy !== null || (!apiKey && !data.hasApiKey)} onClick={test}>{busy === 'test' && <Loader2 className="h-4 w-4 animate-spin" />}Probar conexión</button>
          <button type="submit" className="btn btn-primary" disabled={busy !== null}>{busy === 'save' && <Loader2 className="h-5 w-5 animate-spin" />}Guardar</button>
        </div>
        {data.hasApiKey && !data.fromEnv && (
          <button type="button" className="w-full text-center text-xs font-semibold text-slate-500 hover:text-red-600" disabled={busy !== null} onClick={() => save(true)}>Quitar la API key guardada</button>
        )}
      </form>
    </Card>
  );
}
