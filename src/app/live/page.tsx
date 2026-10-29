import Link from 'next/link';
import { Radio, ShoppingBag } from 'lucide-react';
import { marketplaceApi, type LiveStore } from '@/lib/api';
import { productImages } from '@/lib/catalog';
import { LiveDirectory } from '@/components/live/LiveDirectory';
import { LiveSourceToggle, type LiveSource } from '@/components/shop/LiveSourceToggle';
import { StoreAvatar } from '@/components/shop/LiveStrip';
import './live.css';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['Ropa', 'Electrónica', 'Hogar', 'Belleza', 'Otros'];

/** Stores registered in Vitrina that are live: their products can be bought right here. */
function RegisteredLives({ lives }: { lives: LiveStore[] }) {
  if (lives.length === 0) {
    return (
      <div className="live-card" style={{ padding: 32, textAlign: 'center' }}>
        <Radio className="mx-auto mb-3 h-8 w-8 text-[#ff3d62]" />
        <h2 className="text-lg font-bold">Ninguna tienda registrada está en vivo ahora</h2>
        <p className="mt-2 text-sm text-[#b4bec8]">
          Cuando una tienda de Vitrina empiece su live desde su panel, aparece aquí con los productos que está vendiendo.
        </p>
      </div>
    );
  }
  return (
    <div className="live-grid">
      {lives.map((live) => {
        const cover = live.coverImageUrl || (live.offers[0] ? productImages(live.offers[0].product)[0] : '');
        return (
          <Link key={live.store.id} href={`/en-vivo/${live.store.slug}`} className="live-card block">
            <div className="live-card-media">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              )}
              <span className="absolute left-3 top-3 rounded-md bg-[#e3304b] px-2 py-0.5 text-xs font-extrabold text-white">LIVE</span>
            </div>
            <div className="flex items-center gap-3 p-3">
              <span className="h-10 w-10 shrink-0">
                <StoreAvatar name={live.store.name} logo={live.store.logo} size={40} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-bold text-white">{live.store.name}</span>
                <span className="block truncate text-sm text-[#b4bec8]">{live.title}</span>
                <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#21d5b2]">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {live.offers.length} {live.offers.length === 1 ? 'producto para comprar' : 'productos para comprar'}
                </span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default async function LiveShoppingDirectoryPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const source: LiveSource = params.fuente === 'tiendas' ? 'tiendas' : 'tiktok';
  const category = typeof params.category === 'string' && CATEGORIES.includes(params.category) ? params.category : undefined;
  const page = typeof params.page === 'string' && /^\d{1,4}$/.test(params.page) && Number(params.page) > 0 ? Number(params.page) : 1;
  const [lives, registered] = await Promise.all([
    marketplaceApi.getTikTokLives({ category, page, limit: 100 }),
    marketplaceApi.getLiveStores(),
  ]);
  return (
    <div className="live-page">
      <aside className="live-side-note" aria-label="Vitrina en vivo">
        <h2>Lo que necesitás,<br />más cerca.</h2>
        <hr />
        <p>Descubrí productos en vivo, comunidad y las mejores tiendas de Bolivia.</p>
      </aside>
      <div className="min-w-0">
        <div className="mb-4 overflow-x-auto">
          <LiveSourceToggle
            dark
            value={source}
            counts={{ tiktok: lives?.pagination.total ?? 0, tiendas: registered.length }}
            hrefFor={(s) => (s === 'tiendas' ? '/live?fuente=tiendas' : '/live')}
          />
        </div>
        {source === 'tiendas' ? (
          <RegisteredLives lives={registered} />
        ) : (
          <LiveDirectory key={`${category ?? 'all'}:${page}`} initialData={lives} category={category} page={page} initialNow={Date.parse(lives?.meta.server_time ?? '') || 0} />
        )}
      </div>
    </div>
  );
}
