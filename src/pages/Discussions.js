import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { discussionsAPI, tagsAPI, usersAPI } from '../services/api';
import HeroNavbar from '../components/Layout/HeroNavbar';
import Pagination from '../components/UI/Pagination';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BookmarkIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
  LockClosedIcon,
  MapPinIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import DiscussionSkeleton from '../components/UI/DiscussionSkeleton';
import VoteButtons from '../components/Discussion/VoteButtons';
import { formatRelativeDate } from '../utils/dateUtils';
import PageLayout from '../components/Layout/PageLayout';

/**
 * Discussions Component
 * 
 * Main discussions page with filtering, search, categories, 
 * and popular topics sidebar.
 */

const Discussions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [discussions, setDiscussions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterBy, setFilterBy] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await discussionsAPI.getDiscussions({
        page,
        limit: 12,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy,
        filter: filterBy !== 'all' ? filterBy : undefined
      });

      const rawDiscussions = response.discussions || response.data?.discussions || [];

      // Normalize discussions data to ensure images is always an array
      const normalizedDiscussions = rawDiscussions.map(discussion => {
        let images = [];

        // Handle different image formats
        if (discussion.images) {
          if (typeof discussion.images === 'string') {
            try {
              images = JSON.parse(discussion.images);
            } catch (e) {
              console.warn('Failed to parse images for discussion:', discussion.id);
              images = [];
            }
          } else if (Array.isArray(discussion.images)) {
            images = discussion.images;
          }
        }

        // Ensure images is an array of strings
        images = Array.isArray(images) ? images.filter(img => typeof img === 'string' || (img && (img.data || img.url))) : [];

        return {
          ...discussion,
          images
        };
      });

      setDiscussions(normalizedDiscussions);
      setTotalPages(response.totalPages || response.metadata?.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError('Failed to load discussions. Please try again.');
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchQuery, sortBy, filterBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await discussionsAPI.getCategories();
      const categoriesData = response.data?.categories || response.categories || {};

      // Convert categories object to array with 'All' category first
      const categoriesArray = [
        { id: 'all', name: 'All Categories', icon: '📋', color: '#6b7280' },
        ...Object.entries(categoriesData).map(([id, category]) => ({
          id,
          ...category
        }))
      ];

      setCategories(categoriesArray);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set default categories if fetch fails
      setCategories([
        { id: 'all', name: 'All Categories', icon: '📋', color: '#6b7280' }
      ]);
    }
  }, []);

  const fetchPopularTags = useCallback(async () => {
    try {
      const response = await tagsAPI.getPopularTags(10);
      setPopularTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, []);

  const fetchRecentActivity = useCallback(() => {
    const activities = discussions.slice(0, 5).map(discussion => ({
      id: discussion.id,
      type: 'reply',
      username: discussion.user_data?.username || 'Anonymous',
      threadTitle: discussion.title,
      timestamp: discussion.updated_at || discussion.created_at
    }));
    setRecentActivity(activities);
  }, [discussions]);

  const fetchActiveMembers = useCallback(async () => {
    try {
      const response = await usersAPI.getAllUsers({ limit: 4, sortBy: 'created_at', order: 'DESC' });
      if (response.data && response.data.users) {
        const users = response.data.users.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.profile_photo_url,
          lastActive: 'Active',
          role: user.role || 'Member'
        }));
        setActiveMembers(users);
      }
    } catch (error) {
      console.error('Error fetching active members:', error);
      setActiveMembers([]);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          if (user) {
            navigate('/discussions/new');
          } else {
            toast.error('Please login to start a discussion');
          }
          break;
        case '/':
          e.preventDefault();
          document.getElementById('search-discussions')?.focus();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [user, navigate]);

  useEffect(() => {
    fetchCategories();
    fetchPopularTags();
    fetchActiveMembers();
  }, [fetchCategories, fetchPopularTags, fetchActiveMembers]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  useEffect(() => {
    if (discussions.length > 0) {
      fetchRecentActivity();
    }
  }, [discussions, fetchRecentActivity]);

  const handleSaveDiscussion = async (discussionId, isSaved) => {
    if (!user) {
      toast.error('Please login to save discussions');
      return;
    }

    try {
      if (isSaved) {
        await discussionsAPI.unsaveDiscussion(discussionId);
        toast.success('Discussion removed from saved');
      } else {
        await discussionsAPI.saveDiscussion(discussionId);
        toast.success('Discussion saved!');
      }

      setDiscussions(prev =>
        prev.map(d =>
          d.id === discussionId ? { ...d, is_saved: !isSaved } : d
        )
      );
    } catch (err) {
      console.error('Error saving discussion:', err);
      toast.error('Failed to save discussion');
    }
  };

  const handleTagClick = (tagName) => {
    setSearchQuery(`#${tagName}`);
    setPage(1);
  };

  return (
    <PageLayout
      title="Community Discussions - Lisu Dictionary"
      description="Join discussions about Lisu language, culture, and translations. Share knowledge and connect with the community."
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 transition-colors duration-200">
        {/* Header Section - Oxford Dictionary Style */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/images/hero/Discussions.png")',
            }}
          />
          {/* Enhanced overlay for better text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/90 via-teal-800/75 to-teal-700/60 sm:bg-gradient-to-r sm:from-teal-800/85 sm:via-teal-700/60 sm:to-teal-600/40" />

          {/* Hero Navbar Component */}
          <HeroNavbar />

          {/* Main Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[280px] sm:min-h-[320px]">
              <div className="space-y-6 relative z-10 text-center sm:text-left">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
                    Community Discussions
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-lg mx-auto sm:mx-0 drop-shadow-md">
                    Join conversations about Lisu language and culture
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={user ? "/discussions/new" : "/login"}
                    onClick={() => {
                      if (!user) {
                        toast.error('Please login to start a discussion');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-base rounded-xl transition-colors shadow-xl"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Start Discussion
                  </Link>
                </div>
              </div>

              <div className="relative lg:block hidden" />
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 md:h-16" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
              <path d="M0,32 Q360,64 720,32 T1440,32 L1440,80 L0,80 Z" className="fill-gray-50" />
            </svg>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Filtering & Sorting Section - Mobile Optimized */}
          <div id="categories" className="bg-white rounded-xl shadow-sm mb-4 sm:mb-6 border border-gray-200">
            {/* Category Tabs - Horizontally Scrollable on Mobile */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      // Handle special categories that redirect to different pages
                      if (category.id === 'members') {
                        navigate('/discussions/members');
                        return;
                      }
                      if (category.id === 'community-chat') {
                        navigate('/chat');
                        return;
                      }
                      setSelectedCategory(category.id);
                      setPage(1);
                    }}
                    className={`flex-shrink-0 snap-start px-4 sm:px-5 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm whitespace-nowrap rounded-full transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0 flex items-center ${selectedCategory === category.id
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100:bg-gray-600 border border-gray-300'
                      }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Filters - Mobile First Design */}
            <div className="p-3 sm:p-4 bg-gray-50">
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="search-discussions"
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-11 pr-4 py-3 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 touch-manipulation"
                  />
                </div>

                {/* Filter and Sort - Side by Side on Mobile for Better UX */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {/* Filter Dropdown - Enhanced Touch Target */}
                  <div className="relative">
                    <select
                      value={filterBy}
                      onChange={(e) => {
                        setFilterBy(e.target.value);
                        setPage(1);
                      }}
                      className="w-full appearance-none px-3 py-3 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white touch-manipulation pr-8"
                    >
                      <option value="all">All Questions </option>
                      <option value="unanswered"> Unanswered</option>
                      <option value="my">My Posts</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Sort Dropdown - Enhanced Touch Target */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="w-full appearance-none px-3 py-3 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white touch-manipulation pr-8"
                      title="Sort discussions by activity, engagement, or creation date"
                    >
                      <option value="latest">Latest</option>
                      <option value="popular">Popular</option>
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                <span>{discussions.length} discussion{discussions.length !== 1 ? 's' : ''} found</span>
                {(searchQuery || filterBy !== 'all' || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterBy('all');
                      setSelectedCategory('all');
                      setPage(1);
                    }}
                    className="text-teal-600 hover:underline font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <DiscussionSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchDiscussions}
                  className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                >
                  Retry
                </button>
              </div>
            ) : discussions.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm p-12 sm:p-16 text-center border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {searchQuery ? 'No discussions found' : 'Start the Conversation!'}
                  </h3>
                  <p className="text-gray-600 mb-8 text-base">
                    {searchQuery
                      ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                      : 'Be the first to share your thoughts, ask questions, or start a discussion with the community.'}
                  </p>
                  {user && !searchQuery && (
                    <Link
                      to="/discussions/new"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Start New Discussion
                    </Link>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterBy('all');
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300:bg-gray-600 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {discussions.map((discussion) => (
                  <article
                    key={discussion.id}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                  >
                    {/* Card Content */}
                    <div className="p-5 sm:p-6">
                      {/* Header Section */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        {/* Author Info */}
                        <div className="flex items-center gap-2.5">
                          <Link
                            to={`/users/${discussion.author_id}`}
                            className="flex-shrink-0 relative"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center overflow-hidden">
                              {discussion.user_data?.display_picture && (
                                <img
                                  src={discussion.user_data.display_picture}
                                  alt={discussion.user_data?.username || 'User'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              {!discussion.user_data?.display_picture && (
                                <span className="text-sm font-bold text-white">
                                  {(discussion.user_data?.username || 'A').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {discussion.user_data?.role === 'admin' && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                <CheckBadgeIcon className="w-3.5 h-3.5 text-red-500" />
                              </div>
                            )}
                          </Link>
                          <div className="flex flex-col">
                            <Link
                              to={`/users/${discussion.author_id}`}
                              className="font-semibold text-sm text-gray-900"
                            >
                              {discussion.user_data?.username || 'Anonymous'}
                            </Link>
                            <span className="text-xs text-gray-500">
                              {formatRelativeDate(discussion.updated_at || discussion.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-1.5">
                          {discussion.is_pinned && (
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                              <MapPinIcon className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          {discussion.is_locked && (
                            <div className="p-1.5 bg-red-100 rounded-lg">
                              <LockClosedIcon className="w-4 h-4 text-red-600" />
                            </div>
                          )}
                          <button
                            onClick={() => handleSaveDiscussion(discussion.id, discussion.is_saved)}
                            className={`p-1.5 rounded-lg transition-colors ${discussion.is_saved
                              ? 'bg-teal-100 hover:bg-teal-200:bg-teal-900/50'
                              : 'bg-gray-100 hover:bg-gray-200:bg-gray-600'
                              }`}
                          >
                            {discussion.is_saved ? (
                              <BookmarkSolidIcon className="w-4 h-4 text-teal-600" />
                            ) : (
                              <BookmarkIcon className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <Link
                        to={`/discussions/${discussion.id}`}
                        className="block mb-3"
                      >
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                          {discussion.title}
                        </h3>
                      </Link>

                      {/* Content Preview */}
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {discussion.content?.replace(/<[^>]*>/g, '').substring(0, 120) || 'No description available.'}
                        {discussion.content?.length > 120 && '...'}
                      </p>

                      {/* Tags */}
                      {discussion.tags && discussion.tags.length > 0 && (
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                          {discussion.tags.slice(0, 3).map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => handleTagClick(tag)}
                              className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-200 hover:bg-teal-100:bg-teal-900/40 transition-colors whitespace-nowrap"
                            >
                              #{tag}
                            </button>
                          ))}
                          {discussion.tags.length > 3 && (
                            <span className="text-xs text-gray-500 font-medium">
                              +{discussion.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer - Stats & Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        {/* Engagement Stats */}
                        <div className="flex items-center gap-4">
                          {/* Vote Buttons */}
                          <div className="scale-90 origin-left">
                            <VoteButtons
                              itemId={discussion.id}
                              itemType="discussion"
                              initialVoteCount={discussion.vote_count || 0}
                              initialUpvotes={discussion.upvotes || 0}
                              initialDownvotes={discussion.downvotes || 0}
                              initialUserVote={discussion.user_vote || null}
                              onVoteChange={(voteData) => {
                                setDiscussions(prev => prev.map(d =>
                                  d.id === discussion.id
                                    ? { ...d, vote_count: voteData.vote_count, upvotes: voteData.upvotes, downvotes: voteData.downvotes }
                                    : d
                                ));
                              }}
                            />
                          </div>

                          {/* Replies Count */}
                          <Link
                            to={`/discussions/${discussion.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">
                              {discussion.answers_count || 0}
                            </span>
                          </Link>
                        </div>

                        {/* Activity Badges */}
                        <div className="flex items-center gap-2">
                          {discussion.answers_count > 5 && (
                            <span className="px-2.5 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full text-xs font-bold">
                              🔥 Hot
                            </span>
                          )}
                          {discussion.answers_count === 0 && (
                            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-xs font-medium">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && discussions.length > 0 && totalPages > 1 && (
            <div className="mt-6 sm:mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Discussions;