import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  LockClosedIcon,
  MapPinIcon,
  CheckBadgeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import {
  CheckCircleIcon as CheckCircleOutlineIcon,
  LockClosedIcon as LockClosedOutlineIcon,
  MapPinIcon as MapPinOutlineIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { discussionsAPI, answersAPI } from '../services/api';

// Import the large components to re-export them
import ReplyForm from './Discussion/ReplyForm';
import ReplyItem from './Discussion/ReplyItem';

/**
 * Consolidated Discussion Components
 * Combined all discussion-related components into a single file
 */

/**
 * BestAnswerBadge Component
 * Shows the "Best Answer" badge and mark button
 */
export const BestAnswerBadge = ({
  isBestAnswer,
  canMarkAsBest,
  onMarkAsBest,
  answerId
}) => {
  if (isBestAnswer) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-md">
        <CheckBadgeIcon className="w-6 h-6" />
        <span className="font-semibold">Best Answer</span>
      </div>
    );
  }

  if (canMarkAsBest && onMarkAsBest) {
    return (
      <button
        onClick={() => onMarkAsBest(answerId)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors group border"
        title="Mark this as the best answer"
      >
        <CheckCircleOutlineIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Mark as Best Answer</span>
      </button>
    );
  }

  return null;
};

/**
 * DiscussionActions Component
 * Shows action badges and buttons for discussion status (solved, pinned, locked)
 */
export const DiscussionActions = ({
  discussion,
  isAuthor,
  isAdmin,
  onToggleSolved,
  onTogglePinned,
  onToggleLocked,
  showSolved = true
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

      {/* Mark as Solved Button */}
      {showSolved && isAuthor && !discussion.is_solved && onToggleSolved && (
        <button
          onClick={onToggleSolved}
          className="inline-flex items-center gap-1 px-3 py-1 bg-white text-gray-700 hover:bg-green-100 hover:text-green-700 rounded-full text-sm font-medium transition-colors border"
          title="Mark this discussion as solved"
        >
          <CheckCircleOutlineIcon className="w-4 h-4" />
          Mark as Solved
        </button>
      )}

      {/* Pinned Badge */}
      {discussion.is_pinned && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <MapPinIcon className="w-4 h-4" />
          Pinned
        </span>
      )}

      {/* Locked Badge */}
      {discussion.is_locked && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <LockClosedIcon className="w-4 h-4" />
          Locked
        </span>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <>
          <button
            onClick={onTogglePinned}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors border ${discussion.is_pinned
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-white text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
              }`}
          >
            {discussion.is_pinned ? (
              <MapPinIcon className="w-4 h-4" />
            ) : (
              <MapPinOutlineIcon className="w-4 h-4" />
            )}
            {discussion.is_pinned ? 'Unpin' : 'Pin'}
          </button>

          <button
            onClick={onToggleLocked}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors border ${discussion.is_locked
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-white text-gray-700 hover:bg-red-100 hover:text-red-700'
              }`}
          >
            {discussion.is_locked ? (
              <LockClosedIcon className="w-4 h-4" />
            ) : (
              <LockClosedOutlineIcon className="w-4 h-4" />
            )}
            {discussion.is_locked ? 'Unlock' : 'Lock'}
          </button>
        </>
      )}
    </div>
  );
};

/**
 * VoteButtons Component
 * Handles upvote/downvote functionality
 */
export const VoteButtons = ({
  itemId,
  itemType = 'discussion',
  initialVoteCount = 0,
  initialUpvotes = 0,
  initialUserVote = null,
  onVoteChange,
  layout = 'horizontal'
}) => {
  const { isAuthenticated } = useAuth();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setVoteCount(initialVoteCount);
    setUserVote(initialUserVote);
  }, [initialVoteCount, initialUserVote]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    const previousVote = userVote;
    const previousCount = voteCount;

    try {
      let newUserVote = voteType;
      let newCount = voteCount;

      if (previousVote === voteType) {
        newUserVote = null;
        newCount = previousVote === 'up' ? voteCount - 1 : voteCount + 1;
      } else if (previousVote === null) {
        newCount = voteType === 'up' ? voteCount + 1 : voteCount - 1;
      } else {
        newCount = voteType === 'up' ? voteCount + 2 : voteCount - 2;
      }

      setUserVote(newUserVote);
      setVoteCount(newCount);

      if (itemType === 'discussion') {
        await discussionsAPI.voteDiscussion(itemId, voteType);
      } else {
        // For answers
        if (newUserVote === null) {
          // Remove vote from answer
          await answersAPI.removeVote(itemId);
        } else {
          // Add/change vote on answer
          await discussionsAPI.voteAnswer(itemId, voteType);
        }
      }

      if (onVoteChange) {
        onVoteChange({
          voteCount: newCount,
          userVote: newUserVote
        });
      }

    } catch (error) {
      setUserVote(previousVote);
      setVoteCount(previousCount);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerClass = layout === 'vertical'
    ? 'flex flex-col items-center gap-1'
    : 'flex items-center gap-2';

  return (
    <div className={containerClass}>
      <button
        onClick={() => handleVote('up')}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors border ${userVote === 'up'
          ? 'bg-green-100 text-green-600'
          : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600'
          } disabled:opacity-50`}
      >
        <ChevronUpIcon className="w-5 h-5" />
      </button>

      <span className={`font-semibold ${voteCount > 0 ? 'text-green-600' :
        voteCount < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
        {voteCount}
      </span>

      <button
        onClick={() => handleVote('down')}
        disabled={isLoading}
        className={`p-2 rounded-full transition-colors border ${userVote === 'down'
          ? 'bg-red-100 text-red-600'
          : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
          } disabled:opacity-50`}
      >
        <ChevronDownIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

/**
 * ImageLightbox Component
 * Simple image lightbox for viewing images
 */
export const ImageLightbox = ({ src, alt, isOpen, onClose }) => {
  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

// Re-export the large components
export { default as ReplyForm } from './Discussion/ReplyForm';
export { default as ReplyItem } from './Discussion/ReplyItem';

// Default exports for backward compatibility
const DiscussionComponents = {
  BestAnswerBadge,
  DiscussionActions,
  VoteButtons,
  ImageLightbox,
  ReplyForm,
  ReplyItem
};

export default DiscussionComponents;