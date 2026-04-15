import React, { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../components/LayoutComponents';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  ClockIcon,
  BoltIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { notificationsAPI } from '../services/api';

/**
 * Notifications Page
 */
const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [serverUnreadCount, setServerUnreadCount] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy === 'oldest' ? 'oldest' : 'newest',
      };

      if (filter === 'read') params.is_read = true;
      if (filter === 'unread') params.is_read = false;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (query.trim()) params.search = query.trim();

      const res = await notificationsAPI.getNotifications(params);
      const payload = res?.data || res || {};
      const notificationsList = payload.notifications || payload.data?.notifications || [];
      setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
      setServerUnreadCount(Number.isFinite(payload.unreadCount) ? payload.unreadCount : null);
      setPagination(prev => ({
        ...prev,
        total: Number(payload.total || 0),
        totalPages: Number(payload.totalPages || 1),
        hasNext: !!payload.hasNext,
        hasPrev: !!payload.hasPrev,
      }));
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter, query, sortBy, typeFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filter, query, sortBy, typeFilter]);

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

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      await fetchNotifications();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      await fetchNotifications();
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      await fetchNotifications();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    // Server already applies read/unread filters; keep a safe local guard.
    if (filter === 'unread') return n.is_read === false;
    if (filter === 'read') return n.is_read === true;
    return true;
  });

  const searchedNotifications = filteredNotifications.filter((n) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (n.title || '').toLowerCase().includes(q) ||
      (n.message || '').toLowerCase().includes(q) ||
      (n.type || '').toLowerCase().includes(q)
    );
  });

  const sortedNotifications = [...searchedNotifications].sort((a, b) => {
    const ad = new Date(a.created_at || 0).getTime();
    const bd = new Date(b.created_at || 0).getTime();
    if (sortBy === 'oldest') return ad - bd;
    if (sortBy === 'unread-first') {
      if (!!a.is_read !== !!b.is_read) return a.is_read ? 1 : -1;
      return bd - ad;
    }
    return bd - ad;
  });

  const unreadCount = Number.isFinite(serverUnreadCount)
    ? serverUnreadCount
    : notifications.filter(n => !n.is_read).length;
  const readCount = notifications.length - unreadCount;

  const grouped = sortedNotifications.reduce((acc, n) => {
    const time = new Date(n.created_at || 0).getTime();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const diffDays = Math.floor((now - time) / dayMs);
    const key = diffDays < 1 ? 'Today' : diffDays < 7 ? 'This Week' : 'Earlier';
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  const resolveRelatedPath = (notif) => {
    if (!notif?.related_id || !notif?.related_type) return null;
    if (notif.related_type === 'discussion') return `/discussions/${notif.related_id}`;
    if (notif.related_type === 'answer') return `/discussions/${notif.related_id}`;
    if (notif.related_type === 'user') return `/users/${notif.related_id}`;
    return null;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mention': return 'bg-cyan-100 text-cyan-700';
      case 'answer': return 'bg-emerald-100 text-emerald-700';
      case 'reply': return 'bg-emerald-100 text-emerald-700';
      case 'vote': return 'bg-indigo-100 text-indigo-700';
      case 'follow': return 'bg-purple-100 text-purple-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <PageLayout
      title="Notifications"
      description="Stay up to date with activity, replies, and mentions"
      headerIcon={<BellIcon className="w-6 h-6 text-white" />}
      headerActions={
        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="px-3 py-2 text-sm font-medium text-white border border-white/40 hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh notifications"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 bg-white/20 text-white text-sm font-semibold rounded-full">
              {unreadCount} unread
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-white border border-white/40 hover:bg-white/10 rounded-lg transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      }
      showHeader={true}
      fullWidth={true}
      background="bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{notifications.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Unread</p>
            <p className="text-xl font-bold text-teal-700 mt-1">{unreadCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Read</p>
            <p className="text-xl font-bold text-gray-700 mt-1">{readCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Read Rate</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              {notifications.length ? Math.round((readCount / notifications.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Sticky toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read' },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${filter === key
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${filter === key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notifications"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-sm text-gray-700 focus:outline-none"
              >
                <option value="all">All types</option>
                <option value="mention">Mention</option>
                <option value="answer">Answer</option>
                <option value="reply">Reply</option>
                <option value="vote">Vote</option>
                <option value="follow">Follow</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-sm text-gray-700 focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="unread-first">Unread first</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-5 animate-pulse flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <SparklesIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
            </h3>
            <p className="text-gray-500 text-sm">
              {query ? 'Try a different search keyword' : filter === 'unread' ? "You're all caught up!" : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {['Today', 'This Week', 'Earlier'].map((section) => (
              grouped[section]?.length ? (
                <div key={section}>
                  <div className="flex items-center gap-2 mb-3">
                    {section === 'Today' ? <BoltIcon className="w-4 h-4 text-teal-600" /> : <ClockIcon className="w-4 h-4 text-gray-400" />}
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{section}</h3>
                    <span className="text-xs text-gray-400">{grouped[section].length}</span>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {grouped[section].map(notif => (
                      (() => {
                        const relatedPath = resolveRelatedPath(notif);
                        return (
                          <div
                            key={notif.id}
                            className={`bg-white rounded-lg shadow-sm p-4 sm:p-5 border-l-4 transition-all hover:shadow-md ${notif.is_read ? 'border-gray-200' : 'border-teal-500'}`}
                          >
                            <div className="flex gap-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationIcon(notif.type)}`}>
                                {notif.type === 'mention' && <BellIcon className="w-5 h-5" />}
                                {(notif.type === 'answer' || notif.type === 'reply' || notif.type === 'vote') && <CheckIcon className="w-5 h-5" />}
                                {(notif.type === 'follow' || !['mention', 'answer', 'reply', 'vote'].includes(notif.type)) && <SparklesIcon className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className={`text-sm sm:text-base font-semibold ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                                      {!notif.is_read && <span className="flex-shrink-0 w-2 h-2 bg-teal-500 rounded-full" />}
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 uppercase tracking-wide">{notif.type || 'update'}</span>
                                    </div>
                                    {notif.message && <p className="text-sm text-gray-600 mt-1">{notif.message}</p>}
                                    <p className="text-xs text-gray-400 mt-2">{getTimeAgo(notif.created_at)}</p>
                                    {relatedPath && (
                                      <button
                                        onClick={() => navigate(relatedPath)}
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800"
                                      >
                                        View related
                                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 flex gap-1">
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
                        );
                      })()
                    ))}
                  </div>
                </div>
              ) : null
            ))}

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={!pagination.hasPrev || loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Prev
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.hasNext || loading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Notifications;
