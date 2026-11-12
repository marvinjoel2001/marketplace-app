import { NextRequest, NextResponse } from 'next/server';
import { backend, readSession } from '@/lib/server/session';

export async function GET(req: NextRequest) {
  try {
    const userId = readSession(req);
    if (!userId) return NextResponse.json({ user: null });
    // The backend refuses suspended or deleted accounts, which ends the session here too.
    const user = await backend('/auth/me', {}, userId);
    // Orders come along from the backend; the session only needs the profile.
    delete user.orders;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
