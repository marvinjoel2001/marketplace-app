import React from 'react';
import { marketplaceApi } from '@/lib/api';
import { LiveRoom } from '@/components/live/LiveRoom';

export const dynamic = 'force-dynamic';

export default async function LivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let store: any = null;
  try {
    store = await marketplaceApi.getStore(id);
  } catch {
    store = null;
  }

  // Si no se encuentra en el backend, preparar fallback limpio para rehidratar en cliente
  if (!store) {
    store = {
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      slug: id,
      logo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rating: 5.0,
      reviewCount: 0,
      salesCount: 0,
      isOfficial: true,
      address: 'Santa Cruz, Bolivia',
      description: 'Tienda en Vitrina Market Bolivia',
      offers: [],
    };
  }

  const liveProducts = (store.offers || []).map((o: any) => {
    let img = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400';
    try {
      img = JSON.parse(o.product?.images || '[]')[0] || img;
    } catch {
      img = o.product?.images || img;
    }
    return {
      id: o.product?.id || o.id,
      title: o.product?.title || 'Producto en Oferta',
      slug: o.product?.slug || 'producto-en-oferta',
      price: o.price || 0,
      image: img,
      rating: o.product?.rating || 5.0,
    };
  });

  return (
    <LiveRoom
      store={store}
      liveStream={
        store.liveStreams?.[0] || {
          id: `ls-${store.id}`,
          title: store.liveTitle || `Transmisión de ${store.name}`,
          streamerName: store.streamerName || store.name,
          viewerCount: 0,
          likeCount: 0,
          status: store.isLiveNow ? 'LIVE' : 'OFFLINE',
        }
      }
      liveProducts={liveProducts}
    />
  );
}
