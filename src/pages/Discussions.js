import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  memo,
  useRef,
  startTransition,
  useDeferredValue
} from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery
} from 'react-query';
import { discussionsAPI } from '../services/api';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Temporary direct imports to debug the lazy loading issue
import NewTopicModal from '../components/Discussions/NewTopicModal';
import EditDiscussionModal from '../components/Discussions/EditDiscussionModal';
import DiscussionCard from '../components/Discussions/DiscussionCard';
import DiscussionsSidebar from '../components/Discussions/DiscussionsSidebar';
import DiscussionsRightSidebar from '../components/Discussions/DiscussionsRightSidebar';
import ImageModal from '../components/UI/ImageModal';
import ImageGallery from '../components/UI/ImageGallery';

// Performance constants
const PERFORMANCE_CONFIG = {
  DISCUSSIONS_PER_PAGE: 10,
  SCROLL_THRESHOLD: 300,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  STALE_TIME: 2 * 60 * 1000,  // 2 minutes
  MAX_RETRIES: 2
};

// Optimized component factory
const createOptimizedComponent = (Component, displayName) => {
  const OptimizedComponent = memo(Component);
  OptimizedComponent.displayName = displayName;
  return OptimizedComponent;
};

// Highly optimized memoized components
const LoadingSpinner = createOptimizedComponent(() => (
  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
), 'LoadingSpinner');

const EmptyState = createOptimizedComponent(({ searchQuery, user, onNewTopic }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
      <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {searchQuery ? 'No results found' : 'No discussions yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">
      {searchQuery ? 'Try adjusting your search terms' : 'Be the first to start a discussion!'}
    </p>
    {user && !searchQuery && (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNewTopic();
        }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
      >
        <PlusIcon className="w-5 h-5" />
        Start Discussion
      </button>
    )}
  </div>
), 'EmptyState');

const useThrottle = (callback, delay) => {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef();

  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;

    if (timeSinceLastRun >= delay) {
      callback(...args);
      lastRunRef.current = now;
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRunRef.current = Date.now();
      }, delay - timeSinceLastRun);
    }
  }, [callback, delay]);
};

const useInfiniteScroll = (fetchNextPage, hasNextPage, isFetchingNextPage, setScrollProgress) => {
  const isLoadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (isLoadingRef.current) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Update scroll progress with transition
    if (setScrollProgress) {
      requestAnimationFrame(() => {
        setScrollProgress(Math.min(scrollPercentage * 100, 100));
      });
    }

    // Enhanced trigger logic with loading state management
    if (
      (scrollPercentage >= 0.85 || distanceFromBottom <= PERFORMANCE_CONFIG.SCROLL_THRESHOLD) &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      isLoadingRef.current = true;
      fetchNextPage().finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, setScrollProgress]);

  const throttledScroll = useThrottle(handleScroll, PERFORMANCE_CONFIG.THROTTLE_DELAY);

  useEffect(() => {
    const options = { passive: true, capture: false };
    window.addEventListener('scroll', throttledScroll, options);
    return () => window.removeEventListener('scroll', throttledScroll, options);
  }, [throttledScroll]);
};

