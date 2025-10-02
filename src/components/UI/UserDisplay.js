import React from 'react';
import {
  CheckBadgeIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/solid';

/**
 * UserDisplay Component
 * Displays username with appropriate verification badges based on user role
 */
const UserDisplay = ({ 
  user, 
  className = '',
  showRole = false,
  size = 'sm' // 'xs', 'sm', 'md', 'lg'
}) => {
  // Determine user information with comprehensive fallback
  const getUserName = (userObj) => {
    if (!userObj) return 'Anonymous';
    
    // Try different possible username fields
    const possibleFields = [
      'author_name',    // From backend: u.username as author_name
      'user_name',      // Legacy field name
      'username',       // Direct username field
      'full_name',      // Full name as fallback
      'name'           // Generic name field
    ];
    
    for (const field of possibleFields) {
      if (userObj[field] && typeof userObj[field] === 'string' && userObj[field].trim() !== '') {
        return userObj[field].trim();
      }
    }
    
    return 'Anonymous';
  };

  const username = getUserName(user);
  const role = user?.author_role || user?.role || 'user';
  
  // Size configurations
  const sizeClasses = {
    xs: {
      text: 'text-xs',
      icon: 'w-3 h-3',
      badge: 'w-3 h-3'
    },
    sm: {
      text: 'text-sm',
      icon: 'w-4 h-4',
      badge: 'w-3.5 h-3.5'
    },
    md: {
      text: 'text-base',
      icon: 'w-5 h-5',
      badge: 'w-4 h-4'
    },
    lg: {
      text: 'text-lg',
      icon: 'w-6 h-6',
      badge: 'w-5 h-5'
    }
  };

  const sizes = sizeClasses[size];

  // Get verification badge based on role
  const getVerificationBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <ShieldCheckIcon 
            className={`${sizes.badge} text-red-500 dark:text-red-400`}
            title="Administrator"
          />
        );
      case 'moderator':
        return (
          <CheckBadgeIcon 
            className={`${sizes.badge} text-green-500 dark:text-green-400`}
            title="Moderator"
          />
        );
      case 'verified':
        return (
          <CheckBadgeIcon 
            className={`${sizes.badge} text-blue-500 dark:text-blue-400`}
            title="Verified User"
          />
        );
      default:
        return null;
    }
  };

  // Get role display text
  const getRoleText = () => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      case 'verified':
        return 'Verified';
      default:
        return null;
    }
  };

  const verificationBadge = getVerificationBadge();
  const roleText = getRoleText();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* User Icon for Anonymous users */}
      {username === 'Anonymous' && (
        <UserIcon className={`${sizes.icon} text-blue-500 dark:text-blue-400`} />
      )}
      
      {/* Username */}
      <span className={`font-medium text-gray-900 dark:text-white ${sizes.text} ${username === 'Anonymous' ? 'text-gray-500 dark:text-gray-400 italic' : ''}`}>
        {username}
      </span>
      
      {/* Verification Badge */}
      {verificationBadge}
      
      {/* Role Text (optional) */}
      {showRole && roleText && (
        <span className={`text-gray-500 dark:text-gray-400 ${sizes.text === 'text-xs' ? 'text-[10px]' : 'text-xs'} font-normal`}>
          ({roleText})
        </span>
      )}
    </div>
  );
};

export default UserDisplay;