import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  Briefcase,
  BarChart,
  DollarSign,
  Calendar,
  MessageSquare,
  User,
  Bell,
  Shield,
  Menu,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAdminUserStats, useAdminDisputeStats, useAdminSOSAlerts } from '../../hooks/useCustomHooks';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fetch admin statistics from database
  const { stats: userStats, loading: userLoading } = useAdminUserStats();
  const { stats: disputeStats, loading: disputeLoading } = useAdminDisputeStats();
  const { alerts: sosAlerts, loading: sosLoading } = useAdminSOSAlerts();
  
  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <BarChart className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/hosts', label: 'Hosts', icon: <Briefcase className="w-5 h-5" /> },
    { path: '/admin/bookings', label: 'Bookings', icon: <Calendar className="w-5 h-5" /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <BarChart className="w-5 h-5" /> },
    { path: '/admin/disputes', label: 'Disputes', icon: <AlertTriangle className="w-5 h-5" /> },
    { path: '/admin/sos', label: 'SOS Monitor', icon: <AlertTriangle className="w-5 h-5" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  // Count active alerts for badge
  const activeSOSCount = sosAlerts?.length || 0;
  const openDisputes = disputeStats?.openDisputes || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 fixed md:relative z-40 w-64 h-full bg-gradient-to-b from-amber-900 to-orange-800 text-white flex flex-col transition-transform duration-300
      `}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-white/70">Welcome, {user?.fullName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            let badgeCount = 0;
            
            // Add badge counts
            if (item.path === '/admin/disputes' && openDisputes > 0) {
              badgeCount = openDisputes;
            }
            if (item.path === '/admin/sos' && activeSOSCount > 0) {
              badgeCount = activeSOSCount;
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {badgeCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>

            <div className="flex items-center space-x-4">
              {/* SOS Badge */}
              {activeSOSCount > 0 && (
                <button 
                  onClick={() => navigate('/admin/sos')}
                  className="relative p-2 rounded-full hover:bg-red-100 bg-red-50"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {activeSOSCount}
                  </span>
                </button>
              )}
              
              {/* Notifications Bell */}
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="font-medium text-gray-800">{user?.fullName}</p>
                  <p className="text-sm text-gray-600">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          <Outlet context={{ userStats, disputeStats, sosAlerts }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;