import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  ArrowPathIcon, 
  ExclamationCircleIcon,
  EnvelopeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col justify-center py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 p-12 text-center">
          {/* 500 Icon */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ExclamationCircleIcon className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* 500 Number */}
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text drop-shadow-lg mb-6">
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
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ArrowPathIcon className="mr-2 h-5 w-5" />
              Try Again
            </button>
            
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-slate-400 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 bg-white/50 hover:bg-white/70"
            >
              <HomeIcon className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Need immediate help?</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => window.location.href = 'mailto:support@lisudict.com'}
                className="flex items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 hover:border-slate-300"
              >
                <EnvelopeIcon className="h-5 w-5 text-slate-600 mr-3" />
                <span className="text-slate-700 font-medium">Contact Support</span>
              </button>
              
              <Link
                to="/about"
                className="flex items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 hover:border-slate-300"
              >
                <InformationCircleIcon className="h-5 w-5 text-slate-600 mr-3" />
                <span className="text-slate-700 font-medium">About Us</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
