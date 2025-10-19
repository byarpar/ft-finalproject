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
    teal: 'bg-teal-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 relative overflow-hidden">
      {/* Background Icon */}
      {Icon && (
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${lightColorClasses[color]} rounded-full opacity-50`}>
          <Icon className="w-16 h-16 text-gray-300 absolute top-4 left-4" />
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
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
              {alert}
            </span>
          </div>
        )}

        {/* Title */}
        <p className="text-sm font-medium text-gray-600 mb-1">
          {title}
        </p>

        {/* Value */}
        <p className="text-3xl font-bold text-gray-900 mb-2">
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
                  ? 'text-green-600'
                  : changeType === 'decrease'
                    ? 'text-red-600'
                    : 'text-gray-500'
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
