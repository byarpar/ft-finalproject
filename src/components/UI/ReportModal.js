import React, { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ReportModal = ({ isOpen, onClose, discussion, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    {
      id: 'off-topic',
      label: 'Off-topic',
      description: 'Not related to English-Lisu language learning'
    },
    {
      id: 'spam',
      label: 'Spam',
      description: 'Promotional or repetitive content'
    },
    {
      id: 'inappropriate-language',
      label: 'Inappropriate content',
      description: 'Offensive language or material'
    },
    {
      id: 'harassment',
      label: 'Harassment',
      description: 'Personal attacks or targeting users'
    },
    {
      id: 'misinformation',
      label: 'Incorrect information',
      description: 'False language or translation details'
    },
    {
      id: 'duplicate',
      label: 'Duplicate post',
      description: 'Already discussed recently'
    },
    {
      id: 'low-quality',
      label: 'Low quality',
      description: 'Lacks substance or clarity'
    },
    {
      id: 'copyright',
      label: 'Copyright violation',
      description: 'Unauthorized use of materials'
    },
    {
      id: 'other',
      label: 'Other violation',
      description: 'Violates community guidelines'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReason) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        reason: selectedReason,
        customReason: selectedReason === 'other' ? customReason : '',
        discussionId: discussion.id,
        discussionTitle: discussion.title
      };

      await onSubmit(reportData);

      // Reset form
      setSelectedReason('');
      setCustomReason('');
      onClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason('');
      setCustomReason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Report Discussion
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Why are you reporting this discussion?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Help us understand what's wrong with "{discussion?.title}"
            </p>
          </div>

          {/* Report Reasons */}
          <div className="space-y-3 mb-6">
            {reportReasons.map((reason) => (
              <label
                key={reason.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-all ${selectedReason === reason.id
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {reason.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {reason.description}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'other' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Please explain the issue:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe why you're reporting this discussion..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required={selectedReason === 'other'}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedReason || isSubmitting || (selectedReason === 'other' && !customReason.trim())}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Reports are reviewed by our moderation team. False reports may result in account restrictions.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;