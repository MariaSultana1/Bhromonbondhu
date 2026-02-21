// AllTrips.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, ArrowLeft, Search, Loader2, AlertCircle, Home, Ticket, Star, Users, Clock, Eye } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// ─── Trip Details Modal ───────────────────────────────────────────────────────
function TripDetailsModal({ trip, onClose }) {
  if (!trip) return null;

  const nights = trip.nights || 0;
  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">{trip.destination}</h2>
            <p className="text-blue-100 text-sm mt-1">Booking ID: {trip.bookingId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            ✕
          </button>
        </div>

        {/* Image */}
        <div className="relative w-full h-80 overflow-hidden">
          <img
            src={trip.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80'}
            alt={trip.destination}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80';
            }}
          />
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Trip Dates */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Trip Dates</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Check-in</div>
                <div className="text-lg font-semibold text-gray-800">{fmtDate(trip.date)}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Check-out</div>
                <div className="text-lg font-semibold text-gray-800">{fmtDate(trip.endDate)}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <Calendar className="w-4 h-4 inline mr-2" />
              {nights} night{nights !== 1 ? 's' : ''} • {trip.guests || 1} guest{(trip.guests || 1) > 1 ? 's' : ''}
            </div>
          </div>

          {/* Transport Info */}
          {trip.ticketBooked && trip.ticketInfo && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Ticket className="w-6 h-6 text-purple-600" />
                Transportation
              </h3>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-gray-800 capitalize">{trip.ticketInfo.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider</span>
                  <span className="font-semibold text-gray-800">{trip.ticketInfo.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-semibold text-gray-800">{trip.ticketInfo.from} → {trip.ticketInfo.to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold text-gray-800">{fmtDate(trip.ticketInfo.journeyDate)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-purple-200">
                  <span className="text-gray-600 font-medium">Booking ID</span>
                  <span className="font-bold text-purple-600">{trip.ticketInfo.bookingId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Host Info */}
          {trip.hostBooked && trip.hostInfo && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Home className="w-6 h-6 text-green-600" />
                Host Experience
              </h3>
              <div className="bg-green-50 rounded-xl p-6 border border-green-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {trip.hostName ? trip.hostName.charAt(0).toUpperCase() : 'H'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{trip.hostName || trip.hostInfo.name}</h4>
                    <p className="text-sm text-gray-600">{trip.hostInfo.location}</p>
                    {trip.hostInfo.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{trip.hostInfo.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-green-200">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Check-in</div>
                    <div className="font-semibold text-gray-800">{trip.hostInfo.checkIn || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Check-out</div>
                    <div className="font-semibold text-gray-800">{trip.hostInfo.checkOut || 'N/A'}</div>
                  </div>
                </div>

                {trip.hostInfo.services && trip.hostInfo.services.length > 0 && (
                  <div className="pt-3 border-t border-green-200">
                    <div className="text-xs text-gray-600 mb-2">Services</div>
                    <div className="flex flex-wrap gap-2">
                      {trip.hostInfo.services.map((service, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white text-green-700 rounded-lg text-xs font-medium border border-green-200">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Payment Summary</h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">৳{(trip.totalAmount || 0).toLocaleString()}</span>
              </div>
              {trip.platformFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (15%)</span>
                  <span>+ ৳{(trip.platformFee || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-blue-200 font-bold text-lg">
                <span>Total</span>
                <span className="text-blue-600">৳{(trip.grandTotal || trip.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-blue-200">
                <div className="text-sm">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold ${
                    trip.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    trip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    trip.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trip.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AllTrips({ onBack }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`${API_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch trips: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Trips fetched:', data.trips);
        setTrips(data.trips || []);
      } else {
        throw new Error(data.message || 'Failed to fetch trips');
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const fmtDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredTrips = trips.filter(trip => {
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    const matchesSearch = (trip.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trip.hostName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trip.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Trip Details Modal */}
      {selectedTrip && (
        <TripDetailsModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-3xl mb-2 font-bold">My Trips</h2>
        <p className="text-blue-100">All your adventures in one place</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by destination, host, or location..."
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  filterStatus === status
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === 'all' 
                  ? trips.length 
                  : trips.filter(t => t.status === status).length
                })
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button
            onClick={fetchTrips}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Trips Grid */}
      {!loading && !error && (
        <>
          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-800">No trips found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Start planning your next adventure!'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <div key={trip._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80'}
                      alt={trip.destination}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg text-white ${
                        trip.status === 'confirmed'
                          ? 'bg-green-500/90'
                          : trip.status === 'completed'
                          ? 'bg-blue-500/90'
                          : trip.status === 'pending'
                          ? 'bg-yellow-500/90'
                          : 'bg-red-500/90'
                      }`}>
                        {trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-1 text-gray-800">{trip.destination}</h3>
                    <p className="text-sm text-gray-500 mb-3">ID: {trip.bookingId}</p>

                    {/* Status Indicators */}
                    <div className="space-y-2 mb-4">
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${
                        trip.hostBooked ? 'bg-green-50' : 'bg-yellow-50'
                      }`}>
                        <Home className={`w-4 h-4 ${trip.hostBooked ? 'text-green-600' : 'text-yellow-600'}`} />
                        <span className={`text-sm font-medium ${trip.hostBooked ? 'text-green-700' : 'text-yellow-700'}`}>
                          {trip.hostBooked ? `Host: ${trip.hostName || 'Booked'}` : 'Host not booked'}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${
                        trip.ticketBooked ? 'bg-green-50' : 'bg-yellow-50'
                      }`}>
                        <Ticket className={`w-4 h-4 ${trip.ticketBooked ? 'text-green-600' : 'text-yellow-600'}`} />
                        <span className={`text-sm font-medium ${trip.ticketBooked ? 'text-green-700' : 'text-yellow-700'}`}>
                          {trip.ticketBooked ? `Ticket: ${trip.ticketInfo?.provider || 'Booked'}` : 'Ticket not booked'}
                        </span>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{fmtDate(trip.date)} - {fmtDate(trip.endDate)}</span>
                      </div>
                      {trip.ticketInfo && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{trip.ticketInfo.from} → {trip.ticketInfo.to}</span>
                        </div>
                      )}
                      {trip.hostInfo && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{trip.hostInfo.nights} nights • {trip.guests || 1} guest{(trip.guests || 1) > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="font-bold text-blue-600">
                        ৳{(trip.grandTotal || trip.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className="w-full py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}