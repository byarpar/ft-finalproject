import React from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * BestAnswerBadge Component
 * Shows the "Best Answer" badge and mark button
 */
const BestAnswerBadge = ({
  isBestAnswer,
  canMarkAsBest,
  onMarkAsBest,
  answerId
}) => {
  if (isBestAnswer) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-md">
        <CheckBadgeIcon className="w-6 h-6" />
        <span className="font-semibold">Best Answer</span>
      </div>
    );
  }

  if (canMarkAsBest && onMarkAsBest) {
    return (
      <button
        onClick={() => onMarkAsBest(answerId)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-green-100:bg-green-900/30 hover:text-green-700:text-green-400 rounded-lg transition-colors group"
        title="Mark this as the best answer"
      >
        <CheckCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Mark as Best Answer</span>
      </button>
    );
  }

  return null;
};

export default BestAnswerBadge;
