import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, ArrowLeft, Search, Cloud, Loader2, AlertCircle } from 'lucide-react';
import { TripDetails } from './TripDetails';

export function AllTrips({ onBack }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trips from backend API
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get token from localStorage (assuming you store it there after login)
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found. Please login.');
        }
        
        const response = await fetch('http://localhost:5000/api/trips', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch trips: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
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
    };

    fetchTrips();
  }, []);

  // Function to seed sample trips (for development)
  const seedSampleTrips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/trips/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTrips(data.trips || []);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to seed trips');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    const matchesSearch = trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.host?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (selectedTrip) {
    return <TripDetails trip={selectedTrip} onBack={() => setSelectedTrip(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-3xl mb-2">All Trips</h2>
        <p className="text-blue-100">Your complete travel history</p>
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
          <div className="flex gap-2">
            {['all', 'upcoming', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-3 rounded-xl transition-all ${
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
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading your trips...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <div className="flex flex-col items-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-red-500 font-semibold">Error loading trips</p>
            <p className="text-sm text-gray-600 mt-2 mb-6">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              {error.includes('Session expired') && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State - No trips found */}
      {!loading && !error && trips.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-2xl mb-2">No trips yet</h3>
          <p className="text-gray-600 mb-6">You haven't created any trips yet. Start planning your next adventure!</p>
          <button
            onClick={seedSampleTrips}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md"
          >
            Add Sample Trips
          </button>
        </div>
      )}

      {/* Trips Grid */}
      {!loading && !error && trips.length > 0 && (
        <>
          {/* Trip Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-blue-600">{trips.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-green-600">
                  {trips.filter(t => t.status === 'upcoming').length}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">
                  {trips.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {filteredTrips.length !== trips.length && (
            <p className="text-gray-600">
              Showing {filteredTrips.length} of {trips.length} trips
            </p>
          )}

          {/* Trips Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <div key={trip._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80';
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs backdrop-blur-md shadow-lg ${
                      trip.status === 'upcoming'
                        ? 'bg-green-500/90 text-white'
                        : trip.status === 'completed'
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white text-xl mb-1">{trip.destination}</h3>
                    <p className="text-white/90 text-sm">Booking: {trip.bookingId}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={trip.hostAvatar}
                      alt={trip.host}
                      className="w-10 h-10 rounded-full border-2 border-blue-100"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.host?.replace(/\s/g, '')}`;
                      }}
                    />
                    <div>
                      <div className="text-sm text-gray-500">Hosted by</div>
                      <div className="font-medium">{trip.host}</div>
                      <div className="flex items-center text-sm text-yellow-600">
                        <span>★</span>
                        <span className="ml-1">{trip.hostRating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{trip.date} - {trip.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Cloud className="w-4 h-4" />
                      <span>{trip.weather}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">${trip.totalAmount?.toLocaleString()}</span>
                      <span className="text-gray-500"> • {trip.guests} guest{trip.guests !== 1 ? 's' : ''} • {trip.nights} night{trip.nights !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trip.services?.slice(0, 3).map((service, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                        {service}
                      </span>
                    ))}
                    {trip.services?.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                        +{trip.services.length - 3} more
                      </span>
                    )}
                  </div>
                  <button
                    className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* No search results */}
          {filteredTrips.length === 0 && trips.length > 0 && (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl mb-2">No trips found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="mt-4 px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}