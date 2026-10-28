import Link from 'next/link';

export function Logo({ href = '/', suffix }: { href?: string; suffix?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 rounded-md" aria-label="Vitrina, ir al inicio">
      <svg viewBox="0 0 32 22" className="h-5 w-7" aria-hidden>
        <path d="M7 0h22a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H7L0 11z" fill="var(--color-tag)" />
        <circle cx="7.5" cy="11" r="2.3" fill="var(--color-ink)" />
      </svg>
      <span className="type-sign text-xl font-extrabold leading-none text-ink">vitrina</span>
      {suffix && <span className="rounded-md bg-verde-tint px-1.5 py-0.5 text-xs font-bold text-verde-dark">{suffix}</span>}
    </Link>
  );
}
