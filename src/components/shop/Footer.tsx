import Link from 'next/link';
import { Banknote, QrCode } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#EAEAEA] mt-16 text-gray-700 relative z-10 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="col-span-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-white shrink-0 p-0.5 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/pulpo-icon.png" alt="" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-2xl font-black text-gray-900">
                Vitrina Market<span className="text-emerald-600">.</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">
              Compra a las tiendas de Bolivia: mira sus productos, sus ofertas y sus lives de TikTok, y elige a qué hora te llega.
            </p>
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <span className="text-[11px] font-semibold text-gray-600">Pagas al recibir:</span>
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                <Banknote className="w-3 h-3 mr-1 text-emerald-600" /> Efectivo
              </span>
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded flex items-center">
                <QrCode className="w-3 h-3 mr-1 text-blue-600" /> QR
              </span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Comprar</h5>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/ofertas" className="hover:text-amber-600">Ofertas</Link></li>
              <li><Link href="/live" className="hover:text-amber-600">Tiendas en vivo</Link></li>
              <li><Link href="/cart" className="hover:text-amber-600">Mi carrito</Link></li>
              <li><Link href="/cuenta" className="hover:text-amber-600">Mis pedidos</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px]">Vender</h5>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/vendor" className="hover:text-amber-600 font-semibold text-amber-600">Registrar mi tienda</Link></li>
              <li><Link href="/vendor/productos" className="hover:text-amber-600">Subir productos</Link></li>
              <li><Link href="/vendor/tiktok" className="hover:text-amber-600">Vender por TikTok</Link></li>
              <li><Link href="/vendor/ventas" className="hover:text-amber-600">Mis ventas</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 text-xs text-gray-400">
          <p>© 2026 Vitrina Market Bolivia. Santa Cruz, Bolivia.</p>
        </div>
      </div>
    </footer>
  );
}
