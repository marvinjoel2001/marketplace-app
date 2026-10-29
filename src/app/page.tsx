import Link from 'next/link';
import { Radio } from 'lucide-react';
import { marketplaceApi, type Product } from '@/lib/api';
import { isPromoActive, mainOffer } from '@/lib/catalog';
import { HeroBanner } from '@/components/shop/HeroBanner';
import { HomeHighlightSection } from '@/components/shop/HomeHighlightSection';
import { BrowseByCategory } from '@/components/shop/BrowseByCategory';
import { ProductCard } from '@/components/shop/ProductCard';

export const dynamic = 'force-dynamic';

function countByCategory(products: Product[]) {
  const counts: Record<string, number> = {};
  for (const p of products) if (p.category) counts[p.category.slug] = (counts[p.category.slug] ?? 0) + 1;
  return counts;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const filtering = Boolean(category || q);
  const [products, allProducts, categories, lives, tiktok] = await Promise.all([
    marketplaceApi.getProducts({ category, q }),
    filtering ? marketplaceApi.getProducts() : Promise.resolve(null),
    marketplaceApi.getCategories(),
    filtering ? Promise.resolve([]) : marketplaceApi.getLiveStores(),
    filtering ? Promise.resolve(null) : marketplaceApi.getTikTokLives({ limit: 20 }),
  ]);
  const visible = products.filter((p) => mainOffer(p));
  const catalogue = (allProducts ?? products).filter((p) => mainOffer(p));

  // Nothing published yet: one screen, one message.
  if (catalogue.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full rounded-[2.5rem] bg-white/90 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8 sm:p-10 text-center">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Todavía no hay productos publicados</h1>
          <Link href="/live" className="btn btn-primary mt-6">
            <Radio className="w-4 h-4" />
            Ver quién está en vivo
          </Link>
        </div>
      </div>
    );
  }

  const deals = catalogue.filter((p) => isPromoActive(mainOffer(p)!));
  // The carousel shows offers first, then the newest products.
  const heroProducts = [...deals, ...catalogue.filter((p) => !deals.includes(p))].slice(0, 4);
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="w-full">
      {!filtering && (
        <>
          <HeroBanner products={heroProducts} />
          <HomeHighlightSection lives={lives} tiktok={tiktok?.data ?? []} deals={deals} />
        </>
      )}

      <BrowseByCategory categories={categories} counts={countByCategory(catalogue)} active={category} />

      <section id="catalogo" className="scroll-mt-24">
        <div className="mb-4 inline-block rounded-2xl bg-white/85 backdrop-blur-xl px-4 py-2 border border-white/80 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {q ? `Resultados para “${q}”` : activeCategory ? activeCategory.name : 'Todos los productos'}
          </h2>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-[2rem] bg-white/90 backdrop-blur-2xl border border-white/80 p-8 text-center shadow-card">
            <p className="text-lg font-black text-slate-900">No encontramos productos con esa búsqueda</p>
            <Link href="/" className="btn btn-primary mt-5">
              Ver todos los productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
