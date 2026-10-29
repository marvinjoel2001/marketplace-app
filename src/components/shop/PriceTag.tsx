import { formatBs } from '@/lib/utils';

/** Price as on the product cards: bold indigo, with the regular price struck through when on sale. */
export function PriceTag({
  price,
  regular,
  size = 'sm',
}: {
  price: number;
  regular?: number;
  size?: 'sm' | 'lg';
}) {
  const onSale = regular !== undefined && regular > price;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      <span className={`price-tag ${size === 'lg' ? 'price-tag-lg' : 'price-tag-sm'}`}>{formatBs(price)}</span>
      {onSale && (
        <span className={`${size === 'lg' ? 'text-base' : 'text-[11px] sm:text-xs'} font-semibold text-slate-400 line-through`}>
          {formatBs(regular)}
        </span>
      )}
    </span>
  );
}

export function DiscountBadge({ percent }: { percent: number }) {
  if (percent <= 0) return null;
  return (
    <span className="px-2 py-0.5 rounded-md bg-[#5B4DF0] text-white text-[10px] font-black leading-none shadow-xs">-{percent}%</span>
  );
}
