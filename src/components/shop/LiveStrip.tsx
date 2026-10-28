import Link from 'next/link';
import { Store as StoreIcon } from 'lucide-react';
import type { LiveStore } from '@/lib/api';
import { mediaUrl } from '@/lib/catalog';

export function StoreAvatar({ name, logo, size = 64 }: { name: string; logo?: string | null; size?: number }) {
  const src = mediaUrl(logo);
  return (
    <span
      className="flex items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-verde-tint text-verde-dark"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="type-sign text-lg font-extrabold">{name.slice(0, 1).toUpperCase() || <StoreIcon />}</span>
      )}
    </span>
  );
}

/** Stores that are live right now, shown like stories: tap one to see what it's selling. */
export function LiveStrip({ lives }: { lives: LiveStore[] }) {
  return (
    <section aria-labelledby="live-title">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="live-title" className="type-sign flex items-center gap-2 text-lg font-extrabold">
          <span className="animate-live-dot h-2.5 w-2.5 rounded-full bg-live" aria-hidden />
          En vivo ahora
        </h2>
        <Link href="/en-vivo" className="text-sm font-semibold text-verde-dark">
          Ver todos
        </Link>
      </div>
      {lives.length === 0 ? (
        <p className="panel px-4 py-3 text-sm text-muted">
          Ninguna tienda está en vivo en este momento. Cuando una empiece, aparece aquí.
        </p>
      ) : (
        <ul className="scroll-row -mx-4 px-4">
          {lives.map((live) => (
            <li key={live.store.id}>
              <Link href={`/en-vivo/${live.store.slug}`} className="flex w-[76px] flex-col items-center gap-1.5 text-center">
                <span className="live-ring relative">
                  <StoreAvatar name={live.store.name} logo={live.store.logo} />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded bg-live px-1.5 text-[10px] font-extrabold uppercase leading-4 tracking-wide text-white">
                    Live
                  </span>
                </span>
                <span className="line-clamp-2 text-xs font-medium leading-tight">{live.store.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
