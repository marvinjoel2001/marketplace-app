'use client';

import { useState } from 'react';
import { ChevronDown, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { marketplaceApi, tiktokUsernameFromText, type StoreTikTokAccount } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { MAX_TIKTOK_ACCOUNTS } from './useTikTokAccounts';
import { UsernameGuide } from './UsernameGuide';

/** What the typed text will become, so a pasted link visibly turns into @user before saving. */
function Preview({ text, verb = "Se añadirá" }: { text: string; verb?: string }) {
  if (!text.trim()) return null;
  const username = tiktokUsernameFromText(text);
  if (username) return <p className="mt-1.5 text-xs text-slate-500">{verb} <strong className="text-slate-900">@{username}</strong></p>;
  if (/^https?:\/\/(vm|vt)\.tiktok\.com\//i.test(text.trim()))
    return <p className="mt-1.5 text-xs text-slate-500">Enlace corto de TikTok: sacamos el usuario al añadirlo.</p>;
  return <p className="mt-1.5 text-xs text-rose-600">Escribe el usuario que empieza con @ (sin espacios) o pega el enlace de tu perfil.</p>;
}

function AccountRow({ account, main, storeId, onChange }: {
  account: StoreTikTokAccount;
  main: boolean;
  storeId: string;
  onChange: (list: StoreTikTokAccount[]) => void;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<'view' | 'edit' | 'remove'>('view');
  const [text, setText] = useState(account.username);
  const [busy, setBusy] = useState(false);

  const run = async (task: () => Promise<StoreTikTokAccount[]>, done: string) => {
    setBusy(true);
    try {
      onChange(await task());
      toast(done);
      setMode('view');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'edit')
    return (
      <li className="p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => marketplaceApi.renameStoreTikTokAccount(storeId, account.username, text), 'Cuenta actualizada');
          }}
        >
          <label htmlFor={`edit-${account.username}`} className="text-xs font-semibold text-slate-500">Corregir @{account.username}</label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <input id={`edit-${account.username}`} className="field min-w-0 sm:flex-1" value={text} onChange={(e) => setText(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} autoFocus />
            <button type="button" className="btn btn-ghost !min-h-11 !px-4 !text-xs" onClick={() => { setText(account.username); setMode('view'); }} disabled={busy}>Cancelar</button>
            <button type="submit" className="btn btn-primary !min-h-11 !px-4 !text-xs" disabled={busy || !text.trim()}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
            </button>
          </div>
          <Preview text={text} verb="Quedará" />
        </form>
      </li>
    );

  return (
    <li className="flex flex-wrap items-center gap-3 p-3">
      <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold uppercase text-white">
        {account.username.replace(/[^a-z0-9]/gi, '').slice(0, 1) || '@'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <a href={account.profileUrl} target="_blank" rel="noopener noreferrer" className="break-all font-bold hover:underline">@{account.username}</a>
          {main && <span className="rounded-full bg-[#eeebff] px-2 py-0.5 text-[10px] font-semibold text-[#6248ff]">Principal</span>}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {account.live ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#e8264d]">
              <span className="animate-live-dot h-2 w-2 rounded-full bg-[#FE2C55]" /> En vivo ahora
              {account.viewerCount > 0 && ` (${account.viewerCount.toLocaleString('es-BO')} viendo)`}
            </span>
          ) : main ? (
            'Sin live ahora. Tu enlace usa esta cuenta cuando ninguna transmite.'
          ) : (
            'Sin live ahora'
          )}
        </p>
      </div>
      {mode === 'remove' ? (
        <div className="flex w-full flex-wrap items-center gap-2 rounded-xl bg-rose-50 p-2 pl-3 sm:w-auto" role="group" aria-label={`Quitar @${account.username}`}>
          <p className="mr-auto text-xs font-semibold text-rose-700">¿Quitar? Su live dejará de verse en tu tienda.</p>
          <button type="button" className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white" onClick={() => setMode('view')} disabled={busy}>Cancelar</button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700" disabled={busy}
            onClick={() => void run(() => marketplaceApi.removeStoreTikTokAccount(storeId, account.username), `Quitaste @${account.username}`)}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Quitar
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <button type="button" onClick={() => setMode('edit')} aria-label={`Editar @${account.username}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setMode('remove')} aria-label={`Quitar @${account.username}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  );
}

/** The TikTok accounts the store sells from, with the guide to find the username. */
export function TikTokAccounts({ storeId, storeName, accounts, onChange }: {
  storeId: string;
  storeName: string;
  accounts: StoreTikTokAccount[] | null;
  onChange: (list: StoreTikTokAccount[]) => void;
}) {
  const toast = useToast();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [guide, setGuide] = useState<boolean | null>(null); // null: open only while there are no accounts
  const guideOpen = guide ?? (accounts !== null && accounts.length === 0);
  const full = (accounts?.length ?? 0) >= MAX_TIKTOK_ACCOUNTS;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const list = await marketplaceApi.addStoreTikTokAccount(storeId, text);
      const added = list.find((a) => !accounts?.some((b) => b.username === a.username));
      onChange(list);
      setText('');
      toast(added ? `Añadiste @${added.username}` : 'Esa cuenta ya estaba en tu lista');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel flex flex-col gap-4 p-4" aria-labelledby="tiktok-accounts-title">
      <div>
        <h2 id="tiktok-accounts-title" className="font-bold">Tus cuentas de TikTok</h2>
        <p className="mt-1 text-sm text-ink-soft">Cuando hagas live desde cualquiera de ellas, tus clientes lo ven en Vitrina con tus productos.</p>
      </div>

      {accounts === null ? (
        <div className="h-16 animate-pulse rounded-xl bg-paper" />
      ) : accounts.length > 0 && (
        <ul className="divide-y divide-line rounded-xl border border-line">
          {accounts.map((account, i) => (
            <AccountRow key={account.username} account={account} main={i === 0} storeId={storeId} onChange={onChange} />
          ))}
        </ul>
      )}

      {full ? (
        <p className="text-xs text-slate-500">Tienes {MAX_TIKTOK_ACCOUNTS} cuentas, el máximo. Quita una para añadir otra.</p>
      ) : (
        <form onSubmit={add}>
          <label htmlFor="tiktok-add" className="field-label">
            {accounts?.length ? '¿Vendes también desde otra cuenta?' : 'Tu usuario de TikTok'}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="tiktok-add"
              className="field min-w-0 sm:flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="@tu_usuario o enlace de tu perfil"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button type="submit" className="btn btn-primary w-full shrink-0 sm:w-auto" disabled={busy || !text.trim()}>
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              {accounts?.length ? 'Añadir cuenta' : 'Vincular cuenta'}
            </button>
          </div>
          <Preview text={text} />
        </form>
      )}

      <div>
        <button type="button" onClick={() => setGuide(!guideOpen)} aria-expanded={guideOpen} className="flex items-center gap-1.5 text-sm font-semibold text-[#5b45fa]">
          <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${guideOpen ? 'rotate-180' : ''}`} />
          ¿Dónde encuentro mi usuario?
        </button>
        {guideOpen && <div className="mt-3"><UsernameGuide storeName={storeName} /></div>}
      </div>
    </section>
  );
}
