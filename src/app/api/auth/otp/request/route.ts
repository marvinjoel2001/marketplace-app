import { NextRequest, NextResponse } from 'next/server';
import { backend, errorResponse } from '@/lib/server/session';

// Step 1 of phone sign-in: the backend sends a six-digit code to the number's WhatsApp.
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const digits = String(phone ?? '').replace(/\D/g, '').replace(/^591/, '');
    if (!/^[67]\d{7}$/.test(digits)) {
      return NextResponse.json({ error: 'Escribe tu celular de 8 dígitos, por ejemplo 71234567' }, { status: 400 });
    }
    const data = await backend('/auth/otp/request', {
      method: 'POST',
      headers: { 'x-client-ip': req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown' },
      body: JSON.stringify({ phone: digits }),
    });
    return NextResponse.json(data);
  } catch (err) {
    return errorResponse(err, 'No pudimos enviarte el código');
  }
}
