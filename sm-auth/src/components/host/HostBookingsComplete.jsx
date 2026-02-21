import { Calendar, User, MessageSquare, Check, X, Clock, Star, MapPin, Phone, Mail, Download, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function HostBookingsComplete({ onMessageClick }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRequestReview, setShowRequestReview] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('Dates not available');
  const [declineMessage, setDeclineMessage] = useState('');
  const [reviewMessage, setReviewMessage] = useState('Hi! I hope you enjoyed your stay. It would mean a lot if you could leave a review of your experience.');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch('/host/booking-requests');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAccept = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await apiFetch(`/host/booking-requests/${selectedBooking._id}/accept`, {
        method: 'PUT',
        body: JSON.stringify({ message: welcomeMessage }),
      });
      showToast('Booking accepted successfully!');
      setShowAcceptModal(false);
      setWelcomeMessage('');
      await fetchBookings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await apiFetch(`/host/booking-requests/${selectedBooking._id}/decline`, {
        method: 'PUT',
        body: JSON.stringify({ reason: declineReason, message: declineMessage }),
      });
      showToast('Booking declined.');
      setShowDeclineModal(false);
      setDeclineMessage('');
      await fetchBookings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filterType === 'all') return true;
    return b.status === filterType;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader className="w-8 h-8 text-green-500 animate-spin" />
        <span className="ml-3 text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchBookings} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h2 className="text-2xl mb-2">Bookings Management</h2>
        <p className="text-gray-600">Manage your guest bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        {['all', 'pending', 'confirmed', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`pb-3 px-4 border-b-2 whitespace-nowrap capitalize ${
              filterType === tab
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={booking.traveler?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.traveler?.name}`}
                  alt={booking.traveler?.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="mb-1">{booking.traveler?.name || 'Guest'}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(booking.selectedServices || []).map((service, index) => (
                      <span key={index} className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm mb-2 ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700'
                  : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                  : booking.status === 'cancelled' ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <div className="text-2xl">৳{booking.totalAmount?.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total amount</div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Check-in</p>
                <p>{formatDate(booking.checkIn)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Check-out</p>
                <p>{formatDate(booking.checkOut)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p>{booking.nights} night(s)</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {booking.status === 'pending' && (
                <>
                  <button
                    onClick={() => { setSelectedBooking(booking); setShowAcceptModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button
                    onClick={() => { setSelectedBooking(booking); setShowDeclineModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button
                    onClick={() => { setSelectedBooking(booking); setShowViewDetails(true); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      if (onMessageClick) onMessageClick(booking.traveler?.id, booking._id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <MessageSquare className="w-4 h-4" /> Message Guest
                  </button>
                  <button
                    onClick={() => { setSelectedBooking(booking); setShowViewDetails(true); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </>
              )}
              {(booking.status === 'completed' || booking.status === 'cancelled') && (
                <>
                  <button
                    onClick={() => { setSelectedBooking(booking); setShowReceipt(true); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View Receipt
                  </button>
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => { setSelectedBooking(booking); setShowRequestReview(true); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Request Review
                    </button>
                  )}
                </>
              )}
            </div>

            {booking.status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="mb-1">Respond within 24 hours to maintain your acceptance rate</p>
                  <p className="text-xs">Payment is held in escrow until you accept</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl mb-2">No bookings found</h3>
          <p className="text-gray-600">No {filterType === 'all' ? '' : filterType} bookings at the moment</p>
        </div>
      )}

      {/* View Details Modal */}
      {showViewDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
              <h3 className="text-2xl mb-1">Booking Details</h3>
              <p className="text-blue-100 text-sm">ID: {selectedBooking.bookingId}</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="mb-3">Guest Information</h4>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedBooking.traveler?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking.traveler?.name}`}
                    alt={selectedBooking.traveler?.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <div className="mb-1">{selectedBooking.traveler?.name}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {selectedBooking.traveler?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedBooking.traveler.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedBooking.traveler?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Check-in</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedBooking.checkIn)}
                    </div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Check-out</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedBooking.checkOut)}
                    </div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Guests</div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedBooking.guests} guest(s)
                    </div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Nights</div>
                    <div>{selectedBooking.nights} night(s)</div>
                  </div>
                </div>
              </div>

              {(selectedBooking.selectedServices || []).length > 0 && (
                <div>
                  <h4 className="mb-3">Services Requested</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.selectedServices.map((service, idx) => (
                      <span key={idx} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg">{service}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <h4 className="mb-3">Notes</h4>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Earnings</span>
                    <span>৳{selectedBooking.hostEarnings?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (15%)</span>
                    <span>৳{selectedBooking.platformFee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span>Total Charged to Guest</span>
                    <span className="text-xl text-green-600">৳{selectedBooking.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Payment: <span className={`font-medium ${selectedBooking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedBooking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowViewDetails(false)} className="w-full py-3 bg-gray-100 rounded-xl hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
              <h3 className="text-2xl">Accept Booking</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800">
                  ✓ You're about to accept booking from <strong>{selectedBooking.traveler?.name}</strong>
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span>{formatDate(selectedBooking.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span>{formatDate(selectedBooking.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span>{selectedBooking.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Earnings</span>
                  <span className="text-green-600">৳{selectedBooking.hostEarnings?.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Welcome Message (Optional)</label>
                <textarea
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  placeholder="Welcome! Looking forward to hosting you..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAcceptModal(false)} className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
                  Confirm Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
              <h3 className="text-2xl">Decline Booking</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800">⚠️ This will decline the request from <strong>{selectedBooking.traveler?.name}</strong></p>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Reason for Declining</label>
                <select
                  value={declineReason}
                  onChange={e => setDeclineReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                >
                  <option>Dates not available</option>
                  <option>Unable to provide requested services</option>
                  <option>Personal reasons</option>
                  <option>Other</option>
                </select>
                <textarea
                  value={declineMessage}
                  onChange={e => setDeclineMessage(e.target.value)}
                  placeholder="Additional message to guest (optional)..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                ⚠️ Declining too many bookings may affect your host rating
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeclineModal(false)} className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading && <Loader className="w-4 h-4 animate-spin" />}
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-6">
              <h3 className="text-2xl">Booking Receipt</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center py-4 border-b border-gray-200">
                <h4 className="text-2xl mb-1">ভ্রমণবন্ধু</h4>
                <p className="text-sm text-gray-600">Official Receipt</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span>{selectedBooking.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Name</span>
                  <span>{selectedBooking.traveler?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span>{formatDate(selectedBooking.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span>{formatDate(selectedBooking.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span>{selectedBooking.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span>{selectedBooking.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="capitalize">{selectedBooking.paymentMethod}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Earnings</span>
                  <span className="text-green-600">৳{selectedBooking.hostEarnings?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="text-red-600">-৳{selectedBooking.platformFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span>Guest Total</span>
                  <span className="text-xl text-green-600">৳{selectedBooking.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowReceipt(false)} className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50">
                  Close
                </button>
                <button className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Review Modal */}
      {showRequestReview && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white p-6">
              <h3 className="text-2xl">Request Review</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={selectedBooking.traveler?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking.traveler?.name}`}
                  alt={selectedBooking.traveler?.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div>{selectedBooking.traveler?.name}</div>
                  <div className="text-sm text-gray-600">
                    Stayed: {formatDate(selectedBooking.checkIn)} – {formatDate(selectedBooking.checkOut)}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Personal Message</label>
                <textarea
                  value={reviewMessage}
                  onChange={e => setReviewMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={4}
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                💡 Reviews help build trust and attract more guests
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowRequestReview(false)} className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={() => { showToast('Review request sent!'); setShowRequestReview(false); }}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600"
                >
                  Send Review Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}