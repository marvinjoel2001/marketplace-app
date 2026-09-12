import React from 'react';
import { VendorOffersManager } from '@/components/vendor/VendorOffersManager';

export const metadata = {
  title: 'Ofertas Flash y Cupones — Panel de Tienda Vitrina Market',
  description: 'Crea ofertas con tiempo limitado, descuentos especiales y cupones promocionales.',
};

export const dynamic = 'force-dynamic';

export default function VendorOffersPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6">
      <VendorOffersManager />
    </div>
  );
}
