import { useState, useEffect } from 'react';
import {
  Calendar, MapPin, Star, MessageSquare, Phone, Plane, Train, Bus,
  Ticket, Users, Clock, Download, Mail, Loader, AlertCircle, X, CheckCircle,
  Shield, Languages, Users2, CheckCircle2, Send
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// Navigate without needing useNavigate hook
const goTo = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// ─── Helper Functions ─────────────────────────────────────────────────────────
// Get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Generate color based on name
const getColorFromName = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Avatar component
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
    <div className={`${className} rounded-full border-2 border-blue-100 flex items-center justify-center font-bold text-white text-lg ${getColorFromName(name)}`}>
      {getInitials(name)}
    </div>
  );
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

// ─── Host Profile Modal ───────────────────────────────────────────────────────
function HostProfileModal({ booking, onClose }) {
  const host = booking.hostId;
  
  if (!host) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <AvatarWithInitials 
              image={host.image} 
              name={host.name}
              className="w-16 h-16"
            />
            <div>
              <h3 className="text-2xl font-bold">{host.name}</h3>
              <p className="text-blue-100 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {host.location}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Property Image */}
          {booking.propertyImage && (
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src={booking.propertyImage} 
                alt={host.location} 
                className="w-full h-80 object-cover" 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
                }}
              />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-yellow-700">{(host.rating || 0).toFixed(1)}</span>
              </div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{host.reviews || 0}</div>
              <div className="text-xs text-gray-600">Reviews</div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{host.totalGuests || 0}</div>
              <div className="text-xs text-gray-600">Guests</div>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">{host.responseRate || 95}%</div>
              <div className="text-xs text-gray-600">Response</div>
            </div>
          </div>

          {/* Description */}
          {host.description && (
            <div>
              <h4 className="font-bold text-lg mb-3 text-gray-800">About {host.name}</h4>
              <p className="text-gray-700 leading-relaxed">{host.description}</p>
            </div>
          )}

          {/* Host Details */}
          <div className="grid md:grid-cols-2 gap-4">
            {host.experience && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700 block mb-2">Experience Level</span>
                <span className="text-lg text-gray-900">{host.experience}</span>
              </div>
            )}
            {host.responseTime && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700 block mb-2">Response Time</span>
                <span className="text-lg text-gray-900">{host.responseTime}</span>
              </div>
            )}
          </div>

          {/* Languages */}
          {host.languages && host.languages.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Languages Spoken</h4>
              <div className="flex flex-wrap gap-2">
                {host.languages.map((lang, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification Status */}
          {host.verified && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-semibold text-green-900">Verified Host</div>
                <div className="text-sm text-green-700">Identity and background verified</div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Message Host Modal ───────────────────────────────────────────────────────
function MessageHostModal({ booking, onClose }) {
  const [messageSubject, setMessageSubject] = useState('General Inquiry');
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const host = booking.hostId;

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setMessageError('Message cannot be empty');
      return;
    }

    setSendingMessage(true);
    setMessageError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to send messages');
      }

      console.log('📤 Sending message to host:', {
        hostId: host._id,
        hostName: host.name,
        subject: messageSubject,
        messageLength: messageContent.length
      });

      // Send message to backend
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: host._id,
          content: `[${messageSubject}] ${messageContent.trim()}`,
          type: 'text'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Message sent successfully:', data);
        setMessageSent(true);
        
        setTimeout(() => {
          onClose();
          // Optionally redirect to messages page
          // window.location.href = '/traveler/messages';
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('❌ Send message error:', err);
      setMessageError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!host) return null;

  if (messageSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
          <p className="text-gray-600">
            Your message has been sent to {host.name}. They typically respond within {host.responseTime || 'Within 1 hour'}.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Message Host</h3>
            <p className="text-green-100 text-sm">Send a message to {host.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Host Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <AvatarWithInitials 
              image={host.image} 
              name={host.name}
              className="w-12 h-12"
            />
            <div>
              <div className="font-bold text-gray-900">{host.name}</div>
              <div className="text-sm text-gray-600">{host.location}</div>
            </div>
          </div>

          {/* Error Message */}
          {messageError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{messageError}</p>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
            <select 
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>General Inquiry</option>
              <option>Booking Question</option>
              <option>Service Details</option>
              <option>Schedule Change</option>
              <option>Custom Request</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Your Message</label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder={`Hi ${host.name}, I wanted to ask about...`}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={5}
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            💡 {host.name} responds within {host.responseTime || 'Within 1 hour'}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageContent.trim()}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2"
            >
              {sendingMessage ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    setErrorMsg('');
    const result = await onSubmit(booking, rating, reviewText.trim());
    setSubmitting(false);
    if (result?.success) {
      setSubmitted(true);
      setTimeout(onClose, 1500);
    } else {
      setErrorMsg(result?.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 text-white">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-semibold">Write a Review</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-yellow-100 text-sm">Share your experience with {booking.hostId?.name}</p>
        </div>

        {submitted ? (
          <div className="p-10 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-800">Thank you for your review!</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Star Rating */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Your Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className="w-9 h-9 transition-colors"
                      fill={(hovered || rating) >= star ? '#f59e0b' : 'none'}
                      stroke={(hovered || rating) >= star ? '#f59e0b' : '#d1d5db'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-500 self-center">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Your Review <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                placeholder={`Tell others about your experience staying with ${booking.hostId?.name}...`}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-yellow-400 text-sm text-gray-700 placeholder-gray-400 transition-colors"
              />
              <div className="text-right text-xs text-gray-400 mt-1">{reviewText.length}/500</div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className={`flex-1 px-5 py-3 rounded-xl text-white text-sm font-medium transition-all shadow-sm ${
                  rating === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 hover:shadow-md'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────
function ReceiptModal({ booking, onClose }) {
  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const nights = () => {
    if (!booking.checkIn || !booking.checkOut) return 0;
    return Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000);
  };

  const downloadReceipt = () => {
    const text = [
      '═══════════════════════════════════════',
      '         BOOKING RECEIPT',
      '         Bhromonbondhu',
      '═══════════════════════════════════════',
      '',
      `Booking ID   : ${booking.bookingId || 'N/A'}`,
      `Host         : ${booking.hostId?.name || 'N/A'}`,
      `Location     : ${booking.hostId?.location || 'N/A'}`,
      '',
      `Check-in     : ${fmtDate(booking.checkIn)}`,
      `Check-out    : ${fmtDate(booking.checkOut)}`,
      `Nights       : ${nights()}`,
      `Guests       : ${booking.guests || 1}`,
      '',
      `Services     : ${booking.selectedServices?.join(', ') || 'N/A'}`,
      '',
      `Payment      : ${booking.paymentMethod || 'N/A'}`,
      `Total Amount : ৳${booking.grandTotal?.toLocaleString() || '0'}`,
      '',
      `Booked on    : ${fmtDate(booking.createdAt || new Date())}`,
      '',
      '═══════════════════════════════════════',
      '  Thank you for booking with Bhromonbondhu!',
      '═══════════════════════════════════════',
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${booking.bookingId || 'booking'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-semibold">Booking Receipt</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 text-sm">Booking ID: {booking.bookingId || 'N/A'}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <AvatarWithInitials 
              image={booking.hostId?.image} 
              name={booking.hostId?.name || 'Host'}
              className="w-12 h-12"
            />
            <div>
              <p className="font-semibold text-gray-800">{booking.hostId?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {booking.hostId?.location || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Check-in</p>
              <p className="text-sm font-medium text-gray-800">{fmtDate(booking.checkIn)}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Check-out</p>
              <p className="text-sm font-medium text-gray-800">{fmtDate(booking.checkOut)}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-800">{nights()} night{nights() !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Guests</span>
              <span className="font-medium text-gray-800">{booking.guests || 1} guest{(booking.guests || 1) !== 1 ? 's' : ''}</span>
            </div>
            {booking.selectedServices?.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Services</span>
                <span className="font-medium text-gray-800 text-right">{booking.selectedServices.join(', ')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-800">{booking.paymentMethod || 'N/A'}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="font-semibold text-gray-700">Total Paid</span>
            <span className="text-2xl font-bold text-blue-600">৳{booking.grandTotal?.toLocaleString() || '0'}</span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm font-medium"
            >
              Close
            </button>
            <button
              onClick={downloadReceipt}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [messageModal, setMessageModal] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found. Please login.');

      const [bookingsRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/bookings`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${API_URL}/transport-tickets`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ]);

      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
      if (!ticketsRes.ok) throw new Error('Failed to fetch tickets');

      const bookingsData = await bookingsRes.json();
      const ticketsData = await ticketsRes.json();

      setHostBookings(bookingsData.bookings?.filter(b => b.bookingType === 'host') || []);
      setTicketBookings(ticketsData.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (booking, rating, reviewText) => {
    try {
      const token = localStorage.getItem('token');

      console.log('📤 Submitting review:', {
        url: `${API_URL}/bookings/${booking._id}/review`,
        bookingId: booking._id,
        rating,
        review: reviewText || null
      });

      const res = await fetch(`${API_URL}/bookings/${booking._id}/review`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          review: reviewText || null
        })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      console.log('📥 Review response:', res.status, data);

      if (!res.ok) {
        const backendMsg = data?.message || data?.error || data?.msg || `Server error ${res.status}`;
        return { success: false, error: backendMsg };
      }

      fetchBookings();
      return { success: true };
    } catch (err) {
      console.error('❌ Review fetch error:', err);
      return { success: false, error: 'Network error — is the server running?' };
    }
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

  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTransportIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'flight': return <Plane className="w-5 h-5" />;
      case 'train':  return <Train className="w-5 h-5" />;
      case 'bus':    return <Bus className="w-5 h-5" />;
      default:       return <Ticket className="w-5 h-5" />;
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      fetchBookings();
      alert('Booking cancelled successfully');
    } catch (err) {
      alert('Failed to cancel booking: ' + err.message);
    }
  };

  const cancelTicket = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/transport-tickets/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to cancel ticket');
      fetchBookings();
      alert('Ticket cancelled successfully');
    } catch (err) {
      alert('Failed to cancel ticket: ' + err.message);
    }
  };

  const viewETicket = async (booking) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/transport-tickets/${booking.bookingId}/ticket`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to fetch e-ticket');
      const { ticket: t } = await res.json();

      const html = `<!DOCTYPE html><html><head><title>E-Ticket - ${t.pnr}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px}
.ticket{border:2px solid #333;padding:30px;background:#f9f9f9}
.header{text-align:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:20px}
.row{display:flex;justify-content:space-between;margin:8px 0;font-size:14px}
.label{color:#555;font-weight:bold}
.barcode{text-align:center;margin:20px 0;font-family:monospace;font-size:22px;letter-spacing:3px}
.footer{text-align:center;margin-top:30px;font-size:12px;color:#666}</style></head>
<body><div class="ticket">
<div class="header"><h1>E-TICKET</h1><h2>${t.transportType?.toUpperCase()} TICKET</h2></div>
<div class="row"><span class="label">PNR</span><span>${t.pnr}</span></div>
<div class="row"><span class="label">Booking ID</span><span>${t.bookingId}</span></div>
<div class="row"><span class="label">Operator</span><span>${t.provider}</span></div>
<div class="row"><span class="label">From</span><span>${t.from}</span></div>
<div class="row"><span class="label">To</span><span>${t.to}</span></div>
<div class="row"><span class="label">Journey Date</span><span>${fmtDate(t.journeyDate)}</span></div>
<div class="row"><span class="label">Departure</span><span>${t.departureTime}</span></div>
<div class="row"><span class="label">Arrival</span><span>${t.arrivalTime}</span></div>
<div class="row"><span class="label">Duration</span><span>${t.duration}</span></div>
<div class="row"><span class="label">Passengers</span><span>${t.passengers?.length || 1}</span></div>
<div class="row"><span class="label">Total Amount</span><span>৳${t.totalAmount?.toLocaleString()}</span></div>
<div class="barcode">|||| |||| |||| ${t.pnr} |||| |||| ||||</div>
<div class="footer">Please present this e-ticket at check-in<br>Thank you for traveling with us!</div>
</div></body></html>`;

      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
    } catch (err) {
      alert('Failed to view e-ticket: ' + err.message);
    }
  };

  const downloadPDF = async (booking) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/transport-tickets/${booking.bookingId}/ticket`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to fetch ticket');
      const { ticket: t } = await res.json();

      const text = [
        '═══════════════════════════════════════',
        '            E-TICKET',
        '═══════════════════════════════════════',
        `${t.transportType?.toUpperCase()} TICKET`,
        `PNR          : ${t.pnr}`,
        `Booking ID   : ${t.bookingId}`,
        `Operator     : ${t.provider}`,
        `From         : ${t.from}`,
        `To           : ${t.to}`,
        `Journey Date : ${fmtDate(t.journeyDate)}`,
        `Departure    : ${t.departureTime}`,
        `Arrival      : ${t.arrivalTime}`,
        `Duration     : ${t.duration}`,
        `Passengers   : ${t.passengers?.length || 1}`,
        `Total Amount : ৳${t.totalAmount?.toLocaleString()}`,
        `Contact      : ${t.contactEmail}`,
        `Phone        : ${t.contactPhone}`,
        '═══════════════════════════════════════',
        'Please present this ticket at check-in',
        'Thank you for traveling with us!',
        '═══════════════════════════════════════',
      ].join('\n');

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${t.pnr}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download ticket: ' + err.message);
    }
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
        <button onClick={fetchBookings} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      {reviewModal && (
        <ReviewModal
          booking={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
      {receiptModal && (
        <ReceiptModal
          booking={receiptModal}
          onClose={() => setReceiptModal(null)}
        />
      )}
      {profileModal && (
        <HostProfileModal
          booking={profileModal}
          onClose={() => setProfileModal(null)}
        />
      )}
      {messageModal && (
        <MessageHostModal
          booking={messageModal}
          onClose={() => setMessageModal(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">My Bookings</h2>
            <p className="text-blue-100">Manage your experiences and travel tickets</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">{hostBookings.length + ticketBookings.length}</div>
            <div className="text-blue-100 text-sm">Total Bookings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-2">
        <button
          onClick={() => setActiveTab('hosts')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'hosts' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span>Host Experiences</span>
            {hostBookings.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{hostBookings.length}</span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'tickets' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            <span>Travel Tickets</span>
            {ticketBookings.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{ticketBookings.length}</span>
            )}
          </div>
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
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start exploring authentic local experiences with verified hosts across Bangladesh
              </p>
              <button
                onClick={() => goTo('/traveler/book-travel')}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all"
              >
                Discover Hosts
              </button>
            </div>
          ) : (
            hostBookings.map((booking) => {
              const status = getBookingStatus(booking.checkIn);
              const isCancelled = booking.status === 'cancelled';

              return (
                <div key={booking._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="md:flex">
                    <div className="md:w-72 h-56 md:h-auto relative overflow-hidden">
                      <img
                        src={booking.hostId?.propertyImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'}
                        alt={booking.hostId?.location || 'Location'}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-4 right-4 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg text-sm text-white ${
                        isCancelled ? 'bg-red-500/90' :
                        status === 'upcoming' ? 'bg-green-500/90' :
                        status === 'today' ? 'bg-blue-500/90' :
                        'bg-gray-800/90'
                      }`}>
                        {isCancelled ? 'Cancelled' : status === 'upcoming' ? 'Upcoming' : status === 'today' ? 'Today' : 'Completed'}
                      </div>
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <AvatarWithInitials 
                              image={booking.hostId?.image} 
                              name={booking.hostId?.name || 'Host'}
                              className="w-14 h-14"
                            />
                            <div>
                              <h3 className="text-xl mb-1">{booking.hostId?.name || 'Host'}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.hostId?.location || 'Location'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="text-xs text-gray-500">Check-in</div>
                                <div className="text-sm">{fmtDate(booking.checkIn)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="text-xs text-gray-500">Check-out</div>
                                <div className="text-sm">{fmtDate(booking.checkOut)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                            </div>
                            {booking.selectedServices?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {booking.selectedServices.map((service, idx) => (
                                  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Booking ID: {booking.bookingId}</div>
                        </div>

                        <div className="text-right ml-6">
                          <div className="text-3xl text-blue-600 mb-1">৳{booking.grandTotal?.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Total amount</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                        {!isCancelled && (status === 'upcoming' || status === 'today') ? (
                          <>
                            <button
                              onClick={() => setMessageModal(booking)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-sm"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Message Host</span>
                            </button>
                            <button 
                              onClick={() => setProfileModal(booking)}
                              className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="ml-auto px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200 transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setReviewModal(booking)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all shadow-sm"
                            >
                              <Star className="w-4 h-4" />
                              <span>Write Review</span>
                            </button>
                            <button
                              onClick={() => setReceiptModal(booking)}
                              className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                            >
                              View Receipt
                            </button>
                          </>
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

      {/* ── Travel Tickets ── */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {ticketBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 shadow-sm text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl mb-3">No Travel Tickets Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Book flights, trains, or buses for your next adventure across Bangladesh
              </p>
              <button
                onClick={() => goTo('/traveler/book-travel')}
                className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all"
              >
                Browse Tickets
              </button>
            </div>
          ) : (
            ticketBookings.map((booking) => {
              const status = getBookingStatus(booking.journeyDate);
              const isCancelled = booking.status === 'cancelled';

              return (
                <div key={booking._id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        booking.transportType === 'flight' ? 'bg-blue-100 text-blue-600' :
                        booking.transportType === 'train'  ? 'bg-green-100 text-green-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {getTransportIcon(booking.transportType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl capitalize">{booking.transportType} Ticket</h3>
                          <span className={`px-3 py-1 rounded-lg text-xs ${
                            isCancelled ? 'bg-red-100 text-red-700' :
                            status === 'upcoming' ? 'bg-green-100 text-green-700' :
                            status === 'today' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {isCancelled ? 'Cancelled' : status === 'upcoming' ? 'Upcoming' : status === 'today' ? 'Today' : 'Completed'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{booking.provider}</div>
                        <div className="text-xs text-gray-500 mt-1">PNR: {booking.pnr}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl text-blue-600 mb-1">৳{booking.totalAmount?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {booking.passengers?.length || 1} passenger{(booking.passengers?.length || 1) > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-5 border border-blue-100">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs text-gray-500 mb-2">Departure</div>
                        <div className="mb-2">{booking.from}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" /><span>{booking.departureTime}</span>
                        </div>
                      </div>
                      <div className="text-center flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-2">Travel Date</div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{fmtDate(booking.journeyDate)}</span>
                        </div>
                        <div className="text-xs text-gray-500">{booking.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-2">Arrival</div>
                        <div className="mb-2">{booking.to}</div>
                        <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" /><span>{booking.arrivalTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {!isCancelled && (status === 'upcoming' || status === 'today') ? (
                      <>
                        <button
                          onClick={() => viewETicket(booking)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-sm"
                        >
                          <Ticket className="w-4 h-4" />
                          <span>View E-Ticket</span>
                        </button>
                        <button
                          onClick={() => downloadPDF(booking)}
                          className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download PDF</span>
                        </button>
                        <button
                          onClick={() => cancelTicket(booking.bookingId)}
                          className="ml-auto px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200 transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => viewETicket(booking)}
                        className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        View Receipt
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Support */}
      {(hostBookings.length > 0 || ticketBookings.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-blue-900">Need Assistance?</h4>
              <p className="text-sm text-blue-800 leading-relaxed mb-4">
                Having issues with your booking or need to make changes? Our 24/7 support team is ready to help you.
              </p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-sm transition-all">
                  <Mail className="w-4 h-4" />
                  <span>Contact Support</span>
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}