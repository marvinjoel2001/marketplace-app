import React from 'react';
import { VendorProfileSettings } from '@/components/vendor/VendorProfileSettings';

export const metadata = {
  title: 'Perfil y Fotos de la Tienda — Vitrina Market Bolivia',
  description: 'Sube tu foto de perfil, logo, banner de portada y datos de recogida para los motorizados de OpenDSP.',
};

export default function VendorProfilePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <VendorProfileSettings />
      </div>
    </div>
  );
}
