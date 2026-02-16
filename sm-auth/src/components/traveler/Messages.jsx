// Messages.jsx
import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Shield, DollarSign, Calendar, Search, MoreVertical } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function Messages() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API configuration
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations);
        if (response.data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data.conversations[0]);
          fetchMessages(response.data.conversations[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId, loadMore = false) => {
    try {
      setLoading(true);
      const params = {};
      if (loadMore && nextCursor) {
        params.before = nextCursor;
      }

      const response = await api.get(`/messages/conversations/${conversationId}`, { params });
      
      if (response.data.success) {
        if (loadMore) {
          setMessages(prev => [...response.data.messages, ...prev]);
        } else {
          setMessages(response.data.messages);
        }
        setHasMore(response.data.pagination.hasMore);
        setNextCursor(response.data.pagination.nextCursor);
        
        // Mark messages as read
        await markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const payload = {
        conversationId: selectedConversation._id,
        content: messageText,
        type: 'text'
      };

      const response = await api.post('/messages/send', payload);
      
      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setMessageText('');
        
        // Update conversation list
        fetchConversations();
        
        // Scroll to bottom
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Send payment
  const handleSendPayment = async () => {
    if (!selectedConversation) return;

    const amount = parseFloat(prompt('Enter payment amount:'));
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const description = prompt('Enter payment description (optional):') || '';

    try {
      const response = await api.post('/messages/send-payment', {
        conversationId: selectedConversation._id,
        amount,
        description
      });

      if (response.data.success) {
        // Add payment message to chat
        const paymentMessage = {
          id: Date.now(),
          sender: 'system',
          text: `Payment of ৳${amount.toLocaleString()}${description ? ` for ${description}` : ''}`,
          time: 'Just now',
          type: 'payment'
        };

        setMessages(prev => [...prev, paymentMessage]);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending payment:', error);
    }
  };

  // Schedule meeting
  const handleScheduleMeeting = () => {
    const date = prompt('Enter meeting date and time (e.g., Dec 25, 2024 2:00 PM):');
    if (date) {
      const meetingMessage = {
        id: Date.now(),
        sender: 'me',
        text: `Meeting scheduled for ${date}`,
        time: 'Just now',
        type: 'text'
      };
      setMessages(prev => [...prev, meetingMessage]);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId) => {
    try {
      await api.put(`/messages/read/${conversationId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Load more messages
  const loadMoreMessages = () => {
    if (selectedConversation && hasMore) {
      fetchMessages(selectedConversation._id, true);
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
    fetchMessages(conversation._id);
  };

  // Filter conversations by search term
  const filteredConversations = conversations.filter(conv =>
    conv.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initial load
  useEffect(() => {
    fetchConversations();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && hasMore) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, selectedConversation]);

  // Render message component
  const renderMessage = (message) => {
    if (message.type === 'payment') {
      return (
        <div key={message.id} className="flex justify-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-md">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <DollarSign className="w-4 h-4" />
              <span>{message.text}</span>
            </div>
            <p className="text-xs text-green-600 mt-1">{message.time}</p>
          </div>
        </div>
      );
    }

    const isMe = message.sender === 'me';
    return (
      <div
        key={message.id}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
            isMe
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm">{message.text}</p>
          <p
            className={`text-xs mt-1 ${
              isMe ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {message.time}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Messages</h2>
        <p className="text-gray-600">Chat with your hosts securely</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="grid grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {loading && conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                      selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={conversation.hostAvatar}
                          alt={conversation.hostName}
                          className="w-12 h-12 rounded-full"
                        />
                        {conversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium truncate">{conversation.hostName}</h4>
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                          {conversation.unread > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        {conversation.hostInfo?.location && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
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
          <div className="col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={selectedConversation.hostAvatar}
                        alt={selectedConversation.hostName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{selectedConversation.hostName}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.hostInfo?.location || 'Bangladesh'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" title="End-to-end encrypted" />
                    <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      View Profile
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Loading messages...</div>
                  ) : (
                    <>
                      {hasMore && (
                        <div className="text-center">
                          <button
                            onClick={loadMoreMessages}
                            className="text-sm text-blue-500 hover:text-blue-600"
                          >
                            Load older messages...
                          </button>
                        </div>
                      )}
                      {messages.map(renderMessage)}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button 
                      onClick={handleScheduleMeeting}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Meeting
                    </button>
                    <button 
                      onClick={handleSendPayment}
                      className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      Send Payment
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      {sending ? 'Sending...' : (
                        <>
                          <Send className="w-4 h-4" />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Shield className="w-3 h-3" />
                    <span>Messages are end-to-end encrypted</span>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p className="text-sm">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}