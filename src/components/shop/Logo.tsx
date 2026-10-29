import Link from 'next/link';

/** Vitrina Market wordmark with the octopus logo. */
export function Logo({ href = '/', suffix }: { href?: string; suffix?: string }) {
  return (
    <Link href={href} className="flex items-center space-x-2.5 group shrink-0" aria-label="Vitrina Market, ir al inicio">
      <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-emerald-200/80 group-hover:scale-105 transition-transform shrink-0 bg-white p-0.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pulpo-icon.png" alt="" className="w-full h-full object-cover rounded-full" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-black tracking-tight text-slate-900 leading-none">Vitrina Market</span>
        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
          {suffix ?? 'Marketplace Bolivia'}
        </span>
      </div>
    </Link>
  );
}
