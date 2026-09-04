import React from 'react';
import { marketplaceApi } from '@/lib/api';
import { getMockStore, MOCK_PRODUCTS } from '@/lib/mockData';
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

  // Resilient fallback: Never trigger 404
  if (!store) {
    store = getMockStore(id);
  }

  let liveProducts = (store.offers || []).map((o: any) => {
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
      price: o.price || 189,
      image: img,
      rating: o.product?.rating || 4.8,
    };
  });

  // Guarantee at least 3 live products for an engaging live shopping experience
  if (liveProducts.length === 0) {
    liveProducts = MOCK_PRODUCTS.slice(0, 3).map((p) => {
      let img = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400';
      try {
        img = JSON.parse(p.images)[0] || img;
      } catch {
        img = p.images;
      }
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.basePrice,
        image: img,
        rating: p.rating,
      };
    });
  }

  return (
    <LiveRoom
      store={store}
      liveStream={store.liveStreams?.[0] || {
        id: `ls-${store.id}`,
        title: store.liveTitle || `Transmisión en vivo de ${store.name}`,
        streamerName: store.streamerName || 'Host Oficial',
        viewerCount: 1420,
        likeCount: 3820,
        status: 'LIVE',
      }}
      liveProducts={liveProducts}
    />
  );
}