// Optimized state management hooks
const useOptimizedState = () => {
  // Core state with performance considerations
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('card');
  const [layoutMode, setLayoutMode] = useState('dual');

  // Modal states - grouped for better performance
  const [modalState, setModalState] = useState({
    showNewTopic: false,
    editingDiscussion: null,
    showImageModal: false,
    selectedImage: null,
    showImageGallery: false,
    galleryImages: [],
    galleryStartIndex: 0
  });

  // Form states with optimized initial values (unused - kept for future use)
  // const [formState, setFormState] = useState({
  //   uploadedImages: [],
  //   editUploadedImages: []
  // });

  // Loading states with refs for performance
  const [scrollProgress, setScrollProgress] = useState(0);

  // Optimized state update functions
  const updateModalState = useCallback((updates) => {
    setModalState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    // Core state
    selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    viewMode, setViewMode,
    layoutMode, setLayoutMode,

    // Modal state
    modalState, updateModalState,

    // Loading states
    scrollProgress, setScrollProgress
  };
};

const Discussions = memo(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Optimized state management
  const {
    selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    viewMode, setViewMode,
    layoutMode, setLayoutMode,
    modalState, updateModalState,
    scrollProgress, setScrollProgress
  } = useOptimizedState();

  // Performance-optimized debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, PERFORMANCE_CONFIG.DEBOUNCE_DELAY);
  const deferredSearchQuery = useDeferredValue(debouncedSearchQuery);

  // Memoized query key with deep comparison prevention
  const queryKey = useMemo(() => [
    'discussions',
    selectedCategory,
    deferredSearchQuery,
    sortBy
  ], [selectedCategory, deferredSearchQuery, sortBy]);

  // Optimized categories query with aggressive caching
  const { data: categoriesData } = useQuery(
    ['categories'],
    discussionsAPI.getCategories,
    {
      retry: PERFORMANCE_CONFIG.MAX_RETRIES,
      staleTime: PERFORMANCE_CONFIG.STALE_TIME * 5, // 10 minutes for categories
      cacheTime: PERFORMANCE_CONFIG.CACHE_TIME * 3, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  // High-performance infinite query with optimized settings
  const {
    data: discussionsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery(
    queryKey,
    ({ pageParam = 1 }) => discussionsAPI.getDiscussions({
      page: pageParam,
      limit: PERFORMANCE_CONFIG.DISCUSSIONS_PER_PAGE,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: deferredSearchQuery || undefined,
      sortBy: sortBy
    }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage.currentPage < lastPage.totalPages
          ? lastPage.currentPage + 1
          : undefined;
      },
      retry: PERFORMANCE_CONFIG.MAX_RETRIES,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: PERFORMANCE_CONFIG.STALE_TIME,
      cacheTime: PERFORMANCE_CONFIG.CACHE_TIME,
      refetchOnWindowFocus: false,
      keepPreviousData: true, // Maintain previous data during transitions
      notifyOnChangeProps: ['data', 'error', 'isLoading'], // Minimize re-renders
    }
  );

  // Custom infinite scroll hook
  useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage, setScrollProgress);

  // Highly optimized memoized calculations
  const categories = useMemo(() => {
    if (categoriesData?.data?.categories) {
      return categoriesData.data.categories;
    }
    return [
      { id: 'all', name: 'All Questions', icon: 'GlobeAltIcon', count: 0, color: '#9CA3AF' },
      { id: 'language-learning', name: 'Language Learning', icon: 'AcademicCapIcon', count: 0, color: '#60A5FA' },
      { id: 'grammar', name: 'Grammar', icon: 'BookOpenIcon', count: 0, color: '#34D399' },
      { id: 'vocabulary', name: 'Vocabulary', icon: 'TagIcon', count: 0, color: '#FBBF24' },
      { id: 'culture', name: 'Culture & Context', icon: 'UserGroupIcon', count: 0, color: '#A78BFA' }
    ];
  }, [categoriesData?.data?.categories]);

  // Optimized discussions flattening with performance considerations
  const discussions = useMemo(() => {
    if (!discussionsData?.pages?.length) return [];

    const flatDiscussions = [];
    for (const page of discussionsData.pages) {
      const pageDiscussions = Array.isArray(page) ? page :
        (Array.isArray(page.discussions) ? page.discussions : []);
      flatDiscussions.push(...pageDiscussions);
    }
    return flatDiscussions;
  }, [discussionsData?.pages]);

  // Memoized stats with performance optimization
  const stats = useMemo(() => {
    const statObj = Object.create(null); // Prototype-less object for performance
    for (const category of categories) {
      statObj[category.id] = category.count || 0;
    }
    return statObj;
  }, [categories]);

  // Optimized activity stats calculation
  const activityStats = useMemo(() => {
    const totalCount = discussionsData?.pages?.[0]?.totalCount || discussions.length;
    const now = Date.now();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

    let todayCount = 0;
    let weekCount = 0;
    const activeUsersSet = new Set();

    for (const discussion of discussions) {
      const createdAt = new Date(discussion.created_at).getTime();

      if (createdAt >= todayStart) todayCount++;
      if (createdAt > weekAgo) weekCount++;

      if (discussion.author_name) {
        activeUsersSet.add(discussion.author_name);
      }
    }

    return {
      total: totalCount,
      todayCount,
      weekCount,
      activeUsers: activeUsersSet.size
    };
  }, [discussionsData?.pages, discussions]);

  // Optimized recent activity
  const recentActivity = useMemo(() => {
    return discussions
      .slice(0, 5)
      .map(d => ({
        user: d.author_name || 'Anonymous',
        action: `Created "${d.title.slice(0, 50)}${d.title.length > 50 ? '...' : ''}"`,
        time: new Date(d.created_at).toLocaleDateString()
      }));
  }, [discussions]);

  // Performance-optimized mutations with error boundaries
  const deleteDiscussionMutation = useMutation(
    discussionsAPI.deleteDiscussion,
    {
      onMutate: async (discussionId) => {
        await queryClient.cancelQueries(queryKey);
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistic update - remove from cache
        queryClient.setQueryData(queryKey, old => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              discussions: (page.discussions || []).filter(d => d.id !== discussionId)
            }))
          };
        });

        return { previousData };
      },
      onSuccess: () => {
        toast.success('Discussion deleted successfully!');
      },
      onError: (error, variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
        const errorMessage = error.response?.data?.error?.message ||
          error.response?.data?.error ||
          'Failed to delete discussion';
        toast.error(errorMessage);
      }
    }
  );

  // Ultra-optimized event handlers with minimal re-renders
  const eventHandlers = useMemo(() => ({
    handleEditDiscussion: (discussion) => {
      updateModalState({ editingDiscussion: discussion });
    },

    handleDeleteDiscussion: (discussionId) => {
      if (window.confirm('Are you sure you want to delete this discussion?')) {
        startTransition(() => {
          deleteDiscussionMutation.mutate(discussionId);
        });
      }
    },

    handleReportDiscussion: (discussionId) => {
      // TODO: Implement report modal or API call
      if (window.confirm('Are you sure you want to report this discussion?')) {
        // For now, just show a toast - this would normally send to moderation
        toast.success('Discussion reported. Thank you for helping keep our community safe.');
      }
    },

    handleCancelEdit: () => {
      updateModalState({ editingDiscussion: null });
    },

    handleImageClick: (imageSrc, discussionImages = null, imageIndex = 0) => {
      if (discussionImages && discussionImages.length > 1) {
        updateModalState({
          galleryImages: discussionImages,
          galleryStartIndex: imageIndex,
          showImageGallery: true
        });
      } else {
        updateModalState({
          selectedImage: { src: imageSrc },
          showImageModal: true
        });
      }
    },

    handleSearchChange: (e) => {
      const value = e.target.value;
      startTransition(() => {
        setSearchQuery(value);
      });
    },

    handleCategoryChange: (category) => {
      startTransition(() => {
        setSelectedCategory(category);
      });
    },

    handleSortChange: (sort) => {
      startTransition(() => {
        setSortBy(sort);
      });
    },

    // Modal handlers
    handleCloseImageModal: () => {
      updateModalState({ showImageModal: false, selectedImage: null });
    },

    handleCloseImageGallery: () => {
      updateModalState({
        showImageGallery: false,
        galleryImages: [],
        galleryStartIndex: 0
      });
    },

    handleOpenNewTopicModal: () => {
      updateModalState({ showNewTopic: true });
    },

    handleCloseNewTopicModal: () => {
      updateModalState({ showNewTopic: false });
    }
  }), [
    deleteDiscussionMutation,
    updateModalState, setSearchQuery, setSelectedCategory, setSortBy
  ]);

  // Performance-optimized loading and error states with early returns
  if (isLoading && !discussionsData?.pages?.length) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-400">Loading discussions...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load discussions</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">There was an error loading the discussions. Please try again.</p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              refetch();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // High-performance render with optimized structure
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Optimized Scroll Progress Bar */}
      {discussions.length > 0 && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-50">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-150 ease-out"
            style={{
              width: `${scrollProgress}%`,
              transform: `translateZ(0)` // Hardware acceleration
            }}
          />
        </div>
      )}

      {/* High-Performance Layout Container */}
      <div className="flex h-screen">
        {/* Left Sidebar - Direct rendering for debugging */}
        {(layoutMode === 'left' || layoutMode === 'dual') && (
          <DiscussionsSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={eventHandlers.handleCategoryChange}
            currentUser={user}
            stats={stats}
          />
        )}

        {/* Main Content Area - Optimized for performance */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
              {/* Optimized Search and Controls */}
              <div className="mt-8 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                  <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={eventHandlers.handleSearchChange}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  {user && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        eventHandlers.handleOpenNewTopicModal();
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg touch-safe"
                      style={{ touchAction: 'manipulation' }}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Ask Question
                    </button>
                  )}
                </div>
              </div>

              {/* Optimized Layout Controls */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Layout:</span>
                    <select
                      value={layoutMode}
                      onChange={(e) => setLayoutMode(e.target.value)}
                      className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white transition-colors duration-200"
                    >
                      <option value="full">Full Width</option>
                      <option value="left">Left Sidebar Only</option>
                      <option value="dual">Dual Sidebar</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ultra-Optimized Discussions List */}
              <div className="space-y-4">
                {discussions.length === 0 && !isLoading ? (
                  <EmptyState
                    searchQuery={deferredSearchQuery}
                    user={user}
                    onNewTopic={eventHandlers.handleOpenNewTopicModal}
                  />
                ) : (
                  <>
                    {/* Direct rendering for debugging */}
                    {discussions.map((discussion) => {
                      const categoryLabel = discussion.category?.name || 'Uncategorized';

                      return (
                        <div key={discussion.id} className="touch-safe">
                          <DiscussionCard
                            discussion={discussion}
                            currentUser={user}
                            categoryLabel={categoryLabel}
                            onEdit={eventHandlers.handleEditDiscussion}
                            onDelete={eventHandlers.handleDeleteDiscussion}
                            onReport={eventHandlers.handleReportDiscussion}
                            onImageClick={eventHandlers.handleImageClick}
                            viewMode={viewMode}
                          />
                        </div>
                      );
                    })}

                    {/* Optimized Loading Indicator */}
                    {isFetchingNextPage && (
                      <div className="text-center py-8">
                        <LoadingSpinner />
                        <p className="text-gray-600 dark:text-gray-400">Loading more discussions...</p>
                      </div>
                    )}

                    {/* Performance-optimized Load More Button */}
                    {hasNextPage && !isFetchingNextPage && (
                      <div className="text-center py-8">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            fetchNextPage();
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg touch-safe focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                          style={{ touchAction: 'manipulation' }}
                        >
                          Load More Discussions
                        </button>
                      </div>
                    )}

                    {/* End Indicator */}
                    {!hasNextPage && discussions.length > 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">You've reached the end of the discussions</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Showing {discussions.length} discussion{discussions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Direct rendering for debugging */}
        {layoutMode === 'dual' && (
          <DiscussionsRightSidebar
            sortBy={sortBy}
            onSortChange={eventHandlers.handleSortChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
            stats={activityStats}
            recentActivity={recentActivity}
            currentUser={user}
          />
        )}
      </div>

      {/* Fixed Modal System */}
      {modalState.showNewTopic && (
        <NewTopicModal
          isOpen={modalState.showNewTopic}
          onClose={eventHandlers.handleCloseNewTopicModal}
        />
      )}

      {modalState.editingDiscussion && (
        <EditDiscussionModal
          isOpen={!!modalState.editingDiscussion}
          onClose={eventHandlers.handleCancelEdit}
          discussion={modalState.editingDiscussion}
        />
      )}

      {modalState.showImageModal && modalState.selectedImage && (
        <ImageModal
          src={modalState.selectedImage.src}
          onClose={eventHandlers.handleCloseImageModal}
        />
      )}

      {modalState.showImageGallery && modalState.galleryImages.length > 0 && (
        <ImageGallery
          images={modalState.galleryImages}
          initialIndex={modalState.galleryStartIndex}
          onClose={eventHandlers.handleCloseImageGallery}
        />
      )}
    </div>
  );
});

Discussions.displayName = 'Discussions';

export default Discussions;