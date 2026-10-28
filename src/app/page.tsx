import Link from 'next/link';
import { marketplaceApi } from '@/lib/api';
import { isPromoActive, mainOffer } from '@/lib/catalog';
import { LiveStrip } from '@/components/shop/LiveStrip';
import { ProductCard } from '@/components/shop/ProductCard';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const filtering = Boolean(category || q);
  const [products, categories, lives] = await Promise.all([
    marketplaceApi.getProducts({ category, q }),
    marketplaceApi.getCategories(),
    filtering ? Promise.resolve([]) : marketplaceApi.getLiveStores(),
  ]);
  const visible = products.filter((p) => mainOffer(p));
  const deals = filtering ? [] : visible.filter((p) => isPromoActive(mainOffer(p)!)).slice(0, 12);
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="flex flex-col gap-8">
      {!filtering && <LiveStrip lives={lives} />}

      {categories.length > 0 && (
        <nav aria-label="Categorías" className="scroll-row -mx-4 px-4">
          <Link href="/" className="chip" aria-current={!category ? 'page' : undefined}>
            Todo
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/?category=${c.slug}`} className="chip" aria-current={c.slug === category ? 'page' : undefined}>
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      {deals.length > 0 && (
        <section aria-labelledby="deals-title">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="deals-title" className="type-sign text-lg font-extrabold">
              Ofertas
            </h2>
            <Link href="/ofertas" className="text-sm font-semibold text-verde-dark">
              Ver todas
            </Link>
          </div>
          <ul className="scroll-row -mx-4 px-4">
            {deals.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} compact />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="products-title">
        <h1 id="products-title" className="type-sign mb-3 text-lg font-extrabold">
          {q ? `Resultados para “${q}”` : activeCategory ? activeCategory.name : 'Productos'}
        </h1>
        {visible.length === 0 ? (
          <div className="panel px-5 py-8 text-center">
            <p className="font-semibold">{filtering ? 'No encontramos productos con esa búsqueda.' : 'Todavía no hay productos publicados.'}</p>
            {filtering && (
              <Link href="/" className="btn btn-ghost mt-4">
                Ver todos los productos
              </Link>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
