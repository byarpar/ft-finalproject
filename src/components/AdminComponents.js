import React, { useState } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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

/**
 * CategoriesAndTags Component
 * Simple placeholder for categories and tags management
 */
export const CategoriesAndTags = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Categories & Tags
        </h1>
        <p className="text-gray-600">
          Manage content categories and tags
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-gray-400">#</span>
          </div>
          <p className="text-gray-600">
            Categories and tags management coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * AdminSettings Component
 * Basic admin settings interface
 */
export const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Configure global site settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              General Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                defaultValue="Lisu Dictionary"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                rows="3"
                defaultValue="A comprehensive Lisu language dictionary and learning platform"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="maintenance"
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="maintenance" className="ml-2 text-sm text-gray-700">
                Maintenance Mode
              </label>
            </div>
            <button className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
              Save Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Security Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Security configuration options coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ReportsAnalytics Component
 * Admin analytics and reporting dashboard
 */
export const ReportsAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7days');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-900">12,543</p>
          <span className="text-sm text-green-600">+12% from last period</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Active Discussions</h3>
          <p className="text-2xl font-bold text-gray-900">856</p>
          <span className="text-sm text-green-600">+8% from last period</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Comments</h3>
          <p className="text-2xl font-bold text-gray-900">23,891</p>
          <span className="text-sm text-green-600">+15% from last period</span>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Monthly Searches</h3>
          <p className="text-2xl font-bold text-gray-900">45,123</p>
          <span className="text-sm text-green-600">+23% from last period</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Chart component would be rendered here
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Activity</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Bar chart component would be rendered here
        </div>
      </div>
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