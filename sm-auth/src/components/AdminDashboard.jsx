import { useState } from 'react';
import { Users, Calendar, DollarSign, AlertTriangle, LogOut, Bell, Menu, X, TrendingUp, Shield} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AllUsers } from './admin/AllUsers';
import { AllDisputes } from './admin/AllDisputes';

const platformStats = {
  totalUsers: 1248,
  travelers: 856,
  hosts: 392,
  activeBookings: 45,
  totalRevenue: 3250000,
  monthlyGrowth: 15.8
};

const revenueData = [
  { month: 'Jan', revenue: 450000 },
  { month: 'Feb', revenue: 520000 },
  { month: 'Mar', revenue: 580000 },
  { month: 'Apr', revenue: 640000 },
  { month: 'May', revenue: 720000 },
  { month: 'Jun', revenue: 820000 }
];

const userGrowthData = [
  { month: 'Jan', travelers: 120, hosts: 45 },
  { month: 'Feb', travelers: 145, hosts: 52 },
  { month: 'Mar', travelers: 168, hosts: 61 },
  { month: 'Apr', travelers: 195, hosts: 73 },
  { month: 'May', travelers: 220, hosts: 84 },
  { month: 'Jun', travelers: 248, hosts: 98 }
];

const recentUsers = [
  { id: 1, name: 'Riya Rahman', type: 'traveler', joined: '2 hours ago', status: 'verified' },
  { id: 2, name: 'Karim Ahmed', type: 'host', joined: '5 hours ago', status: 'pending' },
  { id: 3, name: 'Aisha Khan', type: 'traveler', joined: '1 day ago', status: 'verified' },
  { id: 4, name: 'Rafiq Hassan', type: 'host', joined: '1 day ago', status: 'verified' }
];

const disputes = [
  { id: 1, booking: 'B-1234', traveler: 'Riya Rahman', host: 'Karim Ahmed', issue: 'Service not provided', status: 'open' },
  { id: 2, booking: 'B-1235', traveler: 'Mehedi Hassan', host: 'Shahana Begum', issue: 'Payment issue', status: 'resolved' }
];

export function AdminDashboard({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [view, setView] = useState('dashboard');

  // If viewing sub-pages, render them
  if (view === 'allUsers') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl">ভ্রমণবন্ধু</h1>
                  <p className="text-xs text-purple-600">Admin Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">5</span>
                </button>
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </div>
                <button onClick={onLogout} className="text-gray-600 hover:text-gray-900" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <AllUsers onBack={() => setView('dashboard')} />
        </div>
      </div>
    );
  }

  if (view === 'allDisputes') {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl">ভ্রমণবন্ধু</h1>
                  <p className="text-xs text-purple-600">Admin Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">5</span>
                </button>
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </div>
                <button onClick={onLogout} className="text-gray-600 hover:text-gray-900" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <AllDisputes onBack={() => setView('dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div>
                <h1 className="text-xl">ভ্রমণবন্ধু</h1>
                <p className="text-xs text-purple-600">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  5
                </span>
              </button>
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar || './images/Ellipse 21.png'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => { e.target.src = './images/Ellipse 21.png'; }}
                />
                <span className="hidden sm:inline text-sm">{user.name}</span>
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

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
        <div className="mb-6">
          <h2 className="text-2xl mb-2">Platform Overview</h2>
          <p className="text-gray-600">Monitor and manage Bhromonbondhu</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl mb-1">{platformStats.totalUsers}</div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-xs text-gray-500 mt-1">
              {platformStats.travelers} travelers • {platformStats.hosts} hosts
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl mb-1">{platformStats.activeBookings}</div>
            <p className="text-sm text-gray-600">Active Bookings</p>
            <p className="text-xs text-green-600 mt-1">+12 this week</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-2xl mb-1">৳{(platformStats.totalRevenue / 1000).toFixed(0)}K</div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xs text-purple-600 mt-1">+{platformStats.monthlyGrowth}% this month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-2xl mb-1">1</div>
            <p className="text-sm text-gray-600">Open Disputes</p>
            <p className="text-xs text-orange-600 mt-1">Requires attention</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Revenue Trend</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>


          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">User Growth</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="travelers" fill="#3b82f6" />
                  <Bar dataKey="hosts" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Recent Users</h3>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="text-sm mb-1">{u.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className={`px-2 py-0.5 rounded-full ${
                        u.type === 'traveler' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {u.type}
                      </span>
                      <span>{u.joined}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    u.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setView('allUsers')}
              className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              View All Users
            </button>
          </div>


          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Dispute Resolution</h3>
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm mb-1">Booking {dispute.booking}</h4>
                      <p className="text-xs text-gray-600">{dispute.traveler} vs {dispute.host}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dispute.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {dispute.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">{dispute.issue}</p>
                  {dispute.status === 'open' && (
                    <button className="text-xs text-blue-500 hover:underline">
                      Review Case →
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setView('allDisputes')}
              className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              View All Disputes
            </button>
          </div>
        </div>

  
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Users className="w-6 h-6 text-blue-500 mb-2" />
              <h4 className="text-sm mb-1">Manage Users</h4>
              <p className="text-xs text-gray-600">View and moderate users</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <Shield className="w-6 h-6 text-green-500 mb-2" />
              <h4 className="text-sm mb-1">Verifications</h4>
              <p className="text-xs text-gray-600">Approve host applications</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <AlertTriangle className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="text-sm mb-1">Reports</h4>
              <p className="text-xs text-gray-600">Review reported content</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <TrendingUp className="w-6 h-6 text-purple-500 mb-2" />
              <h4 className="text-sm mb-1">Analytics</h4>
              <p className="text-xs text-gray-600">View detailed reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}