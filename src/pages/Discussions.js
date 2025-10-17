import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { discussionsAPI, tagsAPI, usersAPI } from '../services/api';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BookmarkIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  LockClosedIcon,
  MapPinIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import DiscussionSkeleton from '../components/UI/DiscussionSkeleton';
import VoteButtons from '../components/Discussion/VoteButtons';

const Discussions = () => {
  const { user } = useAuth();

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
        limit: 20,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy,
        filter: filterBy !== 'all' ? filterBy : undefined
      });

      setDiscussions(response.discussions || response.data?.discussions || []);
      setTotalPages(response.totalPages || response.data?.pagination?.totalPages || 1);
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
      setCategories(response.data?.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
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
      username: discussion.author_name || 'Anonymous',
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="relative bg-teal-700 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hero/Discussions.png")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-800/85 via-teal-700/60 to-teal-600/40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[320px]">
            <div className="space-y-6 relative z-10">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Lisu Language<br />Community Hub
                </h1>
                <p className="text-base md:text-lg text-white/95 leading-relaxed max-w-lg">
                  Connect, Learn, Share: Your Space for Advanced Lisu Linguistics & Cultural Dialogue
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={user ? "/discussions/new" : "/login"}
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to start a discussion');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusIcon className="w-5 h-5" />
                  Start a Discussion
                </Link>

                <Link
                  to={user ? "/chat" : "/login"}
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to access chat');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-base rounded-lg transition-all duration-200 border-2 border-white/30"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Chat
                </Link>
              </div>
            </div>

            <div className="relative lg:block hidden" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 xl:gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 px-6 py-4 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPage(1);
                    }}
                    className={`px-4 py-2 font-semibold text-sm whitespace-nowrap rounded-full transition-all duration-200 ${selectedCategory === 'all'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                      }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setPage(1);
                      }}
                      className={`px-4 py-2 font-semibold text-sm whitespace-nowrap rounded-full transition-all duration-200 ${selectedCategory === category.id
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  {/* Consolidated Search with Filters */}
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        className="w-full pl-11 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Filter Dropdown */}
                  <div className="w-full sm:w-40">
                    <select
                      value={filterBy}
                      onChange={(e) => {
                        setFilterBy(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All</option>
                      <option value="unanswered">Unanswered</option>
                      <option value="my">My Posts</option>
                      <option value="solved">Solved</option>
                    </select>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="w-full sm:w-40">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="latest">Latest</option>
                      <option value="popular">Popular</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(filterBy !== 'all' || searchQuery) && (
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
                    {filterBy !== 'all' && (
                      <button
                        onClick={() => setFilterBy('all')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                      >
                        {filterBy}
                        <span className="text-teal-600 dark:text-teal-400">×</span>
                      </button>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors"
                      >
                        "{searchQuery.substring(0, 20)}{searchQuery.length > 20 ? '...' : ''}"
                        <span className="text-teal-600 dark:text-teal-400">×</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {discussions.length} discussion{discussions.length !== 1 ? 's' : ''}
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <button
                    onClick={fetchDiscussions}
                    className="mt-4 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              ) : discussions.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm p-12 sm:p-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {searchQuery ? 'No discussions found' : 'Start the Conversation!'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-base">
                      {searchQuery
                        ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                        : 'Be the first to share your thoughts, ask questions, or start a discussion with the community.'}
                    </p>
                    {user && !searchQuery && (
                      <Link
                        to="/discussions/new"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
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
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:border-teal-400 dark:hover:border-teal-500 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex gap-5">
                          {/* Image Thumbnail (if available) */}
                          {discussion.image_url && (
                            <Link
                              to={`/discussions/${discussion.id}`}
                              className="flex-shrink-0 group"
                            >
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                                <img
                                  src={discussion.image_url}
                                  alt={discussion.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            </Link>
                          )}

                          {/* Thread Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title with Status Badges */}
                            <div className="mb-2">
                              <Link
                                to={`/discussions/${discussion.id}`}
                                className="block group"
                              >
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug mb-1">
                                  {discussion.is_pinned && (
                                    <MapPinIcon className="inline w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 -mt-1" />
                                  )}
                                  {discussion.title}
                                </h3>
                              </Link>

                              {/* Status Badges Row */}
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {discussion.is_solved && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                    <CheckCircleSolidIcon className="w-3.5 h-3.5" />
                                    Solved
                                  </span>
                                )}
                                {discussion.is_pinned && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                    <MapPinIcon className="w-3.5 h-3.5" />
                                    Pinned
                                  </span>
                                )}
                                {discussion.is_locked && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                                    <LockClosedIcon className="w-3.5 h-3.5" />
                                    Locked
                                  </span>
                                )}
                                {/* Trending Badge - if replies > 10 and created in last 24h */}
                                {discussion.answers_count > 5 && !discussion.is_solved && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">
                                    🔥 Trending
                                  </span>
                                )}
                                {/* Unanswered Badge */}
                                {discussion.answers_count === 0 && !discussion.is_solved && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                                    💬 Unanswered
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Content Preview/Snippet */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                              {discussion.content?.replace(/<[^>]*>/g, '').substring(0, 200) || 'No description available.'}
                              {discussion.content?.length > 200 && '...'}
                            </p>

                            {/* Metadata Row with Avatar */}
                            <div className="flex items-center gap-3 mb-3">
                              {/* Author Avatar */}
                              <Link
                                to={`/users/${discussion.author_id}`}
                                className="flex-shrink-0"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-shadow">
                                  {(discussion.author_name || 'A').charAt(0).toUpperCase()}
                                </div>
                              </Link>

                              {/* Author Info */}
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <Link
                                  to={`/users/${discussion.author_id}`}
                                  className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                >
                                  <span>{discussion.author_name || 'Anonymous'}</span>
                                  {discussion.author_role === 'admin' && (
                                    <CheckBadgeIcon className="w-4 h-4 text-red-500" title="Verified Admin" />
                                  )}
                                </Link>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {formatDate(discussion.updated_at || discussion.created_at)}
                                </span>
                              </div>
                            </div>

                            {/* Tags */}
                            {discussion.tags && discussion.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                {discussion.tags.slice(0, 4).map((tag, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleTagClick(tag)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-md text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors border border-teal-200 dark:border-teal-800"
                                  >
                                    #{tag}
                                  </button>
                                ))}
                                {discussion.tags.length > 4 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    +{discussion.tags.length - 4}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Engagement Metrics */}
                            <div className="flex items-center gap-5 text-sm">
                              {/* Vote Buttons */}
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

                              {/* Replies Count - Always show */}
                              <Link
                                to={`/discussions/${discussion.id}`}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              >
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                <span className="font-semibold">{discussion.answers_count || 0}</span>
                                {discussion.answers_count > 0 && (
                                  <span className="text-xs hidden sm:inline">
                                    {discussion.answers_count === 1 ? 'Reply' : 'Replies'}
                                  </span>
                                )}
                              </Link>

                              {/* Views Count - Only show if > 0 */}
                              {discussion.views_count > 0 && (
                                <div className="hidden md:flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                  <EyeIcon className="w-4 h-4" />
                                  <span className="font-semibold">{discussion.views_count}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bookmark Action - Show on hover or if saved */}
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleSaveDiscussion(discussion.id, discussion.is_saved)}
                              className={`p-2.5 rounded-lg transition-all duration-200 ${discussion.is_saved
                                ? 'opacity-100 bg-teal-50 dark:bg-teal-900/20'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              title={discussion.is_saved ? 'Unsave thread' : 'Save thread'}
                            >
                              {discussion.is_saved ? (
                                <BookmarkSolidIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 hover:scale-110 transition-transform" />
                              ) : (
                                <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loading && discussions.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700 rounded-lg shadow-sm p-4 border border-teal-500 dark:border-teal-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="w-6 h-6" />
                Community Highlights
              </h2>
              <p className="text-teal-50 text-sm mt-1">
                Stay connected with the latest happenings
              </p>
            </div>

            {/* Trending Topics - Only show if tags exist */}
            {popularTags && popularTags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Trending Topics</h3>
                </div>
                <div className="space-y-2">
                  {popularTags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagClick(tag.name || tag)}
                      className="w-full text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-lg hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 transition-all duration-200 group border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-teal-600 dark:text-teal-400 font-bold">#</span>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                            {tag.name || tag}
                          </span>
                        </div>
                        {tag.count && (
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                            {tag.count} topics
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center relative">
                  <ClockIcon className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Latest Activity</h3>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      to={`/discussions/${activity.id}`}
                      className="block p-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-750 rounded-lg hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                          {(activity.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span className="font-semibold text-teal-600 dark:text-teal-400">{activity.username}</span>
                            <span className="text-gray-500"> replied to</span>
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                            {activity.threadTitle}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Members</h3>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {activeMembers.slice(0, 4).map((member, index) => (
                  <Link
                    key={member.id}
                    to={`/users/${member.id}`}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative mb-2 transform group-hover:scale-110 transition-transform duration-200">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${index === 0 ? 'from-pink-400 to-rose-500' :
                          index === 1 ? 'from-purple-400 to-indigo-500' :
                            index === 2 ? 'from-blue-400 to-cyan-500' :
                              'from-teal-400 to-green-500'
                          } flex items-center justify-center text-white font-bold text-xl border-3 border-gray-200 dark:border-gray-600 group-hover:border-teal-400 dark:group-hover:border-teal-500 transition-all shadow-md group-hover:shadow-lg`}
                      >
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full">
                        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center line-clamp-1 w-full group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {member.username}
                    </p>
                  </Link>
                ))}
              </div>

              <Link
                to="/discussions/members"
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md group"
              >
                <span className="inline-flex items-center gap-2">
                  See All Members
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg shadow-sm p-5 border border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Community Chat</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Join real-time conversations with fellow Lisu language learners and practice together.
              </p>
              <Link
                to="/chat"
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 group"
              >
                <span className="inline-flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Open Chat Page
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discussions;