import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/authConfig';

export async function GET() {
  // `demo` tells the sheet that, without OAuth keys, Google/TikTok buttons use a throwaway account (never in production).
  return NextResponse.json({ providers: authConfig.getProviderStatus(), demo: process.env.NODE_ENV !== 'production' });
}
