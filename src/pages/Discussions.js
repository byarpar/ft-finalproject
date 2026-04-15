import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { discussionsAPI, usersAPI } from '../services/api';
import { Pagination } from '../components/UIComponents';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  EyeIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
  MapPinIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { DiscussionSkeleton } from '../components/UIComponents';
import { VoteButtons } from '../components/DiscussionComponents';
import { MentionRenderer } from '../components/UIComponents';
import { formatRelativeDate } from '../utils/dateUtils';
import { PageLayout } from '../components/LayoutComponents';

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
  const [activeMembers, setActiveMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [layoutView, setLayoutView] = useState('grid'); // 'grid' or 'list'

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await discussionsAPI.getDiscussions({
        page,
        limit: 8,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy
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

      // Handle pagination - support both formats
      const pagination = response.metadata?.pagination || response.pagination || {};
      const calculatedTotalPages = pagination.totalPages || pagination.total_pages || response.totalPages || 1;
      setTotalPages(calculatedTotalPages);

      setError(null);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError('Failed to load discussions. Please try again.');
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchQuery, sortBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await discussionsAPI.getCategories();
      const categoriesData = response.data?.categories || response.categories || {};

      // Convert categories object to array with 'All' category first
      const categoriesArray = [
        { id: 'all', name: 'All', color: '#14b8a6', IconComponent: ChatBubbleLeftRightIcon },
        ...Object.entries(categoriesData)
          .filter(([id]) => id !== 'members' && id !== 'home' && id !== 'community-chat' && id !== 'general')
          .map(([id, category]) => ({
            id,
            ...category
          }))
      ];

      setCategories(categoriesArray);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set default categories if fetch fails
      setCategories([
        { id: 'all', name: 'All', color: '#14b8a6', IconComponent: ChatBubbleLeftRightIcon },
        { id: 'programming', name: 'Programming', color: '#ec4899', IconComponent: ChatBubbleLeftRightIcon },
        { id: 'web-development', name: 'Web Development', color: '#f59e0b', IconComponent: ChatBubbleLeftRightIcon },
        { id: 'cybersecurity', name: 'Cybersecurity', color: '#ef4444', IconComponent: ChatBubbleLeftRightIcon },
        { id: 'data-science', name: 'Data Science', color: '#10b981', IconComponent: ChatBubbleLeftRightIcon },
        { id: 'machine-learning', name: 'Machine Learning', color: '#3b82f6', IconComponent: ChatBubbleLeftRightIcon }
      ]);
    }
  }, []);



  const fetchActiveMembers = useCallback(async () => {
    try {
      const response = await usersAPI.getAllUsers({ limit: 4, sortBy: 'created_at', order: 'DESC' });
      if (response.data && response.data.users) {
        const users = response.data.users.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.profile_photo_url,
          avatarError: false, // Track if image failed to load
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
    fetchActiveMembers();
  }, [fetchCategories, fetchActiveMembers]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

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
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-800/75 to-gray-700/60 sm:bg-gradient-to-r sm:from-gray-800/85 sm:via-gray-700/60 sm:to-gray-600/40" />



          {/* Main Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[280px] sm:min-h-[320px]">
              <div className="space-y-6 relative z-10 text-center sm:text-left">
                <div>
                  <h1 className="app-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-white drop-shadow-lg">
                    Questions &
                    <span className="block text-white">Answers</span>
                  </h1>
                  <p className="app-subtitle text-base sm:text-lg md:text-xl text-white/90 max-w-lg mx-auto sm:mx-0 drop-shadow-md">
                    Ask questions and get help from the Lisu learning community
                  </p>
                </div>

                <div className="pt-4">
                  <Link
                    to={user ? "/discussions/new" : "/login"}
                    onClick={() => {
                      if (!user) {
                        toast.error('Please login to ask a question');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-base rounded-xl transition-colors shadow-xl"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5" />
                    Ask Question
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
          {/* Unique Filtering Section - Card-Based Design */}
          <div className="mb-6 space-y-4">
            {/* Category Pills - Horizontal Scroll */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                {categories.map((category) => {
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setPage(1);
                      }}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border ${selectedCategory === category.id
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all duration-300 text-center h-full"'
                        }`}
                    >
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search & Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Box */}
              <div className="md:col-span-5">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="search-discussions"
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sort Selector */}
              <div className="md:col-span-4">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  title="Sort discussions by different criteria"
                >
                  <option value="latest" title="Recently active discussions with new replies or updates">Latest Activity</option>
                  <option value="popular" title="Discussions with most engagement (votes + replies)">Most Popular</option>
                  <option value="views" title="Most viewed discussions">Most Viewed</option>
                  <option value="newest" title="Brand new discussions, just posted">Newest First</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="md:col-span-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setLayoutView('grid')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border-2 ${layoutView === 'grid'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                      }`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                    Grid
                  </button>
                  <button
                    onClick={() => setLayoutView('list')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border-2 ${layoutView === 'list'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                      }`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                    List
                  </button>
                </div>
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
                    {searchQuery ? 'No questions found' : 'Ask the First Question!'}
                  </h3>
                  <p className="text-gray-600 mb-8 text-base">
                    {searchQuery
                      ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                      : 'Be the first to ask a question and get help from our community of Lisu language learners and experts.'}
                  </p>
                  {user && !searchQuery && (
                    <Link
                      to="/discussions/new"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg transition-colors"
                    >
                      <QuestionMarkCircleIcon className="w-5 h-5" />
                      Ask Your Question
                    </Link>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors border"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Two-Column Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Discussion Threads */}
                <div className="lg:col-span-8">
                  {/* Grid Layout */}
                  {layoutView === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {discussions.map((discussion) => {
                        return (
                          <Link
                            key={discussion.id}
                            to={`/discussions/${discussion.id}`}
                            className="block"
                          >
                            <article
                              className="bg-white rounded-xl border-2 border-gray-200 hover:border-teal-500 overflow-hidden transition-all cursor-pointer h-full flex flex-col"
                            >
                              <div className="p-4 flex-1 flex flex-col">
                                {/* Meta Row */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate(`/users/${discussion.author_id}`);
                                      }}
                                      className="cursor-pointer relative"
                                    >
                                      <div className="avatar-unified bg-gray-100">
                                        {discussion.user_data?.display_picture ? (
                                          <img
                                            src={discussion.user_data.display_picture}
                                            alt={discussion.user_data?.username || 'User'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                          />
                                        ) : (
                                          <span className="text-xs font-bold text-gray-600">
                                            {(discussion.user_data?.username || 'A').charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      {discussion.user_data?.role === 'admin' && (
                                        <CheckBadgeIcon className="w-4 h-4 text-red-600 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                                      )}
                                    </div>
                                    <div className="app-label-uppercase text-gray-500">
                                      {formatRelativeDate(discussion.updated_at || discussion.created_at)}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {discussion.is_pinned && <MapPinIcon className="w-5 h-5 text-blue-500" />}
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSaveDiscussion(discussion.id, discussion.is_saved);
                                      }}
                                      className="z-10"
                                    >
                                      {discussion.is_saved ? (
                                        <BookmarkSolidIcon className="w-5 h-5 text-teal-600" />
                                      ) : (
                                        <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-teal-600" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-bold text-gray-900 hover:text-teal-600 line-clamp-2 leading-snug mb-2">
                                  {discussion.title}
                                </h3>

                                {/* Content Preview */}
                                <div className="text-sm text-gray-600 mb-3 line-clamp-6 prose prose-sm max-w-none text-justify flex-1">
                                  <MentionRenderer
                                    content={(discussion.content || '').substring(0, 400) + ((discussion.content || '').length > 400 ? '...' : '')}
                                    theme="teal"
                                    renderMarkdown={true}
                                  />
                                </div>

                                {/* Tags */}
                                {discussion.tags && discussion.tags.length > 0 && (
                                  <div className="flex gap-1.5 mb-3 flex-wrap">
                                    {discussion.tags.slice(0, 2).map((tag, index) => (
                                      <button
                                        key={index}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleTagClick(tag);
                                        }}
                                        className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs hover:bg-teal-100 border border-teal-200 z-10"
                                      >
                                        #{tag}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Stats Bar */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    {/* Vote Buttons */}
                                    <div
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                    >
                                      <VoteButtons
                                        itemId={discussion.id}
                                        itemType="discussion"
                                        initialVoteCount={discussion.vote_count}
                                        initialUserVote={discussion.user_vote}
                                        layout="horizontal"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                      <span>{discussion.answers_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <EyeIcon className="w-4 h-4" />
                                      <span>{discussion.views_count || 0}</span>
                                    </div>
                                  </div>
                                  {discussion.answers_count === 0 && (
                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </article>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* List Layout */}
                  {layoutView === 'list' && (
                    <div className="space-y-4">
                      {discussions.map((discussion) => {
                        return (
                          <Link
                            key={discussion.id}
                            to={`/discussions/${discussion.id}`}
                            className="block"
                          >
                            <article
                              className="bg-white rounded-xl border-2 border-gray-200 hover:border-teal-500 overflow-hidden transition-all cursor-pointer"
                            >
                              <div className="p-4">
                                {/* Meta Row */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate(`/users/${discussion.author_id}`);
                                      }}
                                      className="cursor-pointer relative"
                                    >
                                      <div className="avatar-unified bg-gray-100">
                                        {discussion.user_data?.display_picture ? (
                                          <img
                                            src={discussion.user_data.display_picture}
                                            alt={discussion.user_data?.username || 'User'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                          />
                                        ) : (
                                          <span className="text-xs font-bold text-gray-600">
                                            {(discussion.user_data?.username || 'A').charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      {discussion.user_data?.role === 'admin' && (
                                        <CheckBadgeIcon className="w-4 h-4 text-red-600 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                                      )}
                                    </div>
                                    <div className="app-label-uppercase text-gray-500">
                                      {formatRelativeDate(discussion.updated_at || discussion.created_at)}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {discussion.is_pinned && <MapPinIcon className="w-5 h-5 text-blue-500" />}
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSaveDiscussion(discussion.id, discussion.is_saved);
                                      }}
                                      className="z-10"
                                    >
                                      {discussion.is_saved ? (
                                        <BookmarkSolidIcon className="w-5 h-5 text-teal-600" />
                                      ) : (
                                        <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-teal-600" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-bold text-gray-900 hover:text-teal-600 line-clamp-2 leading-snug mb-2">
                                  {discussion.title}
                                </h3>

                                {/* Content Preview */}
                                <div className="text-sm text-gray-600 mb-3 line-clamp-6 prose prose-sm max-w-none text-justify">
                                  <MentionRenderer
                                    content={(discussion.content || '').substring(0, 400) + ((discussion.content || '').length > 400 ? '...' : '')}
                                    theme="teal"
                                    renderMarkdown={true}
                                  />
                                </div>

                                {/* Tags */}
                                {discussion.tags && discussion.tags.length > 0 && (
                                  <div className="flex gap-1.5 mb-3 flex-wrap">
                                    {discussion.tags.slice(0, 2).map((tag, index) => (
                                      <button
                                        key={index}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleTagClick(tag);
                                        }}
                                        className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs hover:bg-teal-100 border border-teal-200 z-10"
                                      >
                                        #{tag}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Stats Bar */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    {/* Vote Buttons */}
                                    <div
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                    >
                                      <VoteButtons
                                        itemId={discussion.id}
                                        itemType="discussion"
                                        initialVoteCount={discussion.vote_count}
                                        initialUserVote={discussion.user_vote}
                                        layout="horizontal"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                      <span>{discussion.answers_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <EyeIcon className="w-4 h-4" />
                                      <span>{discussion.views_count || 0}</span>
                                    </div>
                                  </div>
                                  {discussion.answers_count === 0 && (
                                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </article>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Sidebar */}
                <aside className="lg:col-span-4 space-y-4">
                  {/* Trending Topics */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">
                        Trending Topics
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {discussions
                        .slice()
                        .sort((a, b) => {
                          // Sort by engagement score: views + (votes * 3) + (replies * 5)
                          const scoreA = (a.views_count || 0) + (a.vote_count || 0) * 3 + (a.answers_count || 0) * 5;
                          const scoreB = (b.views_count || 0) + (b.vote_count || 0) * 3 + (b.answers_count || 0) * 5;
                          return scoreB - scoreA;
                        })
                        .slice(0, 5)
                        .map((discussion, index) => (
                          <Link
                            key={discussion.id}
                            to={`/discussions/${discussion.id}`}
                            className="block p-4 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex gap-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-bold rounded flex items-center justify-center">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 line-clamp-2 leading-tight mb-2">
                                  {discussion.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                                    {discussion.answers_count || 0}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <EyeIcon className="w-3.5 h-3.5" />
                                    {discussion.views_count || 0}
                                  </span>
                                  {discussion.vote_count > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-teal-600 font-semibold">
                                        +{discussion.vote_count}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>

                  {/* Latest Activity */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">
                        Latest Activity
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {discussions
                        .slice()
                        .sort((a, b) => {
                          // Sort by most recent activity (updated_at)
                          const dateA = new Date(a.updated_at || a.created_at);
                          const dateB = new Date(b.updated_at || b.created_at);
                          return dateB - dateA;
                        })
                        .slice(0, 5)
                        .map((discussion) => (
                          <Link
                            key={discussion.id}
                            to={`/discussions/${discussion.id}`}
                            className="block p-4 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="avatar-unified bg-gray-100">
                                  {discussion.user_data?.display_picture ? (
                                    <img
                                      src={discussion.user_data.display_picture}
                                      alt={discussion.user_data?.username || 'User'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <span className="text-sm font-bold text-gray-600">
                                      {(discussion.user_data?.username || 'A').charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                {discussion.user_data?.role === 'admin' && (
                                  <CheckBadgeIcon className="w-3.5 h-3.5 text-red-600 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 line-clamp-2 leading-tight mb-1">
                                  {discussion.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <span className="font-medium text-blue-600">
                                    {discussion.user_data?.username || 'Anonymous'}
                                  </span>
                                  <span>•</span>
                                  <span>{formatRelativeDate(discussion.updated_at || discussion.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>

                  {/* Active Members */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">
                        Active Members
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-4 gap-4 mb-5">
                        {activeMembers.slice(0, 4).map((member) => (
                          <Link
                            key={member.id}
                            to={`/users/${member.id}`}
                            className="flex flex-col items-center group"
                          >
                            <div className="relative w-16 h-16 mb-2">
                              <div className="avatar-unified bg-teal-100 group-hover:ring-2 group-hover:ring-teal-500 transition-all">
                                {member.avatar && !member.avatarError ? (
                                  <img
                                    src={member.avatar}
                                    alt={member.username || 'User'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      setActiveMembers(prev =>
                                        prev.map(m =>
                                          m.id === member.id ? { ...m, avatarError: true } : m
                                        )
                                      );
                                    }}
                                  />
                                ) : (
                                  <span className="text-xl font-bold text-teal-700">
                                    {(member.username || 'U').charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              {member.role === 'admin' && (
                                <CheckBadgeIcon className="w-4 h-4 text-red-600 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="text-xs text-gray-700 font-medium text-center line-clamp-1 w-full">
                              {member.username || 'User'}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        to="/discussions/members"
                        className="block w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg text-center transition-colors shadow-sm"
                      >
                        View All Members
                      </Link>
                    </div>
                  </div>

                  {/* Need Help */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">
                        Need Help?
                      </h3>
                    </div>
                    <div className="p-4 space-y-1">

                    </div>
                  </div>
                </aside>
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