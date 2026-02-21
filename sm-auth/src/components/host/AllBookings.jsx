import { ArrowLeft, Calendar, User, DollarSign, MapPin, Phone, Mail, MessageSquare, FileText, Edit, X, Loader, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

export function AllBookings({ onBack }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReviewRequest, setShowReviewRequest] = useState(false);
  const [showModify, setShowModify] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [modifyData, setModifyData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX: Use the host-specific endpoint for booking requests
      const response = await fetch(`${API_URL}/host/booking-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = async (booking) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_URL}/bookings/${booking._id}/receipt`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedBooking({ ...booking, receipt: data.receipt });
        setShowReceipt(true);
      }
    } catch (err) {
      setActionError('Failed to load receipt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReviewRequest = async () => {
    try {
      setActionLoading(true);
      setActionError(null);

      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // ✅ FIX: use traveler.id (guest's user ID), not selectedBooking.userId
          receiverId: selectedBooking.traveler?.id || selectedBooking.userId,
          content: `Hi ${selectedBooking.traveler?.name || 'there'}, we'd love to hear about your experience! ${reviewMessage}`,
          type: 'text',
          metadata: {
            requestType: 'review_request',
            bookingId: selectedBooking._id
          }
        })
      });

      if (response.ok) {
        alert('Review request sent successfully!');
        setShowReviewRequest(false);
        setReviewMessage('');
      }
    } catch (err) {
      setActionError('Failed to send review request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModifyBooking = async () => {
    try {
      setActionLoading(true);
      setActionError(null);

      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: selectedBooking.traveler?.id || selectedBooking.userId,
          content: `Booking Modification Request:\n- New Check-in: ${modifyData.checkIn || selectedBooking.checkIn}\n- New Check-out: ${modifyData.checkOut || selectedBooking.checkOut}\n- Guests: ${modifyData.guests || selectedBooking.guests}\n- Reason: ${modifyData.modificationReason || 'Not specified'}`,
          type: 'text',
          metadata: {
            requestType: 'booking_modification',
            bookingId: selectedBooking._id
          }
        })
      });

      if (response.ok) {
        alert('Modification request sent to the guest!');
        setShowModify(false);
        setModifyData({});
      }
    } catch (err) {
      setActionError('Failed to send modification request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    if (!window.confirm('Accept this booking request?')) return;
    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/host/booking-requests/${bookingId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        alert('Booking accepted! The guest will be notified to complete payment.');
        fetchBookings();
      }
    } catch (err) {
      setActionError('Failed to accept booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    const reason = window.prompt('Reason for declining (optional):') || 'Host unavailable';
    if (reason === null) return; // user cancelled
    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/host/booking-requests/${bookingId}/decline`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        alert('Booking declined.');
        fetchBookings();
        setSelectedBooking(null);
      }
    } catch (err) {
      setActionError('Failed to decline booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!selectedBooking?.receipt) return;
    const receiptHTML = `<!DOCTYPE html><html><head><title>Receipt</title></head><body>
      <h1>Receipt #${selectedBooking.receipt.bookingId}</h1>
      <p>Guest: ${selectedBooking.receipt.hostName}</p>
      <p>Check-in: ${selectedBooking.receipt.checkIn}</p>
      <p>Check-out: ${selectedBooking.receipt.checkOut}</p>
      <p>Total: ৳${selectedBooking.receipt.totalAmount}</p>
      <p>Status: ${selectedBooking.receipt.status}</p>
    </body></html>`;
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${selectedBooking.receipt.bookingId}.html`;
    a.click();
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
        <span className="ml-3 text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <button onClick={onBack} className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Guest Bookings</h2>
            <p className="text-blue-100">Manage your guest bookings ({bookings.length})</p>
          </div>
          <button onClick={fetchBookings} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900">Error: {error}</p>
            <button onClick={fetchBookings} className="text-sm text-red-600 underline mt-1">Retry</button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All', color: 'bg-blue-500' },
          { key: 'pending', label: 'Pending', color: 'bg-yellow-500' },
          { key: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
          { key: 'completed', label: 'Completed', color: 'bg-purple-500' },
          { key: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === key ? `${color} text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">No Bookings Found</h3>
          <p className="text-gray-500">No {filterStatus !== 'all' ? filterStatus : ''} bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            // ✅ FIX: The host endpoint returns traveler info directly
            const guestName = booking.traveler?.name || 'Guest';
            const guestEmail = booking.traveler?.email || '';
            const guestPhone = booking.traveler?.phone || '';
            const guestAvatar = booking.traveler?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking._id}`;
            // ✅ FIX: hostEarnings = totalAmount (base before platform fee)
            const hostEarnings = booking.hostEarnings || booking.totalAmount || 0;
            const platformFee = booking.platformFee || 0;
            const grandTotal = booking.totalAmount || 0;

            return (
              <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={guestAvatar}
                        alt={guestName}
                        className="w-16 h-16 rounded-full border-2 border-blue-100 object-cover"
                        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking._id}`; }}
                      />
                      <div>
                        <h3 className="text-xl mb-1 font-semibold">{guestName}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                          {booking.checkIn && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                          </div>
                          {booking.nights && (
                            <span className="text-gray-500">{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                          )}
                        </div>
                        {guestEmail && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{guestEmail}</span>
                          </div>
                        )}
                        {guestPhone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{guestPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700'
                        : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                        : booking.status === 'completed' ? 'bg-purple-100 text-purple-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.paymentStatus && (
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-600'
                          : booking.paymentStatus === 'pending' ? 'bg-orange-50 text-orange-600'
                          : 'bg-gray-50 text-gray-500'
                        }`}>
                          Payment: {booking.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ✅ FIX: Show correct earnings breakdown */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500">Guest Paid</p>
                      <p className="text-lg font-semibold text-gray-800">৳{grandTotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Platform Fee (15%)</p>
                      <p className="text-lg font-semibold text-red-500">-৳{platformFee.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Your Earnings</p>
                      <p className="text-lg font-bold text-green-600">৳{hostEarnings.toLocaleString()}</p>
                    </div>
                  </div>

                  {booking.selectedServices && booking.selectedServices.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {booking.selectedServices.map((service, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">{service}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm text-gray-700">
                      <span className="font-medium">Notes: </span>{booking.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => { setSelectedBooking(booking); setModifyData({ checkIn: booking.checkIn, checkOut: booking.checkOut, guests: booking.guests }); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
                    >
                      <FileText className="w-4 h-4" /> View Details
                    </button>

                    {/* Accept/Decline for pending */}
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptBooking(booking._id)}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleDeclineBooking(booking._id)}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                        >
                          ✗ Decline
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => { setSelectedBooking(booking); setShowModify(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"
                      >
                        <Edit className="w-4 h-4" /> Modify
                      </button>
                    )}

                    <button
                      onClick={() => handleViewReceipt(booking)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <FileText className="w-4 h-4" /> Receipt
                    </button>

                    <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                      <MessageSquare className="w-4 h-4" /> Message Guest
                    </button>

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => { setSelectedBooking(booking); setShowReviewRequest(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                      >
                        Request Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {selectedBooking && !showReceipt && !showReviewRequest && !showModify && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Booking Details</h3>
                <p className="text-blue-100 text-sm">ID: {selectedBooking.bookingId}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Guest Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={selectedBooking.traveler?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking._id}`}
                  alt="Guest"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xl font-semibold">{selectedBooking.traveler?.name || 'Guest'}</h4>
                  <p className="text-sm text-gray-600">{selectedBooking.traveler?.email}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.traveler?.phone}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Check-in</div>
                  <div className="text-lg font-semibold">{selectedBooking.checkIn ? new Date(selectedBooking.checkIn).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Check-out</div>
                  <div className="text-lg font-semibold">{selectedBooking.checkOut ? new Date(selectedBooking.checkOut).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Guests & Duration</div>
                <div className="text-xl font-bold text-green-700">{selectedBooking.guests} guest{selectedBooking.guests > 1 ? 's' : ''} · {selectedBooking.nights || '?'} nights</div>
              </div>

              {/* ✅ FIX: Correct payment breakdown */}
              <div className="p-4 bg-purple-50 rounded-xl">
                <h4 className="mb-3 font-semibold">Earnings Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guest Paid (Total):</span>
                    <span className="font-medium">৳{(selectedBooking.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Platform Fee (15%):</span>
                    <span>-৳{(selectedBooking.platformFee || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-purple-200 font-bold text-lg">
                    <span>Your Earnings:</span>
                    <span className="text-green-600">৳{(selectedBooking.hostEarnings || selectedBooking.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>Payment Status:</span>
                    <span className={selectedBooking.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
                      {selectedBooking.paymentStatus || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.selectedServices?.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Services Booked</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.selectedServices.map((service, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white text-gray-700 rounded-lg border">{service}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Notes</div>
                  <div>{selectedBooking.notes}</div>
                </div>
              )}

              <div className="text-xs text-gray-400">
                Booked: {new Date(selectedBooking.createdAt).toLocaleDateString()}
              </div>

              {selectedBooking.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => { handleAcceptBooking(selectedBooking._id); setSelectedBooking(null); }} className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium">
                    ✓ Accept Booking
                  </button>
                  <button onClick={() => { handleDeclineBooking(selectedBooking._id); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium">
                    ✗ Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Receipt</h3>
              <button onClick={() => { setShowReceipt(false); setSelectedBooking(null); }} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              {selectedBooking.receipt ? (
                <>
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold">ভ্রমণবন্ধু</h4>
                    <p className="text-sm text-gray-600">Travel Platform - Receipt</p>
                  </div>
                  <div className="border-2 border-gray-200 rounded-xl p-6 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Receipt #</span><span className="font-semibold">{selectedBooking.receipt.bookingId}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Guest</span><span>{selectedBooking.traveler?.name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Check-in</span><span>{selectedBooking.receipt.checkIn}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Check-out</span><span>{selectedBooking.receipt.checkOut}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Guests</span><span>{selectedBooking.receipt.guests}</span></div>
                    <div className="flex justify-between border-t pt-3 font-bold"><span>Total</span><span>৳{selectedBooking.receipt.totalAmount?.toLocaleString()}</span></div>
                    <div className="text-center text-xs text-gray-400">{selectedBooking.receipt.status}</div>
                  </div>
                  <button onClick={handleDownloadReceipt} className="mt-4 w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download Receipt
                  </button>
                </>
              ) : (
                <p className="text-center text-gray-500">Loading receipt...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {showReviewRequest && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Request Review</h3>
              <button onClick={() => { setShowReviewRequest(false); setReviewMessage(''); }} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              {actionError && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{actionError}</div>}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Guest</div>
                <div className="text-lg font-semibold">{selectedBooking.traveler?.name || 'Guest'}</div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">Personal Message (Optional)</label>
                <textarea
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  placeholder="Hi! Hope you enjoyed your stay..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                />
              </div>
              <button onClick={handleSendReviewRequest} disabled={actionLoading} className="w-full py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50">
                {actionLoading ? 'Sending...' : 'Send Review Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Booking Modal */}
      {showModify && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Modify Booking</h3>
              <button onClick={() => { setShowModify(false); setModifyData({}); }} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              {actionError && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{actionError}</div>}
              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">Check-in Date</label>
                <input type="date" value={modifyData.checkIn ? new Date(modifyData.checkIn).toISOString().split('T')[0] : ''} onChange={(e) => setModifyData({ ...modifyData, checkIn: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">Check-out Date</label>
                <input type="date" value={modifyData.checkOut ? new Date(modifyData.checkOut).toISOString().split('T')[0] : ''} onChange={(e) => setModifyData({ ...modifyData, checkOut: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">Number of Guests</label>
                <input type="number" value={modifyData.guests || selectedBooking.guests} onChange={(e) => setModifyData({ ...modifyData, guests: parseInt(e.target.value) })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">Modification Reason</label>
                <textarea value={modifyData.modificationReason || ''} onChange={(e) => setModifyData({ ...modifyData, modificationReason: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" rows={3} />
              </div>
              <button onClick={handleModifyBooking} disabled={actionLoading} className="w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50">
                {actionLoading ? 'Sending...' : 'Send Modification Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllBookings;