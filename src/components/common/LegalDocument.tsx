import Link from 'next/link';

export const LEGAL_CONTACT_EMAIL = 'marvinjoelpena@gmail.com';
export const LEGAL_UPDATED_AT = '1 de noviembre de 2026';

/** Shared frame for the public legal pages linked from the footer and the Google consent screen. */
export function LegalDocument({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto my-8 w-full max-w-3xl rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-10">
      <h1 className="type-sign text-2xl font-extrabold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted">Última actualización: {LEGAL_UPDATED_AT}</p>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:font-semibold [&_a]:text-indigo-600 [&_a:hover]:underline">
        {children}
      </div>
      <p className="mt-8 border-t border-slate-100 pt-4 text-xs text-muted">
        ¿Dudas? Escríbenos a <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="font-semibold text-indigo-600">{LEGAL_CONTACT_EMAIL}</a> ·{' '}
        <Link href="/" className="font-semibold text-indigo-600">Volver al inicio</Link>
      </p>
    </article>
  );
}
