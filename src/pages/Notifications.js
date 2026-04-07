import React, { useState } from 'react';
import { PageLayout } from '../components/LayoutComponents';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * Notifications Page
 * Displays user notifications with marking as read/unread and delete options
 */
const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'mention',
      title: 'You were mentioned in a discussion',
      message: 'John mentioned you in "Best React Practices"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      link: '/discussions/1'
    },
    {
      id: 2,
      type: 'answer',
      title: 'New reply to your discussion',
      message: 'Sarah replied to your question about state management',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
      link: '/discussions/2'
    },
    {
      id: 3,
      type: 'update',
      title: 'Discussion you\'re following has new activity',
      message: '"Web Development Tips" has 3 new replies',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
      link: '/discussions/3'
    }
  ]);

  const [filter, setFilter] = useState('all'); // all, unread, read

  // Format timestamp relative to now
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Mark notification as read/unread
  const toggleRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mention':
        return 'bg-cyan-100 text-cyan-700';
      case 'answer':
        return 'bg-emerald-100 text-emerald-700';
      case 'update':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
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
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <SparklesIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-600 text-sm">
                {filter === 'unread'
                  ? 'You\'re all caught up!'
                  : 'Check back later for updates on your activity'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-lg shadow-sm p-4 sm:p-5 border-l-4 transition-all hover:shadow-md ${notif.read
                    ? 'border-gray-200'
                    : 'border-teal-500 bg-teal-50'
                    }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationIcon(notif.type)}`}>
                      {notif.type === 'mention' && <BellIcon className="w-5 h-5" />}
                      {notif.type === 'answer' && <CheckIcon className="w-5 h-5" />}
                      {notif.type === 'update' && <SparklesIcon className="w-5 h-5" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-sm sm:text-base font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notif.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {getTimeAgo(notif.timestamp)}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="flex-shrink-0 w-2.5 h-2.5 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mt-1 shadow-sm" />
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-2">
                      <button
                        onClick={() => toggleRead(notif.id)}
                        className="p-2 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                        title={notif.read ? 'Mark as unread' : 'Mark as read'}
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete notification"
                      >
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
