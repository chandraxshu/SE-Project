import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Link } from 'react-router-dom';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-surface-600 hover:text-surface-900 rounded-lg hover:bg-surface-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-elevated border border-surface-200 py-2 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-surface-100">
            <span className="text-sm font-semibold text-surface-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-surface-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-surface-400">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                  }}
                  className={`p-3.5 hover:bg-surface-50 transition-colors cursor-pointer ${
                    !n.is_read ? 'bg-primary-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${!n.is_read ? 'font-semibold text-surface-900' : 'font-medium text-surface-700'}`}>
                      {n.title}
                    </p>
                    <span className="text-2xs text-surface-400 whitespace-nowrap flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-surface-500 mt-1 line-clamp-2">
                    {n.message}
                  </p>
                  {n.related_item_id && (
                    <Link
                      to={`/items/${n.related_item_id}`}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-2xs text-primary-600 font-medium mt-1.5 hover:underline"
                    >
                      View item <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
