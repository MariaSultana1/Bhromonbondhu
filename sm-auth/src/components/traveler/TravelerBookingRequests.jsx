import { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X, CreditCard, Loader, AlertCircle, MapPin, Users, Send } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
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
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const getColorFromName = (name) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const AvatarWithInitials = ({ image, name, className = 'w-12 h-12' }) => {
  const [imageError, setImageError] = useState(false);
  if (image && !imageError) {
    return (
      <img 
        src={image} 
        alt={name}
        className={`${className} rounded-full border-2 border-gray-200 object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }
  return (
    <div className={`${className} rounded-full border-2 border-gray-200 flex items-center justify-center font-bold text-white text-lg ${getColorFromName(name)}`}>
      {getInitials(name)}
    </div>
  );
};

export function TravelerBookingRequests() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall('/traveler/booking-requests');
      setRequests(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = (request) => {
    if (request.status !== 'confirmed') {
      alert('This request must be accepted by the host first');
      return;
    }
    setSelectedRequest(request);
    setShowPaymentModal(true);
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setBkashNumber('');
  };

  const processPayment = async () => {
    if (!selectedRequest) return;

    // Validation
    if (paymentMethod === 'card') {
      const cleaned = cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(cleaned)) {
        alert('Card number must be 16 digits');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        alert('Expiry must be MM/YY');
        return;
      }
      if (!/^\d{3}$/.test(cardCVV)) {
        alert('CVV must be 3 digits');
        return;
      }
    } else {
      if (!/^01[3-9]\d{8}$/.test(bkashNumber)) {
        alert('bKash number must be 11 digits starting with 01');
        return;
      }
    }

    setPaymentProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        bookingId: selectedRequest._id,
        paymentMethod: paymentMethod,
        paymentDetails: paymentMethod === 'card' 
          ? { cardNumber, cardholderName: 'Card Holder' }
          : { bkashNumber }
      };

      // Call payment endpoint
      await apiCall(`/bookings/${selectedRequest._id}/pay`, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      // Update request status
      setRequests(prev => prev.map(r => 
        r._id === selectedRequest._id 
          ? { ...r, paymentStatus: 'paid', status: 'completed' }
          : r
      ));

      setShowPaymentModal(false);
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
        fetchRequests();
      }, 3000);

    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const withdrawRequest = async (requestId) => {
    if (!window.confirm('Withdraw this request?')) return;
    try {
      await apiCall(`/bookings/${requestId}/cancel`, { method: 'PUT' });
      setRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: 'cancelled' } : r));
      alert('Request withdrawn');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredRequests = requests.filter(r => 
    filterStatus === 'all' || r.status === filterStatus
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'confirmed').length;
  const declinedCount = requests.filter(r => r.status === 'cancelled').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading your booking requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800">Error</p>
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchRequests} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1 font-bold">My Booking Requests</h2>
          <p className="text-gray-600">Track your requests and complete payments</p>
        </div>
        <button onClick={fetchRequests} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Refresh
        </button>
      </div>

      {/* PENDING ALERT */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800">
              {pendingCount} pending request{pendingCount > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-yellow-700">Hosts will review within {pendingCount > 0 ? '24 hours' : ''}</p>
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {[
          { key: 'all', label: `All (${requests.length})` },
          { key: 'pending', label: `Pending (${pendingCount})`, icon: '⏳' },
          { key: 'confirmed', label: `Accepted (${acceptedCount})`, icon: '✅' },
          { key: 'cancelled', label: `Declined (${declinedCount})`, icon: '❌' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`pb-3 px-5 border-b-2 whitespace-nowrap text-sm font-medium transition-colors ${
              filterStatus === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.icon && <span className="mr-1">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* REQUEST CARDS */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">No {filterStatus === 'all' ? '' : filterStatus} requests</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div
              key={request._id}
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
                request.status === 'pending'
                  ? 'border-yellow-300 ring-1 ring-yellow-200'
                  : request.status === 'confirmed'
                  ? 'border-green-300 ring-1 ring-green-200'
                  : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <AvatarWithInitials 
                    image={request.hostId?.image} 
                    name={request.hostId?.name || 'Host'}
                    className="w-16 h-16"
                  />
                  <div>
                    <h3 className="text-lg font-bold mb-1">{request.hostId?.name || 'Host'}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {request.hostId?.location || 'Location'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(request.checkIn)} → {formatDate(request.checkOut)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {request.guests} guest{request.guests > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium mb-2 ${
                    request.status === 'confirmed' ? 'bg-green-100 text-green-700'
                    : request.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                    : request.status === 'cancelled' ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                  }`}>
                    {request.status === 'pending' ? '⏳ Awaiting Host'
                      : request.status === 'confirmed' ? '✅ Accepted'
                      : request.status === 'cancelled' ? '❌ Declined'
                      : '🏁 Completed'}
                  </span>
                  <div className="text-2xl font-bold text-gray-900">৳{request.totalAmount?.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total with fee</div>
                </div>
              </div>

              {/* REQUEST NOTES */}
              {request.notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                  <strong>Your message:</strong> {request.notes}
                </div>
              )}

              {/* DECLINED REASON */}
              {request.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
                  <strong>Decline reason:</strong> {request.declineMessage || 'No reason provided'}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                {request.status === 'pending' && (
                  <>
                    <div className="flex-1 text-sm text-gray-500">
                      ⏱️ Host will review within 24 hours
                    </div>
                    <button
                      onClick={() => withdrawRequest(request._id)}
                      className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 text-sm font-medium"
                    >
                      Withdraw Request
                    </button>
                  </>
                )}

                {request.status === 'confirmed' && request.paymentStatus !== 'paid' && (
                  <>
                    <div className="flex-1 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                      <Check className="w-4 h-4" />
                      Host accepted! Ready for payment
                    </div>
                    <button
                      onClick={() => handleProceedToPayment(request)}
                      className="px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Proceed to Payment
                    </button>
                  </>
                )}

                {request.paymentStatus === 'paid' && (
                  <div className="flex-1 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <Check className="w-4 h-4" />
                    Payment received - Booking confirmed!
                  </div>
                )}

                {request.status === 'cancelled' && (
                  <div className="flex-1 text-sm text-gray-600">
                    This request has been declined by the host
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
              <h3 className="text-2xl font-bold mb-1">Complete Payment</h3>
              <p className="text-green-100">Booking request accepted - Finalize your booking</p>
            </div>

            <div className="p-6 space-y-6">
              {/* BOOKING SUMMARY */}
              <div className="bg-green-50 border-2 border-green-200 px-6 py-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-semibold">Booking Total</span>
                  <span className="text-3xl text-green-600 font-bold">৳{selectedRequest.grandTotal?.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Service Amount</span>
                    <span>৳{selectedRequest.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Platform Fee (15%)</span>
                    <span>৳{selectedRequest.platformFee?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <label className="block text-sm mb-3 text-gray-700 font-semibold">Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium">Card</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">💳</div>
                    <div className="text-sm font-medium">bKash</div>
                  </button>
                </div>
              </div>

              {/* CARD FORM */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 16) {
                        setCardNumber(value.replace(/(\d{4})/g, '$1 ').trim());
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={19}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setCardExpiry(value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value);
                        }
                      }}
                      placeholder="MM/YY"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={5}
                    />
                    <input
                      type="text"
                      value={cardCVV}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 3) setCardCVV(value);
                      }}
                      placeholder="CVV"
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={3}
                    />
                  </div>
                </div>
              )}

              {/* BKASH FORM */}
              {paymentMethod === 'bkash' && (
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 11) setBkashNumber(value);
                  }}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  maxLength={11}
                />
              )}

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={paymentProcessing || (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCVV)) || (paymentMethod === 'bkash' && !bkashNumber)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Pay ৳{selectedRequest.grandTotal?.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION */}
      {showConfirmation && (
        <div className="fixed bottom-8 right-8 bg-white border-2 border-green-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 max-w-md">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900">Booking Confirmed!</div>
            <div className="text-sm text-gray-600">Your payment has been processed. Your booking is now active.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TravelerBookingRequests;