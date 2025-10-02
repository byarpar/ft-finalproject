import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  CogIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch admin settings
  const { data: settingsData, isLoading } = useQuery(
    ['adminSettings'],
    () => adminAPI.getSettings(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const settings = settingsData?.data || {};

  // Update settings mutation
  const updateSettingsMutation = useMutation(
    (newSettings) => adminAPI.updateSettings(newSettings),
    {
      onSuccess: () => {
        toast.success('Settings updated successfully');
        queryClient.invalidateQueries(['adminSettings']);
        setIsSubmitting(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update settings');
        setIsSubmitting(false);
      }
    }
  );

  // Clear cache mutation
  const clearCacheMutation = useMutation(
    () => adminAPI.clearCache(),
    {
      onSuccess: (data) => {
        toast.success(`Cache cleared successfully. ${data.data.cleared} items removed.`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to clear cache');
      }
    }
  );

  const handleSettingsUpdate = async (formData) => {
    setIsSubmitting(true);
    updateSettingsMutation.mutate(formData);
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cache? This may temporarily slow down the application.')) {
      clearCacheMutation.mutate();
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'database', name: 'Database', icon: CircleStackIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'content', name: 'Content', icon: DocumentTextIcon }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:mx-auto lg:max-w-6xl lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <CogIcon className="h-8 w-8 text-gray-400" />
                <div className="ml-3">
                  <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
                  <p className="text-sm text-gray-500">
                    Manage system configuration and preferences
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex space-x-3 md:ml-4 md:mt-0">
              <button
                onClick={handleClearCache}
                disabled={clearCacheMutation.isLoading}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {clearCacheMutation.isLoading ? 'Clearing...' : 'Clear Cache'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
          {/* Tab navigation */}
          <aside className="px-2 py-6 sm:px-6 lg:col-span-3 lg:px-0 lg:py-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${activeTab === tab.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                      } group border-l-4 px-3 py-2 flex items-center text-sm font-medium w-full text-left`}
                  >
                    <Icon
                      className={`${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Tab content */}
          <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
            {activeTab === 'general' && (
              <GeneralSettings
                settings={settings.general || {}}
                onUpdate={handleSettingsUpdate}
                isSubmitting={isSubmitting}
              />
            )}
            {activeTab === 'database' && (
              <DatabaseSettings
                settings={settings.database || {}}
                onUpdate={handleSettingsUpdate}
                isSubmitting={isSubmitting}
              />
            )}
            {activeTab === 'security' && (
              <SecuritySettings
                settings={settings.security || {}}
                onUpdate={handleSettingsUpdate}
                isSubmitting={isSubmitting}
              />
            )}
            {activeTab === 'content' && (
              <ContentSettings
                settings={settings.content || {}}
                onUpdate={handleSettingsUpdate}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// General Settings Component
const GeneralSettings = ({ settings, onUpdate, isSubmitting }) => {
  const [formData, setFormData] = useState({
    siteName: settings.siteName || 'English-Lisu Dictionary',
    siteDescription: settings.siteDescription || 'A comprehensive English-Lisu dictionary',
    maintenanceMode: settings.maintenanceMode || false,
    registrationEnabled: settings.registrationEnabled || true,
    maxSearchResults: settings.maxSearchResults || 20
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ general: formData });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">General Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Basic configuration options for your dictionary application.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium leading-6 text-gray-900">
              Site Name
            </label>
            <input
              type="text"
              id="siteName"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium leading-6 text-gray-900">
              Site Description
            </label>
            <textarea
              id="siteDescription"
              rows={3}
              value={formData.siteDescription}
              onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div>
            <label htmlFor="maxSearchResults" className="block text-sm font-medium leading-6 text-gray-900">
              Max Search Results
            </label>
            <input
              type="number"
              id="maxSearchResults"
              min="10"
              max="100"
              value={formData.maxSearchResults}
              onChange={(e) => setFormData({ ...formData, maxSearchResults: parseInt(e.target.value) })}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="maintenanceMode"
                type="checkbox"
                checked={formData.maintenanceMode}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="maintenanceMode" className="ml-3 text-sm font-medium text-gray-900">
                Maintenance Mode
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="registrationEnabled"
                type="checkbox"
                checked={formData.registrationEnabled}
                onChange={(e) => setFormData({ ...formData, registrationEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="registrationEnabled" className="ml-3 text-sm font-medium text-gray-900">
                Allow User Registration
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Database Settings Component
const DatabaseSettings = ({ settings, onUpdate, isSubmitting }) => {
  const [formData, setFormData] = useState({
    cacheTimeout: settings.cacheTimeout || 300000,
    maxCacheSize: settings.maxCacheSize || 1000,
    connectionPoolSize: settings.connectionPoolSize || 20,
    queryTimeout: settings.queryTimeout || 30000
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ database: formData });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Database Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure database connection and caching options.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="cacheTimeout" className="block text-sm font-medium leading-6 text-gray-900">
                Cache Timeout (ms)
              </label>
              <input
                type="number"
                id="cacheTimeout"
                min="60000"
                max="3600000"
                value={formData.cacheTimeout}
                onChange={(e) => setFormData({ ...formData, cacheTimeout: parseInt(e.target.value) })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <label htmlFor="maxCacheSize" className="block text-sm font-medium leading-6 text-gray-900">
                Max Cache Size
              </label>
              <input
                type="number"
                id="maxCacheSize"
                min="100"
                max="10000"
                value={formData.maxCacheSize}
                onChange={(e) => setFormData({ ...formData, maxCacheSize: parseInt(e.target.value) })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <label htmlFor="connectionPoolSize" className="block text-sm font-medium leading-6 text-gray-900">
                Connection Pool Size
              </label>
              <input
                type="number"
                id="connectionPoolSize"
                min="5"
                max="100"
                value={formData.connectionPoolSize}
                onChange={(e) => setFormData({ ...formData, connectionPoolSize: parseInt(e.target.value) })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <label htmlFor="queryTimeout" className="block text-sm font-medium leading-6 text-gray-900">
                Query Timeout (ms)
              </label>
              <input
                type="number"
                id="queryTimeout"
                min="5000"
                max="120000"
                value={formData.queryTimeout}
                onChange={(e) => setFormData({ ...formData, queryTimeout: parseInt(e.target.value) })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = ({ settings, onUpdate, isSubmitting }) => {
  const [formData, setFormData] = useState({
    jwtExpiration: settings.jwtExpiration || '7d',
    maxLoginAttempts: settings.maxLoginAttempts || 5,
    lockoutDuration: settings.lockoutDuration || 900000,
    requireEmailVerification: settings.requireEmailVerification || true,
    passwordMinLength: settings.passwordMinLength || 8
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ security: formData });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Security Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure authentication and security options.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="jwtExpiration" className="block text-sm font-medium leading-6 text-gray-900">
                JWT Expiration
              </label>
              <select
                id="jwtExpiration"
                value={formData.jwtExpiration}
                onChange={(e) => setFormData({ ...formData, jwtExpiration: e.target.value })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>

            <div>
              <label htmlFor="maxLoginAttempts" className="block text-sm font-medium leading-6 text-gray-900">
                Max Login Attempts
              </label>
              <input
                type="number"
                id="maxLoginAttempts"
                min="3"
                max="10"
                value={formData.maxLoginAttempts}
                onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <label htmlFor="lockoutDuration" className="block text-sm font-medium leading-6 text-gray-900">
                Lockout Duration (minutes)
              </label>
              <input
                type="number"
                id="lockoutDuration"
                min="5"
                max="1440"
                value={formData.lockoutDuration / 60000}
                onChange={(e) => setFormData({ ...formData, lockoutDuration: parseInt(e.target.value) * 60000 })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <label htmlFor="passwordMinLength" className="block text-sm font-medium leading-6 text-gray-900">
                Minimum Password Length
              </label>
              <input
                type="number"
                id="passwordMinLength"
                min="6"
                max="32"
                value={formData.passwordMinLength}
                onChange={(e) => setFormData({ ...formData, passwordMinLength: parseInt(e.target.value) })}
                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="requireEmailVerification"
              type="checkbox"
              checked={formData.requireEmailVerification}
              onChange={(e) => setFormData({ ...formData, requireEmailVerification: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="requireEmailVerification" className="ml-3 text-sm font-medium text-gray-900">
              Require Email Verification
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Content Settings Component
const ContentSettings = ({ settings, onUpdate, isSubmitting }) => {
  const [formData, setFormData] = useState({
    autoApproveWords: settings.autoApproveWords || false,
    requireEtymology: settings.requireEtymology || false,
    allowAnonymousSubmissions: settings.allowAnonymousSubmissions || false,
    moderationRequired: settings.moderationRequired || true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ content: formData });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Content Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure content moderation and submission options.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="autoApproveWords"
                type="checkbox"
                checked={formData.autoApproveWords}
                onChange={(e) => setFormData({ ...formData, autoApproveWords: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="autoApproveWords" className="ml-3 text-sm font-medium text-gray-900">
                Auto-approve new words
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="requireEtymology"
                type="checkbox"
                checked={formData.requireEtymology}
                onChange={(e) => setFormData({ ...formData, requireEtymology: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="requireEtymology" className="ml-3 text-sm font-medium text-gray-900">
                Require etymology for new words
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="allowAnonymousSubmissions"
                type="checkbox"
                checked={formData.allowAnonymousSubmissions}
                onChange={(e) => setFormData({ ...formData, allowAnonymousSubmissions: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="allowAnonymousSubmissions" className="ml-3 text-sm font-medium text-gray-900">
                Allow anonymous submissions
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="moderationRequired"
                type="checkbox"
                checked={formData.moderationRequired}
                onChange={(e) => setFormData({ ...formData, moderationRequired: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              <label htmlFor="moderationRequired" className="ml-3 text-sm font-medium text-gray-900">
                Require moderation for all submissions
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
