import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { PageLayout } from '../components/LayoutComponents';
import {
  UserCircleIcon,
  CogIcon,
  ShieldCheckIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');

  // Profile form state  
  const [profileForm, setProfileForm] = useState({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    native_language: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({}); // eslint-disable-line no-unused-vars

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });

  // Account deletion state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        full_name: user.full_name || '',
        bio: user.bio || '',
        location: user.location || '',
        native_language: user.native_language || '',
      });
      setPreferencesForm({});
      setProfilePhotoPreview(user.profile_photo_url || '');
    }
  }, [user]);

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setProfilePhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePhoto = async () => {
    if (!user?.profile_photo_url && !profilePhotoPreview) {
      // Just clear local state if no photo exists
      setProfilePhoto(null);
      setProfilePhotoPreview('');
      return;
    }

    setLoading(true);
    try {
      // Use the existing profile update endpoint to remove photo
      const response = await authAPI.updateProfile({ profile_photo_base64: null });

      // Update local state
      setProfilePhoto(null);
      setProfilePhotoPreview('');

      // Update user context
      updateUser(response.data.user);

      toast.success('Profile photo removed successfully');
    } catch (error) {
      console.error('Remove profile photo error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to remove profile photo');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { ...profileForm };

      // Handle profile photo
      if (profilePhoto) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          updateData.profile_photo_base64 = e.target.result;
          await submitProfileUpdate(updateData);
        };
        reader.readAsDataURL(profilePhoto);
      } else if (profilePhotoPreview === '' && user.profile_photo_url) {
        // User removed the photo
        updateData.profile_photo_base64 = null;
        await submitProfileUpdate(updateData);
      } else {
        await submitProfileUpdate(updateData);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const submitProfileUpdate = async (updateData) => {
    try {
      const response = await authAPI.updateProfile(updateData);
      updateUser(response.data.user);
      setProfilePhoto(null);
      toast.success('Profile updated successfully');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });

      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };



  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm account deletion');
      return;
    }

    setLoading(true);

    try {
      await authAPI.deleteAccount(deleteConfirmation);
      toast.success('Account deleted successfully');
      // User will be redirected by the auth interceptor
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'account', name: 'Account', icon: TrashIcon },
  ];

  return (
    <PageLayout
      title="Settings"
      description="Manage your account, profile and preferences"
      headerIcon={<CogIcon className="w-6 h-6 text-white" />}
      showHeader={true}
      fullWidth={true}
      background="bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8 xl:gap-x-12 2xl:max-w-6xl 2xl:mx-auto">
          {/* Sidebar */}
          <aside className="py-6 lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors duration-200 ${activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500'
                      : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
                    <span className="truncate">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <div className="space-y-6 lg:col-span-3">
            <div className="bg-white shadow-sm rounded-xl border border-gray-200">
              <div className="px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                {activeTab === 'profile' && (
                  <div>
                    <div className="border-b border-gray-100 pb-6 mb-8">
                      <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                      <p className="mt-2 text-sm text-gray-600">
                        Update your profile information and photo.
                      </p>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-8">
                      {/* Profile Photo */}
                      <div className="pb-6 border-b border-gray-100">
                        <label className="block text-base font-semibold text-gray-800 mb-3">Profile Photo</label>
                        <div className="mt-3 flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            {profilePhotoPreview ? (
                              <img
                                className="h-20 w-20 rounded-full object-cover ring-4 ring-gray-100"
                                src={profilePhotoPreview}
                                alt="Profile"
                              />
                            ) : (
                              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-gray-50">
                                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-3">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                              <PhotoIcon className="h-4 w-4 mr-2" />
                              Change Photo
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleProfilePhotoChange}
                              />
                            </label>
                            {(profilePhotoPreview || user?.profile_photo_url) && (
                              <button
                                type="button"
                                onClick={removeProfilePhoto}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {loading ? 'Removing...' : 'Remove'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Name Fields Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div>
                          <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            id="username"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                            className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors duration-200"
                            placeholder="Enter your username"
                          />
                        </div>

                        {/* Full Name */}
                        <div>
                          <label htmlFor="full_name" className="block text-sm font-semibold text-gray-800 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="full_name"
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors duration-200"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label htmlFor="bio" className="block text-sm font-semibold text-gray-800 mb-2">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          rows={4}
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors duration-200 resize-vertical"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      {/* Location and Language Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Location */}
                        <div>
                          <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            id="location"
                            value={profileForm.location}
                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                            className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors duration-200"
                            placeholder="Enter your location"
                          />
                        </div>

                        {/* Native Language */}
                        <div>
                          <label htmlFor="native_language" className="block text-sm font-semibold text-gray-800 mb-2">
                            Native Language
                          </label>
                          <select
                            id="native_language"
                            value={profileForm.native_language}
                            onChange={(e) => setProfileForm({ ...profileForm, native_language: e.target.value })}
                            className="block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors duration-200 bg-white"
                          >
                            <option value="">Select your native language</option>
                            <option value="lisu">Lisu</option>
                            <option value="chinese">Chinese</option>
                            <option value="english">English</option>
                            <option value="burmese">Burmese</option>
                            <option value="thai">Thai</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors duration-200"
                        >
                          {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div>
                    <div className="border-b border-gray-100 pb-6 mb-8">
                      <h3 className="text-xl font-semibold text-gray-900">Preferences</h3>
                      <p className="mt-2 text-sm text-gray-600">
                        More preferences will be available soon.
                      </p>
                    </div>

                    <div className="mt-8 text-center py-12">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <CogIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No preferences available at the moment.</p>
                      <p className="text-sm text-gray-400 mt-1">We're working on adding more customization options.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <div className="border-b border-gray-100 pb-6 mb-8">
                      <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                      <p className="mt-2 text-sm text-gray-600">
                        Update your password to keep your account secure.
                      </p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      {/* Current Password */}
                      <div>
                        <label htmlFor="current_password" className="block text-sm font-semibold text-gray-800 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current_password ? 'text' : 'password'}
                            id="current_password"
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                            className="block w-full px-4 py-3 pr-12 text-base border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors duration-200"
                            placeholder="Enter your current password"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => togglePasswordVisibility('current_password')}
                          >
                            {showPasswords.current_password ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label htmlFor="new_password" className="block text-sm font-semibold text-gray-800 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new_password ? 'text' : 'password'}
                            id="new_password"
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                            className="block w-full px-4 py-3 pr-12 text-base border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors duration-200"
                            placeholder="Enter your new password"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => togglePasswordVisibility('new_password')}
                          >
                            {showPasswords.new_password ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-800 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm_password ? 'text' : 'password'}
                            id="confirm_password"
                            value={passwordForm.confirm_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                            className="block w-full px-4 py-3 pr-12 text-base border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-colors duration-200"
                            placeholder="Confirm your new password"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            onClick={() => togglePasswordVisibility('confirm_password')}
                          >
                            {showPasswords.confirm_password ? (
                              <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors duration-200"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div>
                    <div className="border-b border-gray-100 pb-6 mb-8">
                      <h3 className="text-xl font-semibold text-gray-900">Delete Account</h3>
                      <p className="mt-2 text-sm text-gray-600">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>

                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <TrashIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Warning: This action is irreversible
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Deleting your account will:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Permanently delete your profile and all personal information</li>
                              <li>Remove all your discussions, answers, and comments</li>
                              <li>Cancel any ongoing contributions or moderations</li>
                              <li>Delete your search history and preferences</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                      >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center mx-auto w-12 h-12 rounded-full bg-red-100">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete your account? This action cannot be undone.
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    Type <strong>DELETE</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="mt-3 block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-colors duration-200"
                    placeholder="Type DELETE"
                  />
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmation('');
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-800 text-base font-medium rounded-lg hover:bg-gray-400 focus:outline-none transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAccountDeletion}
                    disabled={loading || deleteConfirmation !== 'DELETE'}
                    className="px-6 py-3 bg-red-600 text-white text-base font-medium rounded-lg hover:bg-red-700 focus:outline-none disabled:opacity-50 transition-colors duration-200"
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Settings;