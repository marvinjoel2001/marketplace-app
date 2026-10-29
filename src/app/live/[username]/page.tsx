import { notFound } from 'next/navigation';
import { marketplaceApi } from '@/lib/api';
import { LiveRoom } from '@/components/live/LiveRoom';
import '../live.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `@${username} en vivo — Vitrina Market` };
}

export default async function LiveRoomPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const room = await marketplaceApi.getLiveRoom(username);
  if (!room) notFound();
  return (
    // `live-page` turns the dark theme on, like the live directory.
    <div className="live-page" style={{ display: 'block' }}>
      <LiveRoom room={room} />
    </div>
  );
}
