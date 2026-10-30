'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Empty, ErrorBox, Loading, PageHeader, adminFetch, bs, dateOnly, useAdminData } from '@/components/admin/ui';
import { useToast } from '@/context/ToastContext';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

const ROLE: Record<AdminUser['role'], string> = { CUSTOMER: 'Cliente', VENDOR: 'Vendedor', ADMIN: 'Admin' };

export default function AdminUsersPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminData<AdminUser[]>('users');
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const users = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((u) => (!role || u.role === role) && (!term || [u.name, u.email, u.phone].some((v) => v?.toLowerCase().includes(term))));
  }, [data, q, role]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;

  const setStatus = async (u: AdminUser, status: AdminUser['status']) => {
    setBusy(u.id);
    try {
      await adminFetch(`users/${u.id}/status`, { method: 'PATCH', json: { status } });
      toast(status === 'ACTIVE' ? `${u.name} puede volver a entrar` : `${u.name} ya no puede iniciar sesión`);
      await reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader title="Usuarios" subtitle={`${data.length} cuentas de clientes y vendedores`} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" className="field !pl-10" placeholder="Nombre, correo o celular" aria-label="Buscar usuarios" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {['', 'CUSTOMER', 'VENDOR'].map((r) => (
          <button key={r || 'all'} type="button" className="chip" aria-pressed={role === r} onClick={() => setRole(r)}>{r ? ROLE[r as AdminUser['role']] : 'Todos'}</button>
        ))}
      </div>
      {users.length === 0 ? (
        <Empty>No hay usuarios con ese filtro.</Empty>
      ) : (
        <div className="vendor-card divide-y divide-slate-100">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 text-sm">
              <div className="min-w-52 flex-1">
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-slate-500">{u.phone ?? u.email} · desde {dateOnly(u.createdAt)}</p>
              </div>
              <Badge tone={u.role === 'VENDOR' ? 'indigo' : 'slate'}>{ROLE[u.role] ?? u.role}</Badge>
              <span className="text-xs text-slate-500">{u.ordersCount} pedidos · {bs(u.totalSpent)}</span>
              {u.status === 'ACTIVE' ? (
                <button type="button" className="ml-auto rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50" disabled={busy === u.id} onClick={() => setStatus(u, 'BANNED')}>Bloquear</button>
              ) : (
                <>
                  <Badge tone="red">Bloqueado</Badge>
                  <button type="button" className="ml-auto rounded-xl px-3 py-2 text-xs font-semibold text-[#5b45fa] hover:bg-[#eeebff]" disabled={busy === u.id} onClick={() => setStatus(u, 'ACTIVE')}>Desbloquear</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
