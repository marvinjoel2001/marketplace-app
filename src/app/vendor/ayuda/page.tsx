import Link from 'next/link';
import { ArrowRight, Package, Radio, Receipt, Settings } from 'lucide-react';

const GUIDES = [
  { title: 'Publica tu primer producto', text: 'Sube una foto, escribe el nombre, el precio y la cantidad. Después puedes editarlo u ocultarlo desde tu catálogo.', href: '/vendor/productos?nuevo=1', label: 'Subir producto', icon: Package },
  { title: 'Prepara tus pedidos', text: 'En Pedidos verás qué debes entregar, el horario de recojo, los datos del cliente y el estado del pago.', href: '/vendor/ventas', label: 'Ver pedidos', icon: Receipt },
  { title: 'Vende durante tus lives', text: 'Configura tu usuario de TikTok y elige los productos. La transmisión se inicia desde TikTok; comparte el enlace de tu tienda para recibir compras.', href: '/vendor/tiktok', label: 'Configurar TikTok', icon: Radio },
  { title: 'Mantén tu tienda al día', text: 'Cambia tu logo, celular, dirección, horarios y datos de cobro desde Configuración. Guarda los cambios de cada sección.', href: '/vendor/ajustes', label: 'Editar tienda', icon: Settings },
];
export default function VendorHelpPage() {
  return <div className="mx-auto max-w-4xl space-y-5"><div><h1 className="text-2xl font-extrabold tracking-tight">Te ayudamos con tu tienda</h1><p className="mt-2 text-sm text-slate-500">Todo lo que necesitas para empezar a vender.</p></div><div className="grid gap-4 sm:grid-cols-2">{GUIDES.map(({ title, text, href, label, icon: Icon }) => <article key={href} className="vendor-card p-6"><Icon className="mb-4 h-7 w-7 text-[#6248ff]" /><h2 className="font-bold">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{text}</p><Link href={href} className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#6248ff]">{label}<ArrowRight className="h-4 w-4" /></Link></article>)}</div></div>;
}
