/**
 * Chat Page Component
 * 
 * Real-time messaging interface with three-column layout:
 * - Left: Conversation list
 * - Middle: Chat window with messages
 * - Right: Conversation details (collapsible)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationsAPI } from '../services/notificationsAPI';
import toast from 'react-hot-toast';
import chatService from '../services/chatService';
import socketClient from '../services/socketClient';
import {
  BookOpenIcon,
  BellIcon,
  UserCircleIcon,
  InformationCircleIcon,
  ArrowRightCircleIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Import chat components
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import ConversationDetails from '../components/Chat/ConversationDetails';
import NewChatModal from '../components/Chat/NewChatModal';

const Chat = () => {
  const { user, token, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Header navigation state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  // Socket.IO notification listener (separate from chat notifications)
  useEffect(() => {
    if (user) {
      socketClient.onNewNotification((notification) => {
        fetchUnreadCount();
        toast.success(notification.message || 'You have a new notification');
      });
    }

    return () => {
      if (user) {
        socketClient.socket?.off('newNotification');
      }
    };
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setUserProfileDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

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
      setLoading(true);
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
      setLoading(false);
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
        {/* Oxford-Style Header Navigation */}
        <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 dark:from-teal-700 dark:via-teal-800 dark:to-teal-900">
          {/* Top Navigation Bar */}
          <div className="relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              {/* Logo/Brand */}
              <Link to="/" className="group flex items-center gap-3">
                <div className="relative w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-all border border-white/20">
                  <BookOpenIcon className="w-8 h-8 text-white/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-[9px] tracking-tight drop-shadow-lg">LED</span>
                  </div>
                </div>
                <div className="text-white font-light text-xl tracking-[0.3em] uppercase">
                  LISU DICT
                </div>
              </Link>

              {/* Center Navigation Links - Desktop only, show when logged in */}
              {user && !isMobile && (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    to="/"
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/')
                      ? 'bg-white/10 text-white border-b-2 border-white'
                      : 'text-white hover:text-teal-100 hover:bg-white/5'
                      }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/discussions"
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/discussions')
                      ? 'bg-white/10 text-white border-b-2 border-white'
                      : 'text-white hover:text-teal-100 hover:bg-white/5'
                      }`}
                  >
                    Discussions
                  </Link>
                  <Link
                    to="/about"
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${isActive('/about')
                      ? 'bg-white/10 text-white border-b-2 border-white'
                      : 'text-white hover:text-teal-100 hover:bg-white/5'
                      }`}
                  >
                    About Us
                  </Link>
                </div>
              )}

              {/* Top Right Icons */}
              <div className="flex items-center gap-2">
                {!user ? (
                  <>
                    {/* Desktop: Show profile dropdown */}
                    <div className="hidden md:block relative" ref={dropdownRef}>
                      <button
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
                        aria-label="Profile menu"
                      >
                        <UserCircleIcon className="w-5 h-5 text-white" />
                      </button>

                      {profileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                          <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <ArrowRightCircleIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            Log In
                          </Link>
                          <Link
                            to="/register"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <UserPlusIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            Sign Up
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Mobile: Show login/register buttons */}
                    <div className="md:hidden flex items-center gap-1">
                      <Link
                        to="/login"
                        className="px-2 py-1 text-white text-xs font-medium hover:opacity-80 transition-opacity"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        className="px-2 py-1 bg-white/20 text-white text-xs font-medium rounded-lg hover:bg-white/30 transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Notification Icon with Badge */}
                    <Link
                      to="/notifications"
                      className="relative hover:opacity-80 transition-opacity"
                      aria-label="Notifications"
                      title="Notifications"
                    >
                      <BellIcon className="w-5 h-5 text-white" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>

                    {/* Desktop: Profile Button with Dropdown */}
                    <div className="hidden md:block relative" ref={userDropdownRef}>
                      <button
                        onClick={() => setUserProfileDropdownOpen(!userProfileDropdownOpen)}
                        className="flex items-center gap-2 px-2 py-1 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-medium rounded-lg transition-all duration-200 border border-white/10"
                      >
                        <div className="w-7 h-7 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                          {user.profile_photo_url ? (
                            <img
                              src={user.profile_photo_url}
                              alt={user.full_name || user.username || 'User'}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <UserIcon className={`w-4 h-4 text-white ${user.profile_photo_url ? 'hidden' : ''}`} />
                        </div>
                      </button>

                      {/* User Profile Dropdown Menu */}
                      {userProfileDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setUserProfileDropdownOpen(false)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                            <div className="py-1">
                              <Link
                                to={`/users/${user.id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setUserProfileDropdownOpen(false)}
                              >
                                <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                                My Profile
                              </Link>
                              <Link
                                to="/discussions"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setUserProfileDropdownOpen(false)}
                              >
                                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-3 text-gray-400" />
                                My Discussions
                              </Link>
                              <Link
                                to="/dashboard"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setUserProfileDropdownOpen(false)}
                              >
                                <ChartPieIcon className="w-4 h-4 mr-3 text-gray-400" />
                                Dashboard
                              </Link>
                              <Link
                                to="/settings"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setUserProfileDropdownOpen(false)}
                              >
                                <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                                Settings
                              </Link>
                              {user.role === 'admin' && (
                                <Link
                                  to="/admin"
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                  onClick={() => setUserProfileDropdownOpen(false)}
                                >
                                  <ShieldCheckIcon className="w-4 h-4 mr-3 text-gray-400" />
                                  Admin Panel
                                </Link>
                              )}
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                              <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                                Logout
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Mobile: Hamburger Menu */}
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                      aria-label="Toggle mobile menu"
                    >
                      {mobileMenuOpen ? (
                        <XMarkIcon className="w-5 h-5 text-white" />
                      ) : (
                        <Bars3Icon className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && user && (
              <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-white/20 shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HomeIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium">Home</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ChartPieIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                  <Link
                    to="/discussions"
                    className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium">Discussions</span>
                  </Link>
                  <Link
                    to="/about"
                    className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <InformationCircleIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium">About Us</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Chat Container - Responsive Three Column Layout */}
        <div className="flex-1 flex overflow-hidden bg-gray-50 dark:bg-gray-900">

          {/* Left Sidebar - Conversation List */}
          {/* Desktop: Always visible | Mobile: Hidden when conversation selected */}
          <div className={`
            ${selectedConversation ? 'hidden md:flex' : 'flex'}
            flex-col w-full md:w-80 lg:w-[320px] xl:w-[360px] flex-shrink-0
            border-r border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800
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
            ${showDetails ? 'md:border-r md:border-gray-200 md:dark:border-gray-700' : ''}
            bg-white dark:bg-gray-800
          `}>
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
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
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setShowDetails(false)}
              />

              {/* Details Panel */}
              <div className={`
                fixed md:relative
                right-0 top-0 bottom-0
                w-full md:w-80 lg:w-[320px] xl:w-[360px]
                bg-white dark:bg-gray-800
                z-50 md:z-auto
                transform transition-transform duration-300 ease-in-out
                ${showDetails ? 'translate-x-0' : 'translate-x-full'}
                shadow-2xl md:shadow-none
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
