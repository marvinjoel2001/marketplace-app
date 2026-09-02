import React from 'react';
import { marketplaceApi } from '@/lib/api';
import { VendorInventoryDashboard } from '@/components/vendor/VendorInventoryDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gestión de Inventario — Panel del Vendedor CompraYa',
};

export default async function VendorInventoryPage() {
  let store: any = null;
  try {
    store = await marketplaceApi.getStore('techplus-bolivia');
  } catch (err) {
    console.error('Error fetching store inventory from NestJS backend:', err);
  }

  const offers = store?.offers || [];

  return (
    <VendorInventoryDashboard
      initialOffers={offers as any}
      storeName={store?.name || 'TechPlus Bolivia'}
      storeId={store?.id || 'store-1'}
    />
  );
}
