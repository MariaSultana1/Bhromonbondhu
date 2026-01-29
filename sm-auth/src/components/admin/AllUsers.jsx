import { ArrowLeft, Search, Filter, Mail, Phone, Calendar, Shield, X, Ban, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { useState } from 'react';

const allUsers = [
  {
    id: 1,
    name: 'Riya Rahman',
    email: 'riya.rahman@email.com',
    phone: '+880 1712-345678',
    type: 'traveler',
    joined: 'Jan 15, 2024',
    status: 'verified',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riya',
    totalBookings: 12,
    totalSpent: 45000,
    kycStatus: 'verified',
    lastActive: '2 hours ago'
  },
  {
    id: 2,
    name: 'Karim Ahmed',
    email: 'karim.ahmed@email.com',
    phone: '+880 1798-234567',
    type: 'host',
    joined: 'Feb 3, 2024',
    status: 'pending',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim',
    totalBookings: 24,
    totalEarned: 85000,
    verificationStatus: 'pending',
    lastActive: '5 hours ago'
  },
  {
    id: 3,
    name: 'Aisha Khan',
    email: 'aisha.khan@email.com',
    phone: '+880 1523-456789',
    type: 'traveler',
    joined: 'Mar 12, 2024',
    status: 'verified',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
    totalBookings: 8,
    totalSpent: 28000,
    kycStatus: 'verified',
    lastActive: '1 day ago'
  },
  {
    id: 4,
    name: 'Rafiq Hassan',
    email: 'rafiq.hassan@email.com',
    phone: '+880 1612-345678',
    type: 'host',
    joined: 'Apr 20, 2024',
    status: 'verified',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
    totalBookings: 36,
    totalEarned: 125000,
    verificationStatus: 'verified',
    lastActive: '30 minutes ago'
  },
  {
    id: 5,
    name: 'Mehedi Hassan',
    email: 'mehedi.hassan@email.com',
    phone: '+880 1912-765432',
    type: 'traveler',
    joined: 'May 8, 2024',
    status: 'suspended',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi',
    totalBookings: 3,
    totalSpent: 12000,
    kycStatus: 'pending',
    lastActive: '1 week ago',
    suspensionReason: 'Policy violation'
  },
  {
    id: 6,
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan@email.com',
    phone: '+880 1812-987654',
    type: 'host',
    joined: 'Jun 5, 2024',
    status: 'verified',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
    totalBookings: 18,
    totalEarned: 62000,
    verificationStatus: 'verified',
    lastActive: '2 days ago'
  }
];

export function AllUsers({ onBack }) {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const filteredUsers = allUsers.filter(user => {
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const travelerCount = allUsers.filter(u => u.type === 'traveler').length;
  const hostCount = allUsers.filter(u => u.type === 'host').length;
  const verifiedCount = allUsers.filter(u => u.status === 'verified').length;
  const pendingCount = allUsers.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6">
    
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl mb-1">All Users</h2>
          <p className="text-gray-600">Manage platform users</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">{allUsers.length}</div>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1 text-blue-600">{travelerCount}</div>
          <p className="text-sm text-gray-600">Travelers</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1 text-green-600">{hostCount}</div>
          <p className="text-sm text-gray-600">Hosts</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1 text-purple-600">{verifiedCount}</div>
          <p className="text-sm text-gray-600">Verified</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg ${
                filterType === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('traveler')}
              className={`px-4 py-2 rounded-lg ${
                filterType === 'traveler'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Travelers
            </button>
            <button
              onClick={() => setFilterType('host')}
              className={`px-4 py-2 rounded-lg ${
                filterType === 'host'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hosts
            </button>
          </div>
        </div>
      </div>

   
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm">User</th>
                <th className="text-left py-3 px-4 text-sm">Contact</th>
                <th className="text-left py-3 px-4 text-sm">Type</th>
                <th className="text-left py-3 px-4 text-sm">Status</th>
                <th className="text-left py-3 px-4 text-sm">Activity</th>
                <th className="text-left py-3 px-4 text-sm">Joined</th>
                <th className="text-right py-3 px-4 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.type === 'traveler'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      user.status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : user.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div>{user.totalBookings} bookings</div>
                      <div className="text-xs text-gray-500">{user.lastActive}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600">{user.joined}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetail(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowVerifyModal(true);
                          }}
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                          title="Verify User"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.status !== 'suspended' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowSuspendModal(true);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                          title="Suspend User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

  
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full border-4 border-white"
                />
                <div>
                  <h3 className="text-2xl mb-1">{selectedUser.name}</h3>
                  <p className="text-purple-100 text-sm">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setShowUserDetail(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
     
              <div>
                <h4 className="mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">User Type</div>
                    <div className="capitalize">{selectedUser.type}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <div className="capitalize">{selectedUser.status}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Phone</div>
                    <div>{selectedUser.phone}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Joined</div>
                    <div>{selectedUser.joined}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Activity Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl text-blue-600 mb-1">{selectedUser.totalBookings}</div>
                    <div className="text-sm text-gray-700">Total Bookings</div>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl text-green-600 mb-1">
                      ৳{selectedUser.totalSpent || selectedUser.totalEarned}
                    </div>
                    <div className="text-sm text-gray-700">
                      {selectedUser.type === 'traveler' ? 'Total Spent' : 'Total Earned'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Verification Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">
                      {selectedUser.type === 'traveler' ? 'KYC Verification' : 'Host Verification'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      (selectedUser.kycStatus || selectedUser.verificationStatus) === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedUser.kycStatus || selectedUser.verificationStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Last Active</span>
                    <span className="text-sm text-gray-600">{selectedUser.lastActive}</span>
                  </div>
                </div>
              </div>

              {selectedUser.suspensionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-red-700 mb-2">⚠️ Suspension Reason</h4>
                  <p className="text-sm text-red-600">{selectedUser.suspensionReason}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showVerifyModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
              <h3 className="text-2xl">Verify User</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800">
                  ✓ You're about to verify <strong>{selectedUser.name}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <div className="text-sm">
                    <div>Identity documents verified</div>
                    <div className="text-xs text-gray-500">NID/Passport checked</div>
                  </div>
                </label>
                {selectedUser.type === 'host' && (
                  <>
                    <label className="flex items-start gap-3">
                      <input type="checkbox" defaultChecked className="mt-1" />
                      <div className="text-sm">
                        <div>Police verification complete</div>
                        <div className="text-xs text-gray-500">Background check passed</div>
                      </div>
                    </label>
                    <label className="flex items-start gap-3">
                      <input type="checkbox" defaultChecked className="mt-1" />
                      <div className="text-sm">
                        <div>Training completed</div>
                        <div className="text-xs text-gray-500">Host guidelines accepted</div>
                      </div>
                    </label>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600">
                  Confirm Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
              <h3 className="text-2xl">Suspend User</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800">
                  ⚠️ This will suspend <strong>{selectedUser.name}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Reason for Suspension</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>Policy violation</option>
                  <option>Fraudulent activity</option>
                  <option>Multiple complaints</option>
                  <option>Non-payment</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Additional Notes</label>
                <textarea
                  placeholder="Provide details about the suspension..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuspendModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600">
                  Confirm Suspension
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}