import { NextRequest, NextResponse } from 'next/server';
import { backend, readSession } from '@/lib/server/session';

export async function GET(req: NextRequest) {
  const userId = readSession(req);
  if (!userId) return NextResponse.json({ user: null });

  try {
    const user = await backend(`/auth/me/${encodeURIComponent(userId)}`);
    // Orders come along from the backend; the session only needs the profile.
    delete user.orders;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
