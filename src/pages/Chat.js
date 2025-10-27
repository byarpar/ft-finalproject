import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import chatService from '../services/chatService';
import socketClient from '../services/socketClient';
import PageLayout from '../components/Layout/PageLayout';

// Import layout components
import HeroNavbar from '../components/Layout/HeroNavbar';

// Import chat components
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import ConversationDetails from '../components/Chat/ConversationDetails';
import NewChatModal from '../components/Chat/NewChatModal';

// Constants
const PUBLIC_CHANNEL_ID = '00000000-0000-0000-0000-000000000001';
const TOAST_DURATION = 3000;

/**
 * Chat Component
 * 
 * Professional real-time messaging interface with optimized performance:
 * - Implements proper React patterns (memoization, useCallback)
 * - Optimized state management
 * - Clean separation of concerns
 * - Error handling with user feedback
 * - Responsive three-column layout
 * 
 * @component
 */
const Chat = () => {
  // Hooks
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State Management - Grouped by concern
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [showDetails, setShowDetails] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Real-time State
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Memoized public channel configuration
  const allChatChannel = useMemo(() => ({
    id: PUBLIC_CHANNEL_ID,
    name: 'All Chat Channel',
    type: 'public',
    description: 'Public channel for all users',
    isPublic: true,
    participants: [],
    unread_count: 0,
    avatar_url: null
  }), []);

  // URL Parameters
  const conversationIdFromUrl = searchParams.get('conversation');

  // ============================================================================
  // Socket.IO Connection Management
  // ============================================================================

  /**
   * Initialize and manage Socket.IO connection
   * Connects on mount with auth token, disconnects on unmount
   */
  useEffect(() => {
    if (!token) return;

    socketClient.connect(token);

    return () => {
      socketClient.disconnect();
    };
  }, [token]);

  /**
   * Set up Socket.IO event listeners for real-time updates
   * Optimized with proper dependency management
   */
  useEffect(() => {
    // Handler: New Message
    const handleNewMessage = (data) => {
      const { conversationId, message } = data;

      // Update messages if viewing this conversation
      if (selectedConversation?.id === conversationId) {
        setMessages(prev => [...prev, message]);
        socketClient.markAsRead(conversationId);
      }

      // Update conversation list with new message and sort
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id !== conversationId) return conv;

          return {
            ...conv,
            last_message: message,
            last_message_at: message.created_at,
            unread_count: selectedConversation?.id === conversationId
              ? 0
              : (conv.unread_count || 0) + 1
          };
        });

        // Sort by most recent message
        return updated.sort((a, b) =>
          new Date(b.last_message_at) - new Date(a.last_message_at)
        );
      });
    };

    // Handler: Typing Indicators
    const handleUserTyping = (data) => {
      if (selectedConversation?.id === data.conversationId) {
        setTypingUsers(prev => new Set([...prev, data.username]));
      }
    };

    const handleUserStopTyping = (data) => {
      if (selectedConversation?.id === data.conversationId) {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.username);
          return updated;
        });
      }
    };

    // Handler: User Online Status
    const handleUserStatus = ({ userId, isOnline }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        isOnline ? updated.add(userId) : updated.delete(userId);
        return updated;
      });
    };

    // Handler: Message Reactions
    const handleReactionAdded = (data) => {
      if (selectedConversation?.id !== data.conversationId) return;

      setMessages(prev => prev.map(msg =>
        msg.id === data.messageId
          ? { ...msg, reactions: [...(msg.reactions || []), data.reaction] }
          : msg
      ));
    };

    const handleReactionRemoved = (data) => {
      if (selectedConversation?.id !== data.conversationId) return;

      setMessages(prev => prev.map(msg =>
        msg.id === data.messageId
          ? {
            ...msg,
            reactions: (msg.reactions || []).filter(
              r => !(r.user_id === data.userId && r.emoji === data.emoji)
            )
          }
          : msg
      ));
    };

    // Register all event listeners
    socketClient.onNewMessage(handleNewMessage);
    socketClient.onUserTyping(handleUserTyping);
    socketClient.onUserStopTyping(handleUserStopTyping);
    socketClient.onUserStatus(handleUserStatus);
    socketClient.onReactionAdded(handleReactionAdded);
    socketClient.onReactionRemoved(handleReactionRemoved);

    // Cleanup on unmount
    return () => {
      socketClient.offAll();
    };
  }, [selectedConversation]);

  // ============================================================================
  // Data Loading Effects
  // ============================================================================

  /**
   * Load conversations on component mount
   */
  useEffect(() => {
    loadConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle conversation selection from URL parameter
   * Auto-selects conversation when navigating via URL
   */
  useEffect(() => {
    if (!conversationIdFromUrl || conversations.length === 0 || selectedConversation) {
      return;
    }

    const targetConversation = conversations.find(c => c.id === conversationIdFromUrl);
    if (targetConversation) {
      handleSelectConversation(targetConversation);
    }
  }, [conversationIdFromUrl, conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // API Functions
  // ============================================================================

  /**
   * Load all conversations from API
   * Filters to include only conversations where user is a participant
   * Public channels are always included
   */
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      const allConversations = response.data?.conversations || [];

      // Filter: Only include accessible conversations
      const validConversations = allConversations.filter(conv => {
        // Public channels are always accessible
        if (conv.type === 'public' || conv.id === PUBLIC_CHANNEL_ID) {
          return true;
        }

        // Check participant membership (use user_id from backend)
        return (
          conv.participants?.some(p => p.user_id === user.id || p.id === user.id) ||
          conv.other_participants?.some(p => p.user_id === user.id || p.id === user.id)
        );
      });

      // Notify user if conversations were filtered
      const filteredCount = allConversations.length - validConversations.length;
      if (filteredCount > 0) {
        toast.info(
          `Removed ${filteredCount} inaccessible conversation${filteredCount > 1 ? 's' : ''}`,
          { duration: TOAST_DURATION }
        );
      }

      setConversations(validConversations);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to load conversations';
      toast.error(errorMessage, { duration: TOAST_DURATION });
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  /**
   * Handle conversation selection
   * Loads messages, joins socket room, and updates read status
   * 
   * @param {Object} conversation - The conversation to select
   */
  const handleSelectConversation = useCallback(async (conversation) => {
    if (!conversation) return;

    try {
      // Set up UI state
      setSelectedConversation(conversation);
      setLoading(true);
      setMessages([]);
      setSearchParams({ conversation: conversation.id });

      // Join socket room for real-time updates
      socketClient.joinConversation(conversation.id);

      // Load conversation messages
      const response = await chatService.getMessages(conversation.id);
      setMessages(response.data?.messages || []);

      // Mark messages as read
      await chatService.markAsRead(conversation.id);
      socketClient.markAsRead(conversation.id);

      // Update unread count in conversation list
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversation.id
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to load messages';

      // Handle access denied errors
      const isAccessDenied = errorMessage.includes('not a participant');
      const isPublicChannel = conversation.type === 'public' || conversation.id === PUBLIC_CHANNEL_ID;

      if (isAccessDenied && !isPublicChannel) {
        // Remove inaccessible private conversation
        toast.error(
          `Cannot access "${conversation.name || 'this conversation'}". Removing from list...`,
          { duration: TOAST_DURATION }
        );

        setConversations(prev => prev.filter(c => c.id !== conversation.id));
        setSelectedConversation(null);
        setMessages([]);
        setSearchParams({});
      } else {
        toast.error(errorMessage, { duration: TOAST_DURATION });
      }
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  /**
   * Handle sending a message via Socket.IO
   * 
   * @param {string} content - Message content
   * @param {string} messageType - Type of message (text, image, etc.)
   * @param {string|null} replyToMessageId - ID of message being replied to
   */
  const handleSendMessage = useCallback(
    async (content, messageType = 'text', replyToMessageId = null) => {
      if (!selectedConversation || !content?.trim()) return;

      try {
        socketClient.sendMessage(
          selectedConversation.id,
          content.trim(),
          messageType,
          replyToMessageId
        );
      } catch (error) {
        toast.error('Failed to send message', { duration: TOAST_DURATION });
      }
    },
    [selectedConversation]
  );

  /**
   * Handle creating a new conversation/group
   * 
   * @param {string} type - Conversation type
   * @param {Object} data - Conversation data (name, participants, etc.)
   */
  const handleNewChat = useCallback(async (type, data) => {
    try {
      const response = await chatService.createConversation(data);
      const newConversation = response.data;

      // Add to conversation list and select it
      setConversations(prev => [newConversation, ...prev]);
      handleSelectConversation(newConversation);
      setShowNewChatModal(false);

      toast.success('Conversation created successfully', { duration: TOAST_DURATION });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to create conversation';
      toast.error(errorMessage, { duration: TOAST_DURATION });
    }
  }, [handleSelectConversation]);

  // ============================================================================
  // UI Event Handlers
  // ============================================================================

  /**
   * Toggle conversation details panel
   */
  const handleToggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  /**
   * Handle back button (mobile) - deselect conversation
   */
  const handleBack = useCallback(() => {
    setSelectedConversation(null);
    setSearchParams({});
  }, [setSearchParams]);

  /**
   * Handle conversation updates (name, description, etc.)
   */
  const handleUpdateConversation = useCallback((updates) => {
    setSelectedConversation(prev => ({ ...prev, ...updates }));
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation?.id
          ? { ...conv, ...updates }
          : conv
      )
    );
  }, [selectedConversation]);

  // ============================================================================
  // Authentication Guard
  // ============================================================================

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Don't render if user is not authenticated
  if (!user) return null;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <PageLayout
      title="Chat - Lisu Dictionary"
      description="Real-time messaging and communication platform"
      fullWidth={true}
      background=""
    >
      {/* Main Container */}
      <div className="h-screen flex flex-col">
        {/* Navigation Bar with Gradient Background */}
        <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800">
          <HeroNavbar />
        </section>

        {/* Chat Container - Responsive Three Column Layout */}
        <div className="flex-1 flex overflow-hidden bg-gray-50">

          {/* 
            LEFT COLUMN: Conversation List
            - Desktop: Always visible
            - Mobile: Hidden when conversation is selected
          */}
          <aside
            className={`
              ${selectedConversation ? 'hidden md:flex' : 'flex'}
              flex-col w-full md:w-80 lg:w-[320px] xl:w-[360px] flex-shrink-0
              border-r border-gray-200
              bg-white
            `}
            aria-label="Conversations list"
          >
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onNewChat={() => setShowNewChatModal(true)}
              loading={loading}
              onlineUsers={onlineUsers}
              publicChannel={allChatChannel}
            />
          </aside>

          {/* 
            MIDDLE COLUMN: Chat Window
            - Desktop: Always visible
            - Mobile: Full screen when conversation is selected
          */}
          <main
            className={`
              ${selectedConversation ? 'flex' : 'hidden md:flex'}
              flex-col flex-1 min-w-0
              ${showDetails ? 'md:border-r md:border-gray-200' : ''}
              bg-white
            `}
            aria-label="Chat window"
          >
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
              typingUsers={typingUsers}
              onToggleDetails={handleToggleDetails}
              showDetails={showDetails}
              onBack={handleBack}
            />
          </main>

          {/* 
            RIGHT COLUMN: Conversation Details
            - Desktop: Collapsible sidebar
            - Mobile: Full-screen overlay with backdrop
          */}
          {showDetails && selectedConversation && (
            <>
              {/* Mobile Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setShowDetails(false)}
                aria-hidden="true"
              />

              {/* Details Panel */}
              <aside
                className={`
                  fixed md:relative
                  right-0 top-0 bottom-0
                  w-full md:w-80 lg:w-[320px] xl:w-[360px]
                  bg-white
                  z-50 md:z-auto
                  transform transition-transform duration-300 ease-in-out
                  ${showDetails ? 'translate-x-0' : 'translate-x-full'}
                  shadow-2xl md:shadow-none
                  flex flex-col
                `}
                aria-label="Conversation details"
              >
                <ConversationDetails
                  conversation={selectedConversation}
                  onClose={() => setShowDetails(false)}
                  onUpdateConversation={handleUpdateConversation}
                />
              </aside>
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
    </PageLayout>
  );
};

export default Chat;
