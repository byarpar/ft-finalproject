import React from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, change, changeType, icon: Icon, color = 'teal', alert }) => {
  const colorClasses = {
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const lightColorClasses = {
    teal: 'bg-teal-50 dark:bg-teal-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    orange: 'bg-orange-50 dark:bg-orange-900/20',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
      {/* Background Icon */}
      {Icon && (
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${lightColorClasses[color]} rounded-full opacity-50`}>
          <Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 absolute top-4 left-4" />
        </div>
      )}

      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Alert Badge */}
        {alert && (
          <div className="absolute top-0 right-0">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
              {alert}
            </span>
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>

        {/* Value */}
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {value?.toLocaleString() || 0}
        </p>

        {/* Change Indicator */}
        {change !== undefined && (
          <div className="flex items-center space-x-1">
            {changeType === 'increase' ? (
              <ArrowUpIcon className="w-4 h-4 text-green-500" />
            ) : changeType === 'decrease' ? (
              <ArrowDownIcon className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircleIcon className="w-4 h-4 text-gray-400" />
            )}
            <span
              className={`text-sm font-medium ${changeType === 'increase'
                  ? 'text-green-600 dark:text-green-400'
                  : changeType === 'decrease'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
            >
              {change}% from last period
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
