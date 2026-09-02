import React from 'react';
import { notFound } from 'next/navigation';
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
    try {
      store = await marketplaceApi.getStore('techplus-bolivia');
    } catch {
      notFound();
    }
  }

  if (!store) {
    notFound();
  }

  const liveProducts = (store.offers || []).map((o: any) => {
    let img = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400';
    try {
      img = JSON.parse(o.product.images)[0];
    } catch {
      img = o.product?.images || img;
    }
    return {
      id: o.product?.id,
      title: o.product?.title,
      slug: o.product?.slug,
      price: o.price,
      image: img,
      rating: o.product?.rating || 4.8,
    };
  });

  return (
    <LiveRoom
      store={store}
      liveStream={store.liveStreams?.[0] || null}
      liveProducts={liveProducts}
    />
  );
}
