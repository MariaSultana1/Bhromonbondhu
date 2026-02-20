import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, ArrowLeft, Search, Cloud, Loader2, AlertCircle, Plus, CheckCircle } from 'lucide-react';
import { TripDetails } from './TripDetails';

// Weather API service
const weatherService = {
  getWeatherForDestination: async (destination, date) => {
    try {
      // Using Open-Meteo API (free, no key required)
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
      );
      const geoData = await response.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        return 'Clear'; // Default weather
      }

      const { latitude, longitude, name } = geoData.results[0];
      
      // Get weather forecast
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
      );
      const weatherData = await weatherResponse.json();
      
      // Map weather codes to descriptions
      const weatherCodes = {
        0: 'Clear',
        1: 'Mostly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Drizzle',
        55: 'Heavy Drizzle',
        61: 'Light Rain',
        63: 'Rain',
        65: 'Heavy Rain',
        71: 'Light Snow',
        73: 'Snow',
        75: 'Heavy Snow',
        80: 'Light Showers',
        81: 'Showers',
        82: 'Heavy Showers',
        85: 'Light Snow Showers',
        86: 'Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Thunderstorm with Hail'
      };

      const code = weatherData.daily.weather_code[0];
      const maxTemp = weatherData.daily.temperature_2m_max[0];
      const minTemp = weatherData.daily.temperature_2m_min[0];
      
      return `${weatherCodes[code] || 'Clear'} (${minTemp}°-${maxTemp}°C)`;
    } catch (error) {
      console.error('Weather API error:', error);
      return 'Check forecast';
    }
  }
};

