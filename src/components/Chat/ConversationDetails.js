import React from 'react';
import { XMarkIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ConversationDetails = ({ conversation, onClose, onUpdateConversation }) => {
  if (!conversation) return null;

  console.log('🔍 ConversationDetails received:', {
    id: conversation.id,
    name: conversation.name,
    type: conversation.type,
    participantCount: conversation.participants?.length,
    participants: conversation.participants
  });

  const isGroup = conversation.type === 'group';

  return (
    <div className="h-full w-full border-l border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">
          Details
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100:bg-gray-700 transition-colors"
          title="Close details"
          aria-label="Close details"
        >
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 chat-scrollbar">
        {/* Conversation Info */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-teal-100 flex items-center justify-center mb-3">
            {isGroup ? (
              <UserGroupIcon className="w-10 h-10 text-teal-600" />
            ) : (
              <span className="text-2xl font-semibold text-teal-600">
                {conversation.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <h4 className="font-semibold text-lg text-gray-900">
            {conversation.name || 'Conversation'}
          </h4>
          {conversation.description && (
            <p className="text-sm text-gray-600 mt-1">
              {conversation.description}
            </p>
          )}
        </div>

        {/* Participants */}
        <div>
          <h5 className="font-semibold text-gray-900 mb-3">
            Participants ({conversation.participants?.length || 0})
          </h5>
          <div className="space-y-2">
            {conversation.participants?.map((participant) => (
              <Link
                key={participant.id}
                to={`/users/${participant.id}`}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50:bg-gray-700"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  {participant.avatar_url ? (
                    <img
                      src={participant.avatar_url}
                      alt={participant.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">
                      {participant.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {participant.username}
                  </p>
                  {participant.role === 'admin' && (
                    <span className="text-xs text-teal-600">
                      Admin
                    </span>
                  )}
                </div>
                {participant.is_online && (
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50:bg-gray-700 rounded-lg">
            🔇 Mute Notifications
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50:bg-gray-700 rounded-lg">
            🔍 Search in Conversation
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50:bg-gray-700 rounded-lg">
            📂 Shared Media
          </button>
          {isGroup && (
            <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50:bg-red-900/20 rounded-lg">
              🚪 Leave Group
            </button>
          )}
        </div>

        {/* See All Members Link */}
        <div className="pt-4 border-t border-gray-200">
          <Link
            to="/discussions/members"
            className="flex items-center justify-center space-x-2 px-4 py-2 text-teal-600 hover:bg-teal-50:bg-teal-900/20 rounded-lg transition-colors"
          >
            <UserGroupIcon className="w-5 h-5" />
            <span className="font-medium">See All Members</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetails;
