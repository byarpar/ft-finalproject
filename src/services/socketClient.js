/**
 * Socket.IO Client Service
 * 
 * Manages WebSocket connections for real-time chat
 */

import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.IO server
   */
  connect(token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const serverUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('chat:join_conversation', { conversationId });
    }
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('chat:leave_conversation', { conversationId });
    }
  }

  /**
   * Send a message
   */
  sendMessage(conversationId, content, messageType = 'text', replyToMessageId = null) {
    if (this.socket) {
      console.log('🚀 Sending message:', { conversationId, content, messageType });
      this.socket.emit('chat:send_message', {
        conversationId,
        content,
        messageType,
        replyToMessageId
      });
    } else {
      console.error('❌ Socket not connected - cannot send message');
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('chat:typing', { conversationId });
    }
  }

  /**
   * Send stop typing indicator
   */
  sendStopTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('chat:stop_typing', { conversationId });
    }
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId) {
    if (this.socket) {
      this.socket.emit('chat:mark_read', { conversationId });
    }
  }

  /**
   * Add reaction to message
   */
  addReaction(conversationId, messageId, emoji) {
    if (this.socket) {
      this.socket.emit('chat:add_reaction', {
        conversationId,
        messageId,
        emoji
      });
    }
  }

  /**
   * Remove reaction from message
   */
  removeReaction(conversationId, messageId, emoji) {
    if (this.socket) {
      this.socket.emit('chat:remove_reaction', {
        conversationId,
        messageId,
        emoji
      });
    }
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('chat:new_message', (data) => {
        console.log('📨 Received new message:', data);
        callback(data);
      });
      this.listeners.set('chat:new_message', callback);
    }
  }

  /**
   * Listen for user typing
   */
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('chat:user_typing', callback);
      this.listeners.set('chat:user_typing', callback);
    }
  }

  /**
   * Listen for user stop typing
   */
  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('chat:user_stop_typing', callback);
      this.listeners.set('chat:user_stop_typing', callback);
    }
  }

  /**
   * Listen for messages read
   */
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('chat:messages_read', callback);
      this.listeners.set('chat:messages_read', callback);
    }
  }

  /**
   * Listen for reaction added
   */
  onReactionAdded(callback) {
    if (this.socket) {
      this.socket.on('chat:reaction_added', callback);
      this.listeners.set('chat:reaction_added', callback);
    }
  }

  /**
   * Listen for reaction removed
   */
  onReactionRemoved(callback) {
    if (this.socket) {
      this.socket.on('chat:reaction_removed', callback);
      this.listeners.set('chat:reaction_removed', callback);
    }
  }

  /**
   * Listen for user status changes
   */
  onUserStatus(callback) {
    if (this.socket) {
      this.socket.on('chat:user_status', callback);
      this.listeners.set('chat:user_status', callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  /**
   * Remove all event listeners
   */
  offAll() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Create a singleton instance
const socketClient = new SocketClient();

export default socketClient;
