import { ArrowLeft, Search, AlertTriangle, CheckCircle, Clock, X, MessageSquare, FileText, User } from 'lucide-react';
import { useState } from 'react';

const allDisputes = [
  {
    id: 1,
    bookingId: 'BK2024001',
    traveler: {
      name: 'Riya Rahman',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riya',
      email: 'riya@example.com'
    },
    host: {
      name: 'Karim Ahmed',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim',
      email: 'karim@example.com'
    },
    issue: 'Service not provided as promised',
    description: 'The host did not provide the local guide service that was included in the booking.',
    amount: 7500,
    status: 'open',
    priority: 'high',
    createdAt: '2 hours ago',
    messages: 3
  },
  {
    id: 2,
    bookingId: 'BK2024002',
    traveler: {
      name: 'Mehedi Hassan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi',
      email: 'mehedi@example.com'
    },
    host: {
      name: 'Shahana Begum',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shahana',
      email: 'shahana@example.com'
    },
    issue: 'Payment issue',
    description: 'Payment was deducted but host claims it was not received.',
    amount: 6000,
    status: 'resolved',
    priority: 'medium',
    createdAt: '1 day ago',
    resolvedAt: '12 hours ago',
    resolution: 'Payment verified and confirmed. Technical glitch resolved.',
    messages: 8
  },
  {
    id: 3,
    bookingId: 'BK2024003',
    traveler: {
      name: 'Nusrat Jahan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
      email: 'nusrat@example.com'
    },
    host: {
      name: 'Arif Hasan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arif',
      email: 'arif@example.com'
    },
    issue: 'Cancellation dispute',
    description: 'Host cancelled last minute, traveler wants full refund.',
    amount: 8000,
    status: 'investigating',
    priority: 'high',
    createdAt: '5 hours ago',
    messages: 5
  },
  {
    id: 4,
    bookingId: 'BK2024004',
    traveler: {
      name: 'Aisha Khan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
      email: 'aisha@example.com'
    },
    host: {
      name: 'Rafiq Hassan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
      email: 'rafiq@example.com'
    },
    issue: 'Quality of service complaint',
    description: 'Meals provided were not as described in the listing.',
    amount: 4500,
    status: 'open',
    priority: 'low',
    createdAt: '3 days ago',
    messages: 2
  }
];

