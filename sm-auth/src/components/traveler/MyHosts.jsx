// MyHosts.jsx - FIXED VERSION
import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Star, MessageSquare, Phone, Plane, Train, Bus,
  Ticket, Users, Clock, Download, Mail, Loader, AlertCircle, X, CheckCircle,
  Shield, Languages, Users2, CheckCircle2, Send, CreditCard, Smartphone, Lock, Eye
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getColorFromName = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
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
        className={`${className} rounded-full border-2 border-blue-100 object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }
  return (
    <div className={`${className} rounded-full border-2 border-blue-100 flex items-center justify-center font-bold text-white text-lg ${getColorFromName(name || '?')}`}>
      {getInitials(name)}
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

// ─── Payment Modal - FIXED ───────────────────────────────────────────────────
function PaymentModal({ booking, onClose, onPaymentComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '', cardholderName: '', expiryDate: '', cvv: '', bkashNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    }
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }
    if (name === 'cvv') formattedValue = value.replace(/\D/g, '').slice(0, 3);
    if (name === 'bkashNumber') formattedValue = value.replace(/\D/g, '').slice(0, 11);

    setFormData({ ...formData, [name]: formattedValue });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (paymentMethod === 'card') {
      const cardNumberClean = formData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cardNumberClean)) newErrors.cardNumber = 'Card number must be 16 digits';
      if (!formData.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
      if (!formData.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
      } else {
        const [month, year] = formData.expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiry < new Date()) newErrors.expiryDate = 'Card has expired';
      }
      if (!/^\d{3}$/.test(formData.cvv)) newErrors.cvv = 'CVV must be 3 digits';
    } else {
      if (!/^01[3-9]\d{8}$/.test(formData.bkashNumber)) {
        newErrors.bkashNumber = 'Invalid bKash number (must be 11 digits starting with 01)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const paymentDetails = paymentMethod === 'card'
        ? { cardNumber: formData.cardNumber.replace(/\s/g, ''), cardholderName: formData.cardholderName }
        : { bkashNumber: formData.bkashNumber };

      const response = await fetch(`${API_URL}/payments/process/${booking._id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod, paymentDetails })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payment failed');
      if (data.success) {
        setPaymentSuccess(true);
        setTimeout(() => { 
          onPaymentComplete(data); 
          onClose(); 
        }, 2000);
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const nights = booking.checkIn && booking.checkOut
    ? Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))
    : 0;

  const hostName = booking.hostId?.name || 'Host';
  const hostLocation = booking.hostId?.location || 'Location';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Complete Payment</h3>
            <p className="text-green-100 text-sm">Your host {hostName} has accepted your booking</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6">
          {paymentSuccess ? (
            <div className="text-center py-12">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h4 className="text-2xl font-bold mb-2">Payment Successful!</h4>
              <p className="text-gray-600">Your booking is now confirmed. Redirecting...</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host</span>
                    <span className="font-medium">{hostName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{hostLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests</span>
                    <span className="font-medium">{booking.guests}</span>
                  </div>
                  <div className="border-t border-blue-200 my-2 pt-2">
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">৳{booking.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Platform fee</span>
                      <span className="text-gray-700">+ ৳{booking.platformFee?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-blue-200">
                      <span>Total</span>
                      <span className="text-green-600">৳{booking.grandTotal?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className={paymentMethod === 'card' ? 'text-green-700 font-medium' : 'text-gray-600'}>Card</span>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('bkash')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Smartphone className={`w-5 h-5 ${paymentMethod === 'bkash' ? 'text-pink-600' : 'text-gray-500'}`} />
                    <span className={paymentMethod === 'bkash' ? 'text-pink-700 font-medium' : 'text-gray-600'}>bKash</span>
                  </div>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {paymentMethod === 'card' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cardNumber ? 'border-red-300' : 'border-gray-200'}`} />
                      {errors.cardNumber && <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                      <input type="text" name="cardholderName" value={formData.cardholderName} onChange={handleInputChange}
                        placeholder="JOHN DOE"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cardholderName ? 'border-red-300' : 'border-gray-200'}`} />
                      {errors.cardholderName && <p className="mt-1 text-xs text-red-600">{errors.cardholderName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date</label>
                        <input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange}
                          placeholder="MM/YY"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.expiryDate ? 'border-red-300' : 'border-gray-200'}`} />
                        {errors.expiryDate && <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input type="text" name="cvv" value={formData.cvv} onChange={handleInputChange}
                          placeholder="123"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cvv ? 'border-red-300' : 'border-gray-200'}`} />
                        {errors.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">bKash Number</label>
                    <input type="tel" name="bkashNumber" value={formData.bkashNumber} onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.bkashNumber ? 'border-red-300' : 'border-gray-200'}`} />
                    {errors.bkashNumber && <p className="mt-1 text-xs text-red-600">{errors.bkashNumber}</p>}
                    <p className="mt-2 text-xs text-gray-500">You'll receive a payment request on your bKash app</p>
                  </div>
                )}

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{errors.submit}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={processing}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2">
                    {processing ? (
                      <><Loader className="w-4 h-4 animate-spin" />Processing...</>
                    ) : (
                      <>Pay ৳{booking.grandTotal?.toLocaleString()}</>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MyHosts() {
  const [activeTab, setActiveTab] = useState('hosts');
  const [hostBookings, setHostBookings] = useState([]);
  const [ticketBookings, setTicketBookings] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchPendingPayments();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found. Please login.');

      const response = await fetch(`${API_URL}/traveler/booking-requests`, { 
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        } 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('✅ Fetched bookings:', data.bookings);

      if (data.success) {
        // ✅ FIX: Properly format bookings with host details
        const formattedBookings = (data.bookings || []).map(booking => ({
          ...booking,
          // Ensure hostId is a proper object with all details
          hostId: booking.host ? {
            _id: booking.host.id,
            name: booking.host.name,
            location: booking.host.location,
            image: booking.host.avatar,
            propertyImage: booking.host.image,
            rating: booking.host.rating || 0,
            reviews: booking.host.reviews || 0,
            verified: booking.host.verified || false
          } : null,
          // Keep original nested properties for backwards compatibility
          hostName: booking.host?.name || 'Host',
          location: booking.host?.location || 'Location'
        }));

        setHostBookings(formattedBookings);
        console.log('✅ Host bookings formatted:', formattedBookings.length);
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments/pending`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await response.json();
      if (data.success) {
        const formattedPayments = (data.bookings || []).map(booking => ({
          ...booking,
          hostId: booking.hostId || {
            name: booking.hostName || 'Host',
            location: booking.location || 'Location'
          }
        }));
        setPendingPayments(formattedPayments);
        console.log('✅ Pending payments:', formattedPayments.length);
      }
    } catch (err) {
      console.error('Error fetching pending payments:', err);
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    console.log('✅ Payment completed:', paymentData);
    await fetchBookings();
    await fetchPendingPayments();
  };

  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getBookingStatus = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (d > today) return 'upcoming';
    if (d.toDateString() === today.toDateString()) return 'today';
    return 'completed';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-800 mb-4">{error}</p>
        <button onClick={fetchBookings} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Modal */}
      {paymentModalBooking && (
        <PaymentModal
          booking={paymentModalBooking}
          onClose={() => setPaymentModalBooking(null)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">My Bookings</h2>
            <p className="text-blue-100">Manage your host stays and travel tickets</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{hostBookings.length}</div>
            <div className="text-blue-100 text-sm">Host Bookings</div>
          </div>
        </div>
      </div>

      {/* ── Pending Payments Alert ── */}
      {pendingPayments.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900">
                  {pendingPayments.length === 1 ? '1 Booking Awaiting Payment' : `${pendingPayments.length} Bookings Awaiting Payment`}
                </h4>
                <p className="text-sm text-amber-700">Complete payment to confirm your stay.</p>
              </div>
            </div>
            <button
              onClick={() => setPaymentModalBooking(pendingPayments[0])}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-sm transition-all whitespace-nowrap"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-2">
        <button onClick={() => setActiveTab('hosts')}
          className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'hosts' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>
          Host Experiences {hostBookings.length > 0 && <span className="ml-2 text-sm">({hostBookings.length})</span>}
        </button>
      </div>

      {/* ── Host Bookings ── */}
      {activeTab === 'hosts' && (
        <div className="space-y-4">
          {hostBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 shadow-sm text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl mb-3">No Host Bookings Yet</h3>
              <p className="text-gray-600 mb-6">Start exploring authentic local experiences</p>
            </div>
          ) : (
            hostBookings.map((booking) => {
              const status = getBookingStatus(booking.checkIn);
              const isCancelled = booking.status === 'cancelled';
              const isPending = booking.status === 'pending';
              const needsPayment = booking.status === 'confirmed' && booking.paymentStatus === 'pending';
              const isConfirmed = booking.status === 'confirmed';

              // ✅ FIX: Get host details correctly
              const hostId = booking.hostId;
              const hostName = hostId?.name || booking.hostName || 'Host';
              const hostLocation = hostId?.location || booking.location || 'Location';
              const hostImage = hostId?.image || null;
              const hostRating = hostId?.rating || 0;

              return (
                <div key={booking._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="md:flex">
                    {/* Image Section */}
                    <div className="md:w-72 h-56 md:h-auto relative overflow-hidden">
                      <img
                        src={hostId?.propertyImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'}
                        alt={hostLocation}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'; }}
                      />
                      <div className={`absolute top-4 right-4 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg text-sm font-semibold text-white ${
                        isCancelled ? 'bg-red-500/90' :
                        needsPayment ? 'bg-amber-500/90' :
                        isPending ? 'bg-orange-500/90' :
                        status === 'upcoming' ? 'bg-green-500/90' :
                        status === 'today' ? 'bg-blue-500/90' :
                        'bg-gray-800/90'
                      }`}>
                        {isCancelled ? 'Cancelled' :
                         needsPayment ? '💳 Pay Now' :
                         isPending ? '⏳ Awaiting Host' :
                         status === 'upcoming' ? 'Upcoming' :
                         status === 'today' ? 'Today' : 'Completed'}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <AvatarWithInitials image={hostImage} name={hostName} className="w-14 h-14" />
                            <div>
                              <h3 className="text-xl font-semibold">{hostName}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{hostLocation}</span>
                              </div>
                              {hostRating > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium">{hostRating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="text-xs text-gray-500">Check-in</div>
                                <div className="text-sm font-medium">{fmtDate(booking.checkIn)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="text-xs text-gray-500">Check-out</div>
                                <div className="text-sm font-medium">{fmtDate(booking.checkOut)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">Booking ID: {booking.bookingId}</div>
                        </div>

                        <div className="text-right ml-6">
                          <div className="text-3xl text-blue-600 font-bold">৳{booking.grandTotal?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Total amount</div>
                        </div>
                      </div>

                      {/* Status Alerts */}
                      {needsPayment && (
                        <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-amber-900">
                                🎉 Host Accepted! Complete Payment
                              </p>
                              <p className="text-xs text-amber-700 mt-0.5">
                                Payment needed to finalize your stay
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setPaymentModalBooking(booking)}
                            className="w-full mt-3 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition-all"
                          >
                            Pay ৳{booking.grandTotal?.toLocaleString()}
                          </button>
                        </div>
                      )}

                      {isPending && (
                        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-orange-800">Awaiting {hostName}'s approval</p>
                              <p className="text-xs text-orange-600 mt-0.5">
                                You'll be notified when they respond
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {isConfirmed && !needsPayment && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-green-800">✓ Your stay is confirmed</p>
                              <p className="text-xs text-green-600 mt-0.5">
                                Payment completed - See you soon!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                        {needsPayment && (
                          <button
                            onClick={() => setPaymentModalBooking(booking)}
                            className="px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all flex items-center gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </button>
                        )}
                        {(isConfirmed || status === 'upcoming' || status === 'today') && !needsPayment && (
                          <button
                            onClick={() => alert('Message feature coming soon')}
                            className="px-5 py-2.5 border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message Host
                          </button>
                        )}
                        {status === 'completed' && !isCancelled && (
                          <button
                            onClick={() => alert('Review feature coming soon')}
                            className="px-5 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}