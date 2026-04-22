import React, { useState, useEffect, useRef } from 'react';
import { PageLayout } from '../components/LayoutComponents';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { messagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Messages Page
 * Displays direct messages between users
 */
const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationFilter, setConversationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [bootstrappingChat, setBootstrappingChat] = useState(false);
  const messagesEndRef = useRef(null);

  const queryUserId = searchParams.get('userId');
  const queryUsername = searchParams.get('user');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) fetchMessages(selectedConversation.id);
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(res.data?.conversations || []);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const openOrCreateConversationFromQuery = async () => {
    if ((!queryUserId && !queryUsername) || bootstrappingChat) return;

    // Try to match an existing conversation first.
    const existing = conversations.find((c) => {
      const byId = queryUserId && String(c.other_user_id) === String(queryUserId);
      const byUsername = queryUsername && String(c.other_username || '').toLowerCase() === String(queryUsername).toLowerCase();
      return byId || byUsername;
    });

    if (existing) {
      setSelectedConversation(existing);
      setSearchParams({}, { replace: true });
      return;
    }

    if (!queryUserId) {
      // Cannot create a conversation without userId; keep inbox open and notify.
      toast.error('Could not open chat: missing user id');
      setSearchParams({}, { replace: true });
      return;
    }

    setBootstrappingChat(true);
    try {
      await messagesAPI.getOrCreateConversation(queryUserId);
      const refetch = await messagesAPI.getConversations();
      const refreshedConversations = refetch.data?.conversations || [];
      setConversations(refreshedConversations);

      const created = refreshedConversations.find((c) => String(c.other_user_id) === String(queryUserId));
      if (created) {
        setSelectedConversation(created);
      } else {
        toast.error('Could not open conversation');
      }
    } catch {
      toast.error('Failed to open conversation');
    } finally {
      setBootstrappingChat(false);
      setSearchParams({}, { replace: true });
    }
  };

  useEffect(() => {
    if (!loading) {
      openOrCreateConversationFromQuery();
    }
    // Intentionally tracking these values to support direct URL opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, conversations, queryUserId, queryUsername]);

  const fetchMessages = async (conversationId) => {
    try {
      const res = await messagesAPI.getMessages(conversationId);
      setMessages(res.data?.messages || []);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const res = await messagesAPI.sendMessage(selectedConversation.id, messageText.trim());
      setMessages(prev => [...prev, res.data?.message]);
      setMessageText('');
      setConversations(prev => prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, last_message: messageText.trim(), last_message_at: new Date().toISOString() }
          : c
      ));
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const unreadConversations = conversations.filter((c) => parseInt(c.unread_count || 0, 10) > 0).length;

  const filteredConversations = conversations
    .filter((conv) => {
      const matchSearch = (conv.other_username || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchUnread = conversationFilter === 'unread' ? parseInt(conv.unread_count || 0, 10) > 0 : true;
      return matchSearch && matchUnread;
    })
    .sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime());

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr);
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m`;
    if (h < 24) return `${h}h`;
    if (d < 7) return `${d}d`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <PageLayout
      title="Messages"
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gray-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
              <Link to="/discussions" className="hover:text-teal-600 transition-colors">Form Questions</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Messages</span>
            </nav>
            <h1 className="app-title text-3xl sm:text-4xl text-gray-900">Messages</h1>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-[calc(100vh-16rem)] min-h-[500px]">
            <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Conversations List */}
              <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-200 flex-col flex-shrink-0`}>
                <div className="p-4 border-b border-gray-200">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="app-text-title text-sm text-gray-900">Conversations</h2>
                      <p className="app-label-uppercase text-gray-500">{conversations.length} total • {unreadConversations} unread</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConversationFilter(conversationFilter === 'all' ? 'unread' : 'all')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${conversationFilter === 'unread' ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      <FunnelIcon className="w-3.5 h-3.5" />
                      {conversationFilter === 'unread' ? 'Unread only' : 'All'}
                    </button>
                  </div>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                          <div className="avatar-unified bg-gray-200" />
                          <div className="flex-1"><div className="h-3 bg-gray-200 rounded mb-2 w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <UserCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">
                        {conversationFilter === 'unread' ? 'No unread conversations' : 'No conversations yet'}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {conversationFilter === 'unread' ? 'Switch to All to view your full inbox' : 'Visit a user profile to start messaging'}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="avatar-unified bg-gradient-to-r from-teal-400 to-teal-600 text-white font-semibold overflow-hidden">
                              {conv.other_photo ? (
                                <img src={conv.other_photo} alt={conv.other_username || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = ''); }} />
                              ) : null}
                              <span style={{ display: conv.other_photo ? 'none' : undefined }}>{(conv.other_username || '?')[0].toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm">{conv.other_username}</h3>
                              <p className="text-sm text-gray-500 truncate">{conv.last_message || 'No messages yet'}</p>
                            </div>
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <p className="text-xs text-gray-400">{getTimeAgo(conv.last_message_at)}</p>
                            {parseInt(conv.unread_count) > 0 && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full font-semibold">
                                {conv.unread_count}
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
                  <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="avatar-unified bg-gradient-to-r from-teal-400 to-teal-600 text-white font-semibold overflow-hidden">
                      {selectedConversation.other_photo ? (
                        <img src={selectedConversation.other_photo} alt={selectedConversation.other_username || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = ''); }} />
                      ) : null}
                      <span style={{ display: selectedConversation.other_photo ? 'none' : undefined }}>{(selectedConversation.other_username || '?')[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedConversation.other_username}</h2>
                      <p className="text-xs text-gray-400">{selectedConversation.other_status || 'offline'}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center">
                        <div>
                          <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {(msg.profile_photo_url || selectedConversation.other_photo) ? (
                                  <img src={msg.profile_photo_url || selectedConversation.other_photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; }} />
                                ) : (
                                  <span className="text-white text-[10px] font-bold">{(msg.username || selectedConversation.other_username || '?')[0].toUpperCase()}</span>
                                )}
                              </div>
                            )}
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isMe ? 'bg-teal-600 text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isMe ? 'text-teal-100' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        maxLength={1000}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || sending}
                        className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex flex-1 items-center justify-center text-center">
                  <div>
                    <UserCircleIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Select a conversation</p>
                    <p className="text-gray-400 text-sm mt-2">Choose from your conversations or visit a user profile to start one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Messages;
