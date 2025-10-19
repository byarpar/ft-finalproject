import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import SkeletonLoader from '../UI/SkeletonLoader';

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewChat,
  loading,
  onlineUsers,
  publicChannel
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConversationName = (conversation) => {
    return conversation.name || 'Unnamed Group';
  };

  const getConversationAvatar = (conversation) => {
    return conversation.avatar_url || null;
  };

  return (
    <div className="h-full w-full border-r border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="px-3 md:px-4 py-3 md:py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Messages
          </h2>
          <button
            onClick={onNewChat}
            className="p-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all"
            title="New message"
            aria-label="New message"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm border border-gray-200 rounded-full bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white:bg-gray-800 transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {loading ? (
          <div className="p-3">
            <SkeletonLoader variant="list-item" count={5} />
          </div>
        ) : (
          <>
            {/* Public All Chat Channel */}
            {publicChannel && (
              <>
                <button
                  onClick={() => onSelectConversation(publicChannel)}
                  className={`w-full p-3 md:p-4 flex items-start space-x-3 transition-all relative group ${selectedConversation?.id === publicChannel.id
                    ? 'bg-gradient-to-r from-teal-50 to-blue-50'
                    : 'hover:bg-gray-50:bg-gray-700/50'
                    }`}
                >
                  {/* Selection Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${selectedConversation?.id === publicChannel.id
                    ? 'bg-gradient-to-b from-teal-600 to-blue-600'
                    : 'bg-transparent group-hover:bg-gray-300:bg-gray-600'
                    }`} />

                  {/* Avatar - Special Icon for Public Channel */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-teal-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-white">
                      <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    {/* Public badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-[15px] md:text-base font-bold truncate ${selectedConversation?.id === publicChannel.id
                          ? 'text-teal-900'
                          : 'text-gray-900'
                          }`}>
                          {publicChannel.name}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-semibold text-teal-600 bg-teal-100 rounded-full">
                          Public
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] md:text-sm text-gray-600 truncate">
                      Chat with everyone in the community
                    </p>
                  </div>
                </button>
                <div className="border-b-2 border-gray-200 mx-3 my-2" />
              </>
            )}

            {/* Regular Conversations */}
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500 px-4 text-center">
                <ChatBubbleLeftIcon className="w-12 h-12 mb-2" />
                <p className="mb-2">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
                {!searchQuery && (
                  <button
                    onClick={onNewChat}
                    className="text-teal-600 hover:underline"
                  >
                    Start a conversation
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id;
                const lastMessage = conversation.last_message;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation)}
                    className={`w-full p-3 md:p-4 flex items-start space-x-3 transition-all relative group ${isSelected
                      ? 'bg-teal-50'
                      : 'hover:bg-gray-50:bg-gray-700/50'
                      }`}
                  >
                    {/* Selection Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${isSelected
                      ? 'bg-teal-600'
                      : 'bg-transparent group-hover:bg-gray-300:bg-gray-600'
                      }`} />

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {getConversationAvatar(conversation) ? (
                        <img
                          src={getConversationAvatar(conversation)}
                          alt=""
                          className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm">
                          <UserGroupIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      {/* Online indicator (if needed later) */}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-[15px] md:text-base font-semibold truncate ${isSelected
                          ? 'text-teal-900'
                          : 'text-gray-900'
                          }`}>
                          {getConversationName(conversation)}
                        </h3>
                        {conversation.last_message_at && (
                          <span className="text-xs md:text-sm text-gray-500 ml-2 flex-shrink-0">
                            {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] md:text-sm text-gray-600 truncate flex-1">
                          {lastMessage ? (
                            <>
                              <span className="font-medium">{lastMessage.sender_username}:</span>{' '}
                              {lastMessage.content}
                            </>
                          ) : (
                            <span className="italic text-gray-500">No messages yet</span>
                          )}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="ml-2 px-2 py-0.5 min-w-[20px] text-xs font-bold text-white bg-teal-600 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm">
                            {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
