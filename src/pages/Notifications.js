import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/LayoutComponents';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../services/api';

/**
 * Notifications Page
 */
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { unread_only: true } : {};
      const res = await notificationsAPI.getNotifications(params);
      setNotifications(res.data?.notifications || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d < 7) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  // Mark notification as read/unread
  const toggleRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mention': return 'bg-cyan-100 text-cyan-700';
      case 'answer': return 'bg-emerald-100 text-emerald-700';
      case 'follow': return 'bg-purple-100 text-purple-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <PageLayout
      title="Notifications"
      description="Stay updated with your discussion activity and mentions"
      fullWidth={true}
      background="bg-gray-50"
    >
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center">
                  <BellIcon className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 hover:text-teal-800 rounded-md transition-colors border border-teal-200"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-4 border-t border-gray-200">
            {['all', 'unread', 'read'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${filter === tab
                  ? 'border-teal-700 text-teal-700 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-5 animate-pulse flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                  <div className="flex-1"><div className="h-4 bg-gray-200 rounded mb-2 w-2/3" /><div className="h-3 bg-gray-100 rounded w-full" /></div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <SparklesIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-500 text-sm">
                {filter === 'unread' ? "You're all caught up!" : 'Check back later for updates'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-lg shadow-sm p-4 sm:p-5 border-l-4 transition-all hover:shadow-md ${notif.is_read ? 'border-gray-200' : 'border-teal-500 bg-teal-50'}`}
                >
                  <div className="flex gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationIcon(notif.type)}`}>
                      {notif.type === 'mention' && <BellIcon className="w-5 h-5" />}
                      {notif.type === 'answer' && <CheckIcon className="w-5 h-5" />}
                      {(notif.type === 'follow' || !['mention','answer'].includes(notif.type)) && <SparklesIcon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-sm sm:text-base font-semibold ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                          {notif.message && <p className="text-sm text-gray-600 mt-1">{notif.message}</p>}
                          <p className="text-xs text-gray-400 mt-2">{getTimeAgo(notif.created_at)}</p>
                        </div>
                        {!notif.is_read && <div className="flex-shrink-0 w-2.5 h-2.5 bg-teal-500 rounded-full mt-1" />}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      {!notif.is_read && (
                        <button onClick={() => markAsRead(notif.id)} className="p-2 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors" title="Mark as read">
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notif.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Notifications;
