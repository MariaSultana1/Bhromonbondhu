import { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  Map,
  Users,
  MessageSquare,
  Sparkles,
  User as UserIcon,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react';

import { TravelerHome } from './traveler/TravelerHome';
import { BookTravelUnified } from './traveler/BookTravelUnified';
import { LiveJourney } from './traveler/LiveJourney';
import { MyHosts } from './traveler/MyHosts';
import { Messages } from './traveler/Messages';
import { TravelAI } from './traveler/TravelAI';
import { TravelerProfile } from './traveler/TravelerProfile';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function TravelerDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navigation = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'book', label: 'Book Travel', icon: Calendar },
    { id: 'journey', label: 'Live Journey', icon: Map },
    { id: 'hosts', label: 'My Hosts', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'ai', label: 'Travel AI', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUser(data.user);
        setError(null);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/messages/unread-count`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUnreadMessages(data.unreadCount);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <img
                className="w-7 h-7 object-cover"
                alt="Bhromonbondhu Logo"
                src="./images/image 5_white.png"
              />
              <div>
                <h1 className="text-xl font-semibold">ভ্রমণবন্ধু</h1>
                <p className="text-xs text-gray-500">Bhromonbondhu</p>
              </div>
            </div>

            {/* Right Section - Notifications and User Profile */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative">
                <Bell className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Profile - LEFT SIDE LAYOUT */}
              {user && (
                <div className="flex items-center gap-3">
                  {/* User Image */}
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* User Name - Hidden on mobile */}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      @{user.username}
                    </p>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0
            h-[calc(100vh-4rem)] w-64
            bg-white border-r border-gray-200
            transition-transform duration-300 z-40
            ${mobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>

                  {item.id === 'messages' && unreadMessages > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'home' && user && <TravelerHome user={user} />}
          {activeTab === 'book' && <BookTravelUnified />}
          {activeTab === 'journey' && <LiveJourney />}
          {activeTab === 'hosts' && <MyHosts />}
          {activeTab === 'messages' && <Messages />}
          {activeTab === 'ai' && <TravelAI />}
          {activeTab === 'profile' && user && (
            <TravelerProfile user={user} onUserUpdate={setUser} />
          )}
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}