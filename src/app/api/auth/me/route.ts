import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('chiringuito_auth_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: token,
      email: 'usuario@chiringuito.bo',
      name: 'Usuario Autenticado',
      city: 'Santa Cruz de la Sierra',
    },
  });
}
