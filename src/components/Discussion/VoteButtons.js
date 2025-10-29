import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { discussionsAPI } from '../../services/api';

const VoteButtons = ({
  itemId,
  itemType = 'discussion', // 'discussion' or 'answer'
  initialVoteCount = 0,
  initialUpvotes = 0,
  initialUserVote = null,
  onVoteChange,
  layout = 'horizontal' // 'horizontal' or 'vertical'
}) => {
  const { isAuthenticated } = useAuth();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userVote, setUserVote] = useState(initialUserVote); // 'up', 'down', or null
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

    // Save previous state for error recovery
    const previousVote = userVote;
    const previousCount = voteCount;

    try {
      // Optimistic update
      let newUserVote = voteType;
      let newCount = voteCount;

      if (previousVote === voteType) {
        // Removing vote
        newUserVote = null;
        newCount = previousVote === 'up' ? voteCount - 1 : voteCount + 1;
      } else if (previousVote === null) {
        // Adding new vote
        newCount = voteType === 'up' ? voteCount + 1 : voteCount - 1;
      } else {
        // Changing vote from up to down or vice versa
        newCount = voteType === 'up' ? voteCount + 2 : voteCount - 2;
      }

      // Update UI immediately
      setUserVote(newUserVote);
      setVoteCount(newCount);

      // Make API call
      const endpoint = itemType === 'discussion'
        ? discussionsAPI.voteDiscussion
        : discussionsAPI.voteAnswer;

      const response = await endpoint(itemId, voteType);

      // Update with server response
      if (response.data) {
        const serverVoteCount = response.data.vote_count;
        const serverUserVote = response.data.action === 'removed' ? null : voteType;

        setVoteCount(serverVoteCount);
        setUserVote(serverUserVote);

        if (onVoteChange) {
          onVoteChange({
            vote_count: serverVoteCount,
            user_vote: serverUserVote
          });
        }

        // Show appropriate message
        if (response.data.action === 'removed') {
          toast.success('Vote removed');
        } else if (response.data.action === 'updated') {
          toast.success(`Changed to ${voteType === 'up' ? 'upvote' : 'downvote'}`);
        } else {
          toast.success(`${voteType === 'up' ? 'Upvoted' : 'Downvoted'} successfully`);
        }
      }

    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote. Please try again.');

      // Revert on error
      setUserVote(previousVote);
      setVoteCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  };

  if (layout === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => handleVote('up')}
          disabled={isLoading}
          className={`p-1.5 rounded hover:bg-teal-50 transition-colors ${userVote === 'up' ? 'text-teal-600' : 'text-gray-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Upvote"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </button>
        <div className={`text-lg font-bold ${userVote === 'up' ? 'text-teal-600' :
          userVote === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
          {voteCount !== undefined ? voteCount : 0}
        </div>
        <button
          onClick={() => handleVote('down')}
          disabled={isLoading}
          className={`p-1.5 rounded hover:bg-red-50 transition-colors ${userVote === 'down' ? 'text-red-600' : 'text-gray-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Downvote"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
          </svg>
        </button>
      </div>
    );
  }

  // Default horizontal layout
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote('up')}
        disabled={isLoading}
        className={`p-1.5 rounded hover:bg-teal-50 transition-colors ${userVote === 'up' ? 'text-teal-600' : 'text-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Upvote"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      </button>
      <span className={`font-medium min-w-[20px] text-center text-sm ${userVote === 'up' ? 'text-teal-600' :
        userVote === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
        {voteCount !== undefined ? voteCount : 0}
      </span>
      <button
        onClick={() => handleVote('down')}
        disabled={isLoading}
        className={`p-1.5 rounded hover:bg-red-50 transition-colors ${userVote === 'down' ? 'text-red-600' : 'text-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Downvote"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
      </button>
    </div>
  );
};

export default VoteButtons;
