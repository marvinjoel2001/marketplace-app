import { Check, X } from 'lucide-react';

/** A plausible handle for the example profile, built from the store's own name. */
function exampleHandle(storeName: string): string {
  const base = storeName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);
  return base || 'tu_tienda';
}

/**
 * Where to find the TikTok username: a sketch of a profile screen that marks the display name as
 * the wrong thing to copy and the @username as the right one, next to the three steps.
 */
export function UsernameGuide({ storeName }: { storeName: string }) {
  const handle = exampleHandle(storeName);
  return (
    <div className="grid items-center gap-6 rounded-2xl bg-[#f5f3fb] p-4 sm:grid-cols-[200px_1fr] sm:p-5">
      {/* Profile screen sketch: not TikTok's UI, just the parts that matter here. */}
      <figure aria-label="Ejemplo de perfil de TikTok" className="mx-auto w-[200px]">
        <div className="relative rounded-[28px] border-[6px] border-black bg-white px-3 pb-4 pt-6 shadow-[0_10px_30px_-12px_rgba(32,36,67,0.35)]">
          <span aria-hidden className="absolute left-1/2 top-1.5 h-1.5 w-10 -translate-x-1/2 rounded-full bg-black/80" />
          <div className="mx-auto h-14 w-14 rounded-full bg-[#d9d3ff]" aria-hidden />

          <div className="relative mt-3 text-center">
            <p className="truncate text-[15px] font-extrabold text-slate-400 line-through decoration-rose-500 decoration-2">{storeName}</p>
            <span className="absolute -right-1 -top-4 flex items-center gap-0.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              <X className="h-2.5 w-2.5" strokeWidth={3} /> Este no
            </span>
          </div>

          <div className="relative mt-2 flex justify-center">
            <span className="rounded-lg px-2 py-1 text-[13px] font-bold text-black ring-2 ring-[#6248ff] ring-offset-2">@{handle}</span>
            <span className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-full bg-[#6248ff] px-2 py-0.5 text-[10px] font-bold text-white">
              <Check className="h-3 w-3" strokeWidth={3} /> Este sí
            </span>
          </div>

          <div className="mt-9 grid grid-cols-3 gap-1 text-center" aria-hidden>
            {['Siguiendo', 'Seguidores', 'Me gusta'].map((label) => (
              <div key={label}>
                <div className="mx-auto h-2 w-6 rounded bg-slate-200" />
                <p className="mt-1 text-[8px] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5" aria-hidden>
            <span className="rounded-md bg-slate-100 py-1.5 text-center text-[9px] font-semibold text-slate-500">Editar perfil</span>
            <span className="rounded-md bg-slate-100 py-1.5 text-center text-[9px] font-semibold text-slate-500">Compartir perfil</span>
          </div>
        </div>
      </figure>

      <div>
        <h3 className="text-base font-extrabold tracking-tight">¿Dónde está tu usuario de TikTok?</h3>
        <ol className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">1</span>
            <span>Abre TikTok con la cuenta con la que haces tus lives y toca <strong className="text-slate-900">Perfil</strong>, abajo a la derecha.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">2</span>
            <span>Debajo de tu foto está tu usuario: <strong className="text-slate-900">empieza con @</strong>. No es el nombre grande de arriba.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">3</span>
            <span>Escríbelo aquí. O toca <strong className="text-slate-900">Compartir perfil → Copiar enlace</strong> y pega ese enlace: sacamos el usuario solos.</span>
          </li>
        </ol>
        <p className="mt-3 text-xs leading-5 text-slate-500">¿Vendes desde más de una cuenta? Añade cada una. Tu live aparece en Vitrina desde la que esté transmitiendo.</p>
      </div>
    </div>
  );
}
