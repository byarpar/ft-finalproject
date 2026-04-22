import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { Pagination } from '../components/UIComponents';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { SkeletonLoader } from '../components/UIComponents';
import { formatDate } from '../utils/dateUtils';
import { PageLayout } from '../components/LayoutComponents';

/**
 * Members Component
 * 
 * Displays community members with search, filtering, and sorting.
 * Shows member stats and contribution levels.
 */

const Members = () => {
  // State management
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllUsers({
        page,
        limit: 12,
        search: searchQuery || undefined,
        orderBy: sortBy,
        order: sortOrder
      });

      if (response.success) {
        setMembers(response.data?.users || []);
        setPagination(response.data?.pagination || null);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members. Please try again.');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, sortBy, sortOrder]);

  // Fetch members when filters change
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle search
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  }, []);

  // Handle search input change with debounce effect
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('DESC');
    }
    setPage(1);
  }, [sortBy, sortOrder]);

  // Get initials for avatar
  const getInitials = useCallback((name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }, []);

  return (
    <PageLayout
      title="Community Members - AMDF"
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header Section - Title Only */}
        <section className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <Link to="/discussions" className="hover:text-teal-600 transition-colors">Form Questions</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Members</span>
            </nav>
            <h1 className="app-title text-3xl sm:text-4xl md:text-5xl text-gray-900 text-center sm:text-left">
              Community Members
            </h1>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Search & Filter Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base min-h-[44px] sm:min-h-0 touch-manipulation"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setPage(1);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-gray-400 hover:text-gray-600:text-gray-300 active:scale-95 transition-transform touch-manipulation"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </form>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 sm:gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 sm:min-w-[200px] cursor-pointer min-h-[44px] sm:min-h-0 text-sm sm:text-base touch-manipulation"
                  title="Sort members by different criteria"
                >
                  <option value="created_at" title="Show newest members first">
                    Newest Members
                  </option>
                  <option value="activity" title="Most active contributors">
                    Most Active
                  </option>
                  <option value="username" title="Sort alphabetically by username">
                    Username (A-Z)
                  </option>
                  <option value="full_name" title="Sort alphabetically by full name">
                    Full Name (A-Z)
                  </option>
                </select>

                <div className="flex items-center rounded-lg border border-gray-300 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`inline-flex items-center justify-center rounded-md p-2 transition-colors ${viewMode === 'grid'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    aria-label="Grid view"
                    title="Grid view"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`inline-flex items-center justify-center rounded-md p-2 transition-colors ${viewMode === 'list'
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    aria-label="List view"
                    title="List view"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
              {[...Array(6)].map((_, index) => (
                <SkeletonLoader key={index} variant="card" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="text-red-500 mb-4 text-sm sm:text-base">{error}</div>
              <button
                onClick={fetchMembers}
                className="min-h-[44px] px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:bg-teal-800 transition-colors touch-manipulation active:scale-98 text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Members Display */}
          {!loading && !error && members.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
                  {members.map((member) => (
                    <Link
                      key={member.id}
                      to={`/users/${member.id}`}
                      className="group"
                    >
                      <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-teal-500 hover:shadow-sm transition-all duration-300 text-center h-full">
                        {/* Avatar */}
                        <div className="mb-4 flex justify-center">
                          <div className="relative inline-block">
                            {member.profile_photo_url && member.profile_photo_url.trim() !== '' ? (
                              <img
                                src={member.profile_photo_url}
                                alt={member.username}
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                                className="avatar-unified ring-4 ring-gray-50 group-hover:ring-teal-50 transition-all"
                              />
                            ) : null}
                            <div
                              className="avatar-unified bg-teal-50 text-teal-600 text-2xl font-bold ring-4 ring-gray-50 group-hover:ring-teal-100 group-hover:bg-teal-100 transition-all"
                              style={{ display: member.profile_photo_url && member.profile_photo_url.trim() !== '' ? 'none' : 'flex' }}
                            >
                              {getInitials(member.full_name || member.username)}
                            </div>
                            {member.role === 'admin' && (
                              <CheckBadgeIcon className="w-5 h-5 text-red-600 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                            )}
                          </div>
                        </div>

                        {/* Name & Username */}
                        <div className="mb-3">
                          <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                            {member.full_name || member.username}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1">@{member.username}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
                          <div>
                            <div className="text-lg font-bold text-gray-900">{member.total_contributions || 0}</div>
                            <div className="text-xs text-gray-500">Contributions</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{member.discussion_count || 0}</div>
                            <div className="text-xs text-gray-500">Discussions</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{member.reply_count || member.answers_posted || 0}</div>
                            <div className="text-xs text-gray-500">Answers</div>
                          </div>
                        </div>

                        {/* Joined Date */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Joined {formatDate(member.created_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mb-8">
                  {members.map((member) => (
                    <Link
                      key={member.id}
                      to={`/users/${member.id}`}
                      className="group block"
                    >
                      <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-teal-500 hover:shadow-sm transition-all duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative inline-block flex-shrink-0">
                              {member.profile_photo_url && member.profile_photo_url.trim() !== '' ? (
                                <img
                                  src={member.profile_photo_url}
                                  alt={member.username}
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                  className="avatar-unified"
                                />
                              ) : null}
                              <div
                                className="avatar-unified bg-teal-50 text-teal-600 text-lg font-bold"
                                style={{ display: member.profile_photo_url && member.profile_photo_url.trim() !== '' ? 'none' : 'flex' }}
                              >
                                {getInitials(member.full_name || member.username)}
                              </div>
                              {member.role === 'admin' && (
                                <CheckBadgeIcon className="w-5 h-5 text-red-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                                {member.full_name || member.username}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">@{member.username}</p>
                              <p className="text-xs text-gray-500 mt-1">Joined {formatDate(member.created_at)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 sm:gap-5 text-center sm:min-w-[260px]">
                            <div>
                              <div className="text-base font-bold text-gray-900">{member.total_contributions || 0}</div>
                              <div className="text-xs text-gray-500">Contributions</div>
                            </div>
                            <div>
                              <div className="text-base font-bold text-gray-900">{member.discussion_count || 0}</div>
                              <div className="text-xs text-gray-500">Discussions</div>
                            </div>
                            <div>
                              <div className="text-base font-bold text-gray-900">{member.reply_count || member.answers_posted || 0}</div>
                              <div className="text-xs text-gray-500">Answers</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <div className="mt-6 sm:mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.total_pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && members.length === 0 && (
            <div className="text-center py-12 sm:py-16 lg:py-20 bg-white rounded-lg border border-gray-200 px-4">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="bg-gray-100 p-4 sm:p-5 lg:p-6 rounded-full">
                  <UserGroupIcon className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                No members found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto px-4">
                {searchQuery
                  ? `No members match your search "${searchQuery}". Try adjusting your search terms.`
                  : 'There are no members in the community yet. Be the first to join!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="min-h-[44px] px-6 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md text-sm sm:text-base touch-manipulation"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Members;
