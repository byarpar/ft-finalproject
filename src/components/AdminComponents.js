import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EyeIcon,
  FlagIcon,
  ArrowPathIcon,
  TagIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  ServerIcon,
  CircleStackIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  XMarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { admin } from '../services/adminAPI';

/**
 * Consolidated Admin Components
 * Combined smaller admin utility components into a single file
 */

/**
 * StatCard Component
 * Displays statistics with icons and trend indicators
 */
export const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = 'teal',
  alert
}) => {
  const colorClasses = {
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const lightColorClasses = {
    teal: 'bg-teal-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 relative overflow-hidden">
      {/* Background Icon */}
      {Icon && (
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${lightColorClasses[color]} rounded-full opacity-50`}>
          <Icon className="w-16 h-16 text-gray-300 absolute top-4 left-4" />
        </div>
      )}

      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Alert Badge */}
        {alert && (
          <div className="absolute top-0 right-0">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
              {alert}
            </span>
          </div>
        )}

        {/* Value */}
        <div className="mb-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>

        {/* Change Indicator */}
        {change !== undefined && changeType && (
          <div className="flex items-center">
            {changeType === 'increase' ? (
              <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : changeType === 'decrease' ? (
              <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
            ) : (
              <div className="w-4 h-4 mr-1" />
            )}
            <span className={`text-sm font-medium ${changeType === 'increase' ? 'text-green-600' :
              changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
              }`}>
              {Math.abs(change)}%
            </span>
            <span className="text-xs text-gray-500 ml-1">
              {changeType === 'increase' ? 'increase' :
                changeType === 'decrease' ? 'decrease' : 'no change'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const CATEGORY_COLORS = [
  'bg-teal-100 text-teal-800 border-teal-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
];

const timeAgoShort = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/**
 * CategoriesAndTags Component
 * Real data from discussion categories and tags
 */
export const CategoriesAndTags = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');
  const [categorySort, setCategorySort] = useState('discussions');
  const [tagQuery, setTagQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await admin.getCategoriesAndTags();
      setData(res?.data || res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = data?.categories || [];
  const topTags = data?.topTags || [];
  const newTags = data?.newTags || [];

  const sortedCategories = [...categories].sort((a, b) => {
    if (categorySort === 'views') return (b.total_views || 0) - (a.total_views || 0);
    if (categorySort === 'answers') return (b.total_answers || 0) - (a.total_answers || 0);
    if (categorySort === 'recent') {
      return new Date(b.recent_discussion?.created_at || 0).getTime() - new Date(a.recent_discussion?.created_at || 0).getTime();
    }
    return (b.discussion_count || 0) - (a.discussion_count || 0);
  });

  const normalizedQuery = tagQuery.trim().toLowerCase();
  const filteredTopTags = normalizedQuery
    ? topTags.filter((t) => (t.tag || '').toLowerCase().includes(normalizedQuery))
    : topTags;
  const filteredNewTags = normalizedQuery
    ? newTags.filter((t) => (t.tag || '').toLowerCase().includes(normalizedQuery))
    : newTags;

  const totalDiscussions = categories.reduce((sum, c) => sum + (c.discussion_count || 0), 0);
  const totalViews = categories.reduce((sum, c) => sum + (c.total_views || 0), 0);
  const totalAnswers = categories.reduce((sum, c) => sum + (c.total_answers || 0), 0);
  const maxDiscussions = sortedCategories.length ? Math.max(...sortedCategories.map(c => c.discussion_count || 0)) : 1;
  const maxTagCount = filteredTopTags.length ? Math.max(...filteredTopTags.map(t => t.count || 0)) : 1;

  const prettify = (slug) => {
    if (!slug) return 'General';
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 p-6">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-teal-200/40" />
        <div className="absolute -bottom-14 right-24 h-32 w-32 rounded-full bg-emerald-200/40" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="app-label-uppercase text-teal-700">Content Taxonomy</p>
            <h1 className="app-title mt-1 text-2xl text-gray-900">Categories &amp; Tags</h1>
            <p className="app-subtitle mt-1 text-sm text-gray-600">Track content distribution, growth signals, and tag momentum in one place.</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white/90 px-3 py-2 text-sm font-medium text-teal-700 shadow-sm transition-colors hover:bg-white disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {!loading && data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Categories</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{data.totalCategories}</p>
            <p className="mt-1 text-xs text-gray-500">Structured topic groups</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Unique Tags</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{data.totalUniqueTags}</p>
            <p className="mt-1 text-xs text-gray-500">Distinct conversation labels</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Discussions</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalDiscussions.toLocaleString()}</p>
            <p className="mt-1 text-xs text-gray-500">Total active threads</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Answers / Views</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalAnswers.toLocaleString()} / {totalViews.toLocaleString()}</p>
            <p className="mt-1 text-xs text-gray-500">Engagement depth</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="inline-flex w-full gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm sm:w-auto">
        {['categories', 'tags'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${activeTab === tab ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {tab === 'categories' ? (
              <span className="flex items-center gap-1.5"><FolderIcon className="h-4 w-4" />Categories</span>
            ) : (
              <span className="flex items-center gap-1.5"><TagIcon className="h-4 w-4" />Tags</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'categories' && (
        <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Category Performance</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Volume, visibility, and answer activity per category</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5">
                  <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
                  <select
                    value={categorySort}
                    onChange={(e) => setCategorySort(e.target.value)}
                    className="bg-transparent text-sm text-gray-700 focus:outline-none"
                  >
                    <option value="discussions">Sort: Discussions</option>
                    <option value="views">Sort: Views</option>
                    <option value="answers">Sort: Answers</option>
                    <option value="recent">Sort: Recent</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[...Array(6)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded bg-gray-100" />)}
              </div>
            ) : sortedCategories.length ? (
              <div className="divide-y divide-gray-100">
                {sortedCategories.map((cat, i) => {
                  const pct = Math.round(((cat.discussion_count || 0) / maxDiscussions) * 100);
                  const colorClass = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                  return (
                    <div key={cat.category} className="px-5 py-4 hover:bg-gray-50">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${colorClass}`}>
                            <FolderIcon className="h-3 w-3" />
                            {prettify(cat.category)}
                          </span>
                          <span className="text-xs text-gray-400">{timeAgoShort(cat.recent_discussion?.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1"><DocumentTextIcon className="h-3.5 w-3.5" />{(cat.discussion_count || 0).toLocaleString()}</span>
                          <span className="inline-flex items-center gap-1"><EyeIcon className="h-3.5 w-3.5" />{(cat.total_views || 0).toLocaleString()}</span>
                          <span className="inline-flex items-center gap-1"><ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />{(cat.total_answers || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-gray-400">No categories found</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Top Categories Snapshot</h3>
            <p className="mt-0.5 text-xs text-gray-500">Highest thread volume right now</p>
            {loading ? (
              <div className="mt-4 space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />)}
              </div>
            ) : sortedCategories.length ? (
              <div className="mt-4 space-y-2">
                {sortedCategories.slice(0, 5).map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <span className="text-sm font-medium text-gray-800">{i + 1}. {prettify(cat.category)}</span>
                    <span className="text-sm font-semibold text-teal-700">{(cat.discussion_count || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400">No data available</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tags' && (
        <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Tag Frequency</h3>
                <p className="mt-0.5 text-xs text-gray-500">Most used tags across all discussions</p>
              </div>
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  placeholder="Search tag"
                  className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-sm focus:border-teal-400 focus:outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="mt-4 space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
              </div>
            ) : filteredTopTags.length ? (
              <div className="mt-4 space-y-2">
                {filteredTopTags.map((tag, i) => {
                  const pct = Math.round(((tag.count || 0) / maxTagCount) * 100);
                  return (
                    <div key={tag.tag} className="flex items-center gap-3">
                      <span className="w-7 text-right text-xs text-gray-400">{i + 1}</span>
                      <span className="w-36 truncate text-sm font-medium text-gray-800">#{tag.tag}</span>
                      <div className="h-2 flex-1 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-gray-600">{tag.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 py-8 text-center text-sm text-gray-400">No tags found</p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900">Tag Cloud</h3>
              <p className="mt-0.5 text-xs text-gray-500">Quick visual weight by usage ({filteredTopTags.length})</p>
              {loading ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {[...Array(10)].map((_, i) => <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />)}
                </div>
              ) : filteredTopTags.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {filteredTopTags.slice(0, 20).map((tag) => {
                    const pct = Math.round(((tag.count || 0) / maxTagCount) * 100);
                    const intensity = pct > 80 ? 'bg-teal-600 text-white' : pct > 50 ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700';
                    return (
                      <span key={tag.tag} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${intensity}`}>
                        #{tag.tag}
                        <span className="text-xs opacity-80">{tag.count}</span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-400">No tags found</p>
              )}
            </div>

            {filteredNewTags.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
                <h3 className="font-semibold text-emerald-900">New in Last 30 Days</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {filteredNewTags.map((tag) => (
                    <span key={tag.tag} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm font-medium text-emerald-800">
                      #{tag.tag}
                      <span className="text-xs text-emerald-600">{tag.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * AdminSettings Component – real system info + live status
 */
export const AdminSettings = () => {
  const [sysInfo, setSysInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await admin.getSystemInfo();
      setSysInfo(res?.data || res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load system info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const StatusDot = ({ ok }) => (
    <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
  );

  const Row = ({ label, value, mono }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-gray-900 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  );

  const FeaturePill = ({ label, enabled }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${enabled ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
      {enabled
        ? <CheckBadgeIcon className="w-4 h-4 text-green-600" />
        : <XMarkIcon className="w-4 h-4 text-gray-400" />}
      {label}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="app-title text-2xl text-gray-900 flex items-center gap-2">
            <Cog6ToothIcon className="w-6 h-6 text-gray-400" /> Settings
          </h1>
          <p className="app-subtitle text-sm text-gray-500 mt-0.5">System configuration and live health status</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 border border-gray-200 hover:border-teal-400 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-gray-100 rounded-xl" />)}
        </div>
      ) : sysInfo && (
        <>
          {/* Status overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${sysInfo.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                <ServerIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">System</p>
                <p className="text-sm font-bold capitalize text-gray-900">{sysInfo.status}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${sysInfo.database?.status === 'connected' ? 'bg-teal-500' : 'bg-red-500'}`}>
                <CircleStackIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Database</p>
                <p className="text-sm font-bold text-gray-900">{sysInfo.database?.responseMs}ms</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500">
                <CpuChipIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Memory</p>
                <p className="text-sm font-bold text-gray-900">{sysInfo.memory?.pct}%</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Uptime</p>
                <p className="text-sm font-bold text-gray-900">{sysInfo.uptime}</p>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Database info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <CircleStackIcon className="w-4 h-4 text-teal-500" />
                <h3 className="font-semibold text-gray-900">Database</h3>
                <StatusDot ok={sysInfo.database?.status === 'connected'} />
              </div>
              <div className="px-5 py-3">
                <Row label="Host" value={sysInfo.database?.host} mono />
                <Row label="Database" value={sysInfo.database?.name} mono />
                <Row label="Status" value={sysInfo.database?.status} />
                <Row label="Response" value={`${sysInfo.database?.responseMs} ms`} />
              </div>
            </div>

            {/* Server info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ServerIcon className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-gray-900">Server</h3>
                <StatusDot ok />
              </div>
              <div className="px-5 py-3">
                <Row label="Environment" value={sysInfo.server?.env} />
                <Row label="Node.js" value={sysInfo.server?.nodeVersion} mono />
                <Row label="Port" value={sysInfo.server?.port} mono />
                <Row label="Client URL" value={sysInfo.server?.clientUrl} mono />
              </div>
            </div>

            {/* Memory */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <CpuChipIcon className="w-4 h-4 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Memory</h3>
              </div>
              <div className="px-5 py-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Heap Used</span>
                  <span className="font-medium text-gray-900">{sysInfo.memory?.usedMb} MB / {sysInfo.memory?.totalMb} MB</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${sysInfo.memory?.pct > 80 ? 'bg-red-500' : sysInfo.memory?.pct > 60 ? 'bg-yellow-500' : 'bg-teal-500'
                      }`}
                    style={{ width: `${sysInfo.memory?.pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{sysInfo.memory?.pct}% utilized</p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-orange-500" />
                <h3 className="font-semibold text-gray-900">Features &amp; Config</h3>
              </div>
              <div className="px-5 py-4 space-y-2">
                <FeaturePill label="Email / SMTP" enabled={sysInfo.features?.emailEnabled} />
                <FeaturePill label="Google OAuth" enabled={sysInfo.features?.googleAuthEnabled} />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-gray-500">JWT Token Expire</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{sysInfo.features?.jwtExpire}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Max Upload Size</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{sysInfo.features?.maxFileSizeMb} MB</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * MiniBarChart – renders a simple SVG bar chart for time-series data
 */
const MiniBarChart = ({ data, valueKey, colorClass = 'fill-teal-500', height = 120 }) => {
  if (!data || data.length === 0) return <div className="h-28 flex items-center justify-center text-gray-400 text-sm">No data</div>;
  const values = data.map(d => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${data.length * 28} ${height}`} className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const barH = Math.max(2, (values[i] / max) * (height - 20));
          return (
            <g key={i}>
              <rect
                x={i * 28 + 4}
                y={height - 16 - barH}
                width={20}
                height={barH}
                rx={3}
                className={colorClass}
              />
              {data.length <= 14 && (
                <text x={i * 28 + 14} y={height - 2} textAnchor="middle" fontSize="7" fill="#9ca3af">
                  {d.day ? d.day.split(' ')[1] : ''}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * CategoryBar – horizontal percentage bar for category breakdown
 */
const CategoryBar = ({ name, count, max }) => {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 capitalize truncate max-w-[60%]">{name || 'Uncategorized'}</span>
        <span className="text-gray-500">{count} ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-teal-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/**
 * SummaryCard – stat card with trend indicator
 */
const SummaryCard = ({ title, total, sub, pct, icon: Icon, color }) => {
  const colors = {
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-500', text: 'text-teal-600' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-600' },
    red: { bg: 'bg-red-50', icon: 'bg-red-500', text: 'text-red-600' },
  };
  const c = colors[color] || colors.teal;
  const up = pct >= 0;
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm`}>
      <div className={`p-3 rounded-lg ${c.icon} shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{Number(total || 0).toLocaleString()}</p>
        {sub !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {up ? <ArrowUpIcon className="w-3 h-3 text-green-500" /> : <ArrowDownIcon className="w-3 h-3 text-red-500" />}
            <span className={`text-xs font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(pct)}%</span>
            <span className="text-xs text-gray-400">vs prev period · +{Number(sub || 0).toLocaleString()} new</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ReportsAnalytics Component
 * Admin analytics dashboard powered by real database data
 */
export const ReportsAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await admin.getAnalytics(timeRange);
      setData(res?.data || res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const s = data?.summary || {};
  const maxCategory = data?.topCategories?.length
    ? Math.max(...data.topCategories.map(c => c.count))
    : 1;

  const reportStatusColor = { pending: 'bg-yellow-100 text-yellow-800', resolved: 'bg-green-100 text-green-800', dismissed: 'bg-gray-100 text-gray-700' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h2>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-teal-600 hover:border-teal-400 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <SummaryCard title="Total Users" total={s.totalUsers} sub={s.newUsers} pct={s.newUsersPct} icon={UsersIcon} color="teal" />
          <SummaryCard title="Total Discussions" total={s.totalDiscussions} sub={s.newDiscussions} pct={s.newDiscussionsPct} icon={DocumentTextIcon} color="blue" />
          <SummaryCard title="Total Answers" total={s.totalAnswers} sub={s.newAnswers} pct={s.newAnswersPct} icon={ChatBubbleLeftRightIcon} color="purple" />
          <SummaryCard title="Page Views" total={s.totalViews} icon={EyeIcon} color="orange" />
          <SummaryCard title="Pending Reports" total={s.pendingReports} icon={FlagIcon} color="red" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">User Registrations</h3>
          {loading ? (
            <div className="h-28 bg-gray-100 rounded animate-pulse" />
          ) : (
            <MiniBarChart data={data?.userGrowth || []} valueKey="count" colorClass="fill-teal-500" />
          )}
        </div>

        {/* Discussion Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Discussion Activity</h3>
          {loading ? (
            <div className="h-28 bg-gray-100 rounded animate-pulse" />
          ) : (
            <MiniBarChart data={data?.activity || []} valueKey="discussions" colorClass="fill-blue-500" />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Discussions by Category</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : data?.topCategories?.length ? (
            <div className="space-y-3">
              {data.topCategories.map((cat, i) => (
                <CategoryBar key={i} name={cat.category} count={cat.count} max={maxCategory} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No category data</p>
          )}
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Top Contributors</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : data?.topContributors?.length ? (
            <div className="divide-y divide-gray-100">
              {data.topContributors.map((user, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {user.profile_photo_url ? (
                      <img src={user.profile_photo_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <UsersIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800 truncate">{user.username}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 shrink-0">
                    <span className="text-blue-600 font-medium">{user.discussions}d</span>
                    <span className="text-purple-600 font-medium">{user.answers}a</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No contributor data</p>
          )}
        </div>
      </div>

      {/* Reports Summary */}
      {!loading && data?.reportsSummary?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Reports by Status</h3>
          <div className="flex flex-wrap gap-3">
            {data.reportsSummary.map((r, i) => (
              <div key={i} className={`px-4 py-2 rounded-lg text-sm font-medium ${reportStatusColor[r.status] || 'bg-gray-100 text-gray-700'}`}>
                <span className="capitalize">{r.status}</span>
                <span className="ml-2 font-bold">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Default exports for backward compatibility
const AdminComponents = {
  StatCard,
  CategoriesAndTags,
  AdminSettings,
  ReportsAnalytics
};

export default AdminComponents;