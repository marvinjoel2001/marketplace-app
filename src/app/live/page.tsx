import { marketplaceApi } from '@/lib/api';
import { LiveDirectory } from '@/components/live/LiveDirectory';
import './live.css';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['Ropa', 'Electrónica', 'Hogar', 'Belleza', 'Otros'];

export default async function LiveShoppingDirectoryPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === 'string' && CATEGORIES.includes(params.category) ? params.category : undefined;
  const page = typeof params.page === 'string' && /^\d{1,4}$/.test(params.page) && Number(params.page) > 0 ? Number(params.page) : 1;
  const lives = await marketplaceApi.getTikTokLives({ category, page, limit: 100 });
  return (
    <div className="live-page">
      <aside className="live-side-note" aria-label="Vitrina en vivo">
        <h2>Lo que necesitás,<br />más cerca.</h2>
        <hr />
        <p>Descubrí productos en vivo, comunidad y las mejores tiendas de Bolivia.</p>
      </aside>
      <LiveDirectory key={`${category ?? 'all'}:${page}`} initialData={lives} category={category} page={page} initialNow={Date.parse(lives?.meta.server_time ?? '') || 0} />
    </div>
  );
}
