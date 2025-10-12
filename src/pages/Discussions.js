import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { discussionsAPI, tagsAPI, usersAPI } from '../services/api';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BookmarkIcon,
  HeartIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  SparklesIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import NewTopicModal from '../components/Discussions/NewTopicModal';

const Discussions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [discussions, setDiscussions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeMembers, setActiveMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterBy, setFilterBy] = useState('all'); // New: My Discussions, Saved Threads, Unanswered, Solved
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);

  // Fetch discussions
  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await discussionsAPI.getDiscussions({
        page,
        limit: 20,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy
      });

      setDiscussions(response.discussions || []);
      setTotalPages(response.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError('Failed to load discussions. Please try again.');
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchQuery, sortBy]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await discussionsAPI.getCategories();
      setCategories(response.data?.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch popular tags
  const fetchPopularTags = useCallback(async () => {
    try {
      const response = await tagsAPI.getPopularTags(10);
      setPopularTags(response.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  }, []);

  // Fetch recent activity (simulated for now)
  const fetchRecentActivity = useCallback(() => {
    // This would be a real API call in production
    const activities = discussions.slice(0, 5).map(discussion => ({
      id: discussion.id,
      type: 'reply',
      username: discussion.author_name || 'Anonymous',
      threadTitle: discussion.title,
      timestamp: discussion.updated_at || discussion.created_at
    }));
    setRecentActivity(activities);
  }, [discussions]);

  // Fetch active members (from API)
  const fetchActiveMembers = useCallback(async () => {
    try {
      // Fetch real users from the API
      const response = await usersAPI.getAllUsers({ limit: 4, sortBy: 'created_at', order: 'DESC' });
      if (response.data && response.data.users) {
        const users = response.data.users.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.profile_photo_url,
          lastActive: 'Active', // You can calculate this based on user.updated_at
          role: user.role || 'Member'
        }));
        setActiveMembers(users);
      }
    } catch (error) {
      console.error('Error fetching active members:', error);
      // Fallback to empty array if API fails
      setActiveMembers([]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchPopularTags();
    fetchActiveMembers();
  }, [fetchCategories, fetchPopularTags, fetchActiveMembers]);

  // Fetch discussions when filters change
  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  // Update recent activity when discussions change
  useEffect(() => {
    if (discussions.length > 0) {
      fetchRecentActivity();
    }
  }, [discussions, fetchRecentActivity]);

  // Handle save/bookmark discussion
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

      // Update local state
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

  // Handle like discussion
  const handleLikeDiscussion = async (discussionId, isLiked) => {
    if (!user) {
      toast.error('Please login to like discussions');
      return;
    }

    try {
      if (isLiked) {
        await discussionsAPI.unlikeDiscussion(discussionId);
      } else {
        await discussionsAPI.likeDiscussion(discussionId);
      }

      // Update local state
      setDiscussions(prev =>
        prev.map(d =>
          d.id === discussionId
            ? {
              ...d,
              is_liked: !isLiked,
              likes_count: isLiked ? d.likes_count - 1 : d.likes_count + 1
            }
            : d
        )
      );
    } catch (err) {
      console.error('Error liking discussion:', err);
      toast.error('Failed to like discussion');
    }
  };

  // Handle filter by tag
  const handleTagClick = (tagName) => {
    setSearchQuery(`#${tagName}`);
    setPage(1);
  };

  // Format date for display
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

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'grammar': 'bg-blue-100 text-blue-700 border-blue-200',
      'pronunciation': 'bg-green-100 text-green-700 border-green-200',
      'vocabulary': 'bg-purple-100 text-purple-700 border-purple-200',
      'culture': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'general': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const categoryKey = typeof category === 'object' ? category.id : category;
    return colors[categoryKey] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Professional Hero Section with Clean Design */}
      <section className="relative bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700 text-white overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Lisu Language Community Hub
                </h1>
                <p className="text-lg md:text-xl text-teal-50 leading-relaxed max-w-xl">
                  Connect, Share, Learn: Your Space for Lisu Language & Culture Discussions
                </p>
              </div>

              {/* Prominent CTA Button - Primary Entry Point */}
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Please login to start a discussion');
                    navigate('/login');
                    return;
                  }
                  setShowNewTopicModal(true);
                }}
                className="inline-flex items-center gap-3 px-10 py-4 bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-400 font-bold text-base md:text-lg rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                <PlusIcon className="w-6 h-6" />
                Start a New Discussion
              </button>
            </div>

            {/* Right: Community Illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Decorative elements */}
                <div className="absolute top-8 left-8 w-16 h-16 bg-orange-400 rounded-lg opacity-80 flex items-center justify-center text-2xl transform -rotate-12">
                  💬
                </div>
                <div className="absolute top-4 right-12 w-20 h-16 bg-teal-300 rounded-lg opacity-80 flex items-center justify-center text-2xl transform rotate-6">
                  📚
                </div>
                <div className="absolute bottom-8 right-8 w-16 h-16 bg-blue-400 rounded-lg opacity-80 flex items-center justify-center text-2xl transform -rotate-6">
                  🎵
                </div>

                {/* Community people illustration (simplified with avatars) */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/30">
                  <div className="flex items-end justify-center gap-3">
                    {/* Person 1 */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl mb-2">
                        👨
                      </div>
                      <div className="w-12 h-20 bg-orange-300 rounded-t-full"></div>
                    </div>
                    {/* Person 2 */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl mb-2">
                        �
                      </div>
                      <div className="w-12 h-24 bg-pink-300 rounded-t-full"></div>
                    </div>
                    {/* Person 3 */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-2xl mb-2">
                        👨
                      </div>
                      <div className="w-12 h-22 bg-blue-300 rounded-t-full"></div>
                    </div>
                    {/* Person 4 */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-2xl mb-2">
                        👩
                      </div>
                      <div className="w-12 h-20 bg-purple-300 rounded-t-full"></div>
                    </div>
                    {/* Person 5 */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-green-500 flex items-center justify-center text-white text-2xl mb-2">
                        👨
                      </div>
                      <div className="w-12 h-24 bg-teal-300 rounded-t-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Discussion Threads (65-70%) */}
          <div className="lg:col-span-2">
            {/* Clean Filter Bar matching mockup */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
              {/* Category Tabs - Clean horizontal layout with Members tab */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPage(1);
                    }}
                    className={`px-5 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${selectedCategory === 'all'
                      ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                      : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
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
                      className={`px-5 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${selectedCategory === category.id
                        ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20'
                        : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}

                  {/* Members Tab */}
                  <button
                    onClick={() => navigate('/users')}
                    className="ml-auto px-5 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    Members
                  </button>
                </div>
              </div>

              {/* Filter, Sort, and Search Controls */}
              <div className="p-4">
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Filter By Dropdown */}
                  <div className="col-span-6 sm:col-span-3">
                    <select
                      value={filterBy}
                      onChange={(e) => {
                        setFilterBy(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Discussions</option>
                      <option value="my">My Discussions</option>
                      <option value="saved">Saved Threads</option>
                      <option value="unanswered">Unanswered</option>
                      <option value="solved">Solved</option>
                    </select>
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="col-span-6 sm:col-span-3">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="recent">Latest Activity</option>
                      <option value="newest">Newest</option>
                      <option value="popular">Most Popular</option>
                      <option value="replies">Most Replies</option>
                      <option value="newest">Sort By: Newest</option>
                      <option value="oldest">Sort By: Oldest</option>
                      <option value="popular">Sort By: Popular</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div className="col-span-12 sm:col-span-6 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search Discussions"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Discussion count */}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  {discussions.length} topics • Discussions
                </div>
              </div>
            </div>

            {/* Discussion Threads List - 2 Column Grid */}
            <div>
              {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                  <LoadingSpinner />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading discussions...</p>
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                  <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No discussions found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'Be the first to start a discussion!'}
                  </p>
                  {user && !searchQuery && (
                    <button
                      onClick={() => setShowNewTopicModal(true)}
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                    >
                      Start New Discussion
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-200"
                    >
                      {/* Card Content */}
                      <div className="p-5">
                        {/* Top Row: Avatar + Content + Save Button */}
                        <div className="flex gap-4">
                          {/* Left: Avatar */}
                          <Link
                            to={`/users/${discussion.author_id}`}
                            className="flex-shrink-0"
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-sm hover:shadow-md transition-shadow">
                              {(discussion.author_name || 'A').charAt(0).toUpperCase()}
                            </div>
                          </Link>

                          {/* Center: Main Content */}
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <Link
                              to={`/discussions/${discussion.id}`}
                              className="block group"
                            >
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                {discussion.title}
                              </h3>
                            </Link>

                            {/* Author Name + Category Badge */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Link
                                to={`/users/${discussion.author_id}`}
                                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              >
                                {discussion.author_name || 'Anonymous'}
                              </Link>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <ClockIcon className="w-3.5 h-3.5" />
                                {formatDate(discussion.created_at)}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                                  discussion.category
                                )}`}
                              >
                                {typeof discussion.category === 'object'
                                  ? discussion.category.name
                                  : discussion.category || 'General'}
                              </span>
                            </div>

                            {/* Content Preview */}
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                              {discussion.content?.replace(/<[^>]*>/g, '') || 'No description available.'}
                            </p>

                            {/* Tags */}
                            {discussion.tags && discussion.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {discussion.tags.slice(0, 4).map((tag, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleTagClick(tag)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-md text-xs font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                  >
                                    <TagIcon className="w-3 h-3" />
                                    {tag}
                                  </button>
                                ))}
                                {discussion.tags.length > 4 && (
                                  <span className="inline-flex items-center px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400">
                                    +{discussion.tags.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Bottom Stats Row */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              {/* Replies Count */}
                              <Link
                                to={`/discussions/${discussion.id}`}
                                className="flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                              >
                                <div className="p-1.5 bg-teal-50 dark:bg-teal-900/20 rounded">
                                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <span className="font-medium">{discussion.answers_count || 0}</span>
                                <span className="hidden sm:inline">
                                  {discussion.answers_count === 1 ? 'Reply' : 'Replies'}
                                </span>
                              </Link>

                              {/* Views Count */}
                              <div className="flex items-center gap-1.5">
                                <EyeIcon className="w-4 h-4" />
                                <span className="font-medium">{discussion.views_count || 0}</span>
                                <span className="hidden sm:inline">Views</span>
                              </div>

                              {/* Likes Count */}
                              <button
                                onClick={() => handleLikeDiscussion(discussion.id, discussion.is_liked)}
                                className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${discussion.is_liked ? 'text-red-500' : ''
                                  }`}
                              >
                                <HeartIcon className={`w-4 h-4 ${discussion.is_liked ? 'fill-current' : ''}`} />
                                <span className="font-medium">{discussion.likes_count || 0}</span>
                                <span className="hidden sm:inline">
                                  {discussion.likes_count === 1 ? 'Like' : 'Likes'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Right: Save Button */}
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => handleSaveDiscussion(discussion.id, discussion.is_saved)}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              title={discussion.is_saved ? 'Unsave discussion' : 'Save discussion'}
                            >
                              {discussion.is_saved ? (
                                <BookmarkSolidIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                              ) : (
                                <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Last Activity Section (if exists) */}
                        {discussion.last_reply_at && (
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Link
                              to={`/discussions/${discussion.id}`}
                              className="flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    Latest Activity
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium text-teal-600 dark:text-teal-400">
                                      {discussion.last_reply_author || 'Someone'}
                                    </span>{' '}
                                    replied • {formatDate(discussion.last_reply_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>            {/* Pagination */}
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

          {/* Right Column: Community Insights & Engagement Sidebar (30-35%) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Topics / Popular Tags - Enhanced Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Trending Topics</h3>
              </div>
              <div className="space-y-2">
                {popularTags.length > 0 ? (
                  popularTags.map((tag, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <TagIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No trending tags yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start discussions to see popular topics</p>
                  </div>
                )}
              </div>
            </div>

            {/* Latest Activity - Live Feed Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center relative">
                  <ClockIcon className="w-5 h-5 text-white" />
                  {/* Pulse animation dot */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
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
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Be the first to start a conversation!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Members Card - Enhanced */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Members</h3>
                </div>
                <Link
                  to="/users"
                  className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View All
                  <span>→</span>
                </Link>
              </div>

              {/* Members Grid - Visually Appealing */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {activeMembers.slice(0, 4).map((member, index) => (
                  <Link
                    key={member.id}
                    to={`/users/${member.id}`}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div className="relative mb-2 transform group-hover:scale-110 transition-transform duration-200">
                      {member.avatar && member.avatar.trim() !== '' ? (
                        <>
                          <img
                            src={member.avatar}
                            alt={member.username}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            onLoad={(e) => {
                              console.log('Avatar loaded:', member.username);
                              e.target.style.display = 'block';
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'none';
                              }
                            }}
                            onError={(e) => {
                              console.error('Avatar failed:', member.username, member.avatar);
                              e.target.style.display = 'none';
                              if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'flex';
                              }
                            }}
                            className="w-16 h-16 rounded-full object-cover border-3 border-gray-200 dark:border-gray-600 group-hover:border-teal-400 dark:group-hover:border-teal-500 transition-colors shadow-md group-hover:shadow-lg"
                            style={{ display: 'none' }}
                          />
                          <div
                            className={`w-16 h-16 rounded-full bg-gradient-to-br ${index === 0 ? 'from-pink-400 to-rose-500' :
                              index === 1 ? 'from-purple-400 to-indigo-500' :
                                index === 2 ? 'from-blue-400 to-cyan-500' :
                                  'from-teal-400 to-green-500'
                              } flex items-center justify-center text-white font-bold text-xl border-3 border-gray-200 dark:border-gray-600 group-hover:border-teal-400 dark:group-hover:border-teal-500 transition-all shadow-md group-hover:shadow-lg`}
                          >
                            {member.username.charAt(0).toUpperCase()}
                          </div>
                        </>
                      ) : (
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${index === 0 ? 'from-pink-400 to-rose-500' :
                            index === 1 ? 'from-purple-400 to-indigo-500' :
                              index === 2 ? 'from-blue-400 to-cyan-500' :
                                'from-teal-400 to-green-500'
                            } flex items-center justify-center text-white font-bold text-xl border-3 border-gray-200 dark:border-gray-600 group-hover:border-teal-400 dark:group-hover:border-teal-500 transition-all shadow-md group-hover:shadow-lg`}
                        >
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Online indicator with pulse */}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full">
                        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center line-clamp-1 w-full group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {member.username}
                    </p>
                  </Link>
                ))}
              </div>

              {/* View All Members Link - Enhanced */}
              <Link
                to="/users"
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 text-sm font-semibold text-gray-700 dark:text-gray-300 rounded-lg hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 hover:text-teal-700 dark:hover:text-teal-300 transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-md group"
              >
                <span className="inline-flex items-center gap-2">
                  View All Members
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>

            {/* Community Guidelines - Enhanced Card */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10 rounded-lg shadow-sm p-5 border-2 border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Community Guidelines
                </h3>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Help us maintain a respectful and welcoming space for everyone.
              </p>
              <ul className="space-y-2.5 mb-4">
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-lg mt-0.5">✓</span>
                  <span className="leading-relaxed">Be respectful and courteous to all members</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-lg mt-0.5">✓</span>
                  <span className="leading-relaxed">Stay on topic and contribute meaningfully</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-lg mt-0.5">✓</span>
                  <span className="leading-relaxed">Help others learn and grow</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-teal-600 dark:text-teal-400 font-bold text-lg mt-0.5">✓</span>
                  <span className="leading-relaxed">Share knowledge and resources</span>
                </li>
              </ul>
              <Link
                to="/about"
                className="block w-full text-center px-4 py-2.5 bg-white dark:bg-teal-900/20 text-sm font-semibold text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all duration-200 border border-teal-300 dark:border-teal-700 hover:shadow-md group"
              >
                <span className="inline-flex items-center gap-2">
                  Read Full Guidelines
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>

            {/* Suggest a New Word CTA - Clean Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg shadow-sm p-5 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Suggest a New Word
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Help us grow the dictionary! Share Lisu words you'd like to see added.
              </p>
              <Link
                to="/dictionary?suggest=true"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                Suggest a Word
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* New Topic Modal - Placeholder */}
      {showNewTopicModal && (
        <NewTopicModal
          isOpen={showNewTopicModal}
          onClose={() => setShowNewTopicModal(false)}
          onSuccess={(newDiscussion) => {
            // Refresh discussions list
            setPage(1);
            fetchDiscussions();
          }}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Discussions;
