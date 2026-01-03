import { ArrowLeft, MapPin, Calendar, Cloud, User, Star, CheckCircle, MessageCircle, Edit, XCircle, Download, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

export function TripDetails({ trip, onBack }) {
  const [showModifyBooking, setShowModifyBooking] = useState(false);
  const [showCancelBooking, setShowCancelBooking] = useState(false);
  const [showContactHost, setShowContactHost] = useState(false);
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to All Trips</span>
        </button>
        <h2 className="text-3xl mb-2">{trip.destination}</h2>
        <p className="text-blue-100">Booking ID: {trip.bookingId}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="relative h-96">
          <img
            src={trip.image}
            alt={trip.destination}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-4 py-2 rounded-full backdrop-blur-md shadow-lg ${
              trip.status === 'upcoming'
                ? 'bg-green-500/90 text-white'
                : 'bg-gray-800/90 text-white'
            }`}>
              {trip.status === 'upcoming' ? '✓ Upcoming' : '✓ Completed'}
            </span>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MapPin className="w-5 h-5" />
              <span>{trip.location}</span>
            </div>
            <p className="text-gray-700">{trip.description}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Check-in</div>
              <div className="mb-1">{trip.date}</div>
              <div className="text-sm text-gray-500">{trip.checkIn}</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Check-out</div>
              <div className="mb-1">{trip.endDate}</div>
              <div className="text-sm text-gray-500">{trip.checkOut}</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Duration</div>
              <div className="mb-1">{trip.nights} nights</div>
              <div className="text-sm text-gray-500">{trip.guests} guest(s)</div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Weather</div>
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <span>{trip.weather}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-2 border-gray-200 rounded-xl mb-6">
            <h3 className="mb-4">Host Information</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={trip.hostAvatar}
                  alt={trip.host}
                  className="w-16 h-16 rounded-full border-2 border-blue-100"
                />
                <div>
                  <div className="mb-1">{trip.host}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{trip.hostRating} rating</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>+880 1712-345678</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>host@example.com</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowContactHost(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Message Host
              </button>
            </div>
          </div>


          <div className="mb-6">
            <h3 className="mb-4">Services Included</h3>
            <div className="flex flex-wrap gap-3">
              {trip.services.map((service, idx) => (
                <span key={idx} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {service}
                </span>
              ))}
            </div>
          </div>

    
          <div className="p-6 bg-gray-50 rounded-xl mb-6">
            <h3 className="mb-4">Price Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price ({trip.nights} nights × ৳{Math.floor(trip.totalAmount / trip.nights)})</span>
                <span>৳{Math.floor(trip.totalAmount * 0.7)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Services</span>
                <span>৳{Math.floor(trip.totalAmount * 0.2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (15%)</span>
                <span>৳{Math.floor(trip.totalAmount * 0.1)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                <span>Total Amount</span>
                <span className="text-2xl text-blue-600">৳{trip.totalAmount}</span>
              </div>
            </div>
          </div>

        
          <div className="flex flex-wrap gap-3">
            {trip.status === 'upcoming' && (
              <>
                <button
                  onClick={() => setShowModifyBooking(true)}
                  className="flex-1 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2 shadow-md"
                >
                  <Edit className="w-5 h-5" />
                  Modify Booking
                </button>
                <button
                  onClick={() => setShowCancelBooking(true)}
                  className="flex-1 px-6 py-4 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Trip
                </button>
              </>
            )}
            {trip.status === 'completed' && (
              <>
                <button
                  onClick={() => setShowReview(true)}
                  className="flex-1 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center justify-center gap-2 shadow-md"
                >
                  <Star className="w-5 h-5" />
                  Write Review
                </button>
                <button className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Receipt
                </button>
              </>
            )}
          </div>
        </div>
      </div>

     
      {showModifyBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
              <h3 className="text-2xl mb-1">Modify Booking</h3>
              <p className="text-blue-100 text-sm">Booking ID: {trip.bookingId}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
                ⚠️ Changes may require host approval and could affect pricing
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Check-in Date</label>
                <input
                  type="date"
                  defaultValue="2024-12-20"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Check-out Date</label>
                <input
                  type="date"
                  defaultValue="2024-12-23"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Number of Guests</label>
                <select
                  defaultValue={trip.guests}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Reason for Modification</label>
                <textarea
                  placeholder="Optional: Let the host know why you're making changes..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModifyBooking(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md">
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

     
      {showCancelBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6">
              <h3 className="text-2xl mb-1">Cancel Trip</h3>
              <p className="text-red-100 text-sm">Booking ID: {trip.bookingId}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="mb-2 text-red-900">⚠️ Cancellation Policy</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Cancel 7+ days before: 100% refund</li>
                  <li>• Cancel 3-7 days before: 50% refund</li>
                  <li>• Cancel less than 3 days: No refund</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm mb-2 text-gray-600">Expected Refund</div>
                <div className="text-3xl text-green-600">৳{trip.totalAmount}</div>
                <div className="text-xs text-gray-500 mt-1">Processed within 5-7 business days</div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Reason for Cancellation</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-3">
                  <option>Change of plans</option>
                  <option>Emergency</option>
                  <option>Found better option</option>
                  <option>Weather concerns</option>
                  <option>Other</option>
                </select>
                <textarea
                  placeholder="Additional details (optional)..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelBooking(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Keep My Booking
                </button>
                <button className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md">
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

   
      {showContactHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
              <h3 className="text-2xl mb-1">Contact Host</h3>
              <p className="text-green-100 text-sm">{trip.host}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={trip.hostAvatar}
                  alt={trip.host}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <div className="mb-1">{trip.host}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{trip.hostRating} rating</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Subject</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>General Question</option>
                  <option>Booking Inquiry</option>
                  <option>Service Request</option>
                  <option>Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Message</label>
                <textarea
                  placeholder="Hi! I have some questions about..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={5}
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                💡 Tip: Be clear and specific in your questions for faster responses
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowContactHost(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white p-6">
              <h3 className="text-2xl mb-1">Write a Review</h3>
              <p className="text-yellow-100 text-sm">{trip.destination} • {trip.host}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="p-2 hover:bg-yellow-50 rounded-lg transition-colors">
                      <Star className="w-8 h-8 text-yellow-400 hover:fill-yellow-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Review Title</label>
                <input
                  type="text"
                  placeholder="Summarize your experience..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Your Review</label>
                <textarea
                  placeholder="Share details about your trip..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Cleanliness</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    <option>⭐⭐⭐⭐⭐ 5</option>
                    <option>⭐⭐⭐⭐ 4</option>
                    <option>⭐⭐⭐ 3</option>
                    <option>⭐⭐ 2</option>
                    <option>⭐ 1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Communication</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    <option>⭐⭐⭐⭐⭐ 5</option>
                    <option>⭐⭐⭐⭐ 4</option>
                    <option>⭐⭐⭐ 3</option>
                    <option>⭐⭐ 2</option>
                    <option>⭐ 1</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReview(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex-1 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 shadow-md">
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}