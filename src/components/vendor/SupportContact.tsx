'use client';

import { useEffect, useState } from 'react';
import { Check, Clock, Copy, MessageCircle } from 'lucide-react';
import { marketplaceApi, supportChatUrl, type SupportLine } from '@/lib/api';
import { copyText } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useVendor } from '@/context/VendorContext';

/** +591 7123 4567 for Bolivian cells, +<digits> otherwise. */
function formatNumber(digits: string): string {
  const bo = digits.match(/^591(\d{4})(\d{4})$/);
  return bo ? `+591 ${bo[1]} ${bo[2]}` : `+${digits}`;
}

/**
 * "Habla con soporte": opens a WhatsApp chat with Vitrina's support line, the first message already
 * written with the store's name. Hidden until the admin sets a number.
 */
export function SupportContact() {
  const storeName = useVendor().store.name;
  const [line, setLine] = useState<SupportLine | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    marketplaceApi.getSupport().then((s) => { if (active) setLine(s); });
    return () => { active = false; };
  }, []);

  return line?.available ? <SupportCard line={line} storeName={storeName} /> : null;
}

export function SupportCard({ line, storeName }: { line: SupportLine; storeName: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const message = line.message.replaceAll('{tienda}', storeName);
  const number = formatNumber(line.whatsapp);

  const copy = async () => {
    if (await copyText(number)) {
      setCopied(true);
      toast('Número de soporte copiado');
    } else toast(`No se pudo copiar. El número es ${number}`, 'error');
  };

  return (
    <section aria-labelledby="support-title" className="vendor-card grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
      <div className="min-w-0">
        <h2 id="support-title" className="text-xl font-extrabold tracking-tight">Habla con soporte</h2>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          ¿Algo no funciona o tienes una duda? Escríbenos por WhatsApp y te responde una persona del equipo de Vitrina.
        </p>
        {line.hours && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Clock className="h-3.5 w-3.5" /> {line.hours}
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <a
            href={supportChatUrl(line, storeName)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-black hover:bg-[#20bd5b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <MessageCircle className="h-5 w-5" /> Escribir por WhatsApp
          </a>
          <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-[#e2e5ef] px-4 py-3 text-sm font-semibold tabular-nums hover:bg-slate-50">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
            {number}
          </button>
        </div>
      </div>

      {/* The first message, as it will appear in the chat: no surprises before opening WhatsApp. */}
      <figure className="w-full rounded-2xl bg-[#efeae2] p-4 sm:w-72" aria-label="Mensaje que se enviará">
        <figcaption className="mb-2 text-[11px] font-medium text-[#54656f]">Tu primer mensaje</figcaption>
        <p className="relative ml-auto w-fit max-w-full rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-sm leading-5 text-[#111b21] shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]">
          {message}
        </p>
        <p className="mt-2 text-[11px] leading-4 text-[#54656f]">Puedes cambiarlo antes de enviarlo.</p>
      </figure>
    </section>
  );
}
