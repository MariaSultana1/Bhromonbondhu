import { ArrowLeft, Calendar, User, DollarSign, MapPin, Phone, Mail, MessageSquare, FileText, Edit, X } from 'lucide-react';
import { useState } from 'react';

const allBookings = [
  {
    id: 1,
    traveler: 'Riya Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riya',
    email: 'riya.rahman@email.com',
    phone: '+880 1712-345678',
    checkIn: 'Dec 20, 2024',
    checkOut: 'Dec 23, 2024',
    guests: 2,
    amount: 7500,
    platformFee: 1125,
    netAmount: 6375,
    status: 'confirmed',
    services: ['Local Guide', 'Meals'],
    specialRequests: 'Vegetarian meals preferred',
    bookingDate: 'Dec 10, 2024'
  },
  {
    id: 2,
    traveler: 'Arif Hasan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arif',
    email: 'arif.hasan@email.com',
    phone: '+880 1798-765432',
    checkIn: 'Dec 25, 2024',
    checkOut: 'Dec 27, 2024',
    guests: 3,
    amount: 6000,
    platformFee: 900,
    netAmount: 5100,
    status: 'pending',
    services: ['Transportation', 'Meals'],
    specialRequests: 'Airport pickup needed',
    bookingDate: 'Dec 18, 2024'
  },
  {
    id: 3,
    traveler: 'Nusrat Jahan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
    email: 'nusrat.jahan@email.com',
    phone: '+880 1523-456789',
    checkIn: 'Jan 2, 2025',
    checkOut: 'Jan 5, 2025',
    guests: 4,
    amount: 8000,
    platformFee: 1200,
    netAmount: 6800,
    status: 'confirmed',
    services: ['Local Guide', 'Meals', 'Transportation'],
    specialRequests: 'None',
    bookingDate: 'Dec 28, 2024'
  }
];

export function AllBookings({ onBack }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReviewRequest, setShowReviewRequest] = useState(false);
  const [showModify, setShowModify] = useState(false);

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
        <p className="text-blue-100">Manage your guest bookings</p>
      </div>

      <div className="space-y-4">
        {allBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={booking.avatar}
                    alt={booking.traveler}
                    className="w-16 h-16 rounded-full border-2 border-blue-100"
                  />
                  <div>
                    <h3 className="text-xl mb-1">{booking.traveler}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{booking.checkIn} - {booking.checkOut}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{booking.guests} guests</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{booking.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{booking.phone}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-lg text-green-600">৳{booking.netAmount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Platform Fee (15%):</span>
                    <span>৳{booking.platformFee}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Services:</div>
                <div className="flex flex-wrap gap-2">
                  {booking.services.map((service, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  View Details
                </button>
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
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowReceipt(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  View Receipt
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                  <MessageSquare className="w-4 h-4" />
                  Message Guest
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
              </div>
            </div>
          </div>
        ))}
      </div>

      
      {selectedBooking && !showReceipt && !showReviewRequest && !showModify && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Booking Details</h3>
                <p className="text-blue-100 text-sm">ID: #{selectedBooking.id}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img src={selectedBooking.avatar} alt={selectedBooking.traveler} className="w-16 h-16 rounded-full" />
                <div>
                  <h4 className="text-xl mb-1">{selectedBooking.traveler}</h4>
                  <div className="text-sm text-gray-600">{selectedBooking.email}</div>
                  <div className="text-sm text-gray-600">{selectedBooking.phone}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Check-in</div>
                  <div className="text-lg">{selectedBooking.checkIn}</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Check-out</div>
                  <div className="text-lg">{selectedBooking.checkOut}</div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-2">Number of Guests</div>
                <div className="text-2xl text-green-600">{selectedBooking.guests} Guests</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-2">Services Booked</div>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.services.map((service, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white text-gray-700 rounded-lg border border-gray-200">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Special Requests</div>
                <div>{selectedBooking.specialRequests}</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <h4 className="mb-3">Payment Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Booking Amount:</span>
                    <span>৳{selectedBooking.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-red-600">
                    <span>Platform Fee (15%):</span>
                    <span>-৳{selectedBooking.platformFee}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t-2 border-purple-200 text-lg">
                    <span>You Receive:</span>
                    <span className="text-green-600">৳{selectedBooking.netAmount}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Booking Date: {selectedBooking.bookingDate}
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showReceipt && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Receipt</h3>
              <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="text-center mb-6">
                <h4 className="text-2xl mb-2">ভ্রমণবন্ধু</h4>
                <p className="text-sm text-gray-600">Travel Platform - Receipt</p>
              </div>
              
              <div className="border-2 border-gray-200 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Receipt #</div>
                    <div>RCP-{selectedBooking.id}001</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Date</div>
                    <div>{selectedBooking.bookingDate}</div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Guest Information</div>
                  <div>{selectedBooking.traveler}</div>
                  <div className="text-sm text-gray-600">{selectedBooking.email}</div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">Booking Details</div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Check-in:</span>
                    <span>{selectedBooking.checkIn}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Check-out:</span>
                    <span>{selectedBooking.checkOut}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Guests:</span>
                    <span>{selectedBooking.guests}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Services Total:</span>
                    <span>৳{selectedBooking.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600 mb-2">
                    <span>Platform Fee (15%):</span>
                    <span>-৳{selectedBooking.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-xl pt-2 border-t-2 border-gray-300">
                    <span>Net Amount:</span>
                    <span className="text-green-600">৳{selectedBooking.netAmount}</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showReviewRequest && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Request Review</h3>
              <button onClick={() => setShowReviewRequest(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Guest</div>
                <div className="text-lg">{selectedBooking.traveler}</div>
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-gray-700">Personal Message (Optional)</label>
                <textarea
                  placeholder="Hi! Hope you enjoyed your stay. Would love to hear your feedback..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                />
              </div>

              <button className="w-full py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 shadow-md">
                Send Review Request
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showModify && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Modify Booking</h3>
              <button onClick={() => setShowModify(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Check-in Date</label>
                <input
                  type="date"
                  defaultValue="2024-12-20"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Check-out Date</label>
                <input
                  type="date"
                  defaultValue="2024-12-23"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Number of Guests</label>
                <input
                  type="number"
                  defaultValue={selectedBooking.guests}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Modification Reason</label>
                <textarea
                  placeholder="Reason for modification..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                />
              </div>
              <button className="w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}