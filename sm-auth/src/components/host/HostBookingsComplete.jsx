import { Calendar, User, MessageSquare, Check, X, Clock, ArrowLeft, Star, MapPin, DollarSign, Phone, Mail, Edit2, Download } from 'lucide-react';
import { useState } from 'react';

const bookings = [
  {
    id: 1,
    traveler: 'Riya Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riya',
    dates: 'Dec 20-23, 2024',
    guests: 2,
    amount: 7500,
    status: 'confirmed',
    services: ['Local Guide', 'Meals', 'Transportation'],
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    bookingId: 'BK2024001',
    nights: 3,
    phone: '+880 1712-345678',
    email: 'riya@example.com',
    specialRequests: 'Vegetarian meals preferred',
    destination: 'Cox\'s Bazar Beach House',
    paymentStatus: 'paid'
  },
  {
    id: 2,
    traveler: 'Arif Hasan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arif',
    dates: 'Dec 25-27, 2024',
    guests: 1,
    amount: 6000,
    status: 'pending',
    services: ['Local Guide', 'Photography'],
    checkIn: '3:00 PM',
    checkOut: '10:00 AM',
    bookingId: 'BK2024002',
    nights: 2,
    phone: '+880 1812-345678',
    email: 'arif@example.com',
    specialRequests: 'Need early check-in if possible',
    destination: 'Sylhet Tea Garden Tour',
    paymentStatus: 'pending'
  },
  {
    id: 3,
    traveler: 'Nusrat Jahan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
    dates: 'Jan 2-5, 2025',
    guests: 3,
    amount: 8000,
    status: 'confirmed',
    services: ['Local Guide', 'Meals', 'Trekking'],
    checkIn: '1:00 PM',
    checkOut: '12:00 PM',
    bookingId: 'BK2024003',
    nights: 3,
    phone: '+880 1912-345678',
    email: 'nusrat@example.com',
    specialRequests: 'One child-friendly meal required',
    destination: 'Bandarban Hill Trek',
    paymentStatus: 'paid'
  },
  {
    id: 4,
    traveler: 'Mehedi Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi',
    dates: 'Nov 15-18, 2024',
    guests: 2,
    amount: 6000,
    status: 'completed',
    services: ['Local Guide', 'City Tour'],
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    bookingId: 'BK2024004',
    nights: 3,
    phone: '+880 1612-345678',
    email: 'mehedi@example.com',
    specialRequests: 'None',
    destination: 'Dhaka Heritage Tour',
    paymentStatus: 'paid'
  }
];

