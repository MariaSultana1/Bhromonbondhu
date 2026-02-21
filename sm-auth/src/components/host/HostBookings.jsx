import { Calendar, User, MessageSquare, Check, X, Clock, Download, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

// ==================== API CONFIGURATION ====================

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// ==================== HELPER FUNCTIONS ====================

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const from = new Date(checkIn);
  const to = new Date(checkOut);
  return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
};

// ==================== MAIN COMPONENT ====================

export function HostBookings({ onMessageClick }) {
  // ========== STATE MANAGEMENT ==========

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRequestReview, setShowRequestReview] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('Dates not available');
  const [declineMessage, setDeclineMessage] = useState('');
  const [reviewMessage, setReviewMessage] = useState('Hi! I hope you enjoyed your stay. It would mean a lot if you could leave a review of your experience.');

  // ========== FETCH BOOKINGS ==========

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Fetching booking requests...');

      const data = await apiCall('/host/booking-requests');
      console.log('✅ Bookings fetched:', data);

      setBookings(data.bookings || []);
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLE ACCEPT BOOKING ==========

  const handleAccept = async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      console.log('✅ Accepting booking:', selectedBooking._id);

      await apiCall(`/host/booking-requests/${selectedBooking._id}/accept`, {
        method: 'PUT',
        body: JSON.stringify({ welcomeMessage }),
      });

      // Update local state
      setBookings(prev =>
        prev.map(b =>
          b._id === selectedBooking._id
            ? { ...b, status: 'confirmed', paymentStatus: 'paid' }
            : b
        )
      );

      setShowAcceptModal(false);
      setWelcomeMessage('');
      alert(`✅ Booking accepted! ${selectedBooking.traveler.name}'s trip is now confirmed.`);
    } catch (err) {
      console.error('❌ Error accepting booking:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ========== HANDLE DECLINE BOOKING ==========

  const handleDecline = async () => {
    if (!selectedBooking) return;

    setActionLoading(true);
    try {
      console.log('❌ Declining booking:', selectedBooking._id);

      await apiCall(`/host/booking-requests/${selectedBooking._id}/decline`, {
        method: 'PUT',
        body: JSON.stringify({
          reason: declineReason,
          message: declineMessage,
        }),
      });

      // Update local state
      setBookings(prev =>
        prev.map(b =>
          b._id === selectedBooking._id
            ? { ...b, status: 'cancelled' }
            : b
        )
      );

      setShowDeclineModal(false);
      setDeclineReason('Dates not available');
      setDeclineMessage('');
      alert('✅ Booking declined. The traveler will be notified and refunded.');
    } catch (err) {
      console.error('❌ Error declining booking:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ========== FILTER & CALCULATE STATS ==========

  const filteredBookings = bookings.filter(b =>
    filterType === 'all' || b.status === filterType
  );

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-3 text-gray-600">Loading booking requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Error loading bookings</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2 font-bold">Booking Requests</h2>
          <p className="text-gray-600">Manage traveler requests and bookings</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">
              You have {pendingCount} pending booking request{pendingCount > 1 ? 's' : ''}!
            </p>
            <p className="text-sm text-yellow-700">Respond within 24 hours to maintain your acceptance rate.</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {[
          { key: 'all', label: `All (${bookings.length})` },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'confirmed', label: `Confirmed (${confirmedCount})` },
          { key: 'completed', label: `Completed (${completedCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`pb-3 px-5 border-b-2 whitespace-nowrap text-sm font-medium transition-colors ${
              filterType === tab.key
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No {filterType === 'all' ? '' : filterType} bookings found</p>
          </div>
        ) : (
          filteredBookings.map(booking => {
            const nights = calculateNights(booking.checkIn, booking.checkOut);
            const platformFee = Math.round(booking.totalAmount * 0.15);
            const hostEarnings = booking.totalAmount - platformFee;

            return (
              <div
                key={booking._id}
                className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
                  booking.status === 'pending'
                    ? 'border-yellow-300 ring-1 ring-yellow-200'
                    : 'border-gray-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={booking.traveler.avatar}
                      alt={booking.traveler.name}
                      className="w-16 h-16 rounded-full border-2 border-gray-100"
                    />
                    <div>
                      <h3 className="text-lg font-bold mb-1">{booking.traveler.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {booking.guests} guest{booking.guests > 1 ? 's' : ''} · {nights} night{nights > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(booking.selectedServices || []).map((service, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status & Earnings */}
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium mb-2 ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {booking.status === 'pending'
                        ? '⏳ Pending'
                        : booking.status === 'confirmed'
                        ? '✅ Confirmed'
                        : booking.status === 'cancelled'
                        ? '❌ Declined'
                        : '🏁 Completed'}
                    </span>
                    <div className="text-2xl font-bold text-gray-900">৳{hostEarnings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Your earnings</div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Check-in</p>
                    <p className="font-medium text-sm">{formatDate(booking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Check-out</p>
                    <p className="font-medium text-sm">{formatDate(booking.checkOut)}</p>
                  </div>
                </div>

                {/* ✅ Transport Ticket Info */}
                {booking.transportTicket && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-1">🎫 Linked Transport Ticket</p>
                    <div className="flex flex-wrap gap-3 text-xs text-blue-800">
                      <span>Type: <strong>{booking.transportTicket.type}</strong></span>
                      <span>Provider: <strong>{booking.transportTicket.provider}</strong></span>
                      <span>Route: <strong>{booking.transportTicket.from} → {booking.transportTicket.to}</strong></span>
                      <span>Date: <strong>{booking.transportTicket.journeyDate}</strong></span>
                    </div>
                  </div>
                )}


                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowAcceptModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        Accept Request
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDeclineModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowViewDetails(true);
                        }}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm"
                      >
                        View Details
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => {
                          if (onMessageClick) {
                            onMessageClick(booking.traveler.id, booking._id);
                          }
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message Guest
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowViewDetails(true);
                        }}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm"
                      >
                        View Details
                      </button>
                    </>
                  )}

                  {booking.status === 'completed' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReceipt(true);
                        }}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        View Receipt
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowRequestReview(true);
                        }}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm"
                      >
                        Request Review
                      </button>
                    </>
                  )}
                </div>

                {/* Pending Notice */}
                {booking.status === 'pending' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">
                      Payment of ৳{booking.totalAmount?.toLocaleString()} is held in escrow and will be released once you accept.
                      Respond within 24 hours to maintain your host rating.
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========== ACCEPT MODAL ========== */}
      {showAcceptModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">Accept Booking Request</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <img
                  src={selectedBooking.traveler.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">{selectedBooking.traveler.name}</p>
                  <p className="text-sm text-gray-600">{formatDate(selectedBooking.checkIn)} → {formatDate(selectedBooking.checkOut)}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span>{selectedBooking.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span>{calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                  <span>Your Earnings</span>
                  <span className="text-green-600 text-lg">৳{(selectedBooking.totalAmount - Math.round(selectedBooking.totalAmount * 0.15)).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Welcome message (optional)</label>
                <textarea
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  placeholder="Looking forward to hosting you! Feel free to reach out if you have any questions..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  disabled={actionLoading}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {actionLoading ? 'Accepting...' : 'Confirm Accept'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== DECLINE MODAL ========== */}
      {showDeclineModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">Decline Booking Request</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                ⚠️ Declining will cancel the booking and refund <strong>{selectedBooking.traveler.name}</strong> automatically.
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Reason for declining</label>
                <select
                  value={declineReason}
                  onChange={e => setDeclineReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option>Dates not available</option>
                  <option>Unable to provide requested services</option>
                  <option>Guest count exceeds capacity</option>
                  <option>Personal reasons</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Message to guest (optional)</label>
                <textarea
                  value={declineMessage}
                  onChange={e => setDeclineMessage(e.target.value)}
                  placeholder="Sorry, I'm unable to host you on those dates..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                  rows={3}
                />
              </div>

              <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                ⚠️ Frequent declines may lower your host ranking.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeclineModal(false)}
                  disabled={actionLoading}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  {actionLoading ? 'Declining...' : 'Confirm Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== VIEW DETAILS MODAL ========== */}
      {showViewDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
              <h3 className="text-xl font-bold">Booking Details</h3>
              <p className="text-blue-100 text-sm">ID: {selectedBooking.bookingId}</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img src={selectedBooking.traveler.avatar} alt="" className="w-16 h-16 rounded-full" />
                <div>
                  <p className="font-bold text-lg">{selectedBooking.traveler.name}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.traveler.email}</p>
                  {selectedBooking.traveler.phone && (
                    <p className="text-sm text-gray-600">{selectedBooking.traveler.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Check-in', formatDate(selectedBooking.checkIn)],
                  ['Check-out', formatDate(selectedBooking.checkOut)],
                  ['Guests', selectedBooking.guests],
                  ['Nights', calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)],
                  ['Payment Method', selectedBooking.paymentMethod === 'card' ? 'Card' : 'bKash'],
                  ['Status', selectedBooking.status],
                ].map(([label, val]) => (
                  <div key={label} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-xs mb-1">{label}</p>
                    <p className="font-medium capitalize">{val}</p>
                  </div>
                ))}
              </div>

              {selectedBooking.selectedServices?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 text-gray-700">Services Requested</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.selectedServices.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <p className="text-sm font-semibold mb-2 text-gray-700">Guest Notes</p>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                <p className="font-semibold text-gray-700">Payment Breakdown</p>
                <div className="flex justify-between text-gray-600">
                  <span>Traveler pays</span>
                  <span>৳{selectedBooking.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform fee (15%)</span>
                  <span className="text-red-500">-৳{Math.round(selectedBooking.totalAmount * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                  <span>Your earnings</span>
                  <span className="text-green-600 text-lg">৳{(selectedBooking.totalAmount - Math.round(selectedBooking.totalAmount * 0.15)).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setShowViewDetails(false)}
                className="w-full py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== RECEIPT MODAL ========== */}
      {showReceipt && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-6 rounded-t-2xl text-center">
              <h3 className="text-xl font-bold">ভ্রমণবন্ধু Receipt</h3>
              <p className="text-gray-300 text-sm">{selectedBooking.bookingId}</p>
            </div>
            <div className="p-6 space-y-4 text-sm">
              {[
                ['Guest', selectedBooking.traveler.name],
                ['Dates', `${formatDate(selectedBooking.checkIn)} → ${formatDate(selectedBooking.checkOut)}`],
                ['Guests', selectedBooking.guests],
                ['Nights', calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span>{val}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Traveler paid</span>
                  <span>৳{selectedBooking.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Platform fee</span>
                  <span className="text-red-500">-৳{Math.round(selectedBooking.totalAmount * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
                  <span>Your earnings</span>
                  <span className="text-green-600 text-lg">৳{(selectedBooking.totalAmount - Math.round(selectedBooking.totalAmount * 0.15)).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== REQUEST REVIEW MODAL ========== */}
      {showRequestReview && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-400 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">Request Review</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <img src={selectedBooking.traveler.avatar} alt="" className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-semibold">{selectedBooking.traveler.name}</p>
                  <p className="text-sm text-gray-500">Stayed {formatDate(selectedBooking.checkIn)} → {formatDate(selectedBooking.checkOut)}</p>
                </div>
              </div>
              <textarea
                value={reviewMessage}
                onChange={e => setReviewMessage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none text-sm"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestReview(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-medium">
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <h4 className="font-semibold text-green-900 mb-3">Booking Guidelines</h4>
        <ul className="space-y-1.5 text-sm text-gray-700">
          <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span><span>Respond to booking requests within 24 hours</span></li>
          <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span><span>Payment is held in escrow and released after you accept</span></li>
          <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span><span>Cancellations must be made 48 hours in advance</span></li>
          <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span><span>Declining too many requests may affect your host rating</span></li>
        </ul>
      </div>
    </div>
  );
}

export default HostBookings;