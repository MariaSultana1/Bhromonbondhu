// Updated Messages.jsx - Add this to your existing Messages component
// KEY CHANGES: Added "New Conversation" button + NewConversationModal integration

// 1. Add this import at the top of your Messages.jsx:
// import { NewConversationModal } from './NewConversationModal';

// 2. Add this state in your Messages component:
// const [showNewConversation, setShowNewConversation] = useState(false);

// 3. Replace your header section with this updated version:
/*
<div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-3xl mb-2">Messages</h2>
      <p className="text-blue-100">Chat with your hosts securely</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowNewConversation(true)}
        className="flex items-center gap-2 bg-white text-blue-600 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        New Message
      </button>
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
        <Shield className="w-5 h-5" />
        <span className="text-sm">End-to-end encrypted</span>
      </div>
    </div>
  </div>
</div>
*/

// 4. Add modal at bottom of your return, before closing div:
/*
{showNewConversation && (
  <NewConversationModal
    onClose={() => setShowNewConversation(false)}
    onConversationStarted={() => {
      setShowNewConversation(false);
      fetchConversations(); // Refresh conversations list
    }}
  />
)}
*/

// ============================================================
// FULL UPDATED Messages.jsx with all changes applied:
// ============================================================

import { Calendar, Cloud, Camera, Heart, TrendingUp, Star, MapPin, RefreshCw, Loader, AlertCircle, Send, Shield, DollarSign, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { NewConversationModal } from './NewConversationModal';

const API_URL = 'http://localhost:5000/api';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getColorFromName = (name) => {
  const colors = ['bg-red-500','bg-blue-500','bg-green-500','bg-yellow-500','bg-purple-500','bg-pink-500','bg-indigo-500','bg-teal-500'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const AvatarWithInitials = ({ image, name, className = 'w-12 h-12', online = false }) => {
  const [imageError, setImageError] = useState(false);
  if (image && !imageError) {
    return (
      <div className="relative">
        <img src={image} alt={name} className={`${className} rounded-full border-2 border-gray-200 object-cover`} onError={() => setImageError(true)} />
        {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
      </div>
    );
  }
  return (
    <div className="relative">
      <div className={`${className} rounded-full border-2 border-gray-200 flex items-center justify-center font-bold text-white text-lg ${getColorFromName(name || '?')}`}>
        {getInitials(name)}
      </div>
      {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
    </div>
  );
};

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
  } catch (e) { return ''; }
};

export function Messages({ selectedHostId, selectedBookingId }) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchConversations = async () => {
    try {
      setConversationsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/messages/conversations`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to fetch conversations: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        const convs = data.conversations || [];
        setConversations(convs);
        if (convs.length > 0 && !selectedConversation) {
          setSelectedConversation(convs[0]);
          await fetchMessages(convs[0]._id);
        }
      }
    } catch (error) {
      setError('Failed to load conversations. Please try again.');
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/messages/conversations/${conversationId}`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`Failed to fetch messages: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
        setConversationInfo(data.conversationInfo || null);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;
    const tempMessage = { id: `temp-${Date.now()}`, sender: 'me', text: messageText.trim(), time: 'Sending...', type: 'text' };
    setMessages(prev => [...prev, tempMessage]);
    const currentMessageText = messageText;
    setMessageText('');
    try {
      setSending(true);
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ conversationId: selectedConversation._id, content: currentMessageText, type: 'text' })
      });
      if (!response.ok) throw new Error('Failed to send');
      const data = await response.json();
      if (data.success) {
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id).concat(data.message));
        fetchConversations();
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setMessageText(currentMessageText);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setConversationInfo(null);
    fetchMessages(conversation._id);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.hostName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedHostId && conversations.length > 0) {
      const conversation = conversations.find(c => c.participantId === selectedHostId);
      if (conversation) handleSelectConversation(conversation);
    }
  }, [selectedHostId, conversations]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (selectedConversation) fetchMessages(selectedConversation._id);
      fetchConversations();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > 0) setTimeout(scrollToBottom, 100);
  }, [messages.length]);

  const renderMessage = (message) => {
    if (message.type === 'payment') {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md shadow-sm">
            <div className="flex items-center gap-2 text-sm text-green-800 font-medium">
              <DollarSign className="w-5 h-5" /><span>{message.text}</span>
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
    const isMe = message.sender === 'me';
    return (
      <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${isMe ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
          <p className="text-sm leading-relaxed break-words">{message.text}</p>
          <div className="flex items-center justify-between gap-2 mt-1">
            <p className={`text-xs ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>{message.time}</p>
            {isMe && message.read && <span className="text-xs text-blue-100">✓✓</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - UPDATED with New Message button */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Messages</h2>
            <p className="text-blue-100">Chat with your hosts securely</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewConversation(true)}
              className="flex items-center gap-2 bg-white text-blue-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              New Message
            </button>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
              <Shield className="w-5 h-5" />
              <span className="text-sm">End-to-end encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => { setError(null); fetchConversations(); }} className="text-sm text-red-600 hover:text-red-700 underline mt-1">Try again</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100" style={{ height: 'calc(100vh - 320px)' }}>
        <div className="grid grid-cols-3 h-full min-h-0">
          {/* Conversations List */}
          <div className="border-r border-gray-200 overflow-y-auto bg-gray-50">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

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
                <p className="text-xs text-gray-500 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Start a conversation with a host!'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowNewConversation(true)}
                    className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Message a Host
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full p-4 hover:bg-white transition-colors text-left ${selectedConversation?._id === conversation._id ? 'bg-white border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <AvatarWithInitials image={conversation.hostAvatar} name={conversation.hostName} online={conversation.online} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold truncate text-gray-900">{conversation.hostName}</h4>
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          {conversation.unread > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0 font-medium">{conversation.unread}</span>
                          )}
                        </div>
                        {conversation.hostInfo?.location && (
                          <p className="text-xs text-gray-500 mt-1 truncate flex items-center gap-1">
                            <span>📍</span>{conversation.hostInfo.location}
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
          <div className="col-span-2 flex flex-col bg-white min-h-0">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <AvatarWithInitials
                      image={conversationInfo?.hostAvatar || selectedConversation.hostAvatar}
                      name={conversationInfo?.hostName || selectedConversation.hostName}
                      className="w-11 h-11"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{conversationInfo?.hostName || selectedConversation.hostName}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {conversationInfo?.hostLocation && <span className="flex items-center gap-1">📍 {conversationInfo.hostLocation}</span>}
                        {conversationInfo?.hostRating > 0 && <span className="flex items-center gap-1">⭐ {conversationInfo.hostRating.toFixed(1)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <Shield className="w-3.5 h-3.5" /><span>Encrypted</span>
                  </div>
                </div>

                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                  {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="ml-2 text-sm text-gray-500">Loading messages...</span>
                    </div>
                  ) : messages.length === 0 ? (
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
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t-2 border-gray-200 bg-white">
                  <div className="flex gap-2">
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
                      {sending ? <><Loader className="w-4 h-4 animate-spin" />Sending</> : <><Send className="w-4 h-4" />Send</>}
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
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                    {conversations.length > 0
                      ? 'Select a conversation from the list to start messaging'
                      : 'Start a conversation with any host directly!'}
                  </p>
                  <button
                    onClick={() => setShowNewConversation(true)}
                    className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Message a Host
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Your privacy matters:</strong> All messages are encrypted end-to-end. Only you and your host can read them.
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <NewConversationModal
          onClose={() => setShowNewConversation(false)}
          onConversationStarted={() => {
            setShowNewConversation(false);
            fetchConversations();
          }}
        />
      )}
    </div>
  );
}