export function HostBookingsComplete() {
  const [filterType, setFilterType] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const [showModify, setShowModify] = useState(false);
  const [showMessageGuest, setShowMessageGuest] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showRequestReview, setShowRequestReview] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    if (filterType === 'all') return true;
    return booking.status === filterType;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Bookings Management</h2>
        <p className="text-gray-600">Manage your guest bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setFilterType('all')}
          className={`pb-3 px-4 border-b-2 whitespace-nowrap ${
            filterType === 'all'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setFilterType('pending')}
          className={`pb-3 px-4 border-b-2 whitespace-nowrap ${
            filterType === 'pending'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilterType('confirmed')}
          className={`pb-3 px-4 border-b-2 whitespace-nowrap ${
            filterType === 'confirmed'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Confirmed ({confirmedCount})
        </button>
        <button
          onClick={() => setFilterType('completed')}
          className={`pb-3 px-4 border-b-2 whitespace-nowrap ${
            filterType === 'completed'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={booking.avatar}
                  alt={booking.traveler}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="mb-1">{booking.traveler}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {booking.dates}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {booking.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm mb-2 ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <div className="text-2xl">৳{booking.amount}</div>
                <div className="text-xs text-gray-500">Total amount</div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid md:grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Check-in</p>
                <p>{booking.dates.split('-')[0]} at {booking.checkIn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Check-out</p>
                <p>{booking.dates.split('-')[1]?.trim() || ''} at {booking.checkOut}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {booking.status === 'pending' ? (
                <>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowAcceptModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDeclineModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowViewDetails(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </>
              ) : booking.status === 'confirmed' ? (
                <>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowMessageGuest(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Guest
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowViewDetails(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowModify(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Modify
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowReceipt(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View Receipt
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowRequestReview(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Request Review
                  </button>
                </>
              )}
            </div>

            {booking.status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="mb-1">Respond within 24 hours to maintain your acceptance rate</p>
                  <p className="text-xs">Payment is held in escrow until check-in</p>
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
              {/* Guest Information */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="mb-3">Guest Information</h4>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedBooking.avatar}
                    alt={selectedBooking.traveler}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <div className="mb-1">{selectedBooking.traveler}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedBooking.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedBooking.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div>
                <h4 className="mb-3">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Destination</div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedBooking.destination}
                    </div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Dates</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedBooking.dates}
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

              {/* Services */}
              <div>
                <h4 className="mb-3">Services Requested</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.services.map((service, idx) => (
                    <span key={idx} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div>
                  <h4 className="mb-3">Special Requests</h4>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    {selectedBooking.specialRequests}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Amount</span>
                    <span>৳{Math.floor(selectedBooking.amount * 0.8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (15%)</span>
                    <span>৳{Math.floor(selectedBooking.amount * 0.15)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span>Your Earnings</span>
                    <span className="text-xl text-green-600">৳{selectedBooking.amount}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Payment Status: <span className="text-green-600 font-medium">{selectedBooking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowViewDetails(false)}
                className="w-full py-3 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Booking Modal */}
      {showAcceptModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
              <h3 className="text-2xl">Accept Booking</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800">
                  ✓ You're about to accept booking from <strong>{selectedBooking.traveler}</strong>
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Dates</span>
                  <span>{selectedBooking.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span>{selectedBooking.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Earnings</span>
                  <span className="text-green-600">৳{selectedBooking.amount}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Welcome Message (Optional)</label>
                <textarea
                  placeholder="Welcome! Looking forward to hosting you..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600">
                  Confirm Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Booking Modal */}
      {showDeclineModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
              <h3 className="text-2xl">Decline Booking</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800">
                  ⚠️ This will decline the booking request from <strong>{selectedBooking.traveler}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Reason for Declining</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-3">
                  <option>Dates not available</option>
                  <option>Unable to provide requested services</option>
                  <option>Personal reasons</option>
                  <option>Other</option>
                </select>
                <textarea
                  placeholder="Additional message to guest (optional)..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                ⚠️ Declining too many bookings may affect your host rating
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600">
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify Booking Modal */}
      {showModify && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
              <h3 className="text-2xl">Modify Booking</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                💡 Changes will require guest approval
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Services</label>
                <div className="space-y-2">
                  {['Local Guide', 'Meals', 'Transportation', 'Photography', 'Trekking'].map((service) => (
                    <label key={service} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={selectedBooking.services.includes(service)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Notes to Guest</label>
                <textarea
                  placeholder="Let the guest know about the changes..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModify(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                  Send Modification Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Guest Modal */}
      {showMessageGuest && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
              <h3 className="text-2xl">Message Guest</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={selectedBooking.avatar}
                  alt={selectedBooking.traveler}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div>{selectedBooking.traveler}</div>
                  <div className="text-sm text-gray-600">{selectedBooking.email}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Subject</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Check-in Instructions</option>
                  <option>Service Details</option>
                  <option>Schedule Change</option>
                  <option>General Message</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Message</label>
                <textarea
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={5}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageGuest(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Modal */}
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
                  <span>{selectedBooking.traveler}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dates</span>
                  <span>{selectedBooking.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights</span>
                  <span>{selectedBooking.nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests</span>
                  <span>{selectedBooking.guests}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <h5 className="mb-2">Services Provided</h5>
                <div className="space-y-1 text-sm">
                  {selectedBooking.services.map((service, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">• {service}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>৳{Math.floor(selectedBooking.amount * 1.15)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (15%)</span>
                  <span className="text-red-600">-৳{Math.floor(selectedBooking.amount * 0.15)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span>Your Earnings</span>
                  <span className="text-xl text-green-600">৳{selectedBooking.amount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download PDF
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
                  src={selectedBooking.avatar}
                  alt={selectedBooking.traveler}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div>{selectedBooking.traveler}</div>
                  <div className="text-sm text-gray-600">Stayed: {selectedBooking.dates}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Personal Message</label>
                <textarea
                  placeholder="Hi! I hope you enjoyed your stay. It would mean a lot if you could leave a review..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={4}
                  defaultValue="Hi! I hope you enjoyed your stay. It would mean a lot if you could leave a review of your experience."
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                💡 Reviews help build trust and attract more guests
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRequestReview(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600">
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