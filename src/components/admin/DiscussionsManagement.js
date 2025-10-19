import React, { useState, useEffect } from 'react';
import Pagination from '../UI/Pagination';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  LinkIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  CalendarIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import admin from '../../services/adminAPI';
import { discussionsAPI, tagsAPI } from '../../services/api';

const DiscussionsManagement = () => {
  const [activeTab, setActiveTab] = useState('all-threads');
  const [threads, setThreads] = useState([]);
  const [reports, setReports] = useState([]);
  const [moderationHistory, setModerationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedThreads, setSelectedThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    tags: [],
    dateRange: 'all',
  });
  const [reportFilters, setReportFilters] = useState({
    status: 'all',
    type: 'all',
    reportedUser: '',
  });
  const [moderationFilters, setModerationFilters] = useState({
    search: '',
    action: 'all',
    timeRange: 'all',
  });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    newThreads24h: 0,
    newThreads7d: 0,
    mostActiveThread: null,
  });
  const [searchDebounce, setSearchDebounce] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Fetch categories and tags on component mount
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await discussionsAPI.getCategories();
      if (response.success && response.data && response.data.categories) {
        // Filter out the "All Questions" category and any invalid entries
        const categoriesList = response.data.categories
          .filter(cat => cat && cat.id && cat.id !== 'all' && cat.name)
          .map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            count: cat.count || 0
          }));
        setCategories(categoriesList);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use default categories from your backend if API fails
      setCategories([
        { id: 'general', name: 'General Discussion', icon: 'ChatBubbleLeftRightIcon', color: '#9CA3AF' },
        { id: 'language-learning', name: 'Language Learning', icon: 'AcademicCapIcon', color: '#60A5FA' },
        { id: 'grammar', name: 'Grammar', icon: 'BookOpenIcon', color: '#34D399' },
        { id: 'vocabulary', name: 'Vocabulary', icon: 'TagIcon', color: '#FBBF24' },
        { id: 'culture', name: 'Culture & Context', icon: 'UserGroupIcon', color: '#A78BFA' },
        { id: 'pronunciation', name: 'Pronunciation', icon: 'SpeakerWaveIcon', color: '#F87171' },
        { id: 'translation', name: 'Translation', icon: 'LanguageIcon', color: '#F472B6' },
        { id: 'etymology', name: 'Etymology', icon: 'BookmarkIcon', color: '#10B981' },
        { id: 'other', name: 'Other', icon: 'EllipsisHorizontalIcon', color: '#6B7280' },
      ]);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagsAPI.getAllTags();
      if (response.success && response.tags) {
        // Filter out any invalid tag entries
        const validTags = response.tags.filter(tag => tag && (tag.name || tag.tag_name));
        setTags(validTags);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    }
  };

  // Fetch data when filters or pagination change
  useEffect(() => {
    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  // Debounce search query
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }));
      } else {
        fetchThreads();
      }
    }, 500);

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportFilters]);

  useEffect(() => {
    fetchModerationHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moderationFilters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        sortBy: 'recent',
      };

      // Add status filter
      if (filters.status !== 'all') {
        if (filters.status === 'unanswered') {
          params.filter = 'unanswered';
        } else if (filters.status === 'solved') {
          params.filter = 'solved';
        }
      }

      const response = await admin.getAllDiscussions(params);

      console.log('Discussions response:', response);

      // Handle both new format {success, data: {discussions, pagination}} 
      // and old format {discussions, totalCount, currentPage}
      const discussions = response.success
        ? response.data?.discussions
        : response.discussions;

      if (discussions && Array.isArray(discussions)) {
        // Transform data to match component expectations
        const transformedThreads = discussions
          .filter(discussion => discussion && discussion.id)
          .map(discussion => ({
            id: discussion.id,
            title: discussion.title || 'Untitled',
            author: {
              id: discussion.author_id,
              name: discussion.author_name || 'Unknown',
              avatar: null,
            },
            category: typeof discussion.category === 'object' && discussion.category !== null
              ? discussion.category.name
              : discussion.category || 'general',
            tags: Array.isArray(discussion.tags) ? discussion.tags : [],
            replies: discussion.answers_count || 0,
            lastActivity: {
              date: new Date(discussion.last_activity || discussion.created_at).toLocaleDateString(),
              user: discussion.author_name || 'Unknown',
            },
            status: discussion.is_solved ? 'solved' : (discussion.is_locked ? 'locked' : 'active'),
            isLocked: discussion.is_locked || false,
            isHidden: false, // Database doesn't have this field yet
            isArchived: false, // Database doesn't have this field yet
            isPinned: discussion.is_pinned || false,
            viewsCount: discussion.views_count || 0,
            voteCount: discussion.vote_count || 0,
            createdAt: discussion.created_at,
          }));

        setThreads(transformedThreads);

        // Update pagination - handle both response formats
        const paginationData = response.success
          ? response.data?.pagination
          : { total: response.totalCount, totalPages: response.totalPages, page: response.currentPage };

        if (paginationData) {
          setPagination(prev => ({
            ...prev,
            total: paginationData.total || 0,
            totalPages: paginationData.totalPages || Math.ceil((paginationData.total || 0) / prev.limit),
          }));
        }
      } else {
        console.warn('No discussions data in response:', response);
        setThreads([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      console.error('Error details:', error.response?.data || error.message);
      setThreads([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
      // Show error notification if needed
      alert('Failed to fetch discussions. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch recent discussions count
      const [recent24h, recent7d] = await Promise.all([
        admin.getAllDiscussions({
          dateRange: 'today',
          limit: 1,
        }),
        admin.getAllDiscussions({
          dateRange: 'week',
          limit: 1,
        }),
      ]);

      setStats({
        newThreads24h: recent24h.data?.pagination?.total || 0,
        newThreads7d: recent7d.data?.pagination?.total || 0,
        mostActiveThread: 'Grammar Q&A', // This would need a specific endpoint
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const params = {
        page: 1,
        limit: 50,
        status: reportFilters.status !== 'all' ? reportFilters.status : undefined,
        type: reportFilters.type !== 'all' ? reportFilters.type : undefined,
      };

      const response = await admin.getReports(params);

      if (response.success && response.data && response.data.reports) {
        const transformedReports = response.data.reports
          .filter(report => report && report.id)
          .map(report => ({
            id: report.id,
            content: {
              id: report.discussion_id,
              type: 'discussion',
              title: report.discussion_title || 'Untitled',
              excerpt: report.discussion_content?.substring(0, 100) || '',
            },
            reporter: report.reporter ? {
              id: report.reporter.id,
              name: report.reporter.name || 'Unknown',
              avatar: null,
            } : { id: null, name: 'Unknown', avatar: null },
            discussion_author: report.discussion_author ? {
              id: report.discussion_author.id,
              name: report.discussion_author.name || 'Unknown',
            } : { id: null, name: 'Unknown' },
            reason: report.reason || 'unspecified',
            description: report.description || '',
            status: report.status || 'pending',
            createdAt: report.created_at,
            resolvedBy: report.resolved_by,
            resolvedAt: report.resolved_at,
          }));

        setReports(transformedReports);
        setPendingReportsCount(transformedReports.filter(r => r.status === 'pending').length);
      } else {
        setReports([]);
        setPendingReportsCount(0);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
      setPendingReportsCount(0);
    }
  };

  const fetchModerationHistory = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
      };

      // Add filters to params
      if (moderationFilters.search) {
        params.search = moderationFilters.search;
      }
      if (moderationFilters.action && moderationFilters.action !== 'all') {
        params.action = moderationFilters.action;
      }
      if (moderationFilters.timeRange && moderationFilters.timeRange !== 'all') {
        params.timeRange = moderationFilters.timeRange;
      }

      const response = await admin.getModerationHistory(params);
      console.log('Moderation history response:', response);

      if (response.success && response.data && response.data.history) {
        console.log('Raw history data:', response.data.history);

        const transformedHistory = response.data.history
          .filter(item => item && item.id)
          .map(item => ({
            id: item.id,
            action: item.action || 'Unknown',
            moderator: item.moderator ? {
              id: item.moderator.id,
              name: item.moderator.name || 'System',
              avatar: null,
            } : { id: null, name: 'System', avatar: null },
            target: {
              type: item.resource_type || 'record',
              id: item.resource_id,
              title: item.resource_type ? `${item.resource_type} #${item.resource_id || 'N/A'}` : `Record #${item.resource_id || 'N/A'}`,
            },
            timestamp: item.created_at || new Date().toISOString(),
            reason: item.metadata?.reason || '—',
            details: item.metadata || {},
          }));

        console.log('Transformed history:', transformedHistory);
        setModerationHistory(transformedHistory);
      } else {
        console.warn('No history data in response:', response);
        setModerationHistory([]);
      }
    } catch (error) {
      console.error('Error fetching moderation history:', error);
      setModerationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = (threadId) => {
    setSelectedThreads(prev => {
      if (prev.includes(threadId)) {
        return prev.filter(id => id !== threadId);
      }
      return [...prev, threadId];
    });
  };

  const handleSelectAllThreads = () => {
    if (selectedThreads.length === threads.length) {
      setSelectedThreads([]);
    } else {
      setSelectedThreads(threads.map(t => t.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedThreads.length === 0) {
      alert('Please select at least one discussion');
      return;
    }

    const confirmMessage = action === 'delete'
      ? `Are you sure you want to delete ${selectedThreads.length} discussions? This action cannot be undone.`
      : `Apply ${action} to ${selectedThreads.length} selected discussions?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await admin.bulkDiscussionActions(action, selectedThreads);

      if (response.success) {
        // Show success message
        alert(response.data.message);

        // Refresh the threads list
        await fetchThreads();

        // Clear selection
        setSelectedThreads([]);
        setShowBulkActions(false);
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert(`Failed to apply ${action}. Please try again.`);
    }
  };

  const handleThreadAction = async (threadId, action) => {
    try {
      let response;

      switch (action) {
        case 'lock':
          response = await admin.lockDiscussion(threadId);
          break;
        case 'unlock':
          response = await admin.unlockDiscussion(threadId);
          break;
        case 'pin':
          response = await admin.pinDiscussion(threadId);
          break;
        case 'unpin':
          response = await admin.unpinDiscussion(threadId);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
            response = await admin.deleteDiscussion(threadId);
          } else {
            return;
          }
          break;
        case 'edit':
          // Navigate to edit page
          window.location.href = `/admin/discussions/${threadId}/edit`;
          return;
        default:
          console.warn('Unknown action:', action);
          return;
      }

      if (response?.success) {
        // Refresh the threads list
        await fetchThreads();

        // Show success notification
        alert(`Successfully ${action}ed discussion`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on thread ${threadId}:`, error);
      alert(`Failed to ${action} discussion. Please try again.`);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      let response;

      switch (action) {
        case 'review':
          // Open report review modal/page
          // TODO: Implement report review interface
          alert(`Review report ${reportId} - Interface to be implemented`);
          break;
        case 'dismiss':
          response = await admin.dismissReport(reportId);
          break;
        case 'resolve':
          response = await admin.resolveReport(reportId, { action: 'resolved' });
          break;
        default:
          console.warn('Unknown action:', action);
          return;
      }

      if (response?.success || action === 'review') {
        // Refresh reports
        await fetchReports();
      }
    } catch (error) {
      console.error(`Error performing ${action} on report ${reportId}:`, error);
      alert(`Failed to ${action} report. Please try again.`);
    }
  };

  const getStatusBadge = (thread) => {
    if (thread.isHidden) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Hidden</span>;
    }
    if (thread.isLocked) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Locked</span>;
    }
    if (thread.isArchived) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Archived</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
  };

  const getReportStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'red', icon: ExclamationCircleIcon, label: 'New' },
      'in-review': { color: 'yellow', icon: ClockIcon, label: 'In Review' },
      resolved: { color: 'green', icon: CheckCircleIcon, label: 'Resolved' },
    };
    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800${config.color}-900/30${config.color}-400`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    setShowBulkActions(selectedThreads.length > 0);
  }, [selectedThreads]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Discussions Management</h1>
        <p className="mt-2 text-gray-600">
          Monitor and moderate discussions, resolve user reports, and maintain healthy community interactions.
        </p>
      </div>

      {/* Top-Level Moderation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending Reports - Primary Call to Action */}
        <button
          onClick={() => setActiveTab('reported-content')}
          className="relative p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-white group"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldExclamationIcon className="w-8 h-8" />
                <span className="text-4xl font-bold">{pendingReportsCount}</span>
              </div>
              <p className="mt-2 text-sm font-medium opacity-90">Pending Reports</p>
            </div>
            <ExclamationCircleIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div className="mt-4 text-xs opacity-75">Click to review</div>
        </button>

        {/* New Threads (24h) */}
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-teal-600" />
                <span className="text-3xl font-bold text-gray-900">{stats.newThreads24h}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">New Threads (24h)</p>
            </div>
          </div>
        </div>

        {/* New Threads (7d) */}
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">{stats.newThreads7d}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">New Threads (7d)</p>
            </div>
          </div>
        </div>

        {/* Most Active Thread */}
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                <span className="text-lg font-semibold text-gray-900">{stats.mostActiveThread || 'N/A'}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">Most Active Thread</p>
              <p className="text-xs text-gray-500 mt-1">This week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('all-threads')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'all-threads'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300:text-gray-300'
              }`}
          >
            All Threads
          </button>
          <button
            onClick={() => setActiveTab('reported-content')}
            className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reported-content'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300:text-gray-300'
              }`}
          >
            Reported Content
            {pendingReportsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                {pendingReportsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('moderation-history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'moderation-history'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300:text-gray-300'
              }`}
          >
            Moderation History
          </button>
          <button
            onClick={() => setActiveTab('categories-tags')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'categories-tags'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300:text-gray-300'
              }`}
          >
            Categories & Tags
          </button>
        </nav>
      </div>

      {/* All Threads Tab */}
      {activeTab === 'all-threads' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="xl:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by thread title, content, or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter by Category */}
              <div>
                <select
                  value={filters.category}
                  onChange={(e) => {
                    setFilters({ ...filters, category: e.target.value });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat && cat.name).map((cat) => (
                    <option key={cat.id || cat.name} value={cat.id || cat.name.toLowerCase()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    setFilters({ ...filters, status: e.target.value });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="locked">Locked</option>
                  <option value="solved">Solved</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <select
                  value={filters.dateRange}
                  onChange={(e) => {
                    setFilters({ ...filters, dateRange: e.target.value });
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                  <PlusIcon className="w-5 h-5 mr-1" />
                  <span className="hidden xl:inline">New</span>
                </button>
                <button className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <ArrowDownTrayIcon className="w-5 h-5 mr-1" />
                  <span className="hidden xl:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-teal-900">
                  {selectedThreads.length} thread{selectedThreads.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkAction(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 border border-teal-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Action...</option>
                    <option value="change-category">Change Category</option>
                    <option value="add-tag">Add Tag</option>
                    <option value="lock">Lock Selected</option>
                    <option value="hide">Hide Selected</option>
                    <option value="archive">Archive Selected</option>
                    <option value="delete">Delete Selected</option>
                  </select>
                  <button
                    onClick={() => setSelectedThreads([])}
                    className="px-4 py-2 text-sm text-teal-700 hover:text-teal-900:text-teal-100"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Discussion Thread List Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedThreads.length === threads.length && threads.length > 0}
                        onChange={handleSelectAllThreads}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700:text-gray-300">
                      Thread Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700:text-gray-300">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700:text-gray-300">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700:text-gray-300">
                      Replies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700:text-gray-300">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        Loading threads...
                      </td>
                    </tr>
                  ) : threads.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No threads found
                      </td>
                    </tr>
                  ) : (
                    threads.filter(thread => thread && thread.id).map((thread) => (
                      <tr key={thread.id} className="hover:bg-gray-50:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedThreads.includes(thread.id)}
                            onChange={() => handleSelectThread(thread.id)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <button className="text-sm font-medium text-gray-900 hover:text-teal-600:text-teal-400 text-left">
                                  {thread.title || 'Untitled'}
                                </button>
                                {getStatusBadge(thread)}
                              </div>
                              {thread.tags && thread.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {thread.tags.filter(tag => tag).map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserCircleIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="text-sm text-gray-900">{thread.author?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {thread.category || 'General'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {thread.replies || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900">{thread.lastActivity?.date || 'N/A'}</div>
                            <div className="text-gray-500">{thread.lastActivity?.user || 'Unknown'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleThreadAction(thread.id, 'edit')}
                              className="p-2 text-gray-600 hover:text-teal-600:text-teal-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                              title="Edit Thread"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => window.open(`/discussions/${thread.id}`, '_blank')}
                              className="p-2 text-gray-600 hover:text-blue-600:text-blue-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                              title="View on Site"
                            >
                              <LinkIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleThreadAction(thread.id, thread.isLocked ? 'unlock' : 'lock')}
                              className="p-2 text-gray-600 hover:text-yellow-600:text-yellow-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                              title={thread.isLocked ? 'Unlock Thread' : 'Lock Thread'}
                            >
                              {thread.isLocked ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleThreadAction(thread.id, thread.isHidden ? 'unhide' : 'hide')}
                              className="p-2 text-gray-600 hover:text-purple-600:text-purple-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                              title={thread.isHidden ? 'Unhide Thread' : 'Hide Thread'}
                            >
                              {thread.isHidden ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleThreadAction(thread.id, 'archive')}
                              className="p-2 text-gray-600 hover:text-orange-600:text-orange-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                              title="Archive Thread"
                            >
                              <ArchiveBoxIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to permanently delete this thread and all its replies?')) {
                                  handleThreadAction(thread.id, 'delete');
                                }
                              }}
                              className="p-2 text-gray-600 hover:text-red-600:text-red-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                              title="Delete Thread"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reported Content Tab */}
      {activeTab === 'reported-content' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={reportFilters.status}
                onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="in-review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={reportFilters.type}
                onChange={(e) => setReportFilters({ ...reportFilters, type: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="thread">Thread</option>
                <option value="reply">Reply</option>
              </select>

              <input
                type="text"
                placeholder="Filter by reported user..."
                value={reportFilters.reportedUser}
                onChange={(e) => setReportFilters({ ...reportFilters, reportedUser: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Reports Queue Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Filed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium">No pending reports</p>
                        <p className="text-sm mt-1">Great job keeping the community safe!</p>
                      </td>
                    </tr>
                  ) : (
                    reports.filter(report => report && report.id).map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700 uppercase">
                                {report.contentType}
                              </span>
                              <button className="text-sm font-medium text-teal-600 hover:underline">
                                {report.threadTitle}
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              "{report.contentSnippet}"
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                            {report.reason}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-gray-900 hover:text-teal-600:text-teal-400">
                            {report.reporter?.name || report.reportedBy?.name || 'Unknown'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-gray-900 hover:text-teal-600:text-teal-400 font-medium">
                            {report.discussion_author?.name || report.reportedUser?.name || 'Unknown'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {report.dateFiled}
                        </td>
                        <td className="px-6 py-4">
                          {getReportStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleReportAction(report.id, 'review')}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'dismiss')}
                              className="p-2 text-gray-600 hover:text-red-600:text-red-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                              title="Dismiss Report"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Moderation History Tab */}
      {activeTab === 'moderation-history' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search by admin, user, or action..."
                value={moderationFilters.search}
                onChange={(e) => setModerationFilters({ ...moderationFilters, search: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={moderationFilters.action}
                onChange={(e) => setModerationFilters({ ...moderationFilters, action: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Actions</option>
                <option value="hide">Thread Hidden</option>
                <option value="lock">Thread Locked</option>
                <option value="delete">Thread Deleted</option>
                <option value="warn">User Warned</option>
                <option value="suspend">User Suspended</option>
                <option value="ban">User Banned</option>
              </select>
              <select
                value={moderationFilters.timeRange}
                onChange={(e) => setModerationFilters({ ...moderationFilters, timeRange: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* History Log */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                          <span className="ml-3">Loading moderation history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : moderationHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No moderation history found
                      </td>
                    </tr>
                  ) : (
                    moderationHistory.filter(log => log && log.id).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(log.timestamp || log.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {log.moderator?.name || log.admin || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {log.action || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-sm text-teal-600 hover:underline">
                            {log.target?.title || log.target?.name || `Item #${log.target?.id}` || '—'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.reason || log.details?.reason || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Tags Tab */}
      {activeTab === 'categories-tags' && (
        <div className="space-y-6">
          {/* Discussion Categories */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Discussion Categories</h2>
              <button className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Category
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories found
              </div>
            ) : (
              <div className="space-y-3">
                {categories.filter(category => category && category.name).map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">
                          {category.count || 0} thread{category.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 text-gray-600 hover:text-teal-600:text-teal-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-red-600:text-red-400 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discussion Tags */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Discussion Tags</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {tags.length} tag{tags.length !== 1 ? 's' : ''} in use
                </p>
              </div>
              <button className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Tag
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading tags...
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tags found. Tags are created automatically when used in discussions.
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {tags.filter(tag => tag && (tag.name || tag.tag_name)).map((tag, idx) => (
                  <div key={idx} className="group flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-teal-100:bg-teal-900/30 transition-colors">
                    <TagIcon className="w-4 h-4 text-gray-600 group-hover:text-teal-600:text-teal-400" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700:text-teal-300">
                      {tag.name || tag.tag_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({tag.count || 0})
                    </span>
                    <button
                      className="ml-2 p-1 text-gray-400 hover:text-red-600:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove tag"
                      onClick={() => {
                        if (window.confirm(`Remove tag "${tag.name}"? This will remove it from all discussions.`)) {
                          // TODO: Implement tag removal
                          alert('Tag removal functionality to be implemented');
                        }
                      }}
                    >
                      <XCircleIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionsManagement;
