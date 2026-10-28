import { formatBs } from '@/lib/utils';

/** Yellow market tag with the price that applies today; the regular price sits beside it when on sale. */
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
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className={`price-tag ${size === 'lg' ? 'price-tag-lg' : 'price-tag-sm'}`}>{formatBs(price)}</span>
      {onSale && (
        <span className={`${size === 'lg' ? 'text-base' : 'text-xs'} font-medium text-muted line-through`}>
          {formatBs(regular)}
        </span>
      )}
    </span>
  );
}

export function DiscountBadge({ percent }: { percent: number }) {
  if (percent <= 0) return null;
  return (
    <span className="type-sign rounded-md bg-ink px-1.5 py-0.5 text-xs font-extrabold text-tag">-{percent}%</span>
  );
}
