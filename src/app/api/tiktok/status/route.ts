import { NextRequest, NextResponse } from 'next/server';
import {
  checkTikTokLiveStatus,
  fetchTikTokUserProfile,
  normalizeTikTokUsername,
} from '@/lib/tiktokLiveService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || '';
  const action = searchParams.get('action') || 'status'; // 'status' | 'profile'

  if (!username) {
    return NextResponse.json(
      {
        success: false,
        error: 'El parámetro "username" es requerido. Ejemplo: ?username=@tiktok',
      },
      { status: 400 }
    );
  }

  if (action === 'profile') {
    const profile = await fetchTikTokUserProfile(username);
    return NextResponse.json(profile);
  }

  const status = await checkTikTokLiveStatus(username);
  return NextResponse.json(status);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usernames, username } = body;

    // Bulk live check for multiple stores
    if (Array.isArray(usernames)) {
      const results = await Promise.all(
        usernames.slice(0, 10).map(async (u: string) => {
          const s = await checkTikTokLiveStatus(u);
          return s;
        })
      );
      return NextResponse.json({ success: true, results });
    }

    if (username) {
      const status = await checkTikTokLiveStatus(username);
      return NextResponse.json(status);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Debe proveer "username" o un arreglo de "usernames".',
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Error al procesar solicitud',
      },
      { status: 500 }
    );
  }
}
