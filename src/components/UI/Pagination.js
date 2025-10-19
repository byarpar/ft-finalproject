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
}) => {
  // Don't render if only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

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
      if (currentPage > 3) {
        pageNumbers.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
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
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50:bg-gray-600'
          }`}
        aria-label="Previous page"
      >
        Previous
      </button>

      {/* Page Number Buttons */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-gray-500"
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
            className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50:bg-gray-600'
              }`}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50:bg-gray-600'
          }`}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisible: PropTypes.number,
  className: PropTypes.string,
};

export default Pagination;
