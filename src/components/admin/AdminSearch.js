import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';
import './AdminSearch.css';

const AdminSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    part_of_speech: '',
    has_etymology: '',
    created_by: '',
    date_from: '',
    date_to: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Search results query
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useQuery(
    ['adminSearch', searchQuery, filters, currentPage],
    () => adminAPI.search(searchQuery, filters, currentPage, 20),
    {
      enabled: !!searchQuery,
      keepPreviousData: true
    }
  );

  // Search analytics query
  const { data: analytics } = useQuery(
    ['searchAnalytics', '7d'],
    () => adminAPI.getSearchAnalytics('7d', 50),
    {
      refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchQuery(searchTerm.trim());
      setCurrentPage(1);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      part_of_speech: '',
      has_etymology: '',
      created_by: '',
      date_from: '',
      date_to: ''
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-search">
      <div className="admin-search__header">
        <h2>Advanced Search & Analytics</h2>
        <p>Search words with advanced filters and view search analytics</p>
      </div>

      {/* Search Form */}
      <div className="admin-search__form">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search words, definitions, or translations..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`filters-toggle ${showFilters ? 'active' : ''}`}
            >
              Filters
            </button>
          </div>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="search-filters">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Part of Speech</label>
                <select
                  value={filters.part_of_speech}
                  onChange={(e) => handleFilterChange('part_of_speech', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="preposition">Preposition</option>
                  <option value="conjunction">Conjunction</option>
                  <option value="interjection">Interjection</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Has Etymology</label>
                <select
                  value={filters.has_etymology}
                  onChange={(e) => handleFilterChange('has_etymology', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Date From</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Date To</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
            </div>

            <div className="filters-actions">
              <button onClick={clearFilters} className="clear-filters">
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="admin-search__results">
          <div className="results-header">
            <h3>Search Results</h3>
            {searchResults?.data && (
              <div className="results-stats">
                <span>
                  Showing {searchResults.data.results.length} of {searchResults.data.pagination.total_results} results
                  {searchResults.data.performance && (
                    <span className="search-time">
                      ({searchResults.data.performance.search_time_ms}ms)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {searchLoading ? (
            <div className="loading">Searching...</div>
          ) : searchError ? (
            <div className="error">
              Error: {searchError.response?.data?.message || 'Search failed'}
            </div>
          ) : searchResults?.data?.results?.length > 0 ? (
            <>
              <div className="results-list">
                {searchResults.data.results.map((word) => (
                  <div key={word.id} className="result-item">
                    <div className="result-header">
                      <h4>{word.english_word}</h4>
                      <div className="result-meta">
                        <span className="part-of-speech">{word.part_of_speech}</span>
                        {word.has_etymology && (
                          <span className="etymology-badge">Etymology</span>
                        )}
                        <span className="rank">Rank: {parseFloat(word.rank).toFixed(3)}</span>
                      </div>
                    </div>

                    <div className="result-content">
                      <p className="definition">{word.definition}</p>
                      {word.lisu_translation && (
                        <p className="translation">
                          <strong>Lisu:</strong> {word.lisu_translation}
                        </p>
                      )}
                      {word.synonyms && (
                        <p className="synonyms">
                          <strong>Synonyms:</strong> {word.synonyms}
                        </p>
                      )}
                    </div>

                    <div className="result-footer">
                      <span className="created-by">
                        Created by: {word.created_by_email || 'Unknown'}
                      </span>
                      <span className="created-date">
                        {formatDate(word.created_at)}
                      </span>
                      {word.updated_at !== word.created_at && (
                        <span className="updated-date">
                          Updated: {formatDate(word.updated_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {searchResults.data.pagination.total_pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!searchResults.data.pagination.has_prev}
                    className="pagination-button"
                  >
                    Previous
                  </button>

                  <span className="pagination-info">
                    Page {currentPage} of {searchResults.data.pagination.total_pages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!searchResults.data.pagination.has_next}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Search Analytics */}
      {analytics?.data && (
        <div className="admin-search__analytics">
          <h3>Search Analytics (Last 7 Days)</h3>
          <div className="analytics-summary">
            <div className="analytics-stat">
              <span className="stat-label">Total Searches</span>
              <span className="stat-value">{analytics.data.total_searches}</span>
            </div>
            <div className="analytics-stat">
              <span className="stat-label">Unique Terms</span>
              <span className="stat-value">{analytics.data.analytics.length}</span>
            </div>
          </div>

          <div className="analytics-table">
            <table>
              <thead>
                <tr>
                  <th>Search Term</th>
                  <th>Language</th>
                  <th>Count</th>
                  <th>Avg Results</th>
                  <th>Last Searched</th>
                </tr>
              </thead>
              <tbody>
                {analytics.data.analytics.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>{item.search_term}</td>
                    <td>{item.search_language || 'Any'}</td>
                    <td>{item.search_count}</td>
                    <td>{parseFloat(item.avg_results).toFixed(1)}</td>
                    <td>{formatDate(item.last_searched)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSearch;
