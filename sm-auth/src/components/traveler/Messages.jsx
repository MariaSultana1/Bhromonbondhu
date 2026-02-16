// Messages.jsx
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Shield, DollarSign, Calendar, Search, MoreVertical, Loader, AlertCircle, User } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Generate color based on name
const getColorFromName = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Avatar component
const AvatarWithInitials = ({ image, name, className = 'w-12 h-12', online = false }) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <div className="relative">
        <img 
          src={image} 
          alt={name}
          className={`${className} rounded-full border-2 border-gray-200 object-cover`}
          onError={() => setImageError(true)}
        />
        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={`${className} rounded-full border-2 border-gray-200 flex items-center justify-center font-bold text-white text-lg ${getColorFromName(name)}`}>
        {getInitials(name)}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

// Helper function to format message time
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    console.error('Error formatting time:', e);
    return '';
  }
};

export function Messages() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [error, setError] = useState(null);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || user._id;
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    return null;
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      setError(null);
      
      const token = getAuthToken();
      console.log('Token exists:', !!token);
      console.log('Fetching conversations from:', `${API_BASE_URL}/messages/conversations`);
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: getAuthHeaders()
      });

      console.log('Conversations response status:', response.status);
      console.log('Conversations response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.message || response.statusText;
          console.error('Conversations error JSON:', errorData);
        } catch (e) {
          errorText = await response.text();
          console.error('Conversations error text:', errorText);
        }
        throw new Error(`Failed to fetch conversations: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Conversations data received:', {
        success: data.success,
        count: data.conversations?.length || 0,
        conversations: data.conversations
      });
      
      if (data.success) {
        const convs = data.conversations || [];
        console.log(`Setting ${convs.length} conversations`);
        setConversations(convs);
        
        // Auto-select first conversation if none selected
        if (convs.length > 0 && !selectedConversation) {
          const firstConv = convs[0];
          console.log('Auto-selecting first conversation:', firstConv._id);
          setSelectedConversation(firstConv);
          fetchMessages(firstConv._id);
        } else if (convs.length === 0) {
          console.log('No conversations found');
        }
      } else {
        throw new Error(data.message || 'Failed to fetch conversations');
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setConversationsLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId, loadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_BASE_URL}/messages/conversations/${conversationId}`;
      if (loadMore && nextCursor) {
        url += `?before=${nextCursor}`;
      }

      console.log('📨 Fetching messages from:', url);
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      console.log('Messages response status:', response.status);

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.message || response.statusText;
        } catch (e) {
          errorText = await response.text();
        }
        throw new Error(`Failed to fetch messages: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Messages data received:', {
        success: data.success,
        count: data.messages?.length || 0,
        hasMore: data.pagination?.hasMore
      });
      
      if (data.success) {
        // Messages are already formatted by the backend
        const formattedMessages = data.messages || [];
        console.log('Using pre-formatted messages from backend:', formattedMessages.length);
        
        if (loadMore) {
          setMessages(prev => [...formattedMessages, ...prev]);
        } else {
          setMessages(formattedMessages);
          setConversationInfo(data.conversationInfo || null);
        }
        setHasMore(data.pagination?.hasMore || false);
        setNextCursor(data.pagination?.nextCursor || null);
        
        // Scroll to bottom for new messages (not when loading more)
        if (!loadMore) {
          setTimeout(scrollToBottom, 100);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: 'me',
      text: messageText.trim(),
      time: 'Sending...',
      type: 'text'
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, tempMessage]);
    const currentMessageText = messageText;
    setMessageText('');

    try {
      setSending(true);

      console.log('📤 Sending message:', {
        conversationId: selectedConversation._id,
        content: currentMessageText.substring(0, 50)
      });

      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: currentMessageText,
          type: 'text'
        })
      });

      console.log('Send message response status:', response.status);

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = errorData.message || response.statusText;
        } catch (e) {
          errorText = await response.text();
        }
        throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Message sent successfully');
      
      if (data.success) {
        // Backend returns pre-formatted message
        const newMessage = data.message;
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id).concat(newMessage));
        
        // Update conversation list to reflect new message
        fetchConversations();
        
        // Scroll to bottom
        setTimeout(scrollToBottom, 100);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      // Restore message text so user can retry
      setMessageText(currentMessageText);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Send payment
  const handleSendPayment = async () => {
    if (!selectedConversation) return;

    const amount = parseFloat(prompt('Enter payment amount (৳):'));
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const description = prompt('Enter payment description (optional):') || '';

    try {
      const response = await fetch(`${API_BASE_URL}/messages/send-payment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          amount,
          description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send payment');
      }

      const data = await response.json();

      if (data.success) {
        alert(`Payment of ৳${amount.toLocaleString()} sent successfully!`);
        
        // Refresh messages to show payment message
        fetchMessages(selectedConversation._id);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending payment:', error);
      alert('Failed to send payment. Please try again.');
    }
  };

  // Schedule meeting
  const handleScheduleMeeting = async () => {
    if (!selectedConversation) return;

    const date = prompt('Enter meeting date and time (e.g., Dec 25, 2024 2:00 PM):');
    if (!date || !date.trim()) return;

    const meetingText = `📅 Meeting scheduled for ${date}`;

    try {
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: meetingText,
          type: 'text',
          metadata: {
            messageType: 'meeting',
            meetingDate: date
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule meeting');
      }

      const data = await response.json();

      if (data.success) {
        // Backend returns pre-formatted message
        setMessages(prev => [...prev, data.message]);
        fetchConversations();
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('❌ Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    try {
      await fetch(`${API_BASE_URL}/messages/read/${conversationId}`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      // Update conversation list to reflect read status
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unread: 0 } 
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Load more messages
  const loadMoreMessages = () => {
    if (selectedConversation && hasMore && !loading) {
      const currentScrollHeight = messagesContainerRef.current?.scrollHeight;
      fetchMessages(selectedConversation._id, true).then(() => {
        // Maintain scroll position after loading more messages
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop = newScrollHeight - currentScrollHeight;
        }
      });
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setConversationInfo(null);
    fetchMessages(conversation._id);
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv =>
    conv.hostName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initial load
  useEffect(() => {
    const userId = getCurrentUserId();
    console.log('Current user ID:', userId);
    setCurrentUserId(userId);
    
    fetchConversations();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation._id);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  // Render message component
  const renderMessage = (message) => {
    if (message.type === 'payment') {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md shadow-sm">
            <div className="flex items-center gap-2 text-sm text-green-800 font-medium">
              <DollarSign className="w-5 h-5" />
              <span>{message.text}</span>
            </div>
            <p className="text-xs text-green-600 mt-2">{message.time}</p>
          </div>
        </div>
      );
    }

    if (message.type === 'system') {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 max-w-md text-center">
            <p className="text-sm text-blue-800">{message.text}</p>
            <p className="text-xs text-blue-600 mt-1">{message.time}</p>
          </div>
        </div>
      );
    }

    // Backend now returns 'me' or 'host' in the sender field
    const isMe = message.sender === 'me';
    
    return (
      <div
        key={message.id}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
            isMe
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">{message.text}</p>
          <div className="flex items-center justify-between gap-2 mt-1">
            <p
              className={`text-xs ${
                isMe ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {message.time}
            </p>
            {isMe && message.read && (
              <span className="text-xs text-blue-100">✓✓</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Messages</h2>
            <p className="text-blue-100">Chat with your hosts securely</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
            <Shield className="w-5 h-5" />
            <span className="text-sm">End-to-end encrypted</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchConversations();
              }}
              className="text-sm text-red-600 hover:text-red-700 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100" style={{ height: 'calc(100vh - 320px)' }}>
        <div className="grid grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r border-gray-200 overflow-y-auto bg-gray-50">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Conversations */}
            {conversationsLoading ? (
              <div className="p-8 text-center">
                <Loader className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </h3>
                <p className="text-xs text-gray-500">
                  {searchTerm ? 'Try a different search term' : 'Start messaging hosts from your bookings'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full p-4 hover:bg-white transition-colors text-left ${
                      selectedConversation?._id === conversation._id ? 'bg-white border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AvatarWithInitials 
                        image={conversation.hostAvatar} 
                        name={conversation.hostName}
                        online={conversation.online}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold truncate text-gray-900">
                            {conversation.hostName}
                          </h4>
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unread > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0 font-medium">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        {conversation.hostInfo?.location && (
                          <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                            <span>📍</span>
                            {conversation.hostInfo.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="col-span-2 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <AvatarWithInitials 
                      image={conversationInfo?.hostAvatar || selectedConversation.hostAvatar} 
                      name={conversationInfo?.hostName || selectedConversation.hostName}
                      className="w-11 h-11"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {conversationInfo?.hostName || selectedConversation.hostName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {conversationInfo?.hostLocation && (
                          <span className="flex items-center gap-1">
                            📍 {conversationInfo.hostLocation}
                          </span>
                        )}
                        {conversationInfo?.hostRating > 0 && (
                          <span className="flex items-center gap-1">
                            ⭐ {conversationInfo.hostRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Encrypted</span>
                    </div>
                    {conversationInfo?.hostVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white"
                  style={{ 
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  }}
                >
                  {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="ml-2 text-sm text-gray-500">Loading messages...</span>
                    </div>
                  ) : (
                    <>
                      {hasMore && (
                        <div className="text-center mb-4">
                          <button
                            onClick={loadMoreMessages}
                            disabled={loading}
                            className="text-sm text-blue-500 hover:text-blue-600 disabled:text-gray-400 font-medium"
                          >
                            {loading ? 'Loading...' : 'Load older messages'}
                          </button>
                        </div>
                      )}
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                              <Send className="w-8 h-8 text-blue-500" />
                            </div>
                            <p className="text-sm text-gray-500">No messages yet</p>
                            <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {messages.map(renderMessage)}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-2">
                    <button 
                      onClick={handleScheduleMeeting}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 text-sm transition-colors font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Meeting
                    </button>
                    <button 
                      onClick={handleSendPayment}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 text-sm transition-colors font-medium"
                    >
                      <DollarSign className="w-4 h-4" />
                      Send Payment
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t-2 border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                      title="Attach file (Coming soon)"
                      disabled
                    >
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium shadow-sm"
                    >
                      {sending ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Sending
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Messages are end-to-end encrypted for your security</span>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                    <Send className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Conversation Selected</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    {conversations.length > 0 
                      ? 'Select a conversation from the list to start messaging'
                      : 'You don\'t have any conversations yet. Book a host to start chatting!'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Your privacy matters:</strong> All messages are encrypted end-to-end. Only you and your host can read them. We never have access to your conversation content.
          </div>
        </div>
      </div>
    </div>
  );
}