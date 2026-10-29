'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BarChart, Badge, Card, ErrorBox, Loading, PageHeader, Stat, StatusBadge, bs, dateTime, useAdminData } from '@/components/admin/ui';

interface Overview {
  stores: { total: number; active: number; suspended: number; blocked: number; newThisWeek: number };
  orders: { total: number; today: number; inProgress: number; delivered: number; cancelled: number };
  money: { salesTotal: number; salesToday: number; shippingTotal: number; commissionTotal: number; storeOwed: number; driverOwed: number };
  customers: number;
  activeLives: number;
  series: { date: string; orders: number; sales: number }[];
  topStores: { id: string; name: string; orders: number; sales: number }[];
  recentOrders: { id: string; orderNumber: string; storeName: string; customerName: string; total: number; status: string; createdAt: string }[];
}

export default function AdminHome() {
  const { data, error, loading, reload } = useAdminData<Overview>('overview');
  if (loading) return <Loading />;
  if (error || !data) return <ErrorBox message={error || 'Sin datos'} onRetry={reload} />;
  const { stores, orders, money } = data;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader title="Resumen de Vitrina" subtitle="Cifras reales de tus tiendas, pedidos y pagos." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Tiendas activas" value={`${stores.active} / ${stores.total}`} detail={`${stores.newThisWeek} nuevas esta semana`} />
        <Stat label="Pedidos hoy" value={orders.today} detail={`${orders.inProgress} en curso ahora`} />
        <Stat label="Ventas de hoy" value={bs(money.salesToday)} detail={`Total: ${bs(money.salesTotal)}`} />
        <Stat label="Comisión ganada" value={bs(money.commissionTotal)} detail="De pedidos entregados" />
        <Stat label="Por pagar a tiendas" value={bs(money.storeOwed)} detail="Ventas entregadas sin liquidar" tone={money.storeOwed > 0 ? 'red' : undefined} />
        <Stat label="Por pagar a repartidores" value={bs(money.driverOwed)} detail="Envíos entregados sin liquidar" tone={money.driverOwed > 0 ? 'red' : undefined} />
        <Stat label="Clientes registrados" value={data.customers} />
        <Stat label="Lives activos" value={data.activeLives} detail={`${stores.suspended} suspendidas · ${stores.blocked} bloqueadas`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Ventas de los últimos 14 días">
          {data.series.some((d) => d.sales > 0) ? <BarChart data={data.series} valueKey="sales" format={bs} /> : <p className="py-10 text-center text-sm text-slate-500">Todavía no hay ventas en estos días.</p>}
        </Card>
        <Card title="Mejores tiendas" action={<Link href="/admin/tiendas" className="text-xs font-semibold text-[#5b45fa]">Ver todas</Link>}>
          {data.topStores.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Aún no hay pedidos.</p>
          ) : (
            <ol className="space-y-3">
              {data.topStores.map((s, i) => (
                <li key={s.id}>
                  <Link href={`/admin/tiendas/${s.id}`} className="flex items-center gap-3 text-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eeebff] text-xs font-bold text-[#5b45fa]">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{s.name}</span>
                    <span className="text-right text-xs text-slate-500"><strong className="block text-sm text-slate-900">{bs(s.sales)}</strong>{s.orders} pedidos</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card title="Pedidos recientes" action={<Link href="/admin/pedidos" className="flex items-center gap-1 text-xs font-semibold text-[#5b45fa]">Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link>}>
        {data.recentOrders.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Cuando llegue el primer pedido aparecerá aquí.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentOrders.map((o) => (
              <div key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                <strong>{o.orderNumber}</strong>
                <span className="text-slate-500">{o.storeName} → {o.customerName}</span>
                <span className="ml-auto font-semibold">{bs(o.total)}</span>
                <StatusBadge status={o.status} />
                <span className="w-24 text-right text-xs text-slate-500">{dateTime(o.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <p className="text-xs text-slate-500"><Badge>Nota</Badge> Las ventas excluyen pedidos cancelados; la comisión cuenta solo pedidos entregados.</p>
    </div>
  );
}
