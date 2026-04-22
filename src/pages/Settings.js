import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  PhotoIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');

  // Google link state
  const [googleLinked, setGoogleLinked] = useState(false);
  const [googleHasPassword, setGoogleHasPassword] = useState(true);
  const [googleLinkLoading, setGoogleLinkLoading] = useState(false);

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
      setProfilePhotoPreview(user.profile_photo_url || '');
    }
  }, [user]);

  // Fetch Google link status
  const fetchGoogleLinkStatus = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authAPI.getGoogleLinkStatus();
      setGoogleLinked(res.data?.linked ?? false);
      setGoogleHasPassword(res.data?.has_password ?? true);
    } catch {
      // silently fail — not critical
    }
  }, [user]);

  useEffect(() => {
    fetchGoogleLinkStatus();
  }, [fetchGoogleLinkStatus]);

  // Handle google_link redirect param (after OAuth callback)
  useEffect(() => {
    const status = searchParams.get('google_link');
    const message = searchParams.get('message');
    if (status === 'success') {
      toast.success('Google account linked successfully!');
      setGoogleLinked(true);
      setGoogleHasPassword(true);
      setActiveTab('connected');
    } else if (status === 'error') {
      toast.error(message || 'Failed to link Google account.');
      setActiveTab('connected');
    }
    if (status) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleLinkGoogle = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
    const token = localStorage.getItem('token');
    window.location.href = `${backendUrl}/api/auth/google/link?token=${encodeURIComponent(token)}`;
  };

  const handleUnlinkGoogle = async () => {
    // Warn Google-only users they need a password first
    if (!googleHasPassword) {
      toast.error(
        'You signed up with Google and have no password. Set a password in the Security tab first, then you can unlink Google.',
        { duration: 6000 }
      );
      setActiveTab('security');
      return;
    }
    if (!window.confirm(
      'Are you sure you want to unlink your Google account?\n\nYou will need to use your email and password to log in.'
    )) return;
    setGoogleLinkLoading(true);
    try {
      const res = await authAPI.unlinkGoogle();
      setGoogleLinked(false);
      // Update auth context with fresh user data
      if (res.data?.user) updateUser(res.data.user);
      toast.success('Google account unlinked. You can now log in with your email and password.');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to unlink Google account.');
    } finally {
      setGoogleLinkLoading(false);
    }
  };

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
        currentPassword: passwordForm.current_password,
        newPassword: passwordForm.new_password,
        confirmPassword: passwordForm.confirm_password
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
    { id: 'connected', name: 'Connected Accounts', icon: LinkIcon },
    { id: 'account', name: 'Account', icon: TrashIcon },
  ];

  return (
    <PageLayout
      title="Settings"
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <Link to="/discussions" className="hover:text-teal-600 transition-colors">Form Questions</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Settings</span>
            </nav>
            <h1 className="app-title text-3xl sm:text-4xl text-gray-900">Settings</h1>
          </div>
        </section>
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
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
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
                                  referrerPolicy="no-referrer"
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

                        {/* Email (read-only) */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={user?.email || ''}
                            readOnly
                            className="block w-full px-4 py-3 text-base border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                          <p className="mt-1.5 text-xs text-gray-400">Email address cannot be changed here.</p>
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
                          <div className="mt-2 text-right">
                            <Link
                              to="/forgot-password"
                              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                            >
                              Forgot your password?
                            </Link>
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

                  {activeTab === 'connected' && (
                    <div>
                      <div className="border-b border-gray-100 pb-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-900">Connected Accounts</h3>
                        <p className="mt-2 text-sm text-gray-600">
                          Manage third-party accounts linked to your profile.
                        </p>
                      </div>

                      {/* Google */}
                      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <div className="flex items-center justify-between p-5">
                          <div className="flex items-center gap-4">
                            {/* Google logo */}
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm flex-shrink-0">
                              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Google</p>
                              {googleLinked ? (
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                  <CheckCircleIcon className="w-3.5 h-3.5" /> Connected
                                </p>
                              ) : (
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <XCircleIcon className="w-3.5 h-3.5" /> Not connected
                                </p>
                              )}
                            </div>
                          </div>

                          {googleLinked ? (
                            <button
                              onClick={handleUnlinkGoogle}
                              disabled={googleLinkLoading}
                              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {googleLinkLoading ? 'Unlinking...' : 'Unlink'}
                            </button>
                          ) : (
                            <button
                              onClick={handleLinkGoogle}
                              disabled={googleLinkLoading}
                              className="px-4 py-2 text-sm font-medium text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-50"
                            >
                              Link Google
                            </button>
                          )}
                        </div>

                        {/* Warning: Google-only account with no password */}
                        {googleLinked && !googleHasPassword && (
                          <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-amber-700">
                              Your account was created with Google only — you have no password.{' '}
                              <button
                                onClick={() => setActiveTab('security')}
                                className="font-semibold underline hover:text-amber-900"
                              >
                                Set a password
                              </button>{' '}
                              before unlinking Google, otherwise you will not be able to log in.
                            </p>
                          </div>
                        )}
                      </div>
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
      </div>
    </PageLayout>
  );
};

export default Settings;