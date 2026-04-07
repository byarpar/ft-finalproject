import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/LayoutComponents';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * Messages Page
 * Displays direct messages between users
 */
const Messages = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      userId: 'user1',
      username: 'John Doe',
      avatar: 'J',
      lastMessage: 'Thanks for your help! Really appreciated.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: 2,
      messages: []
    },
    {
      id: 2,
      userId: 'user2',
      username: 'Sarah Smith',
      avatar: 'S',
      lastMessage: 'Can we discuss the project deadline?',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      unread: 0,
      messages: []
    },
    {
      id: 3,
      userId: 'user3',
      username: 'Mike Johnson',
      avatar: 'M',
      lastMessage: 'That solution works great!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      unread: 0,
      messages: []
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle sending message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    // Add message to conversation
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? {
            ...conv,
            lastMessage: messageText,
            timestamp: new Date(),
            messages: [
              ...conv.messages,
              {
                id: Date.now(),
                sender: 'you',
                text: messageText,
                timestamp: new Date()
              }
            ]
          }
          : conv
      )
    );
    setMessageText('');
    toast.success('Message sent');
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get time ago format
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <PageLayout
      title="Messages"
      description="Direct messages with community members"
      fullWidth={true}
      background="bg-gray-50"
    >
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto h-[calc(100vh-80px)]">
          <div className="flex gap-4 h-full bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
                <form className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </form>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-600 text-sm">No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {conv.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm">{conv.username}</h3>
                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs text-gray-500">{getTimeAgo(conv.timestamp)}</p>
                          {conv.unread > 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full font-semibold">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold">
                      {selectedConversation.avatar}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedConversation.username}</h2>
                      <p className="text-xs text-gray-500">Active now</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
                  {selectedConversation.messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">No messages yet. Start a conversation!</p>
                      </div>
                    </div>
                  ) : (
                    selectedConversation.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'you'
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${msg.sender === 'you' ? 'text-teal-100' : 'text-gray-500'
                              }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <UserCircleIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-medium">Select a conversation to start</p>
                  <p className="text-gray-500 text-sm mt-2">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Messages;
