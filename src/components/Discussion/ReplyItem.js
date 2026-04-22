import React from 'react';
import { Link } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { VoteButtons } from '../DiscussionComponents';
import { formatRelativeDate } from '../../utils/dateUtils';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { MentionRenderer } from '../UIComponents';
const ReplyItem = ({
  answer,
  user,
  editingAnswerId,
  editContent,
  setEditContent,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onReplyTo,
  onVoteChange,
  expandedReplies,
  onToggleReplies,
  openLightbox
}) => {
  const isEditing = editingAnswerId === answer.id;
  const isExpanded = expandedReplies.has(answer.id);

  return (
    <div className="border-l-2 sm:border-l-4 border-teal-500">
      <div className="pl-3 sm:pl-4 py-2">
        {/* Answer Header */}
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link to={`/users/${answer.author_id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1 sm:flex-none">
              <div className="avatar-unified bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-sm sm:text-base">
                {answer.author_profile_photo ? (
                  <img src={answer.author_profile_photo} alt={answer.author_name || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{(answer.author_name || 'A')[0].toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {answer.author_name || 'Anonymous'}
                  </span>
                  {answer.author_role === 'admin' && (
                    <CheckBadgeIcon className="w-4 h-4 flex-shrink-0 text-red-600" title="Verified Admin" />
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  {formatRelativeDate(answer.created_at)}
                </span>
              </div>
            </Link>
          </div>

          {user && answer.author_id === user.id && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(answer)}
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center sm:p-1.5 text-gray-500 hover:text-teal-600 rounded transition-colors"
                title="Edit reply"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(answer.id)}
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center sm:p-1.5 text-gray-500 hover:text-red-600 rounded transition-colors"
                title="Delete reply"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Answer Content */}
        {isEditing ? (
          <div className="mb-2 sm:mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-2 text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => onSaveEdit(answer.id)}
                className="min-h-[44px] px-4 py-2 sm:py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={onCancelEdit}
                className="min-h-[44px] px-4 py-2 sm:py-1.5 text-gray-600 hover:text-gray-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="prose prose-sm sm:prose max-w-none mb-2 sm:mb-3">
              <div className="text-gray-700 text-sm sm:text-base leading-relaxed text-justify">
                <MentionRenderer
                  content={answer.content}
                  theme="teal"
                />
              </div>
            </div>

            {answer.images && Array.isArray(answer.images) && answer.images.length > 0 && (
              <div className="mb-2 sm:mb-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {answer.images.map((image, index) => {
                    const imageUrl = typeof image === 'string' ? image : (image?.data || image?.url);
                    return imageUrl ? (
                      <div
                        key={index}
                        className="relative group cursor-pointer active:scale-98 transition-transform"
                        onClick={() => openLightbox(answer.images.map(img => typeof img === 'string' ? img : (img?.data || img?.url)), index)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Reply attachment ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-teal-400 transition-all"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                          <MagnifyingGlassPlusIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Answer Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
          <div className="scale-90 sm:scale-100">
            <VoteButtons
              itemId={answer.id}
              itemType="answer"
              initialVoteCount={answer.vote_count || 0}
              initialUpvotes={answer.upvotes || 0}
              initialUserVote={answer.user_vote || null}
              onVoteChange={(voteData) => onVoteChange(answer.id, voteData)}
            />
          </div>
          <button
            onClick={() => onReplyTo(answer)}
            className="min-h-[44px] flex items-center gap-1 px-3 sm:px-0 text-teal-600 hover:text-teal-700 font-medium transition-colors active:scale-95"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Reply</span>
          </button>
          {answer.replies && answer.replies.length > 0 && (
            <button
              onClick={() => onToggleReplies(answer.id)}
              className="min-h-[44px] flex items-center gap-1 px-3 sm:px-0 text-gray-600 hover:text-gray-800 transition-colors active:scale-95"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">Hide {answer.replies.length} {answer.replies.length === 1 ? 'reply' : 'replies'}</span>
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">View {answer.replies.length} {answer.replies.length === 1 ? 'reply' : 'replies'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Nested Replies */}
        {isExpanded && answer.replies && answer.replies.length > 0 && (
          <div className="mt-3 sm:mt-4 ml-4 sm:ml-8 space-y-3 sm:space-y-4 border-l-2 border-gray-300 pl-3 sm:pl-4">
            {answer.replies.map((nestedReply) => (
              <div key={nestedReply.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <Link to={`/users/${nestedReply.author_id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1">
                    <div className="avatar-unified bg-gradient-to-br from-purple-400 to-pink-500 text-white font-semibold text-xs sm:text-sm">
                      {nestedReply.author_profile_photo ? (
                        <img src={nestedReply.author_profile_photo} alt={nestedReply.author_name || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span>{(nestedReply.author_name || 'A')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                          {nestedReply.author_name || 'Anonymous'}
                        </span>
                        {nestedReply.author_role === 'admin' && (
                          <CheckBadgeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-red-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatRelativeDate(nestedReply.created_at)}</span>
                    </div>
                  </Link>

                  {user && nestedReply.author_id === user.id && (
                    <button
                      onClick={() => onDelete(nestedReply.id)}
                      className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center sm:p-1 text-gray-500 hover:text-red-600 rounded transition-colors flex-shrink-0"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap mb-2 leading-relaxed">
                  {nestedReply.content}
                </p>

                {nestedReply.images && Array.isArray(nestedReply.images) && nestedReply.images.length > 0 && (
                  <div className="mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {nestedReply.images.map((image, index) => {
                        const imageUrl = typeof image === 'string' ? image : (image?.data || image?.url);
                        return imageUrl ? (
                          <div
                            key={index}
                            className="relative group cursor-pointer active:scale-98 transition-transform"
                            onClick={() => openLightbox(nestedReply.images.map(img => typeof img === 'string' ? img : (img?.data || img?.url)), index)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Nested reply attachment ${index + 1}`}
                              className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-300 hover:border-teal-400 transition-all"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-opacity flex items-center justify-center">
                              <MagnifyingGlassPlusIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyItem;