export function AllDisputes({ onBack }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDisputeDetail, setShowDisputeDetail] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  const filteredDisputes = allDisputes.filter(dispute => {
    const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus;
    const matchesSearch = dispute.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dispute.traveler.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dispute.host.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openCount = allDisputes.filter(d => d.status === 'open').length;
  const investigatingCount = allDisputes.filter(d => d.status === 'investigating').length;
  const resolvedCount = allDisputes.filter(d => d.status === 'resolved').length;

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
          <h2 className="text-2xl mb-1">All Disputes</h2>
          <p className="text-gray-600">Manage and resolve platform disputes</p>
        </div>
      </div>

    
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1">{allDisputes.length}</div>
          <p className="text-sm text-gray-600">Total Disputes</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1 text-red-600">{openCount}</div>
          <p className="text-sm text-gray-600">Open</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1 text-orange-600">{investigatingCount}</div>
          <p className="text-sm text-gray-600">Investigating</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-2xl mb-1 text-green-600">{resolvedCount}</div>
          <p className="text-sm text-gray-600">Resolved</p>
        </div>
      </div>

     
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking ID or names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('open')}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === 'open'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus('investigating')}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === 'investigating'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Investigating
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-4 py-2 rounded-lg ${
                filterStatus === 'resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>

     
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-l-red-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg">Booking {dispute.bookingId}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    dispute.status === 'open'
                      ? 'bg-red-100 text-red-700'
                      : dispute.status === 'investigating'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {dispute.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    dispute.priority === 'high'
                      ? 'bg-red-100 text-red-600'
                      : dispute.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {dispute.priority} priority
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{dispute.issue}</p>
                <p className="text-sm text-gray-600 mb-4">{dispute.description}</p>

           
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Traveler</div>
                    <div className="flex items-center gap-3">
                      <img
                        src={dispute.traveler.avatar}
                        alt={dispute.traveler.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-sm">{dispute.traveler.name}</div>
                        <div className="text-xs text-gray-600">{dispute.traveler.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2">Host</div>
                    <div className="flex items-center gap-3">
                      <img
                        src={dispute.host.avatar}
                        alt={dispute.host.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-sm">{dispute.host.name}</div>
                        <div className="text-xs text-gray-600">{dispute.host.email}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {dispute.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {dispute.messages} messages
                  </span>
                  <span>Amount: ৳{dispute.amount}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setShowDisputeDetail(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm whitespace-nowrap"
                >
                  View Details
                </button>
                {dispute.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setShowResolveModal(true);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm whitespace-nowrap"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>

            {dispute.status === 'resolved' && dispute.resolution && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-800 mb-1">✓ Resolution</div>
                <div className="text-sm text-gray-700">{dispute.resolution}</div>
                <div className="text-xs text-gray-500 mt-1">Resolved {dispute.resolvedAt}</div>
              </div>
            )}
          </div>
        ))}
      </div>

    
      {showDisputeDetail && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Dispute Details</h3>
                <p className="text-purple-100 text-sm">Booking {selectedDispute.bookingId}</p>
              </div>
              <button onClick={() => setShowDisputeDetail(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Status</div>
                  <div className="text-lg capitalize">{selectedDispute.status}</div>
                </div>
                <span className={`px-4 py-2 rounded-full ${
                  selectedDispute.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : selectedDispute.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedDispute.priority} priority
                </span>
              </div>

            
              <div>
                <h4 className="mb-3">Issue Details</h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="mb-2">{selectedDispute.issue}</div>
                  <p className="text-sm text-gray-700">{selectedDispute.description}</p>
                </div>
              </div>

    
              <div>
                <h4 className="mb-3">Parties Involved</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-3">Traveler</div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={selectedDispute.traveler.avatar}
                        alt={selectedDispute.traveler.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="mb-1">{selectedDispute.traveler.name}</div>
                        <div className="text-sm text-gray-600">{selectedDispute.traveler.email}</div>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                      Contact Traveler
                    </button>
                  </div>
                  <div className="p-4 border-2 border-green-200 bg-green-50 rounded-xl">
                    <div className="text-sm text-gray-600 mb-3">Host</div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={selectedDispute.host.avatar}
                        alt={selectedDispute.host.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="mb-1">{selectedDispute.host.name}</div>
                        <div className="text-sm text-gray-600">{selectedDispute.host.email}</div>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                      Contact Host
                    </button>
                  </div>
                </div>
              </div>

            
              <div>
                <h4 className="mb-3">Financial Details</h4>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Booking Amount:</span>
                    <span>৳{selectedDispute.amount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Platform Fee (15%):</span>
                    <span>৳{Math.floor(selectedDispute.amount * 0.15)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span>Host Earnings:</span>
                    <span className="text-green-600">৳{Math.floor(selectedDispute.amount * 0.85)}</span>
                  </div>
                </div>
              </div>

          
              <div>
                <h4 className="mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">Dispute opened</div>
                      <div className="text-xs text-gray-500">{selectedDispute.createdAt}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{selectedDispute.messages} messages exchanged</div>
                      <div className="text-xs text-gray-500">Last message 1 hour ago</div>
                    </div>
                  </div>
                  {selectedDispute.status === 'resolved' && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">Dispute resolved</div>
                        <div className="text-xs text-gray-500">{selectedDispute.resolvedAt}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedDispute.status === 'resolved' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <h4 className="text-green-700 mb-2">✓ Resolution</h4>
                  <p className="text-sm text-gray-700">{selectedDispute.resolution}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisputeDetail(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedDispute.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      setShowDisputeDetail(false);
                      setShowResolveModal(true);
                    }}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
                  >
                    Resolve Dispute
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {showResolveModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
              <h3 className="text-2xl">Resolve Dispute</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800">
                  You're resolving dispute for booking <strong>{selectedDispute.bookingId}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Resolution Decision</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Refund to traveler (Full)</option>
                  <option>Refund to traveler (Partial - 50%)</option>
                  <option>Payment to host</option>
                  <option>Split payment (50/50)</option>
                  <option>No refund - Dismiss claim</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Resolution Details</label>
                <textarea
                  placeholder="Provide detailed explanation of the resolution..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p>💡 Both parties will be notified via email and in-app notification</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600">
                  Confirm Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}