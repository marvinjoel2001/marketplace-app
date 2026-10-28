import Link from 'next/link';
import { marketplaceApi } from '@/lib/api';
import { mainOffer, promoEndsLabel } from '@/lib/catalog';
import { ProductCard } from '@/components/shop/ProductCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ofertas — Vitrina' };

export default async function OffersPage() {
  const products = (await marketplaceApi.getProducts({ flashSale: true })).filter((p) => mainOffer(p));
  // Soonest-ending first, so what's about to expire is seen first.
  products.sort(
    (a, b) =>
      new Date(mainOffer(a)?.flashSaleEnd ?? 0).getTime() - new Date(mainOffer(b)?.flashSaleEnd ?? 0).getTime(),
  );

  return (
    <div>
      <h1 className="type-sign text-2xl font-extrabold">Ofertas</h1>
      <p className="mt-1 text-sm text-muted">Descuentos que las tiendas tienen activos ahora.</p>

      {products.length === 0 ? (
        <div className="panel mt-6 px-5 py-8 text-center">
          <p className="font-semibold">No hay ofertas activas en este momento.</p>
          <Link href="/" className="btn btn-ghost mt-4">
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
              <p className="mt-1 text-xs font-medium text-ink-soft">{promoEndsLabel(mainOffer(p)?.flashSaleEnd)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
