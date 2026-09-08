import React from 'react';
import { marketplaceApi } from '@/lib/api';
import { VendorInventoryDashboard } from '@/components/vendor/VendorInventoryDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gestión de Inventario — Panel del Vendedor Vitrina Market',
};

export default async function VendorInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>;
}) {
  const params = await searchParams;
  const requestedStoreId = params?.storeId;

  let store: any = null;
  if (requestedStoreId) {
    try {
      store = await marketplaceApi.getStore(requestedStoreId);
    } catch (err) {
      console.error('Error fetching requested store:', err);
    }
  }

  // Si no se solicitó o no se encontró, obtener la lista de tiendas
  if (!store) {
    try {
      const allStores = await marketplaceApi.getStores();
      if (Array.isArray(allStores) && allStores.length > 0) {
        store = allStores[0];
      }
    } catch (err) {
      console.error('Error fetching stores fallback:', err);
    }
  }

  const offers = store?.offers || [];

  return (
    <VendorInventoryDashboard
      initialOffers={offers as any}
      storeName={store?.name}
      storeId={store?.id}
      storeSlug={store?.slug}
    />
  );
}
