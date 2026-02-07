import { useState, useEffect } from "react";
import {
  Home,
  Calendar,
  DollarSign,
  User as UserIcon,
  LogOut,
  Bell,
  Menu,
  X,
  Settings,
  Loader,
} from "lucide-react";

import { HostHome } from './host/HostHome';
import { HostBookingsComplete } from './host/HostBookingsComplete';
import { HostEarnings } from './host/HostEarnings';
import { HostServicesComplete } from './host/HostServicesComplete';
import { HostProfileComplete } from './host/HostProfileComplete';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function HostDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hostData, setHostData] = useState(null);
  const [unreadBookings, setUnreadBookings] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigation = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "services", label: "Services", icon: Settings },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch host data on component mount
  useEffect(() => {
    fetchHostData();
  }, []);

  const fetchHostData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      // Fetch host profile
      const hostRes = await fetch(`${API_URL}/hosts?limit=1`, {
        method: 'GET',
        headers
      });
      const hostResData = await hostRes.json();
      if (hostResData.success && hostResData.hosts && hostResData.hosts.length > 0) {
        setHostData(hostResData.hosts[0]);
      }

      // Fetch unread bookings count
      const bookingsRes = await fetch(`${API_URL}/bookings`, {
        method: 'GET',
        headers
      });
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success && bookingsData.bookings) {
        const unreadCount = bookingsData.bookings.filter(b => b.status === 'pending').length;
        setUnreadBookings(unreadCount);
      }

      // Get notifications
      const messagesRes = await fetch(`${API_URL}/messages/unread-count`, {
        method: 'GET',
        headers
      });
      const messagesData = await messagesRes.json();
      if (messagesData.success) {
        setNotifications(messagesData.unreadCount + unreadBookings);
      }
    } catch (err) {
      console.error('Error fetching host data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            <img
              className="w-[27px] h-[27px] aspect-[1] object-cover"
              alt="Logo"
              src="./images/image 5_white.png"
            />
            <div>
              <h1 className="text-xl font-bold">ভ্রমণবন্ধু</h1>
              <p className="text-xs text-green-600 font-medium">Host Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

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
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
          </div>
        </div>
      </nav>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64
            bg-white border-r transition-transform duration-300 z-40
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            overflow-y-auto
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
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${isActive
                      ? "bg-green-50 text-green-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>

                  {item.id === "bookings" && unreadBookings > 0 && (
                    <span className="ml-auto bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {unreadBookings > 9 ? '9+' : unreadBookings}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === "home" && <HostHome user={user} hostData={hostData} />}
          {activeTab === "bookings" && <HostBookingsComplete hostData={hostData} />}
          {activeTab === "earnings" && <HostEarnings hostData={hostData} />}
          {activeTab === "services" && <HostServicesComplete hostData={hostData} />}
          {activeTab === "profile" && <HostProfileComplete user={user} hostData={hostData} onUpdate={() => fetchHostData()} />}
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