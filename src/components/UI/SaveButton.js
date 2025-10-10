import React, { useState, useEffect } from 'react';
import {
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useMutation, useQueryClient } from 'react-query';
import { discussionsAPI } from '../../services/api';

const SaveButton = ({ discussion, currentUser, className = '' }) => {
  const [isSaved, setIsSaved] = useState(discussion.is_saved || false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Sync local state with prop changes
  useEffect(() => {
    setIsSaved(discussion.is_saved || false);
  }, [discussion.is_saved]);

  const saveDiscussionMutation = useMutation(
    ({ discussionId, currentlySaved }) => {
      // Toggle save/unsave based on current state
      if (currentlySaved) {
        return discussionsAPI.unsaveDiscussion(discussionId);
      } else {
        return discussionsAPI.saveDiscussion(discussionId);
      }
    },
    {
      onMutate: async ({ currentlySaved }) => {
        setIsLoading(true);
        // Optimistic update
        setIsSaved(prev => !prev);

        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['discussions']);

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(['discussions']);

        // Optimistically update the cache
        queryClient.setQueryData(['discussions'], old => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              discussions: (page.discussions || []).map(d =>
                d.id === discussion.id
                  ? { ...d, is_saved: !d.is_saved, save_count: d.save_count + (currentlySaved ? -1 : 1) }
                  : d
              )
            }))
          };
        });

        return { previousData };
      },
      onError: (err, variables, context) => {
        // Revert optimistic update
        setIsSaved(prev => !prev);
        if (context?.previousData) {
          queryClient.setQueryData(['discussions'], context.previousData);
        }
      },
      onSuccess: (data, variables) => {
        // Discussion save/unsave completed successfully
      },
      onSettled: () => {
        setIsLoading(false);
        // Refetch to ensure consistency
        queryClient.invalidateQueries(['discussions']);
      }
    }
  );

  const handleSaveToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      return;
    }

    if (isLoading) return;

    saveDiscussionMutation.mutate({
      discussionId: discussion.id,
      currentlySaved: isSaved
    });
  };

  return (
    <button
      onClick={handleSaveToggle}
      disabled={isLoading || !currentUser}
      className={`
        group relative flex items-center gap-1 px-2 py-1 text-sm font-medium 
        transition-all duration-200 rounded-md
        ${currentUser
          ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
          : 'cursor-not-allowed opacity-60'
        }
        ${isSaved
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400'
        }
        ${isLoading ? 'opacity-50 cursor-wait' : ''}
        ${className}
      `}
      title={
        !currentUser
          ? 'Log in to save discussions'
          : ''
      }
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSaved ? (
        <BookmarkSolidIcon className="w-4 h-4" />
      ) : (
        <BookmarkIcon className="w-4 h-4" />
      )}

      <span className="select-none">
        {discussion.save_count || 0}
      </span>
    </button>
  );
};

export default SaveButton;