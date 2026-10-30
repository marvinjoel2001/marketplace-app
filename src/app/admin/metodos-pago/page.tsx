'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Empty, ErrorBox, Loading, PAYMENT_LABEL, PageHeader, adminFetch, useAdminData } from '@/components/admin/ui';
import { AdminStore } from '@/components/admin/types';
import { useToast } from '@/context/ToastContext';

const METHODS = Object.keys(PAYMENT_LABEL);

export default function AdminPaymentMethodsPage() {
  const toast = useToast();
  const { data, error, loading, reload } = useAdminData<AdminStore[]>('stores/overview');
  const [saving, setSaving] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;

  const toggle = async (store: AdminStore, method: string) => {
    const next = store.paymentMethods.includes(method) ? store.paymentMethods.filter((m) => m !== method) : [...store.paymentMethods, method];
    if (next.length === 0) return toast('Cada tienda debe tener al menos un método de pago', 'error');
    setSaving(`${store.id}|${method}`);
    try {
      await adminFetch(`stores/${store.id}/config`, { method: 'PATCH', json: { paymentMethods: next } });
      toast(`${store.name}: ${PAYMENT_LABEL[method]} ${next.includes(method) ? 'activado' : 'desactivado'}`);
      await reload();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader title="Métodos de pago por tienda" subtitle="Elige cómo pueden pagar los clientes de cada tienda. El checkout solo muestra los métodos activos y el servidor rechaza los demás." />
      {data.length === 0 ? (
        <Empty>Todavía no hay tiendas registradas.</Empty>
      ) : (
        <div className="vendor-card overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="p-4 font-semibold">Tienda</th>
                {METHODS.map((m) => <th key={m} className="p-4 text-center font-semibold">{PAYMENT_LABEL[m]}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4"><Link href={`/admin/tiendas/${s.id}`} className="font-semibold hover:underline">{s.name}</Link></td>
                  {METHODS.map((m) => {
                    const on = s.paymentMethods.includes(m);
                    return (
                      <td key={m} className="p-4 text-center">
                        <button type="button" role="switch" aria-checked={on} aria-label={`${PAYMENT_LABEL[m]} en ${s.name}`} disabled={saving !== null} onClick={() => toggle(s, m)} className="vendor-toggle" />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
