import React, { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';

// Import admin modules
import DashboardOverview from '../components/admin/DashboardOverview';
import UsersManagement from '../components/admin/UsersManagement';
import WordsManagement from '../components/admin/WordsManagement';
import DiscussionsManagement from '../components/admin/DiscussionsManagement';
import CategoriesAndTags from '../components/admin/CategoriesAndTags';
import ReportsAnalytics from '../components/admin/ReportsAnalytics';
import AdminSettings from '../components/admin/AdminSettings';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [notifications, setNotifications] = useState([]);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      // User is not admin, will be redirected
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, path: '/admin', exact: true },
    { name: 'Users', icon: UsersIcon, path: '/admin/users' },
    { name: 'Words & Definitions', icon: BookOpenIcon, path: '/admin/words' },
    { name: 'Discussions', icon: ChatBubbleLeftRightIcon, path: '/admin/discussions' },
    { name: 'Categories & Tags', icon: TagIcon, path: '/admin/categories' },
    { name: 'Reports & Analytics', icon: ChartBarIcon, path: '/admin/reports' },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/admin/settings' },
  ];

  const isActiveLink = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-teal-700 to-teal-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-teal-600">
            <div className="flex items-center space-x-2">
              <BookOpenIcon className="w-8 h-8" />
              <div>
                <h1 className="text-lg font-bold">Lisu Dictionary</h1>
                <p className="text-xs text-teal-200">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActiveLink(item.path, item.exact);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${active
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'text-teal-100 hover:bg-teal-600/50 hover:text-white'
                    }`}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info at Bottom */}
          <div className="p-4 border-t border-teal-600">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.username || user?.email}</p>
                <p className="text-xs text-teal-200 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left: Menu button and search */}
            <div className="flex items-center space-x-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              {/* Global Search */}
              <div className="relative max-w-md w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, words, discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right: Quick links and notifications */}
            <div className="flex items-center space-x-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <GlobeAltIcon className="w-5 h-5" />
                <span>View Site</span>
              </a>

              <a
                href="/admin/help"
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
                <span>Help</span>
              </a>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <BellIcon className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/users/*" element={<UsersManagement />} />
              <Route path="/words/*" element={<WordsManagement />} />
              <Route path="/discussions/*" element={<DiscussionsManagement />} />
              <Route path="/categories/*" element={<CategoriesAndTags />} />
              <Route path="/reports/*" element={<ReportsAnalytics />} />
              <Route path="/settings/*" element={<AdminSettings />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
