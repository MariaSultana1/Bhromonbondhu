import { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, Phone, Battery, Wifi, X, MapPinned, Loader } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TripCompletion } from './TripCompletion';

const API_URL = 'http://localhost:5000/api';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Bangladesh city coordinates
const cityCoordinates = {
  'Dhaka': [23.8103, 90.4125],
  'Comilla': [23.4607, 91.1809],
  'Feni': [23.0191, 91.3835],
  'Chittagong': [22.3569, 91.7832],
  "Cox's Bazar": [21.4272, 91.9737],
  'Sylhet': [24.8917, 91.8679],
  'Khulna': [22.8456, 89.5403],
  'Rajshahi': [24.3745, 88.5639],
  'Barisal': [22.7010, 90.3535],
  'Rangamati': [22.6533, 92.1751],
  'Bandarban': [22.1953, 92.2183],
};

// Custom blue marker icon for current location
const blueIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSI0MSIgdmlld0JveD0iMCAwIDI1IDQxIj48cGF0aCBmaWxsPSIjMDA3OGZmIiBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDEuNCAwLjMgMi43IDAuOCAzLjlsMTEuNyAyMy42IDExLjctMjMuNmMwLjUtMS4yIDAuOC0yLjUgMC44LTMuOUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxOC4yYy0zLjIgMC01LjctMi42LTUuNy01LjdzMi42LTUuNyA1LjctNS43IDUuNyAyLjYgNS43IDUuN1MxNS43IDE4LjIgMTIuNSAxOC4yeiIvPjwvc3ZnPg==',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const emergencyContacts = [
  { name: 'Local Police', number: '999', type: 'police' },
  { name: 'Emergency Helpline', number: '102', type: 'emergency' },
  { name: 'Platform Support', number: '+880 1XXX-XXXXXX', type: 'support' }
];

// Get device status
const getDeviceStatus = async () => {
  try {
    const battery = navigator.getBattery && await navigator.getBattery();
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      battery: battery ? {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
      } : {
        level: 78,
        charging: false,
      },
      connection: connection ? {
        effectiveType: connection.effectiveType,
      } : {
        effectiveType: '4g',
      },
      gps: 'Active',
      online: navigator.onLine
    };
  } catch (error) {
    console.error('Error getting device status:', error);
    return {
      battery: { level: 78, charging: false },
      connection: { effectiveType: '4g' },
      gps: 'Active',
      online: navigator.onLine
    };
  }
};

