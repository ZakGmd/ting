'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getNotifications } from '@/actions/notifications/notificationActions';

export default function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const result = await getNotifications(1, 0);
        if (result.success) {
          setUnreadCount(result.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUnreadCount();

    // Poll for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/notifications" className="relative">
      <Bell strokeWidth={1.5} className="w-5 h-5" />
      {!loading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#fc7348] text-[10px] text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
} 