import React from 'react';
import { marketplaceApi } from '@/lib/api';
import { LiveTrackingView } from '@/components/tracking/LiveTrackingView';

export const dynamic = 'force-dynamic';

export default async function OrderTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order: any = null;
  try {
    order = await marketplaceApi.getOrder(id);
  } catch {
    order = null;
  }

  if (!order) {
    order = {
      id: 'demo-order-id',
      orderNumber: id || 'CY-894120-412',
      customerName: 'Juan Pérez',
      customerEmail: 'juan.perez@example.com',
      customerPhone: '+591 77098765',
      customerAddress: 'Av. San Martín, Calle 5 Oeste, Equipetrol, Santa Cruz',
      customerLat: -17.7695,
      customerLng: -63.194,
      paymentMethod: 'QR_SIMPLE',
      paymentStatus: 'PAID',
      totalAmount: 189,
      subtotal: 189,
      shippingFee: 0,
      status: 'IN_TRANSIT',
      dspQuoteId: 'dsp_q_991823',
      dspOrderId: 'dsp_ord_77189',
      dspTrackingToken: 'trk_tok_carlos_mendoza',
      dspDriverName: 'Carlos Mendoza',
      dspDriverPhone: '+591 77012345',
      dspDriverRating: 4.9,
      dspDriverPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      dspEstimatedMinutes: 18,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: 'item-1',
          orderId: 'demo-order-id',
          productOfferId: 'off-1',
          storeId: 'store-1',
          productTitle: 'Chompa Oversize Beige - Talla M',
          storeName: 'ModaBol (Tienda Oficial)',
          quantity: 1,
          unitPrice: 189,
          subtotal: 189,
          productImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400',
        },
      ],
    };
  }

  return <LiveTrackingView order={order as any} />;
}
