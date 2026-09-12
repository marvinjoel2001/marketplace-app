import React from 'react';
import { AdminControlCenter } from '@/components/admin/AdminControlCenter';

export const metadata = {
  title: 'Super Admin Marketplace — Vitrina Bolivia',
  description: 'Centro de control total de tiendas, usuarios, catálogo, cancelación de pedidos y métodos de pago.',
};

export const dynamic = 'force-dynamic';

export default function AdminPortalPage() {
  return <AdminControlCenter />;
}
