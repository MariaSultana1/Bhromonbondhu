import { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Plus, AlertCircle, Loader } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

export function HostMessages({ selectedGuestId, selectedBookingId }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Get current user ID from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUserId(user._id);
    } catch (e) {
      console.error('Error getting user ID:', e);
    }
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedGuestId && conversations.length > 0) {
      const conversation = conversations.find(c => c.participantId === selectedGuestId);
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversation._id);
      }
    }
  }, [selectedGuestId, conversations]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
    }
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      setError(null);
      console.log('📨 Fetching conversations from:', `${API_BASE_URL}/messages/conversations`);
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch conversations: ${response.status} - ${errorData.message}`);
      }
      
      const data = await response.json();
      console.log('✅ Conversations fetched:', data);
      
      setConversations(data.conversations || []);
      
      if ((data.conversations || []).length > 0 && !selectedConversation) {
        setSelectedConversation(data.conversations[0]);
        fetchMessages(data.conversations[0]._id);
      }
    } catch (err) {
      console.error('❌ Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('💬 Fetching messages for:', conversationId);
      
      const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to fetch messages: ${response.status} - ${errorData.message}`);
      }
      
      const data = await response.json();
      console.log('✅ Messages fetched:', data);
      
      setMessages(data.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      setError(null);
      
      console.log('📤 Sending message:', {
        conversationId: selectedConversation._id,
        content: newMessage
      });
      
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          content: newMessage,
          type: 'text'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to send message: ${response.status} - ${errorData.message}`);
      }
      
      const data = await response.json();
      console.log('✅ Message sent:', data);
      
      // Add the message to the UI optimistically
      const newMsg = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'me',
        text: newMessage,
        type: 'text',
        time: 'Just now',
        createdAt: new Date(),
        read: false
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    (conv.hostName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Messages</h2>
        <p className="text-gray-600">Chat with your guests</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-900 font-medium">Error</h3>
            <p className="text-red-800 text-sm">{error}</p>
            <button 
              onClick={fetchConversations}
              className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    fetchMessages(conv._id);
                  }}
                  className={`w-full p-4 border-b border-gray-100 text-left transition-colors hover:bg-gray-50 ${
                    selectedConversation?._id === conv._id
                      ? 'bg-green-50 border-l-4 border-l-green-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.hostName}`}
                        alt={conv.hostName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{conv.hostName || 'Unknown'}</h4>
                      <p className="text-xs text-gray-600 truncate">{conv.lastMessage || 'No messages'}</p>
                      <p className="text-xs text-gray-400 mt-1">{conv.time || ''}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConversation.hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.hostName}`}
                    alt={selectedConversation.hostName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-sm">{selectedConversation.hostName || 'Unknown'}</h3>
                    <p className="text-xs text-gray-600">
                      {selectedConversation.hostInfo?.location || 'Location unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex gap-2 text-gray-500">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Loading messages...</span>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isSentByMe = msg.sender === 'me';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${
                            isSentByMe
                              ? 'bg-green-500 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          {msg.type === 'payment' && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">💳</span>
                              <span className="font-medium">${msg.amount}</span>
                            </div>
                          )}
                          
                          <p className="text-sm break-words">{msg.text || msg.content || ''}</p>
                          
                          <p className={`text-xs mt-1 ${
                            isSentByMe ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(msg.createdAt)}
                          </p>
                          
                          {msg.read && isSentByMe && (
                            <p className="text-xs mt-1 text-green-100">✓✓ Read</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {sending ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {conversationsLoading ? 'Loading...' : 'Select a conversation to start chatting'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
