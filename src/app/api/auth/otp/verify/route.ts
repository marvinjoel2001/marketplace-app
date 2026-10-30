import { NextRequest, NextResponse } from 'next/server';
import { backend, errorResponse, withSession } from '@/lib/server/session';

// Step 2: the right code proves the number, and only then does the cookie session start.
export async function POST(req: NextRequest) {
  try {
    const { phone, code, idToken } = await req.json();
    const digits = String(phone ?? '').replace(/\D/g, '').replace(/^591/, '');
    const data = await backend('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone: digits, code, idToken }),
    });
    return withSession(NextResponse.json({ user: data.user }), data.user.id);
  } catch (err) {
    return errorResponse(err, 'No pudimos confirmar el código');
  }
}
