import { useState } from 'react';
import { Send, Paperclip, Shield, DollarSign, Calendar } from 'lucide-react';

const conversations = [
  {
    id: 1,
    hostName: 'Fatima Khan',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    lastMessage: 'Looking forward to hosting you!',
    time: '10:30 AM',
    unread: 2,
    online: true
  },
  {
    id: 2,
    hostName: 'Rafiq Ahmed',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
    lastMessage: 'The weather should be perfect for hiking',
    time: 'Yesterday',
    unread: 0,
    online: false
  },
  {
    id: 3,
    hostName: 'Shahana Begum',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shahana',
    lastMessage: 'Thank you for the review!',
    time: '2 days ago',
    unread: 0,
    online: false
  }
];

const messages = [
  {
    id: 1,
    sender: 'host',
    text: 'Hello! Welcome to Bhromonbondhu. I\'m excited to host you in Cox\'s Bazar!',
    time: '9:00 AM',
    type: 'text'
  },
  {
    id: 2,
    sender: 'me',
    text: 'Thank you! I\'m really looking forward to it. What time should I arrive?',
    time: '9:15 AM',
    type: 'text'
  },
  {
    id: 3,
    sender: 'host',
    text: 'Anytime after 2 PM works great. I\'ll be ready to show you around.',
    time: '9:20 AM',
    type: 'text'
  },
  {
    id: 4,
    sender: 'system',
    text: 'Payment of ৳2,500 has been held in escrow for this booking.',
    time: '9:25 AM',
    type: 'payment'
  },
  {
    id: 5,
    sender: 'host',
    text: 'Looking forward to hosting you! Safe travels.',
    time: '10:30 AM',
    type: 'text'
  }
];

export function Messages() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      // In a real app, this would send the message
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Messages</h2>
        <p className="text-gray-600">Chat with your hosts securely</p>
      </div>

      {/* Messages Interface */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="grid grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation.id === conversation.id ? 'bg-blue-50' : ''
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
                        <h4 className="text-sm truncate">{conversation.hostName}</h4>
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
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-2 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedConversation.hostAvatar}
                    alt={selectedConversation.hostName}
                    className="w-10 h-10 rounded-full"
                  />
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm">{selectedConversation.hostName}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedConversation.online ? 'Active now' : 'Offline'}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
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
              })}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                  <Calendar className="w-4 h-4" />
                  Schedule Meeting
                </button>
                <button className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm">
                  <DollarSign className="w-4 h-4" />
                  Send Payment
                </button>
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg"
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
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <Shield className="w-3 h-3" />
                <span>Messages are end-to-end encrypted</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}