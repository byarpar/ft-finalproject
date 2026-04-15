import React, { useState, useEffect, useCallback } from 'react';
import adminAPI from '../../services/adminAPI';
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EyeIcon,
  FlagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

// --- Helpers ---
const fmt = (n) => Number(n || 0).toLocaleString();

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// --- Mini sparkline (7 bars) ---
const Sparkline = ({ data, valueKey, color = '#14b8a6' }) => {
  if (!data?.length) return null;
  const vals = data.map(d => Number(d[valueKey]) || 0);
  const max = Math.max(...vals, 1);
  return (
    <svg viewBox={`0 0 ${data.length * 10} 24`} className="w-full h-6">
      {vals.map((v, i) => {
        const h = Math.max(2, (v / max) * 22);
        return <rect key={i} x={i * 10 + 1} y={24 - h} width={8} height={h} rx={2} fill={color} fillOpacity={0.7} />;
      })}
    </svg>
  );
};

// --- Stat card ---
const Tile = ({ title, value, sub, subLabel, up, icon: Icon, iconBg, sparkData, sparkKey, sparkColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(value)}</p>
      </div>
      <div className={`p-2.5 rounded-lg ${iconBg}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    {sparkData && <Sparkline data={sparkData} valueKey={sparkKey} color={sparkColor} />}
    {sub !== undefined && (
      <div className="flex items-center gap-1">
        {up ? <ArrowUpIcon className="w-3 h-3 text-green-500" /> : <ArrowDownIcon className="w-3 h-3 text-red-500" />}
        <span className={`text-xs font-semibold ${up ? 'text-green-600' : 'text-red-600'}`}>+{fmt(sub)}</span>
        <span className="text-xs text-gray-400">{subLabel}</span>
      </div>
    )}
  </div>
);

// --- Avatar ---
const Avatar = ({ url, name }) => {
  const initials = (name || '?').charAt(0).toUpperCase();
  return url
    ? <img src={url} alt={name} className="avatar-unified" />
    : <div className="avatar-unified bg-teal-500 text-white text-xs font-bold">{initials}</div>;
};

// --- Main Component ---
const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAPI.getDashboardStats();
      const dashboard = res?.data?.dashboard || res?.dashboard || null;
      setData(dashboard);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const o = data?.overview || {};
  const weekly = data?.weeklyActivity || [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <p className="font-medium text-red-800">Failed to load dashboard</p>
          <p className="text-sm text-red-600 mt-0.5">{error}</p>
        </div>
        <button onClick={load} className="ml-auto flex items-center gap-1 text-sm text-red-700 hover:text-red-900">
          <ArrowPathIcon className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome + refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="app-title text-2xl text-gray-900">Dashboard</h1>
          <p className="app-subtitle text-sm text-gray-500 mt-0.5">Live overview of your platform</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 border border-gray-200 hover:border-teal-400 rounded-lg px-3 py-1.5 transition-colors">
          <ArrowPathIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Primary Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile title="Total Users" value={o.total_users} sub={o.new_users_24h} subLabel="new today" up iconBg="bg-teal-500" icon={UsersIcon} sparkData={weekly} sparkKey="new_users" sparkColor="#14b8a6" />
        <Tile title="Total Discussions" value={o.total_discussions} sub={o.new_discussions_24h} subLabel="new today" up iconBg="bg-blue-500" icon={DocumentTextIcon} sparkData={weekly} sparkKey="new_discussions" sparkColor="#3b82f6" />
        <Tile title="Total Answers" value={o.total_answers} sub={o.new_answers_24h} subLabel="new today" up iconBg="bg-purple-500" icon={ChatBubbleLeftRightIcon} />
        <Tile title="Page Views" value={o.total_views} iconBg="bg-orange-500" icon={EyeIcon} />
      </div>

      {/* Secondary Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile title="Active Users" value={o.active_users} iconBg="bg-green-500" icon={CheckCircleIcon} />
        <Tile title="Inactive Users" value={o.inactive_users} iconBg="bg-gray-400" icon={XCircleIcon} />
        <Tile title="Pending Reports" value={o.pending_reports} iconBg="bg-red-500" icon={FlagIcon} />
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-center items-center gap-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Engagement Rate</p>
          <p className="text-2xl font-bold text-teal-600">
            {o.total_users > 0 ? Math.round((o.active_users / o.total_users) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-400">active / total users</p>
        </div>
      </div>

      {/* Recent Users + Recent Discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Registrations</h3>
            <span className="text-xs text-gray-400">Last 5 users</span>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recentUsers?.length ? data.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <Avatar url={u.profile_photo_url} name={u.username} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.username}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.role}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(u.created_at)}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-8">No recent registrations</p>
            )}
          </div>
        </div>

        {/* Recent Discussions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Discussions</h3>
            <span className="text-xs text-gray-400">Last 5 posts</span>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recentDiscussions?.length ? data.recentDiscussions.map((d) => (
              <div key={d.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <Avatar url={d.author_avatar} name={d.author} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{d.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by <span className="text-gray-600">{d.author}</span> · {timeAgo(d.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                  <span className="flex items-center gap-0.5"><EyeIcon className="w-3 h-3" />{d.views_count}</span>
                  <span className="flex items-center gap-0.5"><ChatBubbleLeftRightIcon className="w-3 h-3" />{d.answers_count}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-8">No recent discussions</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Reports */}
      {data?.recentReports?.length > 0 && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 flex items-center gap-2">
            <FlagIcon className="w-4 h-4 text-red-500" />
            <h3 className="font-semibold text-gray-900">Pending Reports</h3>
            <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{o.pending_reports} pending</span>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentReports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.discussion_title || 'Deleted discussion'}</p>
                  <p className="text-xs text-gray-400">
                    Reported by <span className="text-gray-600">{r.reporter || 'Unknown'}</span> · {r.reason} · {timeAgo(r.created_at)}
                  </p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full shrink-0 capitalize">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Database', status: 'Online' },
            { label: 'API Server', status: 'Operational' },
            { label: 'Auth Service', status: 'Running' },
          ].map((svc) => (
            <div key={svc.label} className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-lg border border-green-100">
              <span className="text-sm text-gray-700">{svc.label}</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
