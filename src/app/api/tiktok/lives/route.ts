import { NextRequest, NextResponse } from 'next/server';
import { marketplaceApi } from '@/lib/api';
import { NEAR_COOKIE, resolveNear } from '@/lib/visitorCity';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const page = query.get('page') ?? '1';
  const category = query.get('category') || undefined;
  if (!/^\d{1,4}$/.test(page) || Number(page) < 1 ||
    (category && !['Ropa', 'Electrónica', 'Hogar', 'Belleza', 'Otros'].includes(category))) {
    return NextResponse.json({ error: 'Filtro de transmisiones inválido' }, { status: 400 });
  }
  // Same resolution as the /live page, so background refreshes keep the visitor's city first.
  const near = resolveNear({
    param: query.get('cerca'),
    cookie: request.cookies.get(NEAR_COOKIE)?.value,
    headers: request.headers,
  });
  const result = await marketplaceApi.getTikTokLives({ category, near: near.city, page: Number(page), limit: 100 });
  if (!result) return NextResponse.json({ error: 'No se pudo actualizar el catálogo' }, { status: 503 });
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
