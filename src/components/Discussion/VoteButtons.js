import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { ArrowUpIcon as ArrowUpSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { discussionsAPI } from '../../services/api';

const VoteButtons = ({
  itemId,
  itemType = 'discussion', // 'discussion' or 'answer'
  initialVoteCount = 0,
  initialUpvotes = 0,
  initialUserVote = null,
  onVoteChange
}) => {
  const { isAuthenticated } = useAuth();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState(initialUserVote); // 'upvote', 'downvote', or null
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setVoteCount(initialVoteCount);
    setUpvotes(initialUpvotes);
    setUserVote(initialUserVote);
  }, [initialVoteCount, initialUpvotes, initialUserVote]);

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    // Save previous state for error recovery
    const previousVote = userVote;
    const previousCount = voteCount;
    const previousUpvotes = upvotes;

    try {
      // Optimistic update

      // Calculate new counts (upvote only)
      let newCount = voteCount;
      let newUpvotes = upvotes;
      let newUserVote = 'upvote';

      if (previousVote === 'upvote') {
        // Removing vote
        newUserVote = null;
        newCount -= 1;
        newUpvotes -= 1;
      } else {
        // Adding vote
        newCount += 1;
        newUpvotes += 1;
      }

      // Update UI immediately
      setUserVote(newUserVote);
      setVoteCount(newCount);
      setUpvotes(newUpvotes);

      // Make API call
      const endpoint = itemType === 'discussion'
        ? discussionsAPI.voteDiscussion
        : discussionsAPI.voteAnswer;

      const response = await endpoint(itemId, 'upvote');

      // Update with server response
      if (response.data) {
        setVoteCount(response.data.vote_count);
        setUpvotes(response.data.upvotes);
        setUserVote(response.data.vote_type);

        if (onVoteChange) {
          onVoteChange(response.data);
        }
      }

    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote. Please try again.');

      // Revert on error
      setUserVote(previousVote);
      setVoteCount(previousCount);
      setUpvotes(previousUpvotes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 ${userVote === 'upvote'
        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      title={userVote === 'upvote' ? 'Remove vote' : 'Vote'}
      aria-label={userVote === 'upvote' ? 'Remove vote' : 'Vote'}
    >
      {/* Vote Icon */}
      {userVote === 'upvote' ? (
        <ArrowUpSolid className="h-5 w-5" />
      ) : (
        <ArrowUpIcon className="h-5 w-5" />
      )}

      {/* Vote Count */}
      <span className="text-sm font-medium">
        {upvotes}
      </span>
    </button>
  );
};

export default VoteButtons;
