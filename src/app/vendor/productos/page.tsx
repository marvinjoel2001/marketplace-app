'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCatalog } from '@/components/vendor/ProductCatalog';
import { ListSkeleton } from '@/components/shop/Skeleton';

function ProductsScreen() {
  const params = useSearchParams();
  const router = useRouter();
  return <div className="space-y-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Tu catálogo</h1><p className="mt-1 text-sm text-slate-500">Administra tus productos, precios y disponibilidad.</p></div><ProductCatalog key={params.toString()} initialQuery={params.get('q') ?? ''} createInitially={params.get('nuevo') === '1'} onCloseCreate={() => { if (params.has('nuevo')) router.replace('/vendor/productos'); }} /></div>;
}

export default function VendorProductsPage() {
  return <Suspense fallback={<ListSkeleton rows={4} />}><ProductsScreen /></Suspense>;
}
