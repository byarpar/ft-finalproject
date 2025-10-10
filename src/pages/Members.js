import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext'; // Not used in this component
import { usersAPI } from '../services/api';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Members = () => {
  // Removed unused 'user' from useAuth
  // const { user } = useAuth();

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
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('DESC');
    }
    setPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Background Image */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 text-white overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2532&auto=format&fit=crop')",
          }}
        />

        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <UserGroupIcon className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Lisu Dictionary Community Members
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-teal-50 max-w-3xl mx-auto mb-8 leading-relaxed">
              Connect with fellow learners and speakers who share your passion for Lisu language and culture
            </p>

            {/* Stats */}
            {pagination && (
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{pagination.total_count}</div>
                  <div className="text-sm text-teal-100 uppercase tracking-wide">Community Members</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path
              fill="rgb(249, 250, 251)"
              fillOpacity="1"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Members by Username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </form>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[200px]"
              >
                <option value="created_at">Sort by: Newest</option>
                <option value="username">Sort by: Username (A-Z)</option>
                <option value="full_name">Sort by: Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
            <button
              onClick={fetchMembers}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Members Grid */}
        {!loading && !error && members.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-6">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {member.profile_photo_url ? (
                          <img
                            src={member.profile_photo_url}
                            alt={member.username}
                            className="w-16 h-16 rounded-full object-cover border-2 border-teal-500"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xl font-bold border-2 border-teal-500">
                            {getInitials(member.full_name || member.username)}
                          </div>
                        )}
                      </div>

                      {/* Name & Username */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {member.full_name || member.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{member.username}
                        </p>
                        {member.role && member.role !== 'user' && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-t border-b border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {member.total_contributions || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Total Posts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {member.discussion_count || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Discussions
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {member.chat_count || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Messages
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>Joined {formatDate(member.created_at)}</span>
                      </div>
                    </div>

                    {/* View Profile Button */}
                    <Link
                      to={`/users/${member.id}`}
                      className="block w-full text-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.has_prev}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, pagination.total_pages))].map((_, idx) => {
                    let pageNum;
                    if (pagination.total_pages <= 5) {
                      pageNum = idx + 1;
                    } else if (page <= 3) {
                      pageNum = idx + 1;
                    } else if (page >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + idx;
                    } else {
                      pageNum = page - 2 + idx;
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${page === pageNum
                          ? 'bg-teal-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.has_next}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* Showing X of Y */}
            {pagination && (
              <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                Showing {pagination.from} to {pagination.to} of {pagination.total_count} members
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && members.length === 0 && (
          <div className="text-center py-20">
            <UserGroupIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No members found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? `No members match your search "${searchQuery}"`
                : 'There are no members in the community yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
