import React, { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PhotoIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import ResponsiveImage from '../UI/ResponsiveImage';
import UserDisplay from '../UI/UserDisplay';
import SaveButton from '../UI/SaveButton';
import ShareButton from '../UI/ShareButton';
import LikeButton from '../UI/LikeButton';
import { getImageUrl } from '../../utils/imageUtils';

// Simple time ago function to replace date-fns
const timeAgo = (date) => {
  if (!date) return 'Unknown date';

  try {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return new Date(date).toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
};

const DiscussionCard = ({
  discussion,
  currentUser,
  onEdit,
  onDelete,
  onReport,
  viewMode = 'card'
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onEdit) {
      onEdit(discussion);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(discussion.id);
    }
  };

  const handleReport = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onReport) {
      onReport(discussion.id);
    }
  };

  // Check if current user can edit/delete this discussion
  const canEdit = currentUser && (
    currentUser.id === discussion.author_id ||
    currentUser.id === discussion.user_id ||
    currentUser.role === 'admin' ||
    currentUser.role === 'moderator'
  );

  const renderOptionsMenu = () => {
    if (!currentUser) return null;

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleMenuClick}
          className="p-2 text-gray-400 rounded-full touch-safe"
          style={{ touchAction: 'manipulation' }}
          title="More options"
        >
          <EllipsisHorizontalIcon className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-36">
            {canEdit && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 touch-safe"
                  style={{ touchAction: 'manipulation' }}
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 touch-safe"
                  style={{ touchAction: 'manipulation' }}
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
                {(canEdit || currentUser) && <div className="border-t border-gray-100 dark:border-gray-700 my-1" />}
              </>
            )}
            <button
              onClick={handleReport}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm text-orange-600 dark:text-orange-400 touch-safe"
              style={{ touchAction: 'manipulation' }}
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              Report
            </button>
          </div>
        )}
      </div>
    );
  }; const renderImages = () => {
    if (!discussion.images || discussion.images.length === 0) {
      return null;
    }

    const images = discussion.images;
    const imageCount = images.length;

    // Helper function to get image source
    const getImageSrc = (image) => {
      if (!image) return '';
      // Handle different image formats
      if (typeof image === 'string') return getImageUrl(image);
      if (image.url) return getImageUrl(image.url);
      if (image.src) return getImageUrl(image.src);
      if (image.data) return getImageUrl(image);
      return getImageUrl(image);
    };

    // Helper function to get image alt text
    const getImageAlt = (image, defaultAlt = 'Discussion image') => {
      if (!image) return defaultAlt;
      if (typeof image === 'object' && image.alt) return image.alt;
      return defaultAlt;
    };

    if (viewMode === 'compact' || viewMode === 'list') {
      return (
        <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          <ResponsiveImage
            src={getImageSrc(images[0])}
            alt={getImageAlt(images[0])}
            className="w-full h-full object-cover"
          />
          {imageCount > 1 && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xs font-semibold">
              +{imageCount - 1}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="mt-3">
        {imageCount === 1 && (
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <ResponsiveImage
              src={getImageSrc(images[0])}
              alt={getImageAlt(images[0])}
              className="w-full h-64 object-cover touch-safe"
              style={{ touchAction: 'manipulation' }}
            />
          </div>
        )}

        {imageCount === 2 && (
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {images.slice(0, 2).map((image, index) => (
              <div key={index} className="relative bg-gray-100 aspect-square">
                <ResponsiveImage
                  src={getImageSrc(image)}
                  alt={getImageAlt(image, `Discussion image ${index + 1}`)}
                  className="w-full h-full object-cover touch-safe"
                  style={{ touchAction: 'manipulation' }}
                />
              </div>
            ))}
          </div>
        )}

        {imageCount === 3 && (
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            <div className="relative bg-gray-100 row-span-2">
              <ResponsiveImage
                src={getImageSrc(images[0])}
                alt={getImageAlt(images[0], 'Discussion image 1')}
                className="w-full h-full object-cover touch-safe"
                style={{ touchAction: 'manipulation' }}
              />
            </div>
            <div className="grid grid-rows-2 gap-2">
              {images.slice(1, 3).map((image, index) => (
                <div key={index + 1} className="relative bg-gray-100 aspect-square">
                  <ResponsiveImage
                    src={getImageSrc(image)}
                    alt={getImageAlt(image, `Discussion image ${index + 2}`)}
                    className="w-full h-full object-cover touch-safe"
                    style={{ touchAction: 'manipulation' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {imageCount >= 4 && (
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
            {images.slice(0, 3).map((image, index) => (
              <div key={index} className="relative bg-gray-100 aspect-square">
                <ResponsiveImage
                  src={getImageSrc(image)}
                  alt={getImageAlt(image, `Discussion image ${index + 1}`)}
                  className="w-full h-full object-cover touch-safe"
                  style={{ touchAction: 'manipulation' }}
                />
              </div>
            ))}
            <div className="relative bg-gray-100 aspect-square">
              <ResponsiveImage
                src={getImageSrc(images[3])}
                alt={getImageAlt(images[3], 'Discussion image 4')}
                className="w-full h-full object-cover"
              />
              {imageCount > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <div className="text-white text-center">
                    <PhotoIcon className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-lg font-bold">+{imageCount - 4}</span>
                    <p className="text-xs">more photos</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div
        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200"
      >
        {renderImages()}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
              {discussion.title}
            </h3>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {timeAgo(discussion.created_at || discussion.createdAt)}
              </span>
              {renderOptionsMenu()}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <UserDisplay
              user={{
                author_name: discussion.author_name,
                author_role: discussion.author_role,
                username: discussion.author?.username,
                role: discussion.author?.role
              }}
              size="sm"
              className="text-gray-700 dark:text-gray-300"
            />
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
            {discussion.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                {discussion.answers_count || discussion.answerCount || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <LikeButton discussion={discussion} currentUser={currentUser} />
              <SaveButton discussion={discussion} currentUser={currentUser} />
              <ShareButton discussion={discussion} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'compact') {
    return (
      <div
        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200"
      >
        {renderImages()}

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 mb-1">
            {discussion.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <UserDisplay
              user={{
                author_name: discussion.author_name,
                author_role: discussion.author_role,
                username: discussion.author?.username,
                role: discussion.author?.role
              }}
              size="xs"
              className="text-gray-600 dark:text-gray-400"
            />
            <span>{discussion.answers_count || discussion.answerCount || 0} answers</span>
            <span>{timeAgo(discussion.created_at || discussion.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {renderOptionsMenu()}
        </div>
      </div>
    );
  }

  // Default card view
  return (
    <div
      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl lg:rounded-2xl p-6 touch-safe"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {discussion.author?.avatar ? (
            <img
              src={discussion.author.avatar}
              alt={discussion.author_name || discussion.author?.username || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {(discussion.author_name || discussion.author?.username)?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <UserDisplay
              user={{
                author_name: discussion.author_name,
                author_role: discussion.author_role,
                username: discussion.author?.username,
                role: discussion.author?.role
              }}
              size="sm"
              className="font-medium"
            />
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-4 h-4" />
              {timeAgo(discussion.created_at || discussion.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {discussion.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {discussion.category.name}
            </span>
          )}
          {renderOptionsMenu()}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {discussion.title}
      </h3>

      <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
        {discussion.content}
      </p>

      {/* Images */}
      {renderImages()}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            {discussion.answers_count || discussion.answerCount || 0} answers
          </span>
        </div>

        <div className="flex items-center gap-2">
          <LikeButton discussion={discussion} currentUser={currentUser} />
          <SaveButton discussion={discussion} currentUser={currentUser} />
          <ShareButton discussion={discussion} />
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;
