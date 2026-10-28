import { NextRequest, NextResponse } from 'next/server';
import { backend, errorResponse, withSession } from '@/lib/server/session';

// Phone sign-in. There is no SMS code yet: the number identifies the account.
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const digits = String(phone ?? '').replace(/\D/g, '').replace(/^591/, '');
    if (!/^[67]\d{7}$/.test(digits)) {
      return NextResponse.json(
        { error: 'Escribe tu celular de 8 dígitos, por ejemplo 71234567' },
        { status: 400 },
      );
    }

    const data = await backend('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'PHONE',
        email: `${digits}@tel.vitrina.bo`,
        name: `Cliente ${digits.slice(-4)}`,
        phone: digits,
      }),
    });
    return withSession(NextResponse.json({ user: data.user }), data.user.id);
  } catch (err) {
    return errorResponse(err, 'No pudimos iniciar sesión con tu número');
  }
}
