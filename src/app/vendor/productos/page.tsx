'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { useToast } from '@/context/ToastContext';
import { marketplaceApi } from '@/lib/api';
import { isPromoActive, offerPrice, productImages } from '@/lib/catalog';
import { formatBs } from '@/lib/utils';
import { Sheet } from '@/components/shop/Sheet';
import { ProductForm } from '@/components/vendor/ProductForm';
import { useStoreOffers, type StoreOffer } from '@/components/vendor/useStoreOffers';

function ProductsScreen() {
  const { store } = useVendor();
  const toast = useToast();
  const params = useSearchParams();
  const router = useRouter();
  const { offers, error, reload, setOffers } = useStoreOffers(store.id);
  const [creating, setCreating] = useState(params.get('nuevo') === '1');
  const [editing, setEditing] = useState<StoreOffer | null>(null);
  const [query, setQuery] = useState('');

  const closeCreate = () => {
    setCreating(false);
    if (params.get('nuevo')) router.replace('/vendor/productos');
  };

  const toggleVisible = async (offer: StoreOffer) => {
    try {
      await marketplaceApi.updateOffer(store.id, offer.id, { isActive: !offer.isActive });
      setOffers((list) => list && list.map((o) => (o.id === offer.id ? { ...o, isActive: !o.isActive } : o)));
      toast(offer.isActive ? 'Producto oculto de la tienda' : 'Producto visible otra vez');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const filtered = (offers ?? []).filter((o) => o.product.title.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="type-sign text-2xl font-extrabold">Productos</h1>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus className="h-5 w-5" /> Subir producto
        </button>
      </div>

      {offers && offers.length > 6 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="field pl-10" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en mis productos" aria-label="Buscar en mis productos" />
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
      {offers === null ? (
        <p className="text-sm text-muted">Cargando productos…</p>
      ) : offers.length === 0 ? (
        <div className="panel px-5 py-8 text-center">
          <p className="font-semibold">Todavía no subiste productos.</p>
          <p className="mt-1 text-sm text-muted">Toma una foto, ponle precio y listo: ya se ve en Vitrina.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => setCreating(true)}>
            Subir mi primer producto
          </button>
        </div>
      ) : (
        <ul className="panel divide-y divide-line">
          {filtered.map((o) => {
            const promo = isPromoActive(o);
            return (
              <li key={o.id} className={`flex items-center gap-3 p-3 ${o.isActive ? '' : 'opacity-60'}`}>
                <button type="button" onClick={() => setEditing(o)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper">
                    {productImages(o.product)[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={productImages(o.product)[0]} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{o.product.title}</span>
                    <span className="text-sm tabular-nums">
                      {formatBs(offerPrice(o))}
                      {promo && <span className="ml-1.5 text-xs font-semibold text-verde-dark">-{o.discountPercent}%</span>}
                    </span>
                    <span className={`block text-xs ${o.stock === 0 ? 'font-semibold text-danger' : 'text-muted'}`}>
                      {o.stock === 0 ? 'Agotado' : `${o.stock} disponibles`}
                    </span>
                  </span>
                </button>
                <button type="button" className="shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink-soft hover:bg-paper" onClick={() => toggleVisible(o)}>
                  {o.isActive ? 'Ocultar' : 'Mostrar'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Sheet open={creating} onClose={closeCreate} title="Subir producto">
        <ProductForm
          storeId={store.id}
          onSaved={() => {
            closeCreate();
            reload();
          }}
        />
      </Sheet>
      <Sheet open={Boolean(editing)} onClose={() => setEditing(null)} title="Editar producto">
        {editing && (
          <ProductForm
            key={editing.id}
            storeId={store.id}
            editing={editing}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        )}
      </Sheet>
    </div>
  );
}

export default function VendorProductsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Cargando productos…</p>}>
      <ProductsScreen />
    </Suspense>
  );
}
