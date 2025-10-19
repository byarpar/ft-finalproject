import React from 'react';
import {
  CheckCircleIcon,
  LockClosedIcon,
  MapPinIcon,
} from '@heroicons/react/24/solid';
import {
  CheckCircleIcon as CheckCircleOutlineIcon,
  LockClosedIcon as LockClosedOutlineIcon,
  MapPinIcon as MapPinOutlineIcon,
} from '@heroicons/react/24/outline';

/**
 * DiscussionActions Component
 * Shows action badges and buttons for discussion status (solved, pinned, locked)
 */
const DiscussionActions = ({
  discussion,
  isAuthor,
  isAdmin,
  onToggleSolved,
  onTogglePinned,
  onToggleLocked,
  showSolved = true // New prop to control solved button visibility
}) => {
  if (!discussion) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Solved Badge/Button */}
      {showSolved && discussion.is_solved && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <CheckCircleIcon className="w-4 h-4" />
          Solved
        </span>
      )}

      {/* Mark as Solved Button (Only for discussion author) */}
      {showSolved && isAuthor && !discussion.is_solved && onToggleSolved && (
        <button
          onClick={onToggleSolved}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 hover:bg-green-100:bg-green-900/30 hover:text-green-700:text-green-400 rounded-full text-sm font-medium transition-colors"
          title="Mark this discussion as solved"
        >
          <CheckCircleOutlineIcon className="w-4 h-4" />
          Mark as Solved
        </button>
      )}

      {/* Pinned Badge */}
      {discussion.is_pinned && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <MapPinIcon className="w-4 h-4" />
          Pinned
        </span>
      )}

      {/* Pin/Unpin Button (Admin only) */}
      {isAdmin && onTogglePinned && (
        <button
          onClick={onTogglePinned}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${discussion.is_pinned
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200:bg-blue-900/50'
            : 'bg-gray-100 text-gray-700 hover:bg-blue-100:bg-blue-900/30 hover:text-blue-700:text-blue-400'
            }`}
          title={discussion.is_pinned ? 'Unpin discussion' : 'Pin discussion to top'}
        >
          {discussion.is_pinned ? (
            <MapPinIcon className="w-4 h-4" />
          ) : (
            <MapPinOutlineIcon className="w-4 h-4" />
          )}
          {discussion.is_pinned ? 'Unpin' : 'Pin'}
        </button>
      )}

      {/* Locked Badge */}
      {discussion.is_locked && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <LockClosedIcon className="w-4 h-4" />
          Locked
        </span>
      )}

      {/* Lock/Unlock Button (Admin only) */}
      {isAdmin && onToggleLocked && (
        <button
          onClick={onToggleLocked}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${discussion.is_locked
            ? 'bg-red-100 text-red-700 hover:bg-red-200:bg-red-900/50'
            : 'bg-gray-100 text-gray-700 hover:bg-red-100:bg-red-900/30 hover:text-red-700:text-red-400'
            }`}
          title={discussion.is_locked ? 'Unlock discussion to allow replies' : 'Lock discussion to prevent new replies'}
        >
          {discussion.is_locked ? (
            <LockClosedIcon className="w-4 h-4" />
          ) : (
            <LockClosedOutlineIcon className="w-4 h-4" />
          )}
          {discussion.is_locked ? 'Unlock' : 'Lock'}
        </button>
      )}
    </div>
  );
};

export default DiscussionActions;
