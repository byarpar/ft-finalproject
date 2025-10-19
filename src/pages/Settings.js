/**
 * Settings Component
 * 
 * User account settings page with profile, security, notifications, 
 * privacy, and account deletion management.
 * 
 * Features:
 * - Real-time form validation with visual feedback
 * - Keyboard shortcuts (Ctrl+S to save, Escape to cancel)
 * - Unsaved changes warning
 * - Password strength indicator
 * - Skeleton loaders for better perceived performance
 * - React Query for efficient data fetching
 * - Optimistic updates for better UX
 * - Enhanced confirmation dialogs
 * - Full accessibility support
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import HeroNavbar from '../components/Layout/HeroNavbar';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import PageLayout from '../components/Layout/PageLayout';

const Settings = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('profile');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Refs for form inputs
  const usernameInputRef = useRef(null);
  const currentPasswordInputRef = useRef(null);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Profile state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    full_name: '',
    bio: '',
    location: '',
    preferred_language: 'en'
  });

  // eslint-disable-next-line no-unused-vars
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Security state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    new_replies: true,
    new_mentions: true,
    announcements: true,
    badges: true,
    newsletter: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    public_profile: true,
    show_real_name: false,
    show_activity: true,
    allow_messages: true
  });

  // Delete account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Remove avatar modal state
  const [showRemoveAvatarModal, setShowRemoveAvatarModal] = useState(false);

  // Fetch user profile
  const { isLoading: profileLoading } = useQuery(
    ['userProfile'],
    () => authAPI.getProfile(),
    {
      onSuccess: (response) => {
        if (response?.data?.user) {
          const userData = response.data.user;
          setProfileData({
            username: userData.username || '',
            email: userData.email || '',
            full_name: userData.full_name || '',
            bio: userData.bio || '',
            location: userData.location || '',
            preferred_language: userData.preferred_language || 'en'
          });

          // Set avatar preview if exists
          if (userData.profile_photo_url) {
            setAvatarPreview(userData.profile_photo_url);
          }

          // Set notifications from user data
          if (userData.email_notifications !== undefined) {
            setNotifications(prev => ({
              ...prev,
              new_replies: userData.email_notifications
            }));
          }

          // Set privacy settings
          if (userData.public_profile !== undefined) {
            setPrivacy(prev => ({
              ...prev,
              public_profile: userData.public_profile
            }));
          }
        }
      }
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => authAPI.updateProfile(data),
    {
      onSuccess: () => {
        toast.success('Profile updated successfully!');
        setUnsavedChanges(false);
        setAvatarFile(null); // Clear the file input after successful upload
        queryClient.invalidateQueries(['userProfile']);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    (data) => authAPI.changePassword(data),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    }
  );

  // Update preferences mutation
  const updatePreferencesMutation = useMutation(
    (data) => authAPI.updatePreferences(data),
    {
      onSuccess: () => {
        toast.success('Preferences updated successfully!');
        setUnsavedChanges(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update preferences');
      }
    }
  );

  /**
   * Real-time validation functions
   */
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'username':
        if (!value || value.length < 3) {
          return 'Username must be at least 3 characters';
        }
        if (value.length > 30) {
          return 'Username must be less than 30 characters';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return 'Username can only contain letters, numbers, underscores, and hyphens';
        }
        return '';

      case 'email':
        if (!value) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';

      case 'full_name':
        if (value && value.length > 100) {
          return 'Name must be less than 100 characters';
        }
        return '';

      case 'bio':
        if (value && value.length > 500) {
          return 'Bio must be less than 500 characters';
        }
        return '';

      case 'current_password':
        if (!value) {
          return 'Current password is required';
        }
        return '';

      case 'new_password':
        if (!value) {
          return 'New password is required';
        }
        if (value.length < 8) {
          return 'Password must be at least 8 characters';
        }
        if (value === passwordData.current_password) {
          return 'New password must be different from current password';
        }
        return '';

      case 'confirm_password':
        if (!value) {
          return 'Please confirm your password';
        }
        if (value !== passwordData.new_password) {
          return 'Passwords do not match';
        }
        return '';

      default:
        return '';
    }
  }, [passwordData]);

  /**
   * Get password strength
   */
  const getPasswordStrength = useCallback((password) => {
    if (!password) return { level: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, text: 'Weak', color: 'text-red-500' };
    if (strength === 3) return { level: 2, text: 'Fair', color: 'text-yellow-500' };
    if (strength === 4) return { level: 3, text: 'Good', color: 'text-blue-500' };
    return { level: 4, text: 'Strong', color: 'text-green-500' };
  }, []);

  // Handler functions - defined with useCallback before being used in useEffect

  // Save profile changes
  const handleSaveProfile = useCallback(async () => {
    // Only include fields that exist in the backend schema
    const allowedFields = ['username', 'email', 'full_name', 'bio', 'location'];

    const updateData = {};
    Object.keys(profileData).forEach(key => {
      if (allowedFields.includes(key) && profileData[key] !== undefined) {
        updateData[key] = profileData[key];
      }
    });

    // Add base64 encoded profile photo if available
    if (avatarPreview !== null) {
      updateData.profile_photo_base64 = avatarPreview;
    }

    updateProfileMutation.mutate(updateData);
  }, [profileData, avatarPreview, updateProfileMutation]);

  // Save notification preferences
  const handleSaveNotifications = useCallback(() => {
    updatePreferencesMutation.mutate({
      email_notifications: notifications.new_replies,
      ...notifications
    });
  }, [notifications, updatePreferencesMutation]);

  // Save privacy settings
  const handleSavePrivacy = useCallback(() => {
    updatePreferencesMutation.mutate({
      public_profile: privacy.public_profile,
      ...privacy
    });
  }, [privacy, updatePreferencesMutation]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save (in any section)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (unsavedChanges) {
          if (activeSection === 'profile') {
            handleSaveProfile();
          } else if (activeSection === 'notifications') {
            handleSaveNotifications();
          } else if (activeSection === 'privacy') {
            handleSavePrivacy();
          }
          toast.success('Saved with keyboard shortcut!');
        }
      }

      // Escape to cancel/reset changes
      if (e.key === 'Escape' && unsavedChanges) {
        if (window.confirm('Discard unsaved changes?')) {
          queryClient.invalidateQueries(['userProfile']);
          setUnsavedChanges(false);
          toast.info('Changes discarded');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unsavedChanges, activeSection, queryClient, handleSaveProfile, handleSaveNotifications, handleSavePrivacy]);

  /**
   * Warn before leaving with unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  // Handle profile input changes
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);

    // Real-time validation
    if (touched[field]) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  /**
   * Handle field blur - mark as touched
   */
  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, profileData[field] || passwordData[field]);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(png|jpeg|jpg|gif|webp)$/)) {
        toast.error('Please upload a valid image file (PNG, JPEG, GIF, or WebP)');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result); // This is already base64
      };
      reader.readAsDataURL(file);
      setUnsavedChanges(true);
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = () => {
    setShowRemoveAvatarModal(true);
  };

  // Confirm avatar removal
  const confirmRemoveAvatar = async () => {
    setShowRemoveAvatarModal(false);

    try {
      // Immediately save to backend
      await authAPI.updateProfile({ profile_photo_base64: '' });

      // Clear local state
      setAvatarFile(null);
      setAvatarPreview('');

      // Invalidate profile query to refresh data
      queryClient.invalidateQueries(['userProfile']);

      toast.success('Profile picture removed successfully');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  // Change password
  const handleChangePassword = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    changePasswordMutation.mutate({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password
    });
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      await authAPI.deleteAccount('DELETE');

      toast.success('Account deleted successfully. You will be logged out.');
      setShowDeleteModal(false);

      // Logout after a delay
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  // Navigation items
  const navigationItems = [
    { id: 'profile', label: 'Profile Information', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockClosedIcon },
    { id: 'notifications', label: 'Email & Notifications', icon: EnvelopeIcon },
    { id: 'privacy', label: 'Privacy Controls', icon: EyeIcon },
    { id: 'connected', label: 'Connected Apps', icon: LinkIcon },
    { id: 'delete', label: 'Delete Account', icon: TrashIcon }
  ];

  if (profileLoading) {
    return (
      <PageLayout title="Settings" description="Manage your account settings and preferences">
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <SkeletonLoader variant="text" width="200px" height="32px" />
            </div>
            <SkeletonLoader variant="form-field" count={8} />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Account Settings"
      description="Manage your profile, security, notifications, and privacy settings"
    >
      <div className="min-h-screen bg-gray-50">
        <HeroNavbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Left Navigation - Sticky */}
            <aside className="lg:col-span-3">
              <nav className="space-y-1 sticky top-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeSection === item.id
                        ? 'bg-teal-50 text-teal-600'
                        : 'text-gray-700 hover:bg-gray-100:bg-gray-800'
                        }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Right Content Panel */}
            <div className="mt-8 lg:mt-0 lg:col-span-9">
              {/* Unsaved Changes Banner */}
              {unsavedChanges && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      You have unsaved changes
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Press <kbd className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 rounded">Ctrl+S</kbd> to save or <kbd className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 rounded">Esc</kbd> to cancel
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white shadow rounded-lg">
                {/* Profile Information Section */}
                {activeSection === 'profile' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Profile Information
                    </h2>

                    {profileLoading ? (
                      <div className="space-y-6">
                        <SkeletonLoader variant="avatar" />
                        <SkeletonLoader variant="text" count={5} />
                      </div>
                    ) : (
                      <>
                        {/* Avatar Section */}
                        <div className="mb-8">
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            Profile Picture
                          </label>
                          <div className="flex items-center space-x-6">
                            <div className="relative">
                              {avatarPreview || user?.profile_photo_url ? (
                                <img
                                  src={avatarPreview || user.profile_photo_url}
                                  alt="Profile"
                                  className="h-24 w-24 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    console.log('Settings avatar failed to load');
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="h-24 w-24 rounded-full bg-teal-100 flex items-center justify-center"
                                style={{ display: (avatarPreview || user?.profile_photo_url) ? 'none' : 'flex' }}
                              >
                                <UserIcon className="h-12 w-12 text-teal-600" />
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50:bg-gray-600">
                                <PhotoIcon className="h-5 w-5 mr-2" />
                                Upload New Picture
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAvatarChange}
                                  className="sr-only"
                                />
                              </label>
                              {(avatarPreview || user?.profile_photo_url) && (
                                <button
                                  onClick={handleRemoveAvatar}
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700:text-red-300"
                                >
                                  <XMarkIcon className="h-5 w-5 mr-2" />
                                  Remove Picture
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            JPG, PNG or GIF. Max size 5MB.
                          </p>
                        </div>

                        {/* Profile Fields */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Username
                            </label>
                            <div className="relative">
                              <input
                                ref={usernameInputRef}
                                type="text"
                                value={profileData.username}
                                onChange={(e) => handleProfileChange('username', e.target.value)}
                                onBlur={() => handleFieldBlur('username')}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-inset transition-colors ${touched.username && validationErrors.username
                                  ? 'border-red-500 focus:ring-red-500'
                                  : touched.username && !validationErrors.username
                                    ? 'border-green-500 focus:ring-green-500'
                                    : 'border-gray-300 focus:ring-teal-500'
                                  }`}
                                placeholder="Your username"
                              />
                              {touched.username && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  {validationErrors.username ? (
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                  ) : (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                  )}
                                </div>
                              )}
                            </div>
                            {touched.username && validationErrors.username ? (
                              <p className="mt-1 text-xs text-red-600">
                                {validationErrors.username}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-gray-500">
                                This is your public display name
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                value={profileData.email}
                                onChange={(e) => handleProfileChange('email', e.target.value)}
                                onBlur={() => handleFieldBlur('email')}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-inset transition-colors ${touched.email && validationErrors.email
                                  ? 'border-red-500 focus:ring-red-500'
                                  : touched.email && !validationErrors.email
                                    ? 'border-green-500 focus:ring-green-500'
                                    : 'border-gray-300 focus:ring-teal-500'
                                  }`}
                                placeholder="your.email@example.com"
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {user?.email_verified ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : touched.email && validationErrors.email ? (
                                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                ) : touched.email && !validationErrors.email ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : null}
                              </div>
                            </div>
                            {touched.email && validationErrors.email ? (
                              <p className="mt-1 text-xs text-red-600">
                                {validationErrors.email}
                              </p>
                            ) : !user?.email_verified ? (
                              <button className="mt-2 text-xs text-teal-600 hover:underline">
                                Verify email address
                              </button>
                            ) : null}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Real Name (Optional)
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={profileData.full_name}
                                onChange={(e) => handleProfileChange('full_name', e.target.value)}
                                onBlur={() => handleFieldBlur('full_name')}
                                className={`w-full px-4 py-2 pr-10 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-inset transition-colors ${touched.full_name && validationErrors.full_name
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'border-gray-300 focus:ring-teal-500'
                                  }`}
                                placeholder="John Doe"
                              />
                              {touched.full_name && validationErrors.full_name && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                </div>
                              )}
                            </div>
                            {touched.full_name && validationErrors.full_name && (
                              <p className="mt-1 text-xs text-red-600">
                                {validationErrors.full_name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bio/Tagline
                            </label>
                            <div className="relative">
                              <textarea
                                value={profileData.bio}
                                onChange={(e) => handleProfileChange('bio', e.target.value)}
                                onBlur={() => handleFieldBlur('bio')}
                                rows={4}
                                className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-inset transition-colors resize-none ${touched.bio && validationErrors.bio
                                  ? 'border-red-500 focus:ring-red-500'
                                  : 'border-gray-300 focus:ring-teal-500'
                                  }`}
                                placeholder="Tell us about yourself..."
                              />
                            </div>
                            {touched.bio && validationErrors.bio ? (
                              <p className="mt-1 text-xs text-red-600">
                                {validationErrors.bio}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-gray-500">
                                {profileData.bio?.length || 0}/500 characters
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Location
                            </label>
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) => handleProfileChange('location', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="City, Country"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Preferred Language for Interface
                            </label>
                            <select
                              value={profileData.preferred_language}
                              onChange={(e) => handleProfileChange('preferred_language', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                              <option value="en">English</option>
                              <option value="lis">Lisu</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                          <button
                            onClick={handleSaveProfile}
                            disabled={!unsavedChanges || updateProfileMutation.isLoading}
                            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Security Section */}
                {activeSection === 'security' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Security
                    </h2>

                    {/* Change Password */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Change Password
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              ref={currentPasswordInputRef}
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordData.current_password}
                              onChange={(e) => {
                                setPasswordData(prev => ({ ...prev, current_password: e.target.value }));
                                if (touched.current_password) {
                                  const error = validateField('current_password', e.target.value);
                                  setValidationErrors(prev => ({ ...prev, current_password: error }));
                                }
                              }}
                              onBlur={() => handleFieldBlur('current_password')}
                              className={`w-full px-4 py-2 pr-12 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-inset transition-colors ${touched.current_password && validationErrors.current_password
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-teal-500'
                                }`}
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700:text-gray-200"
                            >
                              {showPasswords.current ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {touched.current_password && validationErrors.current_password && (
                            <p className="mt-1 text-xs text-red-600">
                              {validationErrors.current_password}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordData.new_password}
                              onChange={(e) => {
                                setPasswordData(prev => ({ ...prev, new_password: e.target.value }));
                                if (touched.new_password) {
                                  const error = validateField('new_password', e.target.value);
                                  setValidationErrors(prev => ({ ...prev, new_password: error }));
                                }
                              }}
                              onBlur={() => handleFieldBlur('new_password')}
                              className={`w-full px-4 py-2 pr-12 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-inset transition-colors ${touched.new_password && validationErrors.new_password
                                ? 'border-red-500 focus:ring-red-500'
                                : touched.new_password && !validationErrors.new_password && passwordData.new_password
                                  ? 'border-green-500 focus:ring-green-500'
                                  : 'border-gray-300 focus:ring-teal-500'
                                }`}
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700:text-gray-200"
                            >
                              {showPasswords.new ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {touched.new_password && validationErrors.new_password ? (
                            <p className="mt-1 text-xs text-red-600">
                              {validationErrors.new_password}
                            </p>
                          ) : passwordData.new_password && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Password strength:</span>
                                <span className={`text-xs font-medium ${getPasswordStrength(passwordData.new_password).color}`}>
                                  {getPasswordStrength(passwordData.new_password).text}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${getPasswordStrength(passwordData.new_password).level === 1
                                    ? 'bg-red-500 w-1/4'
                                    : getPasswordStrength(passwordData.new_password).level === 2
                                      ? 'bg-yellow-500 w-2/4'
                                      : getPasswordStrength(passwordData.new_password).level === 3
                                        ? 'bg-blue-500 w-3/4'
                                        : 'bg-green-500 w-full'
                                    }`}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordData.confirm_password}
                              onChange={(e) => {
                                setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }));
                                if (touched.confirm_password) {
                                  const error = validateField('confirm_password', e.target.value);
                                  setValidationErrors(prev => ({ ...prev, confirm_password: error }));
                                }
                              }}
                              onBlur={() => handleFieldBlur('confirm_password')}
                              className={`w-full px-4 py-2 pr-12 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-inset transition-colors ${touched.confirm_password && validationErrors.confirm_password
                                ? 'border-red-500 focus:ring-red-500'
                                : touched.confirm_password && !validationErrors.confirm_password && passwordData.confirm_password
                                  ? 'border-green-500 focus:ring-green-500'
                                  : 'border-gray-300 focus:ring-teal-500'
                                }`}
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700:text-gray-200"
                            >
                              {showPasswords.confirm ? (
                                <EyeSlashIcon className="h-5 w-5" />
                              ) : (
                                <EyeIcon className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {touched.confirm_password && validationErrors.confirm_password ? (
                            <p className="mt-1 text-xs text-red-600">
                              {validationErrors.confirm_password}
                            </p>
                          ) : touched.confirm_password && !validationErrors.confirm_password && passwordData.confirm_password ? (
                            <p className="mt-1 text-xs text-green-600 flex items-center">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Passwords match
                            </p>
                          ) : null}
                        </div>

                        <button
                          onClick={handleChangePassword}
                          disabled={!passwordData.current_password || !passwordData.new_password || changePasswordMutation.isLoading}
                          className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Two-Factor Authentication (2FA)
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Status: <span className="font-medium text-red-600">Disabled</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="border-t border-gray-200 pt-8 mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Active Sessions
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Current Session
                            </p>
                            <p className="text-xs text-gray-500">
                              macOS • Safari • {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-xs text-green-600 font-medium">
                            Active Now
                          </span>
                        </div>
                      </div>
                      <button className="mt-4 text-sm text-red-600 hover:text-red-700:text-red-300 font-medium">
                        Log Out All Other Sessions
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Email & Notifications
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Manage how you receive notifications from Lisu Dictionary
                    </p>

                    <div className="space-y-4">
                      {[
                        { key: 'new_replies', label: 'New Replies to My Discussions', description: 'Get notified when someone replies to your discussion' },
                        { key: 'new_mentions', label: 'New Mentions (@username)', description: 'Get notified when someone mentions you' },
                        { key: 'announcements', label: 'Announcements & Updates', description: 'Receive important updates about Lisu Dictionary' },
                        { key: 'badges', label: 'New Badges/Achievements', description: 'Get notified when you earn a new badge' },
                        { key: 'newsletter', label: 'Newsletter', description: 'Receive our monthly newsletter' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.label}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                              type="checkbox"
                              checked={notifications[item.key]}
                              onChange={(e) => {
                                setNotifications(prev => ({ ...prev, [item.key]: e.target.checked }));
                                setUnsavedChanges(true);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300:ring-teal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleSaveNotifications}
                        disabled={!unsavedChanges || updatePreferencesMutation.isLoading}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatePreferencesMutation.isLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Privacy Section */}
                {activeSection === 'privacy' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Privacy Controls
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Control who can see your information and activity
                    </p>

                    <div className="space-y-4 mb-8">
                      {[
                        { key: 'public_profile', label: 'Make My Profile Public', description: 'Allow anyone to view your profile' },
                        { key: 'show_real_name', label: 'Show My Real Name on Profile', description: 'Display your real name instead of username' },
                        { key: 'show_activity', label: 'Show My Activity Feed to Others', description: 'Let others see your recent activity' },
                        { key: 'allow_messages', label: 'Allow Private Messages from Other Users', description: 'Enable direct messages from community members' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.label}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                              type="checkbox"
                              checked={privacy[item.key]}
                              onChange={(e) => {
                                setPrivacy(prev => ({ ...prev, [item.key]: e.target.checked }));
                                setUnsavedChanges(true);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300:ring-teal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Data Management */}
                    <div className="border-t border-gray-200 pt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Data Management
                      </h3>
                      <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100:bg-gray-700 transition-colors">
                          <div className="text-left">
                            <h4 className="text-sm font-medium text-gray-900">
                              Request My Data
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Download a copy of your data
                            </p>
                          </div>
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100:bg-gray-700 transition-colors">
                          <div className="text-left">
                            <h4 className="text-sm font-medium text-gray-900">
                              Manage Cookie Preferences
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Control cookie settings
                            </p>
                          </div>
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleSavePrivacy}
                        disabled={!unsavedChanges || updatePreferencesMutation.isLoading}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {updatePreferencesMutation.isLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Connected Apps Section */}
                {activeSection === 'connected' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Connected Apps
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      Manage third-party applications connected to your account
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Google Account
                            </h4>
                            <p className="text-xs text-gray-500">
                              Connected on {new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700:text-red-300 border border-red-300 rounded-lg hover:bg-red-50:bg-red-900/20 transition-colors">
                          Disconnect
                        </button>
                      </div>

                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">
                          No other apps connected
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Account Section */}
                {activeSection === 'delete' && (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-red-600 mb-6">
                      Delete Account
                    </h2>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                        <div className="ml-4">
                          <h3 className="text-sm font-semibold text-red-800 mb-2">
                            Warning: This action is irreversible
                          </h3>
                          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                            <li>Your account will be permanently deleted</li>
                            <li>All your discussions, replies, and contributions will be removed</li>
                            <li>Your profile data will be deleted</li>
                            <li>You won't be able to recover your account</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          To proceed, type <span className="font-bold text-red-600">DELETE</span> in the box below
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={(e) => setDeleteConfirmation(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Type DELETE to confirm"
                        />
                      </div>

                      <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleteConfirmation !== 'DELETE'}
                        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Delete My Account Permanently
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowDeleteModal(false)}></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Delete Account
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you absolutely sure you want to delete your account? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Delete Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove Avatar Confirmation Modal */}
        {showRemoveAvatarModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowRemoveAvatarModal(false)}></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-teal-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Remove Profile Picture
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to remove your profile picture? This action will take effect immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-teal-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={confirmRemoveAvatar}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Remove Picture
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRemoveAvatarModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
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
