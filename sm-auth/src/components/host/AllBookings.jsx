import { ArrowLeft, Calendar, User, DollarSign, MapPin, Phone, Mail, MessageSquare, FileText, Edit, X, Loader, AlertCircle, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();

      if (data.success) {
        // Enrich bookings with user details if needed
        const enrichedBookings = await Promise.all(
          (data.bookings || []).map(async (booking) => {
            try {
              // Fetch host details if hostId exists
              let hostInfo = null;
              if (booking.hostId) {
                const hostResponse = await fetch(
                  `http://localhost:5000/api/hosts/${booking.hostId}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }
                );
                if (hostResponse.ok) {
                  const hostData = await hostResponse.json();
                  hostInfo = hostData.host;
                }
              }

              return {
                ...booking,
                hostInfo
              };
            } catch (err) {
              console.error('Error enriching booking:', err);
              return booking;
            }
          })
        );

        setBookings(enrichedBookings);
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
        `http://localhost:5000/api/bookings/${booking._id}/receipt`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedBooking({
          ...booking,
          receipt: data.receipt
        });
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

      // This would send a message to the guest
      // Using the existing messaging API
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: selectedBooking.userId,
          content: `Hi ${selectedBooking.traveler}, we'd love to hear about your experience! ${reviewMessage}`,
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

      const updatePayload = {
        checkIn: modifyData.checkIn || selectedBooking.checkIn,
        checkOut: modifyData.checkOut || selectedBooking.checkOut,
        guests: modifyData.guests || selectedBooking.guests,
        notes: modifyData.modificationReason || ''
      };

      // Since the API doesn't have a direct update endpoint for bookings,
      // we'll need to use a message to notify the host
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: selectedBooking.userId,
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

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        setActionLoading(true);
        setActionError(null);

        const response = await fetch(
          `http://localhost:5000/api/bookings/${bookingId}/cancel`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          alert('Booking cancelled successfully');
          fetchBookings();
          setSelectedBooking(null);
        }
      } catch (err) {
        setActionError('Failed to cancel booking');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDownloadReceipt = () => {
    if (!selectedBooking?.receipt) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Bhromonbondhu</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .receipt-box { border: 2px solid #333; padding: 20px; max-width: 600px; margin: 0 auto; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; }
          .total-row { border-top: 2px solid #333; font-weight: bold; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <h1>ভ্রমণবন্ধু</h1>
            <p>Travel Platform - Receipt</p>
          </div>
          <div class="row">
            <span>Receipt #:</span>
            <span>${selectedBooking.receipt.bookingId}</span>
          </div>
          <div class="row">
            <span>Host:</span>
            <span>${selectedBooking.receipt.hostName}</span>
          </div>
          <div class="row">
            <span>Check-in:</span>
            <span>${selectedBooking.receipt.checkIn}</span>
          </div>
          <div class="row">
            <span>Check-out:</span>
            <span>${selectedBooking.receipt.checkOut}</span>
          </div>
          <div class="row">
            <span>Guests:</span>
            <span>${selectedBooking.receipt.guests}</span>
          </div>
          <div class="row">
            <span>Total Amount:</span>
            <span>৳${selectedBooking.receipt.totalAmount}</span>
          </div>
          <div class="row total-row">
            <span>Status:</span>
            <span>${selectedBooking.receipt.status}</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${selectedBooking.receipt.bookingId}.html`;
    a.click();
  };

  // Filter bookings
  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-3xl mb-2">All Bookings</h2>
        <p className="text-blue-100">Manage your guest bookings ({bookings.length})</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">No Bookings Found</h3>
          <p className="text-gray-500">You don't have any bookings yet</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'confirmed'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'cancelled'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
            </button>
          </div>

          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={booking.hostInfo?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking._id}`}
                        alt="Host"
                        className="w-16 h-16 rounded-full border-2 border-blue-100 object-cover"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${booking._id}`;
                        }}
                      />
                      <div>
                        <h3 className="text-xl mb-1">{booking.hostInfo?.name || 'Host'}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                          {booking.checkIn && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                            </div>
                          )}
                          {booking.guests && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{booking.guests} guests</span>
                            </div>
                          )}
                          {booking.hostInfo?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.hostInfo.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </div>
                      <div className="text-gray-800">Contact via messages</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="text-lg text-green-600 font-semibold">
                          ৳{booking.grandTotal ? booking.grandTotal.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      {booking.platformFee && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Platform Fee (15%):</span>
                          <span>৳{booking.platformFee.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.selectedServices && booking.selectedServices.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Services:</div>
                      <div className="flex flex-wrap gap-2">
                        {booking.selectedServices.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setModifyData({
                          checkIn: booking.checkIn,
                          checkOut: booking.checkOut,
                          guests: booking.guests
                        });
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      View Details
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModify(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                        Modify
                      </button>
                    )}
                    <button
                      onClick={() => handleViewReceipt(booking)}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                      disabled={actionLoading}
                    >
                      <FileText className="w-4 h-4" />
                      Receipt
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReviewRequest(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                      >
                        Request Review
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                        disabled={actionLoading}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {selectedBooking.hostInfo && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={selectedBooking.hostInfo.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking._id}`}
                    alt="Host"
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking._id}`;
                    }}
                  />
                  <div>
                    <h4 className="text-xl mb-1">{selectedBooking.hostInfo.name}</h4>
                    <div className="text-sm text-gray-600">
                      {selectedBooking.hostInfo.location}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Check-in</div>
                  <div className="text-lg">
                    {selectedBooking.checkIn
                      ? new Date(selectedBooking.checkIn).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Check-out</div>
                  <div className="text-lg">
                    {selectedBooking.checkOut
                      ? new Date(selectedBooking.checkOut).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-2">Number of Guests</div>
                <div className="text-2xl text-green-600">{selectedBooking.guests} Guests</div>
              </div>

              {selectedBooking.selectedServices && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Services Booked</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.selectedServices.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-200"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Special Requests</div>
                  <div>{selectedBooking.notes}</div>
                </div>
              )}

              <div className="p-4 bg-purple-50 rounded-xl">
                <h4 className="mb-3 font-semibold">Payment Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Booking Amount:</span>
                    <span>৳{selectedBooking.totalAmount?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-red-600">
                    <span>Platform Fee (15%):</span>
                    <span>-৳{selectedBooking.platformFee?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t-2 border-purple-200 text-lg font-semibold">
                    <span>You Receive:</span>
                    <span className="text-green-600">
                      ৳{(selectedBooking.grandTotal - selectedBooking.platformFee)?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Booking Date: {new Date(selectedBooking.createdAt).toLocaleDateString()}
              </div>
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
              <button
                onClick={() => {
                  setShowReceipt(false);
                  setSelectedBooking(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {selectedBooking.receipt ? (
              <div className="p-8">
                <div className="text-center mb-6">
                  <h4 className="text-2xl mb-2 font-bold">ভ্রমণবন্ধু</h4>
                  <p className="text-sm text-gray-600">Travel Platform - Receipt</p>
                </div>

                <div className="border-2 border-gray-200 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Receipt #</div>
                      <div className="font-semibold">{selectedBooking.receipt.bookingId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Date</div>
                      <div className="font-semibold">
                        {new Date(selectedBooking.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Host Information</div>
                    <div className="font-semibold">{selectedBooking.receipt.hostName}</div>
                    <div className="text-sm text-gray-600">{selectedBooking.receipt.location}</div>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="text-sm text-gray-600 mb-2">Booking Details</div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Check-in:</span>
                      <span>{selectedBooking.receipt.checkIn}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Check-out:</span>
                      <span>{selectedBooking.receipt.checkOut}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Guests:</span>
                      <span>{selectedBooking.receipt.guests}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2 font-semibold">
                      <span>Total Amount:</span>
                      <span>৳{selectedBooking.receipt.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-4">
                      Status: {selectedBooking.receipt.status}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadReceipt}
                  className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>Loading receipt...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Request Modal */}
      {showReviewRequest && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Request Review</h3>
              <button
                onClick={() => {
                  setShowReviewRequest(false);
                  setReviewMessage('');
                }}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {actionError}
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Guest</div>
                <div className="text-lg font-semibold">
                  {selectedBooking.hostInfo?.name || 'Guest'}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  placeholder="Hi! Hope you enjoyed your stay. Would love to hear your feedback..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                />
              </div>

              <button
                onClick={handleSendReviewRequest}
                disabled={actionLoading}
                className="w-full py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
              <button
                onClick={() => {
                  setShowModify(false);
                  setModifyData({});
                }}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {actionError}
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={modifyData.checkIn ? new Date(modifyData.checkIn).toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setModifyData({ ...modifyData, checkIn: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={modifyData.checkOut ? new Date(modifyData.checkOut).toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setModifyData({ ...modifyData, checkOut: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">
                  Number of Guests
                </label>
                <input
                  type="number"
                  value={modifyData.guests || selectedBooking.guests}
                  onChange={(e) =>
                    setModifyData({ ...modifyData, guests: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700 font-medium">
                  Modification Reason
                </label>
                <textarea
                  value={modifyData.modificationReason || ''}
                  onChange={(e) =>
                    setModifyData({
                      ...modifyData,
                      modificationReason: e.target.value
                    })
                  }
                  placeholder="Tell the guest why you're requesting this modification..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={handleModifyBooking}
                disabled={actionLoading}
                className="w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Sending...' : 'Send Modification Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}