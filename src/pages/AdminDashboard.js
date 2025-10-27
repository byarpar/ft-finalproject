import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';
import SkeletonLoader from '../components/UI/SkeletonLoader';

// Import admin modules
import DashboardOverview from '../components/admin/DashboardOverview';
import UsersManagement from '../components/admin/UsersManagement';
import WordsManagement from '../components/admin/WordsManagement';
import DiscussionsManagement from '../components/admin/DiscussionsManagement';
import CategoriesAndTags from '../components/admin/CategoriesAndTags';
import ReportsAnalytics from '../components/admin/ReportsAnalytics';
import AdminSettings from '../components/admin/AdminSettings';

/**
 * Admin Dashboard - Complete administrative interface for managing the Lisu Dictionary
 * Provides access to user management, content moderation, analytics, and system settings
 * 
 * @component
 * @requires {Object} user - Must be authenticated with 'admin' role
 * @requires {Array} navigation - Array of admin panel navigation items
 * @requires {Array} adminModules - Array of admin feature components
 */
const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [notifications, setNotifications] = useState([]);

  /**
   * Handles user logout
   */
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  /**
   * Handles search submission
   * @param {Event} e - Form submit event
   */
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    // TODO: Implement global admin search
    console.log('Searching for:', searchQuery);
  }, [searchQuery]);

  // Handle responsive sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <PageLayout
        title="Admin Dashboard - Loading"
        description="Loading admin dashboard..."
        fullWidth={true}
        background=""
      >
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar Skeleton */}
          <aside className="w-64 bg-gradient-to-b from-teal-700 to-teal-900">
            <div className="p-6">
              <div className="h-8 bg-white/20 rounded mb-8"></div>
              <div className="space-y-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-10 bg-white/10 rounded"></div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* Header Skeleton */}
              <div className="mb-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>

              {/* Stats Grid Skeleton */}
              <SkeletonLoader variant="stats-grid" count={4} />

              {/* Content Area Skeleton */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonLoader variant="card" count={2} />
              </div>
            </div>
          </main>
        </div>
      </PageLayout>
    );
  }

  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/admin',
      exact: true,
      description: 'View system overview and statistics'
    },
    {
      name: 'Users',
      icon: UsersIcon,
      path: '/admin/users',
      description: 'Manage user accounts and permissions'
    },
    {
      name: 'Words & Definitions',
      icon: BookOpenIcon,
      path: '/admin/words',
      description: 'Manage dictionary entries and translations'
    },
    {
      name: 'Discussions',
      icon: ChatBubbleLeftRightIcon,
      path: '/admin/discussions',
      description: 'Moderate community discussions'
    },
    {
      name: 'Categories & Tags',
      icon: TagIcon,
      path: '/admin/categories',
      description: 'Organize content taxonomy'
    },
    {
      name: 'Reports & Analytics',
      icon: ChartBarIcon,
      path: '/admin/reports',
      description: 'View analytics and generate reports'
    },
    {
      name: 'Settings',
      icon: Cog6ToothIcon,
      path: '/admin/settings',
      description: 'Configure system settings'
    },
  ];

  /**
   * Checks if a navigation link is currently active
   * @param {string} path - The path to check
   * @param {boolean} exact - Whether to require exact match
   * @returns {boolean} True if the link is active
   */
  const isActiveLink = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <PageLayout
      title="Admin Dashboard - Lisu Dictionary"
      description="Administrative interface for managing Lisu Dictionary users, content, and system settings"
      fullWidth={true}
      background=""
    >
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-teal-700 to-teal-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
          aria-label="Admin navigation sidebar"
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-teal-600">
              <Link to="/admin" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <img
                  src="/logo.png"
                  alt="Lisu Dictionary Logo"
                  className="w-10 h-10 object-contain drop-shadow-lg"
                />
                <div>
                  <h1 className="text-lg font-bold">Lisu Dictionary</h1>
                  <p className="text-xs text-teal-200">Admin Panel</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-teal-600 rounded transition-colors"
                aria-label="Close sidebar"
              >
                <XMarkIcon className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" aria-label="Admin panel navigation">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActiveLink(item.path, item.exact);

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors group ${active
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'text-teal-100 hover:bg-teal-600/50 hover:text-white'
                      }`}
                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    title={item.description}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" aria-hidden="true" />
                    <span className="font-medium">{item.name}</span>
                    {active && (
                      <span className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true" />
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Info at Bottom */}
            <div className="p-4 border-t border-teal-600">
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <UserCircleIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={user?.username || user?.email}>
                    {user?.username || user?.email}
                  </p>
                  <p className="text-xs text-teal-200 capitalize flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" aria-hidden="true" />
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-teal-800"
                aria-label="Logout from admin panel"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Bar */}
          <header className="bg-white shadow-sm z-10">
            <div className="flex items-center justify-between h-16 px-6">
              {/* Left: Menu button and search */}
              <div className="flex items-center space-x-4 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                  aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                  aria-expanded={sidebarOpen}
                >
                  <Bars3Icon className="w-6 h-6" aria-hidden="true" />
                </button>

                {/* Global Search */}
                <form onSubmit={handleSearch} className="relative max-w-md w-full">
                  <label htmlFor="admin-search" className="sr-only">
                    Search admin panel
                  </label>
                  <MagnifyingGlassIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-search"
                    type="search"
                    placeholder="Search users, words, discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                    aria-describedby="search-description"
                  />
                  <span id="search-description" className="sr-only">
                    Search across users, dictionary words, and community discussions
                  </span>
                </form>
              </div>

              {/* Right: Quick links and notifications */}
              <div className="flex items-center space-x-2">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-teal-600:text-teal-400 rounded-lg hover:bg-gray-100:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="View public site (opens in new tab)"
                >
                  <GlobeAltIcon className="w-5 h-5" aria-hidden="true" />
                  <span className="hidden sm:inline">View Site</span>
                </a>

                <Link
                  to="/admin/help"
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-teal-600:text-teal-400 rounded-lg hover:bg-gray-100:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Admin help and documentation"
                >
                  <QuestionMarkCircleIcon className="w-5 h-5" aria-hidden="true" />
                  <span className="hidden sm:inline">Help</span>
                </Link>

                {/* Notifications */}
                <button
                  className="relative p-2 text-gray-600 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label={notifications.length > 0 ? `${notifications.length} unread notifications` : 'Notifications'}
                >
                  <BellIcon className="w-6 h-6" aria-hidden="true" />
                  {notifications.length > 0 && (
                    <>
                      <span
                        className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
                        aria-hidden="true"
                      />
                      <span className="sr-only">{notifications.length} unread</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main
            className="flex-1 overflow-y-auto bg-gray-50"
            role="main"
            aria-label="Admin dashboard content"
          >
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
              <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="/users/*" element={<UsersManagement />} />
                <Route path="/words/*" element={<WordsManagement />} />
                <Route path="/discussions/*" element={<DiscussionsManagement />} />
                <Route path="/categories/*" element={<CategoriesAndTags />} />
                <Route path="/reports/*" element={<ReportsAnalytics />} />
                <Route path="/settings/*" element={<AdminSettings />} />
                {/* Fallback for unknown admin routes */}
                <Route
                  path="*"
                  element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                      <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mb-4" aria-hidden="true" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Admin Section Not Found
                      </h2>
                      <p className="text-gray-600 mb-6">
                        The admin section you're looking for doesn't exist.
                      </p>
                      <Link
                        to="/admin"
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        Back to Dashboard
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            role="button"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSidebarOpen(false);
            }}
            aria-label="Close sidebar overlay"
          />
        )}
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
