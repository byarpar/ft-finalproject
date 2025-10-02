import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  CogIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BookOpenIcon,
  EyeIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const AdminDashboard = () => {
  // Fetch admin dashboard data
  const { data: dashboardData, isLoading, error } = useQuery(
    ['adminDashboard'],
    () => adminAPI.getDashboardStats()
  );

  const stats = dashboardData?.data?.dashboard?.overview || {};

  const StatCard = ({ icon: Icon, title, value, change, changeType = 'positive' }) => (
    <div className="card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center">
        <div className="p-3 bg-dictionary-blue rounded-xl">
          <Icon className="w-7 h-7 text-dictionary-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-semibold text-dictionary-secondary uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-dictionary-primary mt-1">{value}</p>
          {change && (
            <p className={`text-sm font-medium mt-1 ${changeType === 'positive' ? 'text-dictionary-green' : 'text-dictionary-orange'}`}>
              {changeType === 'positive' ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const recentActivities = [
    {
      id: 1,
      type: 'word_added',
      description: 'New word "mountain" added by John Doe',
      time: '2 minutes ago',
      icon: BookOpenIcon
    },
    {
      id: 2,
      type: 'user_registered',
      description: 'New user Sarah Chen registered',
      time: '15 minutes ago',
      icon: UsersIcon
    },
    {
      id: 3,
      type: 'word_edited',
      description: 'Word "river" edited by Admin',
      time: '1 hour ago',
      icon: BookOpenIcon
    },
    {
      id: 4,
      type: 'settings_changed',
      description: 'System settings updated',
      time: '2 hours ago',
      icon: CogIcon
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dictionary-bg-secondary flex items-center justify-center px-4">
        <div className="card p-8 text-center max-w-md w-full">
          <ExclamationTriangleIcon className="w-16 h-16 text-dictionary-orange mx-auto mb-4" />
          <h2 className="text-xl font-bold text-dictionary-primary mb-2">Error Loading Dashboard</h2>
          <p className="text-dictionary-secondary">Failed to load dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dictionary-bg-secondary py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <CogIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Admin Dashboard</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Monitor and manage your dictionary system with comprehensive insights and controls</p>
        </div>

        {/* Stats Grid - All 4 stats in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={BookOpenIcon}
            title="Total Words"
            value={stats.total_words || 0}
            change={stats.words_growth || 0}
          />
          <StatCard
            icon={EyeIcon}
            title="Daily Views"
            value={stats.daily_views || 0}
            change={stats.views_growth || 0}
          />
          <StatCard
            icon={ArrowTrendingUpIcon}
            title="Monthly Searches"
            value={stats.monthly_searches || 0}
            change={stats.searches_growth || 0}
          />
          <StatCard
            icon={BookOpenIcon}
            title="Words w/o Etymology"
            value={stats.words_without_etymology || 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3">
                <CogIcon className="w-5 h-5 text-white" />
              </div>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/admin/words"
                className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3 group-hover:shadow-lg transition-shadow">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">Manage Words</span>
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3 group-hover:shadow-lg transition-shadow">
                  <UsersIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">Manage Users</span>
              </Link>
              <Link
                to="/admin/etymology"
                className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg mr-3 group-hover:shadow-lg transition-shadow">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">Manage Etymology</span>
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg mr-3 group-hover:shadow-lg transition-shadow">
                  <CogIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">System Settings</span>
              </Link>
              <Link
                to="/admin/search"
                className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mr-3 group-hover:shadow-lg transition-shadow">
                  <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-900">Advanced Search</span>
              </Link>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">Database</span>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2" />
                  <span className="text-sm font-medium text-emerald-600">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">Server</span>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2" />
                  <span className="text-sm font-medium text-emerald-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">API</span>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-2" />
                  <span className="text-sm font-medium text-emerald-600">Responsive</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">Backup</span>
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
                  <span className="text-sm font-medium text-amber-600">2 days ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                      <p className="text-xs text-slate-500 flex items-center mt-1">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Words */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
              </div>
              Popular Words This Week
            </h3>
            <div className="space-y-4">
              {['mountain', 'river', 'forest', 'bird', 'flower'].map((word, index) => (
                <div key={word} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <span className="text-sm font-semibold text-slate-900 capitalize">{word}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-slate-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                        style={{ width: `${100 - index * 15}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 min-w-[60px]">{150 - index * 20} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
              Recent User Registrations
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Sarah Chen', email: 'sarah@example.com', time: '2 hours ago' },
                { name: 'John Doe', email: 'john@example.com', time: '5 hours ago' },
                { name: 'Maria Garcia', email: 'maria@example.com', time: '1 day ago' },
                { name: 'David Kim', email: 'david@example.com', time: '2 days ago' }
              ].map((user, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{user.full_name || user.name}</p>
                    <p className="text-xs text-slate-500">{user.email} • {user.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
