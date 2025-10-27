import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';

/**
 * 404 Not Found Error Page
 * Displayed when a user navigates to a non-existent route
 * 
 * @component
 */
const NotFound = () => {
  const navigate = useNavigate();

  // Set proper HTTP status for server-side rendering
  useEffect(() => {
    // This helps with SSR/SSG scenarios
    if (window && window.location) {
      console.warn('404 Not Found:', window.location.href);
    }
  }, []);

  return (
    <PageLayout
      title="404 - Page Not Found"
      description="The page you're looking for doesn't exist."
    >
      <Helmet>
        {/* Explicitly tell search engines this is a 404 */}
        <meta name="prerender-status-code" content="404" />
        <meta name="robots" content="noindex, nofollow" />
        <meta http-equiv="status" content="404" />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-2xl">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-[120px] sm:text-[180px] font-bold text-teal-600 leading-none">
              404
            </h1>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
            It might have been moved, deleted, or never existed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Go Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300:bg-gray-600 text-gray-900 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Go back to previous page"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Go Back
            </button>

            {/* Home Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-label="Go to home page"
            >
              <HomeIcon className="w-5 h-5" />
              Go Home
            </Link>

            {/* Search Button */}
            <Link
              to="/dictionary"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Search the dictionary"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              Search Dictionary
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Here are some helpful links instead:
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link to="/" className="text-teal-600 hover:underline">
                Home
              </Link>
              <Link to="/dictionary" className="text-teal-600 hover:underline">
                Dictionary
              </Link>
              <Link to="/discussions" className="text-teal-600 hover:underline">
                Discussions
              </Link>
              <Link to="/about" className="text-teal-600 hover:underline">
                About
              </Link>
              <Link to="/help" className="text-teal-600 hover:underline">
                Help Center
              </Link>
              <Link to="/contact" className="text-teal-600 hover:underline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
