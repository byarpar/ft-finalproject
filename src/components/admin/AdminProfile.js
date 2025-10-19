import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Profile
        </h1>
        <p className="text-gray-600">
          Manage your admin profile and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Photo */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-teal-500 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
              {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {user?.username || 'Admin User'}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {user?.role || 'Administrator'}
            </p>
            <button className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50:bg-gray-700 text-sm text-gray-700">
              Change Photo
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  defaultValue={user?.username}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.full_name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 capitalize"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                rows="3"
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Change Password
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Total Actions
          </p>
          <p className="text-3xl font-bold text-gray-900">
            1,234
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Last Login
          </p>
          <p className="text-3xl font-bold text-gray-900">
            Today
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">
            Member Since
          </p>
          <p className="text-3xl font-bold text-gray-900">
            2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
