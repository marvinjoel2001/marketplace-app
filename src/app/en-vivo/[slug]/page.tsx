import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marketplaceApi } from '@/lib/api';
import { describeSchedule } from '@/lib/schedule';
import { ProductCard } from '@/components/shop/ProductCard';
import { StoreAvatar } from '@/components/shop/LiveStrip';
import { TikTokIcon } from '@/components/common/TikTokIcon';

export const dynamic = 'force-dynamic';

export default async function StoreLivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [store, lives] = await Promise.all([marketplaceApi.getStore(slug), marketplaceApi.getLiveStores()]);
  if (!store) notFound();

  const live = lives.find((l) => l.store.id === store.id);
  // While live, show what the store picked for the live; otherwise everything it sells.
  const offers = live?.offers.length ? live.offers : store.offers;
  const products = offers.map((o) => ({ ...o.product, offers: [{ ...o, store }] }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <span className={live ? 'live-ring' : ''}>
          <StoreAvatar name={store.name} logo={store.logo} size={68} />
        </span>
        <div className="min-w-0">
          {live && (
            <p className="mb-0.5 flex items-center gap-1.5 text-sm font-bold text-live">
              <span className="animate-live-dot h-2 w-2 rounded-full bg-live" /> En vivo ahora
            </p>
          )}
          <h1 className="type-sign truncate text-2xl font-extrabold">{store.name}</h1>
          <p className="text-sm text-muted">Entregas: {describeSchedule(store)}</p>
        </div>
      </header>

      {live && (
        <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px]">{live.title}</p>
          {store.tiktokLiveUrl && (
            <a href={store.tiktokLiveUrl} target="_blank" rel="noopener noreferrer" className="btn shrink-0 bg-ink text-white hover:bg-ink-soft">
              <TikTokIcon /> Ver el live en TikTok
            </a>
          )}
        </div>
      )}

      <section aria-labelledby="live-products">
        <h2 id="live-products" className="type-sign mb-3 text-lg font-extrabold">
          {live ? 'Productos del live' : 'Productos de la tienda'}
        </h2>
        {products.length === 0 ? (
          <p className="panel px-4 py-6 text-center text-sm text-muted">Esta tienda todavía no publicó productos.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/live" className="text-sm font-semibold text-verde-dark">
        Ver otras tiendas en vivo
      </Link>
    </div>
  );
}
