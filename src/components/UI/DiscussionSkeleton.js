import React from 'react';

const DiscussionSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex gap-5">
          {/* Content */}
          <div className="flex-1">
            {/* Title Skeleton */}
            <div className="mb-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="flex gap-2 mt-2">
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>

            {/* Snippet Skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>

            {/* Metadata Skeleton */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            {/* Tags Skeleton */}
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            </div>

            {/* Engagement Skeleton */}
            <div className="flex items-center gap-5">
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Bookmark Skeleton */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionSkeleton;
