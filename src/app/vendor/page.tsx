'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bell, Check, ClipboardList, Copy, Eye, MapPin, Package, Pencil, Radio, ShoppingCart, Store as StoreIcon, Tag, Truck } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { useToast } from '@/context/ToastContext';
import { marketplaceApi, type StoreSummary, type LiveRoomData } from '@/lib/api';
import { describeSchedule, describeWindow } from '@/lib/schedule';
import { copyText, formatBs } from '@/lib/utils';
import { mediaUrl } from '@/lib/catalog';
import { ORDER_STATUS } from '@/lib/orderStatus';
import { TikTokIcon } from '@/components/common/TikTokIcon';
import { ListSkeleton } from '@/components/shop/Skeleton';
import { ProductCatalog } from '@/components/vendor/ProductCatalog';
import { SalesOverview } from '@/components/vendor/SalesOverview';
import { storeOrderTotal, useStoreOrders } from '@/components/vendor/useStoreOrders';

function NotifyToggle() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  useEffect(() => { const timer = setTimeout(() => setPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission), 0); return () => clearTimeout(timer); }, []);
  if (permission !== 'default') return null;
  return <button type="button" onClick={() => Notification.requestPermission().then(setPermission)} className="flex w-full items-center gap-3 rounded-2xl border border-[#e3defc] bg-[#eeebff] p-3 text-left"><Bell className="h-5 w-5 shrink-0 text-[#6248ff]" /><span className="flex-1 text-xs"><strong className="block">Activa los avisos de venta</strong><span className="text-slate-500">Recibe una notificación cuando llegue un pedido.</span></span><ArrowRight className="h-4 w-4 text-[#6248ff]" /></button>;
}

export default function VendorHomePage() {
  const { store, unseenSales } = useVendor();
  const toast = useToast();
  const [summary, setSummary] = useState<StoreSummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const [version, setVersion] = useState(0);
  const [liveRoom, setLiveRoom] = useState<LiveRoomData | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const { orders, error: ordersError, reload } = useStoreOrders(store.id, unseenSales);
  useEffect(() => {
    let active = true;
    marketplaceApi.getStoreSummary(store.id).then((s) => { if (active) { setSummary(s); setSummaryError(false); } }).catch(() => { if (active) setSummaryError(true); });
    return () => { active = false; };
  }, [store.id, unseenSales, version]);
  useEffect(() => {
    if (!store.tiktokUsername) return;
    let active = true;
    const read = () => marketplaceApi.getLiveRoom(store.tiktokUsername!).then((room) => { if (active) setLiveRoom(room); });
    read();
    const timer = setInterval(() => { if (!document.hidden) read(); }, 30_000);
    return () => { active = false; clearInterval(timer); };
  }, [store.tiktokUsername]);
  const verifiedLive = liveRoom?.isLive && liveRoom.live && liveRoom.live.store_id === store.id;
  const copyLink = async () => {
    if (await copyText(`${window.location.origin}/en-vivo/${store.slug}`)) { setCopied(true); toast('Enlace de tu tienda copiado'); }
    else toast('No se pudo copiar el enlace. Abre «Ver tienda» y copia la dirección.', 'error');
  };
  const metrics = [
    { label: 'Ventas hoy', value: summary ? formatBs(summary.today.total) : '—', detail: 'Importe de tus pedidos', icon: ShoppingCart },
    { label: 'Pedidos hoy', value: summary ? String(summary.today.count) : '—', detail: 'Pedidos recibidos hoy', icon: Package },
    { label: 'Productos', value: summary ? String(summary.products) : '—', detail: 'En tu catálogo', icon: ClipboardList },
    { label: 'En promoción', value: summary ? String(summary.activeOffers) : '—', detail: 'Ofertas activas', icon: Tag },
  ];
  const recent = [...(orders ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const tasks = [
    { href: '/vendor/productos?nuevo=1', label: 'Subir producto', icon: Package },
    { href: '/vendor/tiktok', label: 'Preparar live', icon: Radio },
    { href: '/vendor/ventas', label: 'Ver pedidos', icon: ClipboardList },
    { href: '/vendor/ajustes', label: 'Editar tienda', icon: StoreIcon },
  ];
  return <div className="mx-auto grid max-w-[1600px] gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
    <div className="min-w-0 space-y-4">
      <section className="vendor-card grid gap-4 p-3 md:grid-cols-[1fr_1fr]" aria-label="Resumen de mi tienda">
        <div className="flex items-center gap-5"><span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eeebff] text-[#6248ff] sm:h-28 sm:w-28">{store.logo ? <Image unoptimized width={640} height={640} src={mediaUrl(store.logo)} alt={`Logo de ${store.name}`} className="h-full w-full object-cover" /> : <StoreIcon className="h-11 w-11" strokeWidth={1.4} />}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="break-words text-2xl font-extrabold tracking-tight">{store.name}</h1><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Tu tienda</span></div><p className="mt-1.5 text-xs text-slate-500">{store.category}</p><p className="mt-2 flex items-start gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="line-clamp-2">{store.address}</span></p><Link href="/vendor/ajustes" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e2e5ef] px-3 py-2 text-xs font-semibold"><Pencil className="h-3.5 w-3.5 text-[#6248ff]" />Editar tienda</Link></div></div>
        <div className="flex flex-col items-start justify-center rounded-2xl bg-[#eee8fb] p-4"><h2 className="text-xl font-extrabold tracking-tight text-[#38244d]">¡Vende en TikTok Live!</h2><p className="mb-4 mt-2 max-w-xs text-xs leading-5 text-[#725d84]">Prepara tu catálogo y comparte tu tienda durante tus transmisiones.</p><Link href="/vendor/tiktok" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold"><TikTokIcon className="h-4 w-4" />{store.tiktokUsername ? 'Administrar TikTok' : 'Conectar mi cuenta'}<ArrowRight className="h-3 w-3" /></Link></div>
      </section>
      <div className="grid grid-cols-2 gap-3 2xl:grid-cols-4 lg:grid-cols-4">{metrics.map(({ label, value, detail, icon: Icon }) => <div key={label} className="vendor-card flex flex-col items-start gap-3 p-4 sm:flex-row"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eeebff] text-[#6248ff]"><Icon className="h-5 w-5" strokeWidth={1.8} /></span><div className="min-w-0"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 break-words text-[23px] font-extrabold leading-tight tracking-tight tabular-nums">{value}</p><p className="mt-2 text-[10px] text-slate-400">{detail}</p></div></div>)}</div>
      {summaryError && <p role="alert" className="text-xs text-red-600">No pudimos actualizar el resumen. <button className="font-semibold underline" onClick={() => setVersion((v) => v + 1)}>Reintentar</button></p>}
      <ProductCatalog compact onChanged={() => setVersion((v) => v + 1)} />
      {ordersError ? <div className="vendor-card p-5 text-sm text-red-600" role="alert">No pudimos cargar las estadísticas. <button className="font-bold underline" onClick={reload}>Reintentar</button></div> : orders ? <SalesOverview orders={orders} storeId={store.id} /> : <div className="vendor-card p-5"><ListSkeleton rows={2} /></div>}
    </div>
    <aside className="min-w-0 space-y-4">
      <section className="vendor-card p-5"><h2 className="mb-3 text-lg font-extrabold tracking-tight">Live de TikTok</h2>{verifiedLive ? <div className="relative overflow-hidden rounded-2xl bg-[#141a31] p-4 text-white">{liveRoom.live?.cover_image_url && <Image unoptimized width={640} height={640} src={liveRoom.live.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}<div className="relative"><div className="mb-20 flex items-center justify-between"><span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold">EN VIVO</span><span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px]"><Eye className="h-3 w-3" />{liveRoom.live?.viewer_count.toLocaleString('es-BO')}</span></div><p className="mb-3 text-sm font-bold">{liveRoom.live?.title}</p><a href={liveRoom.live?.live_url} target="_blank" rel="noopener noreferrer" className="btn w-full bg-white !text-xs text-slate-900"><TikTokIcon className="h-4 w-4" />Ir al live</a></div></div> : <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-[#f5f3fb] p-5 text-center"><Radio className="mb-3 h-8 w-8 text-[#9d8cc5]" strokeWidth={1.5} /><p className="text-sm font-bold">{!store.tiktokUsername ? 'Conecta tu TikTok' : liveRoom === undefined ? 'Consultando tu live…' : liveRoom === null ? 'No pudimos comprobar tu live' : 'Sin transmisión verificada'}</p><p className="mb-4 mt-2 text-xs leading-5 text-slate-500">{!store.tiktokUsername ? 'Vincula tu cuenta y prepara los productos que mostrarás.' : 'Tu catálogo sigue disponible para tus clientes.'}</p><Link href="/vendor/tiktok" className="btn btn-primary w-full !min-h-10 !text-xs"><TikTokIcon className="h-4 w-4" />{store.tiktokUsername ? 'Administrar live' : 'Conectar ahora'}</Link></div>}</section>
      <section className="vendor-card p-5"><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-extrabold tracking-tight">Pedidos recientes</h2><Link href="/vendor/ventas" className="flex items-center gap-1 text-[11px] font-semibold text-[#5b45fa]">Ver todos<ArrowRight className="h-3.5 w-3.5" /></Link></div>{ordersError ? <p role="alert" className="py-6 text-xs text-red-600">No pudimos cargar los pedidos. <button className="underline" onClick={reload}>Reintentar</button></p> : !orders ? <ListSkeleton rows={3} /> : !recent.length ? <div className="py-8 text-center"><ClipboardList className="mx-auto mb-3 h-7 w-7 text-slate-300" /><p className="text-xs font-semibold">Aquí llegarán tus pedidos</p><p className="mt-2 text-xs text-slate-400">Comparte tu tienda para empezar.</p></div> : <ul className="divide-y divide-[#edf0f6]">{recent.map((o) => {
        const item = o.items.find((i) => i.storeId === store.id);
        const status = ORDER_STATUS[o.status];
        return <li key={o.id}><Link href={`/vendor/ventas?pedido=${encodeURIComponent(o.id)}`} className="flex items-center gap-3 py-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">{item?.productImage ? <Image unoptimized width={640} height={640} src={mediaUrl(item.productImage)} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-slate-400" />}</span><span className="min-w-0 flex-1"><span className="flex justify-between gap-2 text-xs font-bold"><span className="truncate">#{o.orderNumber}</span><span className="shrink-0">{formatBs(storeOrderTotal(o, store.id))}</span></span><span className="mt-1.5 block truncate text-[10px] text-slate-500">{status?.store ?? o.status}</span></span></Link></li>;
      })}</ul>}</section>
      <section className="vendor-card p-5"><h2 className="mb-3 text-base font-extrabold">Tareas rápidas</h2><div className="grid grid-cols-2 gap-2">{tasks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border text-[11px] font-medium ${href === '/vendor/tiktok' ? 'border-[#ece6ff] bg-[#eee9ff] text-[#6040ef]' : 'border-[#e5e8f1] hover:bg-slate-50'}`}><Icon className="h-5 w-5" strokeWidth={1.8} />{label}</Link>)}</div></section>
      <section className="vendor-card p-5"><h2 className="text-sm font-bold">Tu tienda, a un enlace</h2><p className="mb-3 mt-2 text-xs leading-5 text-slate-500">Compártela en tus redes y recibe pedidos.</p><button onClick={copyLink} className="btn btn-ghost w-full !min-h-10 !text-xs">{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}{copied ? 'Copiar enlace otra vez' : 'Copiar enlace de tienda'}</button></section>
      <NotifyToggle />
      <div className="flex gap-2 px-2 text-[11px] leading-5 text-slate-500"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#6248ff]" /><span>Entregas: {describeSchedule(store)}.</span></div>
      {summary?.upcoming[0] && <Link href="/vendor/ventas" className="flex items-start gap-2 px-2 text-[11px] leading-5 text-[#6248ff]"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />Próximo recojo: {describeWindow(summary.upcoming[0].deliveryAt, summary.upcoming[0].deliveryWindow)}</Link>}
    </aside>
  </div>;
}



