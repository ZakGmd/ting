'use client';

import { useEffect, useState, useCallback } from 'react';
import { getNotifications, markNotificationsAsRead, markAllNotificationsAsRead, NotificationWithActor } from '@/actions/notifications/notificationActions';
import { Bell, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

// Using the type from the API instead of defining our own
type Notification = NotificationWithActor;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchNotifications = useCallback(async (append = false) => {
    try {
      setLoading(true);
      const offset = append ? page * limit : 0;
      const result = await getNotifications(limit, offset);
      
      if (result.success) {
        if (append) {
          setNotifications(prev => [...prev, ...(result.notifications || [])]);
        } else {
          setNotifications(result.notifications || []);
        }
        
        setHasMore((result.notifications?.length || 0) === limit);
        if (append) {
          setPage(prev => prev + 1);
        }
      } else {
        setError(result.error || 'Failed to fetch notifications');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleLoadMore() {
    if (!loading && hasMore) {
      await fetchNotifications(true);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      const result = await markNotificationsAsRead([notificationId]);
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true } 
              : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      const result = await markAllNotificationsAsRead();
      
      if (result.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'LIKE':
        return '❤️';
      case 'COMMENT':
        return '💬';
      case 'FOLLOW':
        return '👤';
      case 'MENTION':
        return '@';
      case 'NEW_JOB':
        return '💼';
      case 'APPLICATION':
        return '📝';
      case 'SYSTEM':
        return '🔔';
      default:
        return '🔔';
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {notifications.length > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 transition-colors"
          >
            <Check size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {notifications.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Bell size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-300 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">
            We&apos;ll notify you when something happens
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-lg ${notification.isRead ? 'bg-black/30' : 'bg-black/50 border border-[#fc7348]/30'} transition-colors`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {notification.actor?.profileImage ? (
                    <Image 
                      src={notification.actor.profileImage} 
                      alt={notification.actor.name}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#fc7348]/20 flex items-center justify-center">
                      <span className="text-[#fc7348]">{getNotificationIcon(notification.type as string)}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300">
                      {notification.actor?.name || 'System'}
                    </p>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-white mt-1">{notification.message}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    {notification.linkUrl ? (
                      <Link 
                        href={notification.linkUrl} 
                        className="text-xs text-[#fc7348] hover:underline"
                      >
                        View details
                      </Link>
                    ) : (
                      <span></span>
                    )}
                    
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs px-2 py-1 rounded text-gray-300 hover:bg-white/10"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'Load more'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 