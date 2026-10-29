import Link from 'next/link';
import { ChevronRight, Dumbbell, Gamepad2, Home, Laptop, type LucideIcon, Shirt, ShoppingBag, Smartphone, Sparkles, UtensilsCrossed } from 'lucide-react';
import type { Category } from '@/lib/api';

const STYLES: { match: RegExp; icon: LucideIcon; tint: string }[] = [
  { match: /celular|telefon/, icon: Smartphone, tint: 'bg-emerald-50 text-emerald-600' },
  { match: /electr|tecno|computa/, icon: Laptop, tint: 'bg-sky-50 text-sky-600' },
  { match: /moda|ropa|accesori|calzado/, icon: Shirt, tint: 'bg-rose-50 text-rose-500' },
  { match: /hogar|mueble/, icon: Home, tint: 'bg-amber-50 text-amber-600' },
  { match: /belleza|cuidado/, icon: Sparkles, tint: 'bg-teal-50 text-teal-600' },
  { match: /deporte|outdoor/, icon: Dumbbell, tint: 'bg-indigo-50 text-indigo-600' },
  { match: /juego|gaming|juguete/, icon: Gamepad2, tint: 'bg-purple-50 text-purple-600' },
  { match: /abarrote|aliment|comida/, icon: UtensilsCrossed, tint: 'bg-red-50 text-red-500' },
];

function styleFor(slug: string) {
  return STYLES.find((s) => s.match.test(slug)) ?? { icon: ShoppingBag, tint: 'bg-slate-50 text-slate-600' };
}

/** Categories that actually have products, with how many each one has. */
export function BrowseByCategory({ categories, counts, active }: { categories: Category[]; counts: Record<string, number>; active?: string }) {
  const withProducts = categories.filter((c) => (counts[c.slug] ?? 0) > 0);
  if (withProducts.length < 2) return null;
  return (
    <section className="mb-10" aria-labelledby="categorias">
      <h2 id="categorias" className="mb-4 inline-block rounded-2xl bg-white/85 backdrop-blur-xl px-4 py-2 text-xl sm:text-2xl font-black tracking-tight text-slate-900 border border-white/80 shadow-sm">
        Categorías
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {withProducts.map((cat) => {
          const { icon: Icon, tint } = styleFor(cat.slug);
          const on = cat.slug === active;
          const n = counts[cat.slug] ?? 0;
          return (
            <Link
              key={cat.id}
              href={on ? '/' : `/?category=${cat.slug}#catalogo`}
              aria-current={on ? 'page' : undefined}
              className={`rounded-2xl p-3 sm:p-3.5 flex items-center gap-2.5 sm:gap-3 border shadow-sm transition-colors group ${
                on ? 'bg-white border-[#5B4DF0] ring-2 ring-indigo-200' : 'bg-white/90 border-white/80 hover:bg-white'
              }`}
            >
              <span className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${tint} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-[#5B4DF0]">{cat.name}</span>
                <span className="block text-xs text-slate-600 mt-0.5">
                  {n} {n === 1 ? 'producto' : 'productos'}
                </span>
              </span>
              <ChevronRight className="hidden sm:block w-4 h-4 text-slate-400 shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
