import React, { memo } from 'react';
import {
  GlobeAltIcon,
  AcademicCapIcon,
  BookOpenIcon,
  TagIcon,
  UserGroupIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const DiscussionsSidebar = memo(({
  categories,
  selectedCategory,
  onCategoryChange,
  currentUser,
  stats
}) => {
  const getCategoryIcon = (iconName) => {
    const iconMap = {
      GlobeAltIcon: GlobeAltIcon,
      AcademicCapIcon: AcademicCapIcon,
      BookOpenIcon: BookOpenIcon,
      TagIcon: TagIcon,
      UserGroupIcon: UserGroupIcon,
      ChartBarIcon: ChartBarIcon,
      FireIcon: FireIcon,
      ClockIcon: ClockIcon,
      StarIcon: StarIcon
    };

    return iconMap[iconName] || GlobeAltIcon;
  };

  const getCategoryColor = (color) => {
    const colorMap = {
      '#9CA3AF': 'text-gray-500',
      '#60A5FA': 'text-blue-500',
      '#34D399': 'text-green-500',
      '#FBBF24': 'text-yellow-500',
      '#A78BFA': 'text-purple-500',
      '#F87171': 'text-red-500',
      '#FB7185': 'text-pink-500',
      '#38BDF8': 'text-sky-500'
    };

    return colorMap[color] || 'text-gray-500';
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Discussions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask questions and share knowledge with the community
          </p>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.icon);
              const isSelected = selectedCategory === category.id;
              const colorClass = getCategoryColor(category.color);

              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200
                    ${isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : colorClass}`} />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${isSelected
                      ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {stats?.[category.id] || category.count || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Questions</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Object.values(stats || {}).reduce((sum, count) => sum + count, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Your Questions</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser ? '0' : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <TagIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Popular Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['grammar', 'vocabulary', 'pronunciation', 'culture', 'translation'].map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Guidelines</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>• Be respectful and constructive</p>
            <p>• Search before posting</p>
            <p>• Use clear, descriptive titles</p>
            <p>• Tag your posts appropriately</p>
          </div>
          <button className="mt-3 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors">
            View Full Guidelines →
          </button>
        </div>

        {/* Help Section */}
        {!currentUser && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Join the Community</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Sign in to ask questions, share knowledge, and connect with fellow learners.
            </p>
            <button className="w-full px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-md text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors">
              Sign In to Participate
            </button>
          </div>
        )}

      </div>
    </div>
  );
});

DiscussionsSidebar.displayName = 'DiscussionsSidebar';

export default DiscussionsSidebar;
