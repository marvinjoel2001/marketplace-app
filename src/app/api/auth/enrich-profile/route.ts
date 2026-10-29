import { NextRequest, NextResponse } from 'next/server';
import { backend, errorResponse, readSession } from '@/lib/server/session';

// Saves the customer's delivery address (and phone, if the account has none yet).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = readSession(req);
    if (!userId || userId !== body.userId) {
      return NextResponse.json({ error: 'Inicia sesión de nuevo para guardar tu dirección' }, { status: 401 });
    }
    const data = await backend('/auth/enrich-profile', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        name: body.name,
        phone: body.phone,
        address: body.address,
        addressReference: body.addressReference,
        lat: body.lat,
        lng: body.lng,
      }),
    });
    return NextResponse.json({ user: data.user });
  } catch (err) {
    return errorResponse(err, 'No pudimos guardar tu dirección');
  }
}
