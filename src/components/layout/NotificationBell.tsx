// 알림 벨(아이콘+뱃지+드롭다운) 컴포넌트
import React, { useEffect, useState, useRef } from 'react';
import { fetchNotifications, markNotificationRead, deleteNotification } from '@/lib/supabase/notifications';
import type { Notification } from '@/types/database';

interface NotificationBellProps {
  userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications(userId).then(({ data }) => {
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    });
  }, [userId, open]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, is_read: true } : notif));
    setUnreadCount(c => c - 1);
  };
  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(n => n.filter(notif => notif.id !== id));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative p-2 rounded-full hover:bg-blue-50 transition"
        onClick={() => setOpen(v => !v)}
        aria-label="알림"
      >
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-xs bg-white rounded-xl shadow-xl border z-50 animate-fade-in">
          <div className="p-3 border-b font-bold text-blue-600">알림</div>
          <ul className="max-h-80 overflow-y-auto divide-y">
            {notifications.length === 0 && <li className="text-xs text-gray-400 p-4 text-center">알림이 없습니다.</li>}
            {notifications.map(notif => (
              <li key={notif.id} className={`flex items-start gap-2 p-3 ${notif.is_read ? 'bg-white' : 'bg-blue-50'}`}>
                <div className="flex-1">
                  <div className="text-sm text-gray-800">{notif.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString('ko-KR')}</div>
                </div>
                {!notif.is_read && (
                  <button className="text-xs text-blue-500 hover:underline mr-2" onClick={() => handleRead(notif.id)}>읽음</button>
                )}
                <button className="text-xs text-red-400 hover:underline" onClick={() => handleDelete(notif.id)}>삭제</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 