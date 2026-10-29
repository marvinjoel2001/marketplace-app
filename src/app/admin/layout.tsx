import { AdminShell } from '@/components/admin/AdminShell';
import '../vendor/vendor.css';

export const metadata = {
  title: 'Administración — Vitrina Market',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
