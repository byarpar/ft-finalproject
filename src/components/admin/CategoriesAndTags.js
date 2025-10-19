import React from 'react';
import { TagIcon } from '@heroicons/react/24/outline';

const CategoriesAndTags = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Categories & Tags
        </h1>
        <p className="text-gray-600">
          Manage content categories and tags
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <div className="text-center">
          <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Categories and tags management coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoriesAndTags;
