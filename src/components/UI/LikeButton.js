import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useMutation, useQueryClient } from 'react-query';
import { discussionsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const LikeButton = ({ discussion, currentUser, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Check if user has liked this discussion
  const isLiked = discussion.is_liked || false;
  const likeCount = discussion.like_count || 0;

  // Optimistic update helper
  const updateDiscussionInCache = (discussionId, updates) => {
    // Update all discussions queries
    queryClient.setQueriesData(['discussions'], (oldData) => {
      if (!oldData?.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map(page => ({
          ...page,
          discussions: (page.discussions || []).map(d =>
            d.id === discussionId ? { ...d, ...updates } : d
          )
        }))
      };
    });

    // Update specific discussion query if it exists
    queryClient.setQueryData(['discussion', discussionId], (oldData) => {
      if (!oldData) return oldData;
      return { ...oldData, ...updates };
    });
  };

  // Like mutation with optimistic updates
  const likeMutation = useMutation(
    (discussionId) => discussionsAPI.likeDiscussion(discussionId),
    {
      onMutate: async (discussionId) => {
        setIsLoading(true);

        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['discussions']);

        // Snapshot the previous value
        const previousData = queryClient.getQueriesData(['discussions']);

        // Optimistically update
        updateDiscussionInCache(discussionId, {
          is_liked: true,
          like_count: likeCount + 1
        });

        return { previousData, discussionId };
      },
      onSuccess: (data, discussionId) => {
        // Update with server response
        if (data?.data) {
          updateDiscussionInCache(discussionId, {
            is_liked: data.data.is_liked,
            like_count: data.data.like_count
          });
        }
        toast.success('Discussion liked!', {
          icon: '❤️',
          duration: 2000
        });
      },
      onError: (error, discussionId, context) => {
        // Revert optimistic update
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }

        const errorMessage = error.response?.data?.error?.message ||
          error.response?.data?.error ||
          'Failed to like discussion';
        toast.error(errorMessage);
      },
      onSettled: () => {
        setIsLoading(false);
        // Invalidate and refetch discussions to ensure consistency
        queryClient.invalidateQueries(['discussions']);
      }
    }
  );

  // Unlike mutation with optimistic updates
  const unlikeMutation = useMutation(
    (discussionId) => discussionsAPI.unlikeDiscussion(discussionId),
    {
      onMutate: async (discussionId) => {
        setIsLoading(true);

        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['discussions']);

        // Snapshot the previous value
        const previousData = queryClient.getQueriesData(['discussions']);

        // Optimistically update
        updateDiscussionInCache(discussionId, {
          is_liked: false,
          like_count: Math.max(likeCount - 1, 0)
        });

        return { previousData, discussionId };
      },
      onSuccess: (data, discussionId) => {
        // Update with server response
        if (data?.data) {
          updateDiscussionInCache(discussionId, {
            is_liked: data.data.is_liked,
            like_count: data.data.like_count
          });
        }
        toast.success('Discussion unliked', {
          duration: 2000
        });
      },
      onError: (error, discussionId, context) => {
        // Revert optimistic update
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }

        const errorMessage = error.response?.data?.error?.message ||
          error.response?.data?.error ||
          'Failed to unlike discussion';
        toast.error(errorMessage);
      },
      onSettled: () => {
        setIsLoading(false);
        // Invalidate and refetch discussions to ensure consistency
        queryClient.invalidateQueries(['discussions']);
      }
    }
  );

  const handleLikeToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('Please login to like discussions');
      return;
    }

    if (isLoading) return;

    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync(discussion.id);
      } else {
        await likeMutation.mutateAsync(discussion.id);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Like toggle error:', error);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading || !currentUser}
      className={`
        group flex items-center gap-1 px-2 py-1 text-sm font-medium 
        transition-all duration-200 rounded-md cursor-pointer
        ${isLiked
          ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300'
          : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
        }
        ${!currentUser ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 dark:hover:bg-red-900/20'}
        ${isLoading ? 'opacity-50 cursor-wait' : ''}
        ${className}
      `}
      title={
        !currentUser
          ? 'Please login to like discussions'
          : isLiked
            ? 'Unlike this discussion'
            : 'Like this discussion'
      }
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isLiked ? (
        <HeartIconSolid className="w-4 h-4 text-red-600 dark:text-red-400" />
      ) : (
        <HeartIcon className="w-4 h-4 group-hover:text-red-600 dark:group-hover:text-red-400" />
      )}

      <span className="select-none">
        {likeCount}
      </span>
    </button>
  );
};

export default LikeButton;