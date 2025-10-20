import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import HeroNavbar from '../components/Layout/HeroNavbar';
import Pagination from '../components/UI/Pagination';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/UI/SkeletonLoader';
import { formatDate } from '../utils/dateUtils';
import PageLayout from '../components/Layout/PageLayout';

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
        sortBy,
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
      title="Community Members - Lisu Dictionary"
      description="Connect with the Lisu Dictionary community. Meet fellow learners, native speakers, and language enthusiasts passionate about preserving the Lisu language."
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header Section - Oxford Dictionary Style */}
        <section className="relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2532&auto=format&fit=crop')",
            }}
          />
          {/* Enhanced overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-900/90 via-teal-800/75 to-teal-700/60 sm:bg-gradient-to-r sm:from-teal-800/85 sm:via-teal-700/60 sm:to-teal-600/40" />

          {/* Hero Navbar Component */}
          <HeroNavbar />

          {/* Main Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[280px] sm:min-h-[320px]">
              <div className="space-y-6 relative z-10 text-center sm:text-left">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
                    Community Members
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-lg mx-auto sm:mx-0 drop-shadow-md">
                    Connect with fellow Lisu language learners and speakers
                  </p>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Search & Filter Section */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 lg:mb-8 border border-gray-200">
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
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 sm:min-w-[200px] cursor-pointer min-h-[44px] sm:min-h-0 text-sm sm:text-base touch-manipulation"
                >
                  <option value="created_at">✨ Newest Members</option>
                  <option value="username">🔤 Username (A-Z)</option>
                  <option value="full_name">👤 Name (A-Z)</option>
                </select>
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

          {/* Members Grid */}
          {!loading && !error && members.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md active:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 group"
                  >
                    <div className="p-4 sm:p-5 lg:p-6">
                      {/* Avatar & Basic Info */}
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                          {member.profile_photo_url && member.profile_photo_url.trim() !== '' ? (
                            <>
                              <img
                                src={member.profile_photo_url}
                                alt={member.username}
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                                onLoad={(e) => {
                                  console.log('Image loaded successfully:', member.username);
                                  e.target.style.display = 'block';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'none';
                                  }
                                }}
                                onError={(e) => {
                                  console.error('Image failed to load for', member.username, member.profile_photo_url);
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-teal-500"
                                style={{ display: 'none' }}
                              />
                              <div
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold border-2 border-teal-500"
                              >
                                {getInitials(member.full_name || member.username)}
                              </div>
                            </>
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold border-2 border-teal-500">
                              {getInitials(member.full_name || member.username)}
                            </div>
                          )}
                        </div>

                        {/* Name & Username */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-teal-600:text-teal-400 transition-colors">
                            {member.full_name || member.username}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            @{member.username}
                          </p>
                          {member.role && member.role !== 'user' && (
                            <div className="flex items-center gap-1 mt-1">
                              <ShieldCheckIcon className="h-3 w-3 flex-shrink-0 text-teal-600" />
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 text-teal-800 capitalize">
                                {member.role}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 py-2.5 sm:py-3 border-t border-b border-gray-200">
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            <DocumentTextIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">
                            {member.total_contributions || 0}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500">
                            Posts
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">
                            {member.discussion_count || 0}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500">
                            Discussions
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">
                            {member.chat_count || 0}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500">
                            Messages
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 mb-3 sm:mb-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Joined {formatDate(member.created_at)}</span>
                        </div>
                      </div>

                      {/* View Profile Button */}
                      <Link
                        to={`/users/${member.id}`}
                        className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 active:from-teal-800 active:to-cyan-800 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md active:shadow-lg group min-h-[44px] flex items-center justify-center text-sm sm:text-base active:scale-98 touch-manipulation"
                      >
                        <span className="flex items-center justify-center gap-2">
                          View Profile
                          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

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
            <div className="text-center py-12 sm:py-16 lg:py-20 bg-white rounded-lg sm:rounded-xl border border-gray-200 px-4">
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
                  className="min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 active:from-teal-800 active:to-cyan-800 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md active:shadow-lg text-sm sm:text-base active:scale-98 touch-manipulation"
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
