/**
 * Chat Page Component
 * 
 * Real-time messaging interface with three-column layout:
 * - Left: Conversation list
 * - Middle: Chat window with messages
 * - Right: Conversation details (collapsible)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import chatService from '../services/chatService';
import socketClient from '../services/socketClient';

// Import chat components
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import ConversationDetails from '../components/Chat/ConversationDetails';
import NewChatModal from '../components/Chat/NewChatModal';

const Chat = () => {
  const { user, token } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Public All Chat Channel (using fixed UUID from database)
  const allChatChannel = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'All Chat Channel',
    type: 'public',
    description: 'Public channel for all users',
    isPublic: true,
    participants: [],
    unread_count: 0,
    avatar_url: null
  };

  // Get conversation ID from URL
  const conversationIdFromUrl = searchParams.get('conversation');

  /**
   * Initialize Socket.IO connection
   */
  useEffect(() => {
    if (token) {
      socketClient.connect(token);

      return () => {
        socketClient.disconnect();
      };
    }
  }, [token]);

  /**
   * Set up Socket.IO event listeners
   */
  useEffect(() => {
    // Listen for new messages
    socketClient.onNewMessage((data) => {
      const { conversationId, message } = data;

      // If the message is for the selected conversation, add it
      if (selectedConversation && conversationId === selectedConversation.id) {
        setMessages(prev => [...prev, message]);

        // Mark as read if user is viewing the conversation
        socketClient.markAsRead(conversationId);
      }

      // Update conversation list (move to top, update last message)
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              last_message: message,
              last_message_at: message.created_at,
              unread_count: selectedConversation?.id === conversationId
                ? 0
                : (conv.unread_count || 0) + 1
            };
          }
          return conv;
        });

        // Sort by last message time
        return updated.sort((a, b) =>
          new Date(b.last_message_at) - new Date(a.last_message_at)
        );
      });
    });

    // Listen for typing indicators
    socketClient.onUserTyping((data) => {
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        setTypingUsers(prev => new Set(prev).add(data.username));
      }
    });

    socketClient.onUserStopTyping((data) => {
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.username);
          return updated;
        });
      }
    });

    // Listen for user status changes
    socketClient.onUserStatus((data) => {
      const { userId, isOnline } = data;
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (isOnline) {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    // Listen for reactions
    socketClient.onReactionAdded((data) => {
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === data.messageId) {
            const reactions = msg.reactions || [];
            return {
              ...msg,
              reactions: [...reactions, data.reaction]
            };
          }
          return msg;
        }));
      }
    });

    socketClient.onReactionRemoved((data) => {
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === data.messageId) {
            return {
              ...msg,
              reactions: (msg.reactions || []).filter(
                r => !(r.user_id === data.userId && r.emoji === data.emoji)
              )
            };
          }
          return msg;
        }));
      }
    });

    return () => {
      socketClient.offAll();
    };
  }, [selectedConversation, user]);

  /**
   * Load conversations on mount
   */
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle URL conversation selection
   */
  useEffect(() => {
    if (conversationIdFromUrl && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find(c => c.id === conversationIdFromUrl);
      if (conv && conv.id !== selectedConversation?.id) {
        handleSelectConversation(conv);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationIdFromUrl, conversations.length]);

  /**
   * Load all conversations
   */
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      const conversations = response.data || [];

      console.log('📋 Loaded conversations:', conversations.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        participantCount: c.participants?.length || 0,
        otherParticipantCount: c.other_participants?.length || 0,
        participants: c.participants,
        other_participants: c.other_participants
      })));

      // Filter out conversations where user is not actually a participant
      const validConversations = conversations.filter(conv => {
        // Public channels are always accessible
        if (conv.type === 'public' || conv.id === 'all-chat-public') {
          return true;
        }

        // Check if user is in participants list
        const userInParticipants = conv.participants?.some(p => p.id === user.id) ||
          conv.other_participants?.some(p => p.id === user.id);

        if (!userInParticipants) {
          console.warn('⚠️  User not in participants for conversation:', {
            id: conv.id,
            name: conv.name,
            type: conv.type,
            participantCount: conv.participants?.length || 0
          });
        }

        return userInParticipants;
      });

      if (validConversations.length < conversations.length) {
        const filtered = conversations.length - validConversations.length;
        console.info(`🧹 Filtered ${filtered} invalid conversation(s)`);
        toast.info(`Removed ${filtered} inaccessible conversation(s)`, { duration: 2000 });
      }

      setConversations(validConversations);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to load conversations';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle conversation selection
   */
  const handleSelectConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);
      setMessagesLoading(true);
      setMessages([]);

      // Update URL
      setSearchParams({ conversation: conversation.id });

      // Join conversation room via socket (works for all conversation types including public)
      socketClient.joinConversation(conversation.id);

      // Load messages for regular conversations
      const response = await chatService.getMessages(conversation.id);
      console.log('📨 Messages response:', response);
      setMessages(response.data || []);

      // Mark as read
      await chatService.markAsRead(conversation.id);
      socketClient.markAsRead(conversation.id);

      // Update unread count in conversations list
      setConversations(prev => prev.map(conv =>
        conv.id === conversation.id
          ? { ...conv, unread_count: 0 }
          : conv
      ));
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      console.error('Error details:', {
        conversationId: conversation?.id,
        conversationName: conversation?.name,
        conversationType: conversation?.type,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Show more specific error message
      const errorMessage = error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to load messages';

      // Handle "not a participant" error specifically
      // But don't remove public channels - they're always accessible
      if (errorMessage.includes('not a participant') &&
        conversation.type !== 'public' &&
        conversation.id !== 'all-chat-public') {
        toast.error(`Cannot access "${conversation.name || 'this conversation'}". Removing from list...`, { duration: 3000 });

        // Remove the problematic conversation from the list
        setConversations(prev => prev.filter(c => c.id !== conversation.id));
        setSelectedConversation(null);
        setMessages([]);

        // Clear URL parameter
        setSearchParams({});
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = useCallback(async (content, messageType = 'text', replyToMessageId = null) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      // Send via Socket.IO for real-time delivery (works for all conversation types)
      socketClient.sendMessage(
        selectedConversation.id,
        content.trim(),
        messageType,
        replyToMessageId
      );
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  /**
   * Handle starting a new group chat
   */
  const handleNewChat = async (type, data) => {
    try {
      const response = await chatService.createConversation({
        ...data
      });

      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      handleSelectConversation(newConversation);
      setShowNewChatModal(false);
      toast.success('Group created');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Chat - Lisu Dictionary</title>
        <meta name="description" content="Real-time messaging and communication" />
      </Helmet>

      <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
        {/* Chat Container - Responsive Three Column Layout */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left Sidebar - Conversation List */}
          {/* Desktop: Always visible | Mobile: Hidden when conversation selected */}
          <div className={`
            ${selectedConversation ? 'hidden md:flex' : 'flex'}
            flex-col w-full md:w-80 lg:w-96 flex-shrink-0
          `}>
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onNewChat={() => setShowNewChatModal(true)}
              loading={loading}
              onlineUsers={onlineUsers}
              publicChannel={allChatChannel}
            />
          </div>

          {/* Middle Column - Chat Window */}
          {/* Desktop: Always visible | Mobile: Full screen when conversation selected */}
          <div className={`
            ${selectedConversation ? 'flex' : 'hidden md:flex'}
            flex-col flex-1 min-w-0
          `}>
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={messagesLoading}
              typingUsers={typingUsers}
              onToggleDetails={() => setShowDetails(!showDetails)}
              showDetails={showDetails}
              onBack={() => {
                setSelectedConversation(null);
                setSearchParams({});
              }}
            />
          </div>

          {/* Right Sidebar - Conversation Details */}
          {/* Desktop: Collapsible sidebar | Mobile: Full-screen overlay */}
          {showDetails && selectedConversation && (
            <>
              {/* Mobile Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setShowDetails(false)}
              />

              {/* Details Panel */}
              <div className={`
                fixed lg:relative
                right-0 top-0 bottom-0
                w-full max-w-sm lg:w-80 xl:w-96
                bg-white dark:bg-gray-800
                z-50 lg:z-auto
                transform transition-transform duration-300 ease-in-out
                ${showDetails ? 'translate-x-0' : 'translate-x-full'}
                shadow-2xl lg:shadow-none
                flex flex-col
              `}>
                <ConversationDetails
                  conversation={selectedConversation}
                  onClose={() => setShowDetails(false)}
                  onUpdateConversation={(updates) => {
                    setSelectedConversation({ ...selectedConversation, ...updates });
                    setConversations(prev => prev.map(conv =>
                      conv.id === selectedConversation.id
                        ? { ...conv, ...updates }
                        : conv
                    ));
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onCreate={handleNewChat}
        />
      )}
    </>
  );
};

export default Chat;
