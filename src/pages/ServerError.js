import React from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { PageLayout } from '../components/LayoutComponents';

/**
 * 500 Internal Server Error Page
 * Displayed when a server error occurs
 * 
 * @component
 */
const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <PageLayout
      title="500 - Server Error"
      background="bg-gray-50"
    >
      <div className="flex flex-col justify-center py-16 sm:px-6 lg:px-8 relative overflow-hidden min-h-[80vh]">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            {/* 500 Icon */}
            <div className="mb-8">
              <div className="bg-red-600 rounded-lg w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ExclamationCircleIcon className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* 500 Number */}
            <h1 className="text-8xl md:text-9xl font-bold text-gray-800 mb-6">
              500
            </h1>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Internal Server Error
            </h2>

            {/* Description */}
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto">
              Something went wrong on our end. Our team has been notified and we're working to fix this issue.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button
                onClick={handleRefresh}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
              >
                <ArrowPathIcon className="mr-2 h-5 w-5" />
                Try Again
              </button>

              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 bg-white"
              >
                <HomeIcon className="mr-2 h-5 w-5" />
                Go Home
              </Link>
            </div>

            {/* Additional Help */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Need immediate help?</h3>
              <div className="grid gap-4 sm:grid-cols-1">
                <button
                  onClick={() => window.location.href = 'mailto:support@lisudict.com'}
                  className="flex items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 hover:border-slate-300"
                >
                  <EnvelopeIcon className="h-5 w-5 text-slate-600 mr-3" />
                  <span className="text-slate-700 font-medium">Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ServerError;
