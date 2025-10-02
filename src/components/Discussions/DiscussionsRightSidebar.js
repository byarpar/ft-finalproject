import React, { memo } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const DiscussionsRightSidebar = memo(({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  layoutMode,
  onLayoutModeChange,
  stats,
  recentActivity,
  currentUser
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: ArrowDownIcon },
    { value: 'oldest', label: 'Oldest First', icon: ArrowUpIcon },
    { value: 'most_answers', label: 'Most Answers', icon: ChatBubbleLeftRightIcon },
    { value: 'trending', label: 'Trending', icon: FireIcon }
  ];

  const viewOptions = [
    { value: 'card', label: 'Card View', icon: Squares2X2Icon },
    { value: 'list', label: 'List View', icon: ListBulletIcon },
    { value: 'compact', label: 'Compact View', icon: TableCellsIcon }
  ];

  const layoutOptions = [
    { value: 'full', label: 'Full Width' },
    { value: 'left', label: 'Left Sidebar' },
    { value: 'dual', label: 'Dual Sidebar' }
  ];

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Activity Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Activity Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded border border-blue-100 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.total || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded border border-blue-100 dark:border-blue-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats?.todayCount || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Today</div>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded border border-blue-100 dark:border-blue-800">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.weekCount || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
            </div>
            <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded border border-blue-100 dark:border-blue-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats?.activeUsers || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Sort By</h3>
          </div>
          <div className="space-y-2">
            {sortOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onSortChange(option.value)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200
                    ${sortBy === option.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <EyeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">View Mode</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {viewOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onViewModeChange(option.value)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200
                    ${viewMode === option.value
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Mode */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Squares2X2Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Layout</h3>
          </div>
          <div className="space-y-2">
            {layoutOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onLayoutModeChange(option.value)}
                className={`
                  w-full flex items-center justify-center px-3 py-2 rounded-md text-sm transition-all duration-200
                  ${layoutMode === option.value
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity && recentActivity.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <ClockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserGroupIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.user}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <CalendarIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {currentUser && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200">
                View My Discussions
              </button>
              <button className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200">
                Saved Discussions
              </button>
              <button className="w-full px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200">
                My Activity
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Guidelines</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Be respectful and constructive</p>
            <p>• Search before posting</p>
            <p>• Use clear, descriptive titles</p>
            <p>• Tag your posts appropriately</p>
          </div>
          <button className="mt-3 w-full px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-md text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors duration-200">
            View Full Guidelines
          </button>
        </div>

      </div>
    </div>
  );
});

DiscussionsRightSidebar.displayName = 'DiscussionsRightSidebar';

export default DiscussionsRightSidebar;