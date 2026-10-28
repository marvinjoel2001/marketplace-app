import Link from 'next/link';
import { Eye } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';
import { mediaUrl, productImages } from '@/lib/catalog';
import { StoreAvatar } from '@/components/shop/LiveStrip';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'En vivo — Vitrina' };

export default async function LiveStoresPage() {
  const lives = await marketplaceApi.getLiveStores();

  return (
    <div>
      <h1 className="type-sign text-2xl font-extrabold">En vivo</h1>
      <p className="mt-1 text-sm text-muted">Tiendas de Vitrina que están transmitiendo ahora. Entra y compra lo que muestran.</p>

      {lives.length === 0 ? (
        <div className="panel mt-6 px-5 py-8 text-center">
          <p className="font-semibold">Ninguna tienda está en vivo en este momento.</p>
          <p className="mt-1 text-sm text-muted">Vuelve más tarde o mira los productos de siempre.</p>
          <Link href="/" className="btn btn-ghost mt-4">
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lives.map((live) => {
            const cover = mediaUrl(live.coverImageUrl) || (live.offers[0] ? productImages(live.offers[0].product)[0] : '');
            return (
              <li key={live.store.id}>
                <Link href={`/en-vivo/${live.store.slug}`} className="panel block overflow-hidden">
                  <div className="relative aspect-[4/3] bg-ink">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="h-full w-full object-cover opacity-90" />
                    )}
                    <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-live px-2 py-1 text-xs font-extrabold text-white">
                      <span className="animate-live-dot h-1.5 w-1.5 rounded-full bg-white" /> En vivo
                    </span>
                    {live.viewerCount > 0 && (
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-md bg-ink/70 px-2 py-1 text-xs font-semibold text-white">
                        <Eye className="h-3.5 w-3.5" /> {live.viewerCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-3">
                    <StoreAvatar name={live.store.name} logo={live.store.logo} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{live.store.name}</p>
                      <p className="truncate text-sm text-muted">{live.title}</p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-sm text-ink-soft">
        ¿Buscas más?{' '}
        <Link href="/live" className="font-semibold text-verde-dark underline underline-offset-4">
          Mira otros vendedores de Bolivia en vivo en TikTok
        </Link>
      </p>
    </div>
  );
}