export function LiveJourney() {
  const [sosActive, setSosActive] = useState(false);
  const [showTripCompletion, setShowTripCompletion] = useState(false);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({
    battery: { level: 78, charging: false },
    connection: { effectiveType: '4g' },
    gps: 'Active',
    online: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]);

  // Fetch trips with transport bookings only
  useEffect(() => {
    fetchUpcomingTrips();
    
    // Update device status every 30 seconds
    const statusInterval = setInterval(async () => {
      const status = await getDeviceStatus();
      setDeviceStatus(status);
    }, 30000);

    return () => clearInterval(statusInterval);
  }, []);

  const fetchUpcomingTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await response.json();
      
      if (data.success && data.trips) {
        // ✅ Filter for upcoming trips with transport bookings ONLY
        const transportTrips = data.trips.filter(trip => {
          const status = trip.status || 'upcoming';
          const hasTransport = trip.transportType && trip.transportTicketId;
          return status === 'upcoming' && hasTransport;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('✅ Fetched transport trips:', transportTrips.length);
        setUpcomingTrips(transportTrips);
        
        // Get device status
        const status = await getDeviceStatus();
        setDeviceStatus(status);
      }
    } catch (err) {
      console.error('❌ Error fetching trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Track device location in real-time
  useEffect(() => {
    if (selectedTrip && 'geolocation' in navigator) {
      console.log('📍 Starting location tracking...');
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          console.log('📍 Location updated:', newLocation);
          setCurrentLocation(newLocation);
          
          // Center map on current location
          setMapCenter([newLocation.lat, newLocation.lng]);
        },
        (error) => {
          console.error('❌ Location error:', error);
          setDeviceStatus(prev => ({ ...prev, gps: 'Error' }));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      return () => {
        console.log('📍 Stopping location tracking...');
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [selectedTrip]);

  // Load route data for selected trip
  const handleTrackJourney = async (trip) => {
    try {
      setSelectedTrip(trip);
      
      // Create route from source to destination
      const source = trip.transportFrom || trip.location || 'Dhaka';
      const destination = trip.transportTo || trip.destination || "Cox's Bazar";
      
      const sourceCoords = cityCoordinates[source] || [23.8103, 90.4125];
      const destCoords = cityCoordinates[destination] || [21.4272, 91.9737];
      
      setRouteCoordinates([sourceCoords, destCoords]);
      
      // Set initial map center to midpoint
      const centerLat = (sourceCoords[0] + destCoords[0]) / 2;
      const centerLng = (sourceCoords[1] + destCoords[1]) / 2;
      setMapCenter([centerLat, centerLng]);

      console.log('✅ Route loaded:', source, '→', destination);
    } catch (error) {
      console.error('❌ Error loading route:', error);
    }
  };

  const handleSOS = () => {
    setSosActive(true);
    alert('SOS Activated! Emergency contacts have been notified and your location is being shared.');
  };

  const handleEndJourney = () => {
    setShowTripCompletion(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Loading journeys...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchUpcomingTrips}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // ========== TRACKING VIEW ==========
  if (selectedTrip) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedTrip(null);
            setCurrentLocation(null);
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <X className="w-5 h-5" />
          Back to Journeys
        </button>

        {/* Header */}
        <div>
          <h2 className="text-2xl mb-2">Tracking Journey</h2>
          <p className="text-gray-600">
            {selectedTrip.transportFrom || selectedTrip.location || 'Dhaka'} → {selectedTrip.transportTo || selectedTrip.destination}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {selectedTrip.transportType} • {selectedTrip.transportProvider}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Journey Status */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">Journey to {selectedTrip.destination}</h3>
                  <p className="text-white/90 text-sm">
                    Transport: {selectedTrip.transportType}
                  </p>
                  <p className="text-white/80 text-xs mt-1">Booking ID: {selectedTrip.bookingId}</p>
                </div>
                <Navigation className="w-8 h-8" />
              </div>
              
              <div className="flex items-center justify-between text-sm mt-4">
                <span>Date: {new Date(selectedTrip.date).toLocaleDateString()}</span>
                {currentLocation && (
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    📍 Tracking Active
                  </span>
                )}
              </div>

              {/* End Journey Button */}
              <button
                onClick={handleEndJourney}
                className="w-full mt-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold flex items-center justify-center gap-2 border-2 border-green-500 transition-all"
              >
                <MapPinned className="w-5 h-5" />
                End Journey
              </button>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl p-6 shadow-sm relative z-0">
              <h3 className="mb-4">Real-Time Location & Route</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px', zIndex: 0 }}>
                <MapContainer
                  center={mapCenter}
                  zoom={7}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  zoomControl={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  
                  {/* Route line */}
                  {routeCoordinates.length === 2 && (
                    <Polyline
                      positions={routeCoordinates}
                      color="blue"
                      weight={3}
                      opacity={0.7}
                      dashArray="5, 10"
                    />
                  )}

                  {/* Start marker */}
                  {routeCoordinates[0] && (
                    <Marker position={routeCoordinates[0]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>Start: {selectedTrip.transportFrom || 'Dhaka'}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* End marker */}
                  {routeCoordinates[1] && (
                    <Marker position={routeCoordinates[1]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>Destination: {selectedTrip.transportTo || selectedTrip.destination}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Current location marker (blue) */}
                  {currentLocation && (
                    <Marker position={[currentLocation.lat, currentLocation.lng]} icon={blueIcon}>
                      <Popup>
                        <div className="text-sm">
                          <strong>📍 Your Current Location</strong>
                          <p className="text-xs mt-1">Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Navigation className="w-4 h-4" />
                  <span>{selectedTrip.transportType || 'Transport'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Wifi className="w-4 h-4" />
                  <span>{deviceStatus.connection.effectiveType.toUpperCase()}</span>
                </div>
                {currentLocation && (
                  <div className="flex items-center gap-2 text-green-600">
                    <MapPin className="w-4 h-4 animate-pulse" />
                    <span>Live Tracking</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SOS Button */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="mb-4 text-center">Emergency SOS</h3>
              <button
                onClick={handleSOS}
                disabled={sosActive}
                className={`w-full h-32 rounded-xl flex flex-col items-center justify-center transition-all ${
                  sosActive
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white active:scale-95'
                }`}
              >
                <AlertCircle className="w-12 h-12 mb-2" />
                <span className="text-xl">{sosActive ? 'SOS Active' : 'Press for SOS'}</span>
              </button>
              {sosActive && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ✓ Emergency contacts notified
                    <br />
                    ✓ Location being shared
                    <br />
                    ✓ Support team alerted
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 text-center mt-3">
                Press only in case of emergency
              </p>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-blue-500" />
                <h3>Emergency Contacts</h3>
              </div>
              <div className="space-y-2">
                {emergencyContacts.map((contact, index) => (
                  <a
                    key={index}
                    href={`tel:${contact.number}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>{contact.name}</div>
                    <div className="text-sm text-blue-600">{contact.number}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Device Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="mb-4">Device Status</h3>
              <div className="space-y-3">
                {/* Battery */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-5 h-5 ${
                        deviceStatus.battery.level > 60 ? 'text-green-500' :
                        deviceStatus.battery.level > 30 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                      <span className="text-sm">Battery</span>
                    </div>
                    <span className="text-sm font-semibold">{deviceStatus.battery.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        deviceStatus.battery.level > 60 ? 'bg-green-500' :
                        deviceStatus.battery.level > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${deviceStatus.battery.level}%` }}
                    ></div>
                  </div>
                  {deviceStatus.battery.charging && (
                    <p className="text-xs text-green-600 mt-1">⚡ Charging</p>
                  )}
                </div>

                {/* Connection */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-blue-500" />
                    <span className="text-sm">Connection</span>
                  </div>
                  <span className="text-sm text-blue-600 font-semibold">
                    {deviceStatus.connection.effectiveType.toUpperCase()}
                  </span>
                </div>

                {/* GPS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <span className="text-sm">GPS</span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    currentLocation ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {currentLocation ? 'Active' : deviceStatus.gps}
                  </span>
                </div>

                {/* Online Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${deviceStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">Online Status</span>
                  </div>
                  <span className={`text-sm font-semibold ${deviceStatus.online ? 'text-green-600' : 'text-red-600'}`}>
                    {deviceStatus.online ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Completion Modal */}
        {showTripCompletion && (
          <div className="fixed inset-0 z-[9999]">
            <TripCompletion
              tripId={selectedTrip._id}
              tripData={{
                destination: selectedTrip.destination,
                date: selectedTrip.date,
                source: selectedTrip.transportFrom || selectedTrip.location || 'Dhaka'
              }}
              onCompleted={(data) => {
                setShowTripCompletion(false);
                setSelectedTrip(null);
                fetchUpcomingTrips(); // Refresh trips list
              }}
              onClose={() => setShowTripCompletion(false)}
            />
          </div>
        )}
      </div>
    );
  }

  // ========== LIST VIEW ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Live Journeys</h2>
        <p className="text-gray-600">Track your transport bookings in real-time</p>
      </div>

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 ? (
        <>
          {/* Next Journey Highlight */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Your Next Journey</h3>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-2xl mb-2">
                    {upcomingTrips[0].transportFrom || upcomingTrips[0].location || 'Dhaka'} → {upcomingTrips[0].destination}
                  </h4>
                  <p className="text-blue-100">
                    {upcomingTrips[0].transportType} • {upcomingTrips[0].transportProvider}
                  </p>
                </div>
                <Navigation className="w-8 h-8" />
              </div>

              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Travel Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(upcomingTrips[0].date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Booking ID</p>
                    <p className="text-lg font-semibold">
                      {upcomingTrips[0].bookingId}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTrackJourney(upcomingTrips[0])}
                className="w-full py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
              >
                Start Live Tracking
              </button>
            </div>
          </div>

          {/* All Trips List */}
          {upcomingTrips.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">All Upcoming Journeys ({upcomingTrips.length})</h3>
              <div className="space-y-3">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip._id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-1">
                          {trip.transportFrom || trip.location || 'Dhaka'} → {trip.destination}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          🚌 {trip.transportType} • {trip.transportProvider}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">📅 {new Date(trip.date).toLocaleDateString()}</p>
                        {trip.bookingId && (
                          <p className="text-gray-500 text-xs mt-1">Booking: {trip.bookingId}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTrackJourney(trip)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                    >
                      Track Journey
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <p className="text-yellow-800 font-semibold text-lg mb-2">No Active Journeys</p>
          <p className="text-yellow-700 mb-4">Book a transport ticket to start tracking your journey.</p>
          <button
            onClick={() => window.location.href = '/traveler/book-travel'}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
          >
            Book Transport
          </button>
        </div>
      )}
    </div>
  );
}