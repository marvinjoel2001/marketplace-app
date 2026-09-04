import { NextRequest, NextResponse } from 'next/server';
import {
  checkTikTokLiveStatus,
  updateVendorLiveStatus,
  normalizeTikTokUsername,
} from '@/lib/tiktokLiveService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || '';

  if (!username) {
    return NextResponse.json(
      {
        success: false,
        error: 'El parámetro "username" es requerido. Ejemplo: ?username=@techplus_bo',
      },
      { status: 400 }
    );
  }

  const status = await checkTikTokLiveStatus(username);
  return NextResponse.json(status);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, isLive, title, viewers } = body;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: 'El campo "username" es requerido.',
        },
        { status: 400 }
      );
    }

    const updated = updateVendorLiveStatus(
      username,
      Boolean(isLive),
      title,
      typeof viewers === 'number' ? viewers : undefined
    );

    return NextResponse.json(updated);
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
