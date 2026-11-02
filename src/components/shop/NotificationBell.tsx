'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';

/** Bell with the number of unread order updates. Checks every 20 s while the tab is visible. */
export function NotificationBell({ userId }: { userId: string }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => {
      if (document.visibilityState !== 'visible') return;
      marketplaceApi.getNotifications(userId).then((r) => active && r && setUnread(r.unread));
    };
    load();
    const timer = setInterval(load, 20_000);
    document.addEventListener('visibilitychange', load);
    // Sent by /notificaciones once it marked everything read.
    const cleared = () => setUnread(0);
    window.addEventListener('notifications-read', cleared);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', load);
      window.removeEventListener('notifications-read', cleared);
    };
  }, [userId]);

  return (
    <Link
      href="/notificaciones"
      aria-label={unread ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
      className="relative inline-flex p-2 text-slate-700 hover:text-emerald-700 transition-all"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FE2C55] px-1 text-[10px] font-black leading-none text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
