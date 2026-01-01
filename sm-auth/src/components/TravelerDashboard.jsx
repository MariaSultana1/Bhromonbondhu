import { useState } from 'react';
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
import { BookTravel } from './traveler/BookTravel';
import { LiveJourney } from './traveler/LiveJourney';
import { MyHosts } from './traveler/MyHosts';
import { Messages } from './traveler/Messages';
import { TravelAI } from './traveler/TravelAI';
import { TravelerProfile } from './traveler/TravelerProfile';

export default function TravelerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'book', label: 'Book Travel', icon: Calendar },
    { id: 'journey', label: 'Live Journey', icon: Map },
    { id: 'hosts', label: 'My Hosts', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'ai', label: 'Travel AI', icon: Sparkles },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
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
              <div>
                <h1 className="text-xl">ভ্রমণবন্ধু</h1>
                <p className="text-xs text-gray-500">Bhromonbondhu</p>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destinations, hosts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="hidden sm:inline text-sm">
                  {user.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
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

                  {item.id === 'messages' && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      2
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'home' && <TravelerHome user={user} />}
          {activeTab === 'book' && <BookTravel />}
          {activeTab === 'journey' && <LiveJourney />}
          {activeTab === 'hosts' && <MyHosts />}
          {activeTab === 'messages' && <Messages />}
          {activeTab === 'ai' && <TravelAI />}
          {activeTab === 'profile' && (
            <TravelerProfile user={user} />
          )}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

