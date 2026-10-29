'use client';

import { useVendor } from '@/context/VendorContext';
import { SalesOverview } from '@/components/vendor/SalesOverview';
import { useStoreOrders } from '@/components/vendor/useStoreOrders';
import { ListSkeleton } from '@/components/shop/Skeleton';

export default function VendorStatisticsPage() {
  const { store, unseenSales } = useVendor();
  const { orders, error, reload } = useStoreOrders(store.id, unseenSales);
  return <div className="mx-auto max-w-6xl space-y-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Estadísticas</h1><p className="mt-2 text-sm text-slate-500">Sigue las ventas y los pedidos de tu tienda.</p></div>{error ? <div role="alert" className="vendor-card p-5 text-red-600">No pudimos cargar tus estadísticas. <button onClick={reload} className="font-bold underline">Reintentar</button></div> : orders ? <SalesOverview orders={orders} storeId={store.id} /> : <ListSkeleton rows={4} />}</div>;
}
