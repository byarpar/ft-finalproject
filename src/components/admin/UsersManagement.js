import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import admin from '../../services/adminAPI';
import { Pagination } from '../UIComponents';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const UsersManagement = () => {
  return (
    <Routes>
      <Route path="/" element={<UsersList />} />
      <Route path="/:userId" element={<UserDetail />} />
    </Routes>
  );
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await admin.getDashboardStats();
      const d = res?.data?.dashboard?.overview || {};
      setStats(d);
    } catch (e) { /* non-critical */ }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };

      const response = await admin.getAllUsers(params);

      if (response.success) {
        const users = response.data?.users || response.users || [];
        setUsers(users);
        const pagination = response.metadata?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || pagination.total_pages || 1);
        setTotalUsers(pagination.total || pagination.total_users || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set empty state on error
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await admin.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await admin.updateUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await admin.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="app-title text-2xl text-gray-900 mb-1">Users Management</h1>
        <p className="app-subtitle text-sm text-gray-500">Manage user accounts, roles, and permissions</p>
      </div>

      {/* Stat tiles */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-lg"><UserCircleIcon className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-gray-500">Total Users</p><p className="text-xl font-bold text-gray-900">{Number(stats.total_users || 0).toLocaleString()}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg"><CheckCircleIcon className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-gray-500">Active</p><p className="text-xl font-bold text-gray-900">{Number(stats.active_users || 0).toLocaleString()}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-gray-400 rounded-lg"><XCircleIcon className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-gray-500">Inactive</p><p className="text-xl font-bold text-gray-900">{Number(stats.inactive_users || 0).toLocaleString()}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg"><ClockIcon className="w-5 h-5 text-white" /></div>
            <div><p className="text-xs text-gray-500">New Today</p><p className="text-xl font-bold text-gray-900">{Number(stats.new_users_24h || 0).toLocaleString()}</p></div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50:bg-gray-700 text-gray-700"
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {users.length} of {totalUsers} users
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <UserCircleIcon className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profile_photo_url ? (
                          <img
                            src={user.profile_photo_url}
                            alt={user.username || user.email || 'User'}
                            className="avatar-unified"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="avatar-unified bg-teal-500 text-white font-medium"
                          style={{ display: user.profile_photo_url ? 'none' : 'flex' }}
                        >
                          {(user.username || user.email)?.[0]?.toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.username || 'N/A'}
                          </p>
                          {user.full_name && (
                            <p className="text-xs text-gray-500">
                              {user.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 capitalize"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {user.is_active ? (
                          <>
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/users/${user.id}`}
                          className="text-teal-600 hover:text-teal-900:text-teal-300"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900:text-red-300"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await admin.getUser(userId);
      const d = res?.data || res;
      setData(d);
      setRole(d?.user?.role || 'user');
      setIsActive(d?.user?.is_active ?? true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        admin.updateUserRole(userId, role),
        admin.updateUserStatus(userId, isActive),
      ]);
      await load();
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await admin.deleteUser(userId);
      navigate('/admin/users');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-gray-100 rounded" />
      <div className="h-40 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
      <ExclamationTriangleIcon className="w-6 h-6 text-red-500 shrink-0" />
      <div>
        <p className="font-medium text-red-800">Failed to load user</p>
        <p className="text-sm text-red-600">{error}</p>
      </div>
      <button onClick={load} className="ml-auto text-sm text-red-700 flex items-center gap-1">
        <ArrowPathIcon className="w-4 h-4" /> Retry
      </button>
    </div>
  );

  const user = data?.user || {};
  const stats = data?.stats || {};
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString() : '—';
  const lastLogin = user.last_login ? new Date(user.last_login).toLocaleString() : 'Never';

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start">
        {user.profile_photo_url
          ? <img src={user.profile_photo_url} alt={user.username} className="avatar-unified shrink-0" />
          : <div className="avatar-unified bg-teal-500 text-white text-2xl font-bold shrink-0">
            {(user.username || '?')[0].toUpperCase()}
          </div>
        }
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900">{user.username || '—'}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.bio && <p className="text-sm text-gray-600 mt-2">{user.bio}</p>}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            <span>Joined: {joined}</span>
            <span>Last login: {lastLogin}</span>
            {user.location && <span>📍 {user.location}</span>}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <DocumentTextIcon className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.discussionsStarted || 0}</p>
          <p className="text-xs text-gray-500">Discussions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.answersPosted || 0}</p>
          <p className="text-xs text-gray-500">Answers</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <ShieldCheckIcon className="w-6 h-6 text-teal-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.reputation || 0}</p>
          <p className="text-xs text-gray-500">Reputation</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{stats.favoritesCount || 0}</p>
          <p className="text-xs text-gray-500">Favorites</p>
        </div>
      </div>

      {/* Edit Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Edit Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
            >
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={isActive ? 'active' : 'inactive'}
              onChange={e => setIsActive(e.target.value === 'active')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersManagement;
