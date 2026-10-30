'use client';

import { useMemo, useState } from 'react';
import { Package, Search } from 'lucide-react';
import { Badge, Empty, ErrorBox, Loading, PageHeader, adminFetch, bs, useAdminData } from '@/components/admin/ui';
import { useToast } from '@/context/ToastContext';
import { productImages } from '@/lib/catalog';

interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  images: string;
  status: 'ACTIVE' | 'REMOVED_BY_ADMIN' | 'DRAFT';
  basePrice: number;
  category: { name: string } | null;
  offers: { id: string; price: number; salePrice: number | null; stock: number; isActive: boolean; store: { id: string; name: string; status: string } }[];
}

export default function AdminProductsPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminData<AdminProduct[]>('products');
  const [q, setQ] = useState('');
  const [onlyRemoved, setOnlyRemoved] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const products = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (p) => (!onlyRemoved || p.status === 'REMOVED_BY_ADMIN') && (!term || [p.title, ...p.offers.map((o) => o.store.name)].some((v) => v.toLowerCase().includes(term))),
    );
  }, [data, q, onlyRemoved]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;

  const moderate = async (p: AdminProduct, status: AdminProduct['status']) => {
    setBusy(p.id);
    try {
      await adminFetch(`products/${p.id}/moderate`, { method: 'PATCH', json: { status } });
      toast(status === 'ACTIVE' ? `"${p.title}" vuelve a estar visible` : `"${p.title}" quedó oculto para los clientes`);
      await reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader title="Productos" subtitle="Oculta productos que no cumplen las reglas de Vitrina. Se muestran los 150 más recientes." />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" className="field !pl-10" placeholder="Producto o tienda" aria-label="Buscar productos" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="button" className="chip" aria-pressed={!onlyRemoved} onClick={() => setOnlyRemoved(false)}>Todos</button>
        <button type="button" className="chip" aria-pressed={onlyRemoved} onClick={() => setOnlyRemoved(true)}>Ocultos por admin</button>
      </div>
      {products.length === 0 ? (
        <Empty>No hay productos con ese filtro.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {products.map((p) => {
            const image = productImages(p)[0];
            const offer = p.offers[0];
            return (
              <article key={p.id} className="vendor-card flex gap-3 p-3">
                <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f2f4f9]">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-slate-400" />
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-1 text-sm">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="truncate text-xs text-slate-500">{offer ? `${offer.store.name} · ${bs(offer.salePrice ?? offer.price)} · ${offer.stock} en stock` : 'Sin tienda'} · {p.category?.name}</p>
                  <div className="flex items-center gap-2">
                    {p.status === 'REMOVED_BY_ADMIN' ? <Badge tone="red">Oculto por admin</Badge> : offer?.isActive ? <Badge tone="green">Publicado</Badge> : <Badge>Oculto por la tienda</Badge>}
                    {p.status === 'REMOVED_BY_ADMIN' ? (
                      <button type="button" className="ml-auto text-xs font-semibold text-[#5b45fa]" disabled={busy === p.id} onClick={() => moderate(p, 'ACTIVE')}>Restaurar</button>
                    ) : (
                      <button type="button" className="ml-auto text-xs font-semibold text-rose-600" disabled={busy === p.id} onClick={() => moderate(p, 'REMOVED_BY_ADMIN')}>Ocultar</button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
