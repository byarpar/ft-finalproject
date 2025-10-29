import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Pagination Component
 * Displays page navigation with smart ellipsis for large page counts
 * 
 * @component
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback when page changes
 * @param {number} [maxVisible=5] - Maximum number of page buttons to show
 * @param {string} [className] - Additional CSS classes
 * @param {boolean} [showInfo=false] - Show page info text
 * @param {number} [total] - Total number of items (optional, for info display)
 * 
 * @example
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className = '',
  showInfo = false,
  total = null,
}) => {
  // Don't render if only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  // Ensure currentPage is within valid range
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  /**
   * Generate array of page numbers to display
   * Uses ellipsis (...) for large page counts
   */
  const generatePageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Add ellipsis if current page is far from start
      if (validCurrentPage > 3) {
        pageNumbers.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, validCurrentPage - 1);
      const end = Math.min(totalPages - 1, validCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if current page is far from end
      if (validCurrentPage < totalPages - 2) {
        pageNumbers.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="space-y-3">
      {/* Page Info (Optional) */}
      {showInfo && total && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Page {validCurrentPage} of {totalPages} • {total.toLocaleString()} total items
        </div>
      )}

      {/* Pagination Controls */}
      <div className={`flex items-center justify-center gap-1 sm:gap-2 flex-wrap ${className}`}>
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage === 1}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all min-w-[80px] ${validCurrentPage === 1
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 active:bg-gray-100 dark:active:bg-gray-500'
            }`}
          aria-label="Previous page"
        >
          Previous
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 sm:px-3 py-2 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[36px] sm:min-w-[40px] px-2 sm:px-3 py-2 rounded-lg font-medium text-sm transition-all ${validCurrentPage === page
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:from-teal-600 hover:to-cyan-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                aria-label={`Go to page ${page}`}
                aria-current={validCurrentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage === totalPages}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all min-w-[80px] ${validCurrentPage === totalPages
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 active:bg-gray-100 dark:active:bg-gray-500'
            }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisible: PropTypes.number,
  className: PropTypes.string,
  showInfo: PropTypes.bool,
  total: PropTypes.number,
};

export default Pagination;