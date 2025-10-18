import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { notificationsAPI } from '../services/notificationsAPI';
import { Helmet } from 'react-helmet-async';
import {
  BellIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AtSymbolIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  MegaphoneIcon,
  XMarkIcon,
  EnvelopeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get active tab from URL or default to 'all'
  const activeTab = searchParams.get('filter') || 'all';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({
    all: 0,
    unread: 0,
    mentions: 0,
    replies: 0,
    contributions: 0,
    votes: 0,
    follows: 0,
    system: 0
  });
  const notificationsPerPage = 20;

  /* Mock notification data removed - now using real API
  const mockNotifications = [
    {
      id: 1,
      type: 'reply',
      category: 'replies',
      user: {
        name: 'ExpertLinguist',
        avatar: null,
        id: 'user-123'
      },
      message: 'replied to your discussion',
      target: 'Lisu Tones Explained',
      timestamp: '5 minutes ago',
      isRead: false,
      link: '/discussions/1',
      actionButtons: [
        { label: 'View Reply', action: 'view' }
      ]
    },
    {
      id: 2,
      type: 'follow',
      category: 'follows',
      user: {
        name: 'JohnDoe',
        avatar: null,
        id: 'user-456'
      },
      message: 'started following you',
      target: null,
      timestamp: '2 hours ago',
      isRead: false,
      link: '/users/user-456'
    },
    {
      id: 3,
      type: 'upvote',
      category: 'likes',
      user: {
        name: 'LisuLearner',
        avatar: null,
        id: 'user-789'
      },
      message: 'upvoted your answer in',
      target: 'How to pronounce "ꓡꓲ"?',
      timestamp: 'Yesterday',
      isRead: true,
      link: '/discussions/5'
    },
    {
      id: 4,
      type: 'mention',
      category: 'mentions',
      user: {
        name: 'CommunityHelper',
        avatar: null,
        id: 'user-321'
      },
      message: 'mentioned you in',
      target: 'Grammar Help Thread',
      timestamp: '2 days ago',
      isRead: false,
      link: '/discussions/8#mention',
      actionButtons: [
        { label: 'Reply', action: 'reply' }
      ]
    },
    {
      id: 5,
      type: 'contribution_approved',
      category: 'contributions',
      user: null, // System notification
      message: 'Your word',
      target: 'na³tɕy⁵⁵',
      secondaryMessage: 'was approved',
      timestamp: '3 days ago',
      isRead: true,
      link: '/words/word-na3tcy55',
      actionButtons: [
        { label: 'View Entry', action: 'view' }
      ]
    },
    {
      id: 6,
      type: 'contribution_feedback',
      category: 'contributions',
      user: {
        name: 'AdminReviewer',
        avatar: null,
        id: 'admin-1'
      },
      message: 'left feedback on your submission',
      target: 'hmu³hã⁵',
      timestamp: '4 days ago',
      isRead: false,
      link: '/dashboard?tab=contributions&id=sub-123',
      actionButtons: [
        { label: 'View Feedback', action: 'view' },
        { label: 'Edit Submission', action: 'edit' }
      ]
    },
    {
      id: 7,
      type: 'contribution_rejected',
      category: 'contributions',
      user: null,
      message: 'Your suggested edit for',
      target: 'hmu³hã⁵',
      secondaryMessage: 'needs revision',
      timestamp: '5 days ago',
      isRead: true,
      link: '/dashboard?tab=contributions&id=sub-456',
      actionButtons: [
        { label: 'View Feedback', action: 'view' },
        { label: 'Resubmit', action: 'edit' }
      ]
    },
    {
      id: 8,
      type: 'system',
      category: 'system',
      user: null,
      message: 'New Feature:',
      target: 'Enhanced search with tone marks',
      secondaryMessage: 'is now available!',
      timestamp: '1 week ago',
      isRead: true,
      link: '/help/article/enhanced-search',
      actionButtons: [
        { label: 'Learn More', action: 'view' }
      ]
    },
    {
      id: 9,
      type: 'like',
      category: 'likes',
      user: {
        name: 'ToneMaster',
        avatar: null,
        id: 'user-999'
      },
      message: 'liked your discussion',
      target: 'Understanding Lisu Syllables',
      timestamp: '1 week ago',
      isRead: true,
      link: '/discussions/12'
    },
    {
      id: 10,
      type: 'message',
      category: 'messages',
      user: {
        name: 'LanguageEnthusiast',
        avatar: null,
        id: 'user-888'
      },
      message: 'sent you a message',
      target: null,
      timestamp: '2 weeks ago',
      isRead: false,
      link: '/chat?user=user-888',
      actionButtons: [
        { label: 'Reply', action: 'reply' }
      ]
    },
    {
      id: 11,
      type: 'admin',
      category: 'system',
      user: null,
      message: 'Important:',
      target: 'Scheduled maintenance on Dec 1st',
      timestamp: '2 weeks ago',
      isRead: true,
      link: '/help/article/maintenance-schedule'
    },
    {
      id: 12,
      type: 'reply',
      category: 'replies',
      user: {
        name: 'NewLearner',
        avatar: null,
        id: 'user-777'
      },
      message: 'replied to a discussion you follow',
      target: 'Basic Pronunciation Guide',
      timestamp: '3 weeks ago',
      isRead: true,
      link: '/discussions/20'
    }
  ]; */

  // Filter tabs configuration
  const filterTabs = [
    { id: 'all', label: 'All', icon: BellIcon },
    { id: 'unread', label: 'Unread', icon: ExclamationCircleIcon },
    { id: 'mentions', label: 'Mentions', icon: AtSymbolIcon },
    { id: 'replies', label: 'Replies', icon: ChatBubbleLeftRightIcon },
    { id: 'contributions', label: 'Contributions', icon: DocumentTextIcon },
    { id: 'votes', label: 'Votes', icon: ArrowUpIcon },
    { id: 'follows', label: 'Follows', icon: UserIcon },
    { id: 'system', label: 'System', icon: MegaphoneIcon },
  ];

  // Load notifications on mount and when filter changes
  useEffect(() => {
    loadNotifications();
    loadCategoryCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * notificationsPerPage;
      const response = await notificationsAPI.getNotifications({
        filter: activeTab,
        limit: notificationsPerPage,
        offset: offset
      });

      setNotifications(response.data || []);
      setTotalNotifications(response.pagination?.total || 0);
      setHasMore(response.pagination?.hasMore || false);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
      setLoading(false);
    }
  };

  const loadCategoryCounts = async () => {
    try {
      const response = await notificationsAPI.getCategoryCounts();
      setCategoryCounts(response.counts || {
        all: 0,
        unread: 0,
        mentions: 0,
        replies: 0,
        contributions: 0,
        votes: 0,
        follows: 0,
        system: 0
      });
    } catch (error) {
      console.error('Error loading category counts:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      loadCategoryCounts(); // Reload counts
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await notificationsAPI.markAsRead(notification.id);

        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        loadCategoryCounts(); // Reload counts
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    navigate(notification.target_link);
  };

  const handleDismissNotification = async (e, notificationId) => {
    e.stopPropagation();

    try {
      await notificationsAPI.deleteNotification(notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadCategoryCounts(); // Reload counts
      toast.success('Notification dismissed');
    } catch (error) {
      console.error('Error dismissing notification:', error);
      toast.error('Failed to dismiss notification');
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'reply':
        return <ChatBubbleLeftRightIcon className={`${iconClass} text-blue-500`} />;
      case 'follow':
        return <UserIcon className={`${iconClass} text-green-500`} />;
      case 'upvote':
        return <ArrowUpIcon className={`${iconClass} text-green-500`} />;
      case 'downvote':
        return <ArrowDownIcon className={`${iconClass} text-red-500`} />;
      case 'mention':
        return <AtSymbolIcon className={`${iconClass} text-purple-500`} />;
      case 'contribution_approved':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'contribution_rejected':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'contribution_feedback':
        return <ExclamationCircleIcon className={`${iconClass} text-yellow-500`} />;
      case 'system':
      case 'admin':
        return <MegaphoneIcon className={`${iconClass} text-teal-500`} />;
      case 'message':
        return <EnvelopeIcon className={`${iconClass} text-indigo-500`} />;
      case 'group_chat':
        return <UserGroupIcon className={`${iconClass} text-blue-600`} />;
      default:
        return <BellIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const handleTabChange = (tabId) => {
    setSearchParams({ filter: tabId });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalNotifications / notificationsPerPage);
  const unreadCount = categoryCounts.unread || 0;

  return (
    <>
      <Helmet>
        <title>Your Notifications - Lisu Dictionary</title>
        <meta name="description" content="View and manage your notifications from the Lisu Dictionary community" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile-Optimized Header - Sticky */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            {/* Header Section - Mobile Optimized */}
            <div className="flex items-center justify-between py-3 sm:py-4">
              {/* Left: Title with Icon */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <BellIcon className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    Your Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {unreadCount} unread
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mark All as Read - Icon on mobile, text on desktop */}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-2 sm:px-4 sm:py-2 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCircleIcon className="w-5 h-5 sm:hidden" />
                    <span className="hidden sm:inline">Mark All Read</span>
                  </button>
                )}

                {/* Settings Icon */}
                <Link
                  to="/settings?tab=notifications"
                  className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Notification settings"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Filter Tabs - Scrollable on Mobile */}
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="flex gap-1 sm:gap-2 border-b border-gray-200 dark:border-gray-700 min-w-min">
                {filterTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  // Show counts from categoryCounts
                  const tabCount = categoryCounts[tab.id] || 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`
                        flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all flex-shrink-0
                        ${isActive
                          ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {/* Show count badge */}
                      {tabCount > 0 && (
                        <span className={`
                          px-1.5 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center
                          ${isActive
                            ? 'bg-teal-600 text-white dark:bg-teal-500'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }
                        `}>
                          {tabCount > 99 ? '99+' : tabCount}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Settings Tab Option (alternative placement) */}
                <Link
                  to="/settings?tab=notifications"
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap border-b-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all flex-shrink-0 sm:hidden"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">{/* Notifications List */}

          {/* Notifications List - Mobile-Optimized Card Layout */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16 sm:py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-teal-600"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-4">
              <BellIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                {activeTab === 'all'
                  ? "You're all caught up! Check back later for updates."
                  : `No ${activeTab} notifications at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {notifications.map((notification) => {
                const actorName = notification.actor_full_name || notification.actor_username || notification.actor_name;
                const actorAvatar = notification.actor_profile_photo || notification.actor_avatar;
                const actorInitial = actorName?.[0]?.toUpperCase() || 'U';
                const actionButtons = typeof notification.action_buttons === 'string'
                  ? JSON.parse(notification.action_buttons)
                  : notification.action_buttons || [];

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all touch-manipulation
                      ${!notification.is_read
                        ? 'bg-teal-50/50 border-teal-200 active:bg-teal-50 dark:bg-teal-900/10 dark:border-teal-800 dark:active:bg-teal-900/20 shadow-sm'
                        : 'bg-white border-gray-200 active:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:active:bg-gray-750'
                      }
                      hover:shadow-md dark:hover:shadow-lg
                    `}
                  >
                    {/* Unread Indicator Strip - Left Edge for Mobile */}
                    {!notification.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-blue-500 rounded-l-xl"></div>
                    )}

                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0">
                      {actorName ? (
                        <div className="relative">
                          {actorAvatar ? (
                            <img
                              src={actorAvatar}
                              alt={actorName}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-sm sm:text-base">
                                {actorInitial}
                              </span>
                            </div>
                          )}
                          {/* Notification Type Icon Badge */}
                          <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm ring-2 ring-white dark:ring-gray-800">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Main Message */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm sm:text-base leading-relaxed text-gray-900 dark:text-gray-100">
                          {actorName && notification.actor_id && (
                            <Link
                              to={`/users/${notification.actor_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              {actorName}
                            </Link>
                          )}
                          {actorName && ' '}
                          <span className={actorName ? 'text-gray-700 dark:text-gray-300' : 'font-semibold'}>
                            {notification.message}
                          </span>
                          {notification.target_title && (
                            <>
                              {' '}
                              <span className="font-bold text-gray-900 dark:text-white break-words">
                                "{notification.target_title}"
                              </span>
                            </>
                          )}
                          {notification.secondary_message && (
                            <>
                              {' '}
                              <span className="text-gray-700 dark:text-gray-300">{notification.secondary_message}</span>
                            </>
                          )}
                        </p>

                        {/* Dismiss Button - Always visible on mobile for better touch */}
                        <button
                          onClick={(e) => handleDismissNotification(e, notification.id)}
                          className="p-1.5 sm:p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                          title="Dismiss notification"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {new Date(notification.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {/* Action Buttons - Full width on mobile */}
                      {actionButtons.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                          {actionButtons.map((button, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="w-full sm:w-auto px-4 py-2 sm:py-1.5 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 active:bg-teal-200 dark:text-teal-300 dark:bg-teal-900/30 dark:hover:bg-teal-900/50 transition-colors touch-manipulation min-h-[44px] sm:min-h-0 flex items-center justify-center"
                            >
                              {button.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* "NEW" Badge for very recent unread notifications */}
                      {!notification.is_read && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-blue-500 rounded-full shadow-sm">
                            NEW
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination - Mobile-Friendly */}
          {!loading && totalNotifications > notificationsPerPage && (
            <div className="mt-6 sm:mt-8">
              {/* Mobile: Load More Button (Better for touch) */}
              <div className="sm:hidden">
                {hasMore && (
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="w-full py-3.5 text-sm font-semibold text-teal-700 bg-teal-50 border-2 border-teal-200 rounded-xl hover:bg-teal-100 active:bg-teal-200 dark:text-teal-300 dark:bg-teal-900/30 dark:border-teal-800 dark:hover:bg-teal-900/50 transition-all touch-manipulation shadow-sm"
                  >
                    Load More Notifications
                  </button>
                )}
                {/* Page indicator */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Page {currentPage} of {totalPages} • {totalNotifications} total
                </p>
              </div>

              {/* Desktop: Traditional Pagination */}
              <div className="hidden sm:flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-750 transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {/* Show first page */}
                  {totalPages > 1 && (
                    <button
                      onClick={() => setCurrentPage(1)}
                      className={`
                        min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-colors
                        ${currentPage === 1
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-750'
                        }
                      `}
                    >
                      1
                    </button>
                  )}

                  {/* Ellipsis if needed */}
                  {currentPage > 3 && totalPages > 5 && (
                    <span className="text-gray-500 dark:text-gray-400 px-2">...</span>
                  )}

                  {/* Middle pages */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 5) return page > 1 && page < totalPages;
                      return page > 1 && page < totalPages && Math.abs(page - currentPage) <= 1;
                    })
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`
                          min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-colors
                          ${currentPage === page
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-750'
                          }
                        `}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Ellipsis if needed */}
                  {currentPage < totalPages - 2 && totalPages > 5 && (
                    <span className="text-gray-500 dark:text-gray-400 px-2">...</span>
                  )}

                  {/* Show last page */}
                  {totalPages > 1 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`
                        min-w-[40px] h-10 px-3 text-sm font-medium rounded-lg transition-colors
                        ${currentPage === totalPages
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-750'
                        }
                      `}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-750 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Notifications;