export function AllTrips({ onBack }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [consolidatedTrips, setConsolidatedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherCache, setWeatherCache] = useState({});

  // ✅ Consolidate trips: combine ticket + host into single trip
  const consolidateTrips = useCallback((rawTrips) => {
    const tripMap = new Map();

    rawTrips.forEach(trip => {
      // Create a unique key based on destination + date range
      const key = `${trip.destination}_${trip.date}_${trip.endDate}`;
      
      if (!tripMap.has(key)) {
        tripMap.set(key, {
          _id: trip._id,
          destination: trip.destination,
          location: trip.location,
          date: trip.date,
          endDate: trip.endDate,
          image: trip.image,
          totalAmount: trip.totalAmount || 0,
          guests: trip.guests,
          nights: trip.nights,
          services: trip.services || [],
          bookingId: trip.bookingId,
          status: trip.status,
          weather: trip.weather,
          // Booking tracking
          hostBooked: trip.host && trip.host !== 'pending' ? true : false,
          hostName: trip.host && trip.host !== 'pending' ? trip.host : null,
          hostInfo: trip.hostInfo || null,
          ticketBooked: trip.transportProvider ? true : false,
          ticketInfo: {
            type: trip.transportType,
            provider: trip.transportProvider,
            from: trip.transportFrom,
            to: trip.transportTo,
            bookingId: trip.ticketBookingId
          },
          // Completion tracking
          completionDate: trip.completionDate || null
        });
      } else {
        // Merge booking info if this is a duplicate
        const existing = tripMap.get(key);
        if (trip.host && trip.host !== 'pending') {
          existing.hostBooked = true;
          existing.hostName = trip.host;
        }
        if (trip.transportProvider) {
          existing.ticketBooked = true;
          existing.ticketInfo = {
            type: trip.transportType,
            provider: trip.transportProvider,
            from: trip.transportFrom,
            to: trip.transportTo
          };
        }
      }
    });

    return Array.from(tripMap.values());
  }, []);

  // ✅ FIX: Use useCallback to prevent unnecessary re-renders
  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trips: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const rawTrips = data.trips || [];
        const consolidated = consolidateTrips(rawTrips);
        
        // Fetch weather for all trips
        const weatherPromises = consolidated.map(trip =>
          weatherService.getWeatherForDestination(trip.destination, trip.date)
            .then(weather => {
              trip.weather = weather;
              return trip;
            })
        );

        const tripsWithWeather = await Promise.all(weatherPromises);
        setTrips(tripsWithWeather);
        setConsolidatedTrips(tripsWithWeather);
        console.log('✅ Trips fetched and consolidated:', tripsWithWeather.length, 'trips');
      } else {
        throw new Error(data.message || 'Failed to fetch trips');
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [consolidateTrips]);

  // ✅ FIX: Fetch trips only once on mount
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleRefresh = () => {
    fetchTrips();
  };

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

  // Mark trip as completed
  const markTripAsCompleted = async (tripId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/trips/${tripId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completionDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setTrips(prevTrips => prevTrips.map(trip =>
          trip._id === tripId ? { ...trip, status: 'completed', completionDate: new Date() } : trip
        ));
        setSelectedTrip(null);
      }
    } catch (err) {
      console.error('Error completing trip:', err);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    const matchesSearch = trip.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.hostName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (selectedTrip) {
    return <TripDetails trip={selectedTrip} onBack={() => setSelectedTrip(null)} onMarkComplete={() => markTripAsCompleted(selectedTrip._id)} />;
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
                onClick={handleRefresh}
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
                    <span className={`px-3 py-1.5 rounded-full text-xs backdrop-blur-md shadow-lg flex items-center gap-1 ${
                      trip.status === 'upcoming'
                        ? 'bg-green-500/90 text-white'
                        : trip.status === 'completed'
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {trip.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white text-xl mb-1">{trip.destination}</h3>
                    <p className="text-white/90 text-sm">Booking: {trip.bookingId}</p>
                  </div>
                </div>
                <div className="p-6">
                  {/* Booking Status Cards */}
                  <div className="space-y-2 mb-4">
                    <div className={`rounded-lg p-3 flex items-center gap-2 ${
                      trip.hostBooked 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'bg-yellow-50 border-2 border-yellow-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${trip.hostBooked ? 'bg-green-600' : 'bg-yellow-600'}`} />
                      <span className={`text-sm font-medium ${trip.hostBooked ? 'text-green-800' : 'text-yellow-800'}`}>
                        {trip.hostBooked ? `Host: ${trip.hostName}` : 'Host: Not Booked'}
                      </span>
                    </div>
                    <div className={`rounded-lg p-3 flex items-center gap-2 ${
                      trip.ticketBooked 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'bg-yellow-50 border-2 border-yellow-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${trip.ticketBooked ? 'bg-green-600' : 'bg-yellow-600'}`} />
                      <span className={`text-sm font-medium ${trip.ticketBooked ? 'text-green-800' : 'text-yellow-800'}`}>
                        {trip.ticketBooked ? `Ticket: ${trip.ticketInfo.provider}` : 'Ticket: Not Booked'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{trip.date} - {trip.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.ticketInfo.from || 'N/A'} → {trip.ticketInfo.to || trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Cloud className="w-4 h-4" />
                      <span>{trip.weather}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">৳{trip.totalAmount?.toLocaleString()}</span>
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

                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="flex-1 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all text-sm"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      View Details
                    </button>
                    {!trip.hostBooked && trip.status === 'upcoming' && (
                      <button
                        className="py-2 px-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all text-sm flex items-center gap-1"
                        onClick={() => window.location.href = `/traveler/book-travel?dest=${trip.destination}`}
                      >
                        <Plus className="w-4 h-4" />
                        Host
                      </button>
                    )}
                    {!trip.ticketBooked && trip.status === 'upcoming' && (
                      <button
                        className="py-2 px-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all text-sm flex items-center gap-1"
                        onClick={() => window.location.href = `/traveler/book-tickets?dest=${trip.destination}`}
                      >
                        <Plus className="w-4 h-4" />
                        Ticket
                      </button>
                    )}
                  </div>
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
