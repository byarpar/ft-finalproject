import React, { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  FaceSmileIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import socketClient from '../../services/socketClient';
import SkeletonLoader from '../UI/SkeletonLoader';

const ChatWindow = ({
  conversation,
  messages,
  onSendMessage,
  loading,
  typingUsers,
  onToggleDetails,
  showDetails,
  onBack
}) => {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Send typing indicator
    if (!isTyping && conversation) {
      setIsTyping(true);
      socketClient.sendTyping(conversation.id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (conversation) {
        socketClient.sendStopTyping(conversation.id);
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim() && conversation) {
      onSendMessage(messageInput);
      setMessageInput('');

      if (isTyping) {
        setIsTyping(false);
        socketClient.sendStopTyping(conversation.id);
      }
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <ChatBubbleLeftIcon className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      {/* Chat Header - Compact & Responsive */}
      <div className="px-2.5 md:px-3 py-2 md:py-2.5 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0 z-10">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* Back Button - Mobile Only */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100:bg-gray-800 transition-colors"
              title="Back to conversations"
              aria-label="Back to conversations"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Avatar */}
          <div className="w-8 h-8 md:w-9 md:h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm">
            <span className="text-xs md:text-sm font-bold text-white">
              {conversation.name?.[0]?.toUpperCase() || 'C'}
            </span>
          </div>

          {/* Name and status */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] md:text-[15px] font-semibold text-gray-900 truncate leading-tight">
              {conversation.name || 'Conversation'}
            </h2>
            <p className="text-[11px] md:text-xs text-gray-500 truncate leading-tight">
              {conversation.participants?.length || 0} participant{conversation.participants?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleDetails}
            className={`p-2 rounded-lg transition-colors ${showDetails
              ? 'bg-teal-50 text-teal-600'
              : 'hover:bg-gray-100:bg-gray-800 text-gray-600'
              }`}
            title="Conversation details"
            aria-label="Toggle conversation details"
          >
            <InformationCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4 space-y-2 md:space-y-2.5 bg-gray-50 chat-scrollbar chat-scroll-smooth min-h-0">
        {loading ? (
          <div className="space-y-3">
            <SkeletonLoader variant="chat-message" count={4} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="max-w-sm">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 md:w-20 md:h-20 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-gray-500">
                Start the conversation by sending a message below.
                Say hello and break the ice! 👋
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === user.id;
            const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-1.5 md:space-x-2 animate-fade-in`}
              >
                {!isOwn && showAvatar && (
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex-shrink-0 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] md:text-xs font-semibold text-gray-700">
                      {message.sender?.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-6 md:w-7" />}

                <div className={`max-w-[70%] md:max-w-lg ${isOwn ? 'order-1' : 'order-2'}`}>
                  {!isOwn && showAvatar && (
                    <p className="text-[11px] md:text-xs text-gray-600 mb-0.5 px-1">
                      {message.sender?.username}
                    </p>
                  )}
                  <div
                    className={`px-3 py-2 md:px-3.5 md:py-2 rounded-2xl shadow-sm ${isOwn
                      ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white'
                      : 'bg-white text-gray-900'
                      }`}
                  >
                    <p className="text-[14px] md:text-[15px] leading-normal whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-500 mt-0.5 px-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    {message.is_edited && <span className="ml-1 italic">(edited)</span>}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {typingUsers.size > 0 && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm italic">
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span>{Array.from(typingUsers).join(', ')} typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Touch-Friendly & Responsive - Always visible at bottom */}
      <div className="p-2.5 md:p-3 border-t border-gray-200 bg-white flex-shrink-0 z-10">
        <form onSubmit={handleSubmit} className="flex items-end space-x-1.5 md:space-x-2">
          {/* Emoji Button */}
          <button
            type="button"
            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100:bg-gray-800 transition-colors flex-shrink-0"
            title="Add emoji"
            aria-label="Add emoji"
          >
            <FaceSmileIcon className="w-5 h-5 text-gray-500" />
          </button>

          {/* Text Input - Responsive sizing */}
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={handleInputChange}
              placeholder="Type your message..."
              rows="1"
              className="w-full px-3 py-2 md:px-3.5 md:py-2.5 text-[14px] md:text-[15px] border border-gray-300 rounded-2xl bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white:bg-gray-900 resize-none max-h-32 transition-colors"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Attachment Button - Hidden on small mobile */}
          <button
            type="button"
            className="hidden sm:flex p-1.5 md:p-2 rounded-lg hover:bg-gray-100:bg-gray-800 transition-colors flex-shrink-0"
            title="Attach file"
            aria-label="Attach file"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Send Button - Compact but touch-friendly */}
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none flex-shrink-0 min-w-[36px] min-h-[36px] md:min-w-[40px] md:min-h-[40px] flex items-center justify-center"
            title="Send message"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
