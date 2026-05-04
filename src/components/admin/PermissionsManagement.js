import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheckIcon,
  UsersIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  EnvelopeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { admin } from '../../services/adminAPI';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  discussions: ChatBubbleLeftRightIcon,
  answers: ChatBubbleOvalLeftEllipsisIcon,
  messaging: EnvelopeIcon,
  notifications: BellIcon,
  profile: UserCircleIcon,
  admin: Cog6ToothIcon,
};

const ROLE_COLORS = {
  user: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', accent: 'bg-blue-500', light: 'bg-blue-50' },
  moderator: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', accent: 'bg-amber-500', light: 'bg-amber-50' },
  admin: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', accent: 'bg-teal-500', light: 'bg-teal-50' },
};

const ROLE_ICONS = {
  user: UserIcon,
  moderator: ShieldCheckIcon,
  admin: WrenchScrewdriverIcon,
};

/**
 * PermissionsManagement Component
 * Displays role-based permissions matrix for the admin dashboard
 */
const PermissionsManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'matrix'
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await admin.getPermissions();
      const data = response.data?.roles || response.roles || [];
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions');
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const toggleCategory = (roleId, category) => {
    const key = `${roleId}-${category}`;
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPermissionStats = (role) => {
    let total = 0, allowed = 0;
    Object.values(role.permissions).forEach(cat => {
      cat.actions.forEach(action => {
        total++;
        if (action.allowed) allowed++;
      });
    });
    return { total, allowed, percentage: Math.round((allowed / total) * 100) };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-96 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="h-4 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <ShieldCheckIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load permissions</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchPermissions}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4 inline mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  const activeRole = roles.find(r => r.id === selectedRole) || roles[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheckIcon className="w-7 h-7 text-teal-600" />
            Permissions
          </h1>
          <p className="text-gray-500 mt-1">
            Role-based access control overview — {roles.length} roles configured
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'cards'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'matrix'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Matrix
            </button>
          </div>
          <button
            onClick={fetchPermissions}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map(role => {
          const stats = getPermissionStats(role);
          const colors = ROLE_COLORS[role.id] || ROLE_COLORS.user;
          const RoleIcon = ROLE_ICONS[role.id] || ShieldCheckIcon;

          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`text-left bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${selectedRole === role.id
                ? `${colors.border} shadow-md`
                : 'border-gray-200'
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${colors.accent}`}>
                    <RoleIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{role.name}</h3>
                    <p className="text-xs text-gray-500">Level {role.level}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors.bg} ${colors.text}`}>
                  {role.count} users
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{role.description}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.accent} rounded-full transition-all duration-500`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {stats.allowed}/{stats.total}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Permissions Detail */}
      {viewMode === 'cards' ? (
        /* Card View - Single Role Detail */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${ROLE_COLORS[activeRole?.id]?.accent || 'bg-gray-500'}`}>
                {(() => { const RIcon = ROLE_ICONS[activeRole?.id] || ShieldCheckIcon; return <RIcon className="w-5 h-5 text-white" />; })()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {activeRole?.name} Permissions
                </h2>
                <p className="text-sm text-gray-500">{activeRole?.description}</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {activeRole && Object.entries(activeRole.permissions).map(([key, category]) => {
              const expanded = expandedCategories[`${activeRole.id}-${key}`] !== false;
              const Icon = CATEGORY_ICONS[key] || ShieldCheckIcon;
              const allowedCount = category.actions.filter(a => a.allowed).length;

              return (
                <div key={key}>
                  <button
                    onClick={() => toggleCategory(activeRole.id, key)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold text-gray-900">{category.label}</span>
                      <span className="text-xs text-gray-400">
                        {allowedCount}/{category.actions.length} enabled
                      </span>
                    </div>
                    {expanded
                      ? <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      : <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    }
                  </button>

                  {expanded && (
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {category.actions.map((action, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${action.allowed
                              ? 'bg-green-50 text-green-800'
                              : 'bg-gray-50 text-gray-400'
                              }`}
                          >
                            {action.allowed
                              ? <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                              : <XCircleIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            }
                            <span className={!action.allowed ? 'line-through' : ''}>
                              {action.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Matrix View - All Roles Comparison */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Permissions Matrix</h2>
            <p className="text-sm text-gray-500">Compare permissions across all roles</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky left-0 z-10 min-w-[240px]">
                    Permission
                  </th>
                  {roles.map(role => {
                    const colors = ROLE_COLORS[role.id] || ROLE_COLORS.user;
                    return (
                      <th key={role.id} className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                            {role.name}
                          </span>
                          <span className="text-gray-400 normal-case font-normal flex items-center gap-1">
                            <UsersIcon className="w-3 h-3" /> {role.count}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roles[0] && Object.entries(roles[0].permissions).map(([catKey, category]) => {
                  const Icon = CATEGORY_ICONS[catKey] || ShieldCheckIcon;

                  return (
                    <React.Fragment key={catKey}>
                      {/* Category Header Row */}
                      <tr className="bg-gray-50">
                        <td
                          colSpan={1 + roles.length}
                          className="px-6 py-2.5 text-sm font-semibold text-gray-700"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-400" />
                            {category.label}
                          </div>
                        </td>
                      </tr>
                      {/* Permission Rows */}
                      {category.actions.map((action, actionIdx) => (
                        <tr key={`${catKey}-${actionIdx}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-2.5 text-sm text-gray-700 bg-white sticky left-0 z-10 border-r border-gray-100">
                            {action.name}
                          </td>
                          {roles.map(role => {
                            const roleAction = role.permissions[catKey]?.actions[actionIdx];
                            const allowed = roleAction?.allowed || false;

                            return (
                              <td key={role.id} className="px-4 py-2.5 text-center">
                                {allowed ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" />
                                ) : (
                                  <XCircleIcon className="w-5 h-5 text-gray-200 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Hierarchy Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-teal-600" />
          Role Hierarchy
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Higher roles inherit all permissions from lower roles. Each role level builds upon the previous one.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {roles.map((role, idx) => {
            const colors = ROLE_COLORS[role.id] || ROLE_COLORS.user;
            return (
              <React.Fragment key={role.id}>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${colors.border} ${colors.light}`}>
                  {(() => { const RIcon = ROLE_ICONS[role.id] || ShieldCheckIcon; return <RIcon className={`w-4 h-4 ${colors.text}`} />; })()}
                  <span className={`text-sm font-semibold ${colors.text}`}>{role.name}</span>
                  <span className="text-xs text-gray-400">Lv.{role.level}</span>
                </div>
                {idx < roles.length - 1 && (
                  <ChevronRightIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
