import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/lib/authConfig';
import { backend, errorResponse, withSession } from '@/lib/server/session';

// Demo sign-in for Google/TikTok while their OAuth keys are not configured.
// With keys set, sign-in goes through /api/auth/oauth/[provider] and this route refuses.
export async function POST(req: NextRequest) {
  try {
    const { provider, email, name } = await req.json();
    const status = authConfig.getProviderStatus();
    const key = provider === 'GOOGLE' ? 'google' : provider === 'TIKTOK' ? 'tiktok' : null;
    if (!key) return NextResponse.json({ error: 'Proveedor no válido' }, { status: 400 });
    if (status[key].enabled) {
      return NextResponse.json({ error: 'Usa el botón para continuar con tu cuenta' }, { status: 403 });
    }

    const data = await backend('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify({ provider, email, name }),
    });
    return withSession(NextResponse.json({ user: data.user }), data.user.id);
  } catch (err) {
    return errorResponse(err, 'No pudimos iniciar sesión');
  }
}
