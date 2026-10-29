import { Store as StoreIcon } from 'lucide-react';
import { TikTokIcon } from '@/components/common/TikTokIcon';

export type LiveSource = 'tiendas' | 'tiktok';

/**
 * Two-option switch between stores registered in Vitrina and the TikTok lives found by the scraper.
 * Renders links when `hrefFor` is given (server pages) or buttons with `onChange` (client widgets).
 */
export function LiveSourceToggle({
  value,
  counts,
  onChange,
  hrefFor,
  dark = false,
}: {
  value: LiveSource;
  counts: Record<LiveSource, number>;
  onChange?: (source: LiveSource) => void;
  hrefFor?: (source: LiveSource) => string;
  dark?: boolean;
}) {
  const options: { key: LiveSource; label: string; icon: React.ReactNode }[] = [
    { key: 'tiktok', label: 'TikTok', icon: <TikTokIcon className="w-3.5 h-3.5" size={14} /> },
    { key: 'tiendas', label: 'Tiendas registradas', icon: <StoreIcon className="w-3.5 h-3.5" /> },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Qué lives ver"
      className={`inline-flex rounded-full p-1 ${dark ? 'bg-[#151e26] border border-[#253039]' : 'bg-slate-100 border border-slate-200'}`}
    >
      {options.map(({ key, label, icon }) => {
        const on = value === key;
        const cls = `inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
          on
            ? dark
              ? 'bg-white text-slate-900'
              : 'bg-[#5B4DF0] text-white shadow-md shadow-indigo-500/25'
            : dark
              ? 'text-slate-300 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
        }`;
        const content = (
          <>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${key === 'tiktok' ? 'bg-black' : on && !dark ? 'bg-white/20' : ''}`}>{icon}</span>
            {label}
            <span className={`rounded-full px-1.5 text-[10px] font-black ${on ? (dark ? 'bg-slate-200' : 'bg-white/25') : dark ? 'bg-[#253039]' : 'bg-white'}`}>{counts[key]}</span>
          </>
        );
        return hrefFor ? (
          <a key={key} href={hrefFor(key)} role="radio" aria-checked={on} className={cls}>
            {content}
          </a>
        ) : (
          <button key={key} type="button" role="radio" aria-checked={on} onClick={() => onChange?.(key)} className={cls}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
