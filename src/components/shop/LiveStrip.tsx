import { mediaUrl } from '@/lib/catalog';

/** Store logo in a circle; falls back to the store's initial. `fill` stretches it to its container. */
export function StoreAvatar({ name, logo, size = 64, fill = false }: { name: string; logo?: string | null; size?: number; fill?: boolean }) {
  const src = mediaUrl(logo);
  return (
    <span
      className="flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-50 to-emerald-50 text-[#5B4DF0]"
      style={fill ? { width: '100%', height: '100%' } : { width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover object-center" />
      ) : (
        <span className="text-lg font-black">{name.slice(0, 1).toUpperCase()}</span>
      )}
    </span>
  );
}
