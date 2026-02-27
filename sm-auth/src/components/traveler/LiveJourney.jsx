import { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle, Phone, Battery, Wifi, Signal, X, MapPinned, Loader } from 'lucide-react';
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

// ==================== DEVICE STATUS UTILITIES ====================

/**
 * Get device status including battery, connection, GPS, and online status
 */
const getDeviceStatus = async () => {
  try {
    // Battery API
    let battery = {
      level: 78,
      charging: false,
    };

    try {
      if (navigator.getBattery) {
        const batteryManager = await navigator.getBattery();
        battery = {
          level: Math.round(batteryManager.level * 100),
          charging: batteryManager.charging,
        };
      } else if (navigator.battery) {
        // Older API
        const batteryManager = navigator.battery;
        battery = {
          level: Math.round(batteryManager.level * 100),
          charging: batteryManager.charging,
        };
      }
    } catch (e) {
      console.log('Battery API not available, using default');
    }

    // Network connection
    let connection = {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
    };

    try {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        connection = {
          effectiveType: conn.effectiveType || '4g',
          downlink: conn.downlink || 10,
          rtt: conn.rtt || 50,
        };
      }
    } catch (e) {
      console.log('Network API not available, using default');
    }

    // GPS status
    let gps = 'Idle';
    let accuracy = null;

    // Online status
    const online = navigator.onLine;

    return {
      battery,
      connection,
      gps,
      accuracy,
      online,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error getting device status:', error);
    return {
      battery: { level: 78, charging: false },
      connection: { effectiveType: '4g', downlink: 10, rtt: 50 },
      gps: 'Error',
      accuracy: null,
      online: navigator.onLine,
      timestamp: new Date(),
    };
  }
};

/**
 * Get signal strength based on connection type
 */
const getSignalStrength = (connection) => {
  const effectiveType = connection?.effectiveType || '4g';
  const levels = {
    '4g': 4,
    '3g': 3,
    '2g': 2,
    'slow-2g': 1,
  };
  return levels[effectiveType] || 4;
};

/**
 * Get connection quality label
 */
const getConnectionLabel = (effectiveType) => {
  const labels = {
    '4g': 'Excellent',
    '3g': 'Good',
    '2g': 'Poor',
    'slow-2g': 'Very Poor',
  };
  return labels[effectiveType] || 'Unknown';
};

/**
 * Get battery status color
 */
const getBatteryColor = (level) => {
  if (level >= 75) return 'text-green-500';
  if (level >= 50) return 'text-blue-500';
  if (level >= 25) return 'text-yellow-500';
  return 'text-red-500';
};

/**
 * Get battery status label
 */
const getBatteryLabel = (level) => {
  if (level >= 75) return 'Excellent';
  if (level >= 50) return 'Good';
  if (level >= 25) return 'Low';
  return 'Critical';
};

// ==================== DEVICE STATUS WIDGET ====================

/**
 * Device Status Widget Component
 */
function DeviceStatusWidget({ deviceStatus }) {
  const signalStrength = getSignalStrength(deviceStatus.connection);
  const connectionLabel = getConnectionLabel(deviceStatus.connection?.effectiveType);
  const batteryColor = getBatteryColor(deviceStatus.battery?.level);
  const batteryLabel = getBatteryLabel(deviceStatus.battery?.level);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Signal className="w-5 h-5 text-blue-500" />
        Device Status
      </h3>

      {/* Battery Status */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Battery className={`w-5 h-5 ${batteryColor}`} />
            <span className="text-sm text-gray-600">Battery</span>
          </div>
          <span className={`text-sm font-semibold ${batteryColor}`}>
            {deviceStatus.battery?.level}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              deviceStatus.battery?.level >= 75
                ? 'bg-green-500'
                : deviceStatus.battery?.level >= 50
                ? 'bg-blue-500'
                : deviceStatus.battery?.level >= 25
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${deviceStatus.battery?.level}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{batteryLabel}</span>
          <span className="text-xs text-gray-500">
            {deviceStatus.battery?.charging ? '🔌 Charging' : '🔋 On Battery'}
          </span>
        </div>
      </div>

      {/* Network Connection */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">Network</span>
          </div>
          <span className="text-sm font-semibold text-blue-600">
            {deviceStatus.connection?.effectiveType?.toUpperCase()}
          </span>
        </div>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`flex-1 h-2 rounded ${
                bar <= signalStrength ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">{connectionLabel}</span>
          <span className="text-xs text-gray-500">
            {deviceStatus.connection?.downlink}Mbps
          </span>
        </div>
      </div>

      {/* GPS Status */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">GPS</span>
          </div>
          <span className="text-sm font-semibold text-green-600">
            {deviceStatus.gps}
          </span>
        </div>
        {deviceStatus.accuracy && (
          <p className="text-xs text-gray-500 mt-1">
            Accuracy: ±{Math.round(deviceStatus.accuracy)}m
          </p>
        )}
      </div>

      {/* Online Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Online Status</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              deviceStatus.online ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className={`text-sm font-semibold ${
            deviceStatus.online ? 'text-green-600' : 'text-red-600'
          }`}>
            {deviceStatus.online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-400 mt-3">
        Updated: {new Date(deviceStatus.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function LiveJourney() {
  const [sosActive, setSosActive] = useState(false);
  const [showTripCompletion, setShowTripCompletion] = useState(false);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState({
    battery: { level: 78, charging: false },
    connection: { effectiveType: '4g', downlink: 10, rtt: 50 },
    gps: 'Idle',
    accuracy: null,
    online: true,
    timestamp: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]);
  const [apiDebug, setApiDebug] = useState(null);
  const [sosAlertId, setSosAlertId] = useState(null);
  const [locationUpdateInterval, setLocationUpdateInterval] = useState(null);

  // Helper functions
  const getSource = (trip) => {
    return trip.transport?.from || 
           trip.ticketInfo?.from || 
           trip.transportFrom || 
           trip.location || 
           trip.source || 
           'Dhaka';
  };

  const getDestination = (trip) => {
    return trip.destination || 
           trip.transport?.to || 
           trip.ticketInfo?.to || 
           trip.transportTo || 
           'Destination';
  };

  const getProvider = (trip) => {
    return trip.transport?.provider || 
           trip.ticketInfo?.provider || 
           trip.transportProvider || 
           trip.provider || 
           'Provider';
  };

  const getTransportType = (trip) => {
    return trip.transport?.type || 
           trip.ticketInfo?.type || 
           trip.transportType || 
           trip.type || 
           'Transport';
  };

  // ==================== DEVICE STATUS EFFECTS ====================

  // Fetch trips
  useEffect(() => {
    fetchUpcomingTrips();
    
    // Update device status every 30 seconds
    const statusInterval = setInterval(async () => {
      const status = await getDeviceStatus();
      setDeviceStatus(status);
    }, 30000);

    // Get initial device status
    getDeviceStatus().then(status => {
      setDeviceStatus(status);
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      setDeviceStatus(prev => ({ ...prev, online: true }));
    });

    window.addEventListener('offline', () => {
      setDeviceStatus(prev => ({ ...prev, online: false }));
    });

    return () => {
      clearInterval(statusInterval);
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, []);

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
          setMapCenter([newLocation.lat, newLocation.lng]);

          // Update device status with GPS info
          setDeviceStatus(prev => ({
            ...prev,
            gps: 'Active',
            accuracy: newLocation.accuracy,
            timestamp: new Date(),
          }));
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

  const fetchUpcomingTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📡 Fetching trips...');
      
      const response = await fetch(`${API_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch trips: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success && data.trips) {
        const transportTrips = data.trips.filter(trip => {
          const status = trip.status || trip.bookingStatus || 'upcoming';
          const hasTransport = 
            (trip.transport && trip.transport.booked === true) ||
            trip.ticketBooked === true ||
            (trip.transportType && trip.transportTicketId);
          
          return (status === 'upcoming' || status === 'confirmed') && hasTransport;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('✅ Filtered transport trips:', transportTrips.length);
        setUpcomingTrips(transportTrips);
      }
    } catch (err) {
      console.error('❌ Error fetching trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackJourney = async (trip) => {
    try {
      setSelectedTrip(trip);
      
      console.log('📍 Selected trip data:', trip);
      
      let source, destination, provider, transportType;
      
      if (trip.transport && trip.transport.from && trip.transport.to) {
        source = trip.transport.from;
        destination = trip.transport.to;
        provider = trip.transport.provider;
        transportType = trip.transport.type;
      } else if (trip.ticketInfo && trip.ticketInfo.from && trip.ticketInfo.to) {
        source = trip.ticketInfo.from;
        destination = trip.ticketInfo.to;
        provider = trip.ticketInfo.provider;
        transportType = trip.ticketInfo.type;
      } else if (trip.transportFrom && trip.transportTo) {
        source = trip.transportFrom;
        destination = trip.transportTo;
        provider = trip.transportProvider;
        transportType = trip.transportType;
      } else {
        source = trip.location || trip.source || 'Dhaka';
        destination = trip.destination || "Cox's Bazar";
        provider = trip.provider || 'Transport Provider';
        transportType = trip.transportType || 'transport';
      }
      
      console.log('📍 Route details:', { 
        source, 
        destination, 
        provider, 
        transportType,
      });
      
      const sourceCoords = cityCoordinates[source] || [23.8103, 90.4125];
      const destCoords = cityCoordinates[destination] || [21.4272, 91.9737];
      
      setRouteCoordinates([sourceCoords, destCoords]);
      
      const centerLat = (sourceCoords[0] + destCoords[0]) / 2;
      const centerLng = (sourceCoords[1] + destCoords[1]) / 2;
      setMapCenter([centerLat, centerLng]);

      setSelectedTrip(prev => ({
        ...prev,
        displayProvider: provider,
        displayType: transportType,
        displaySource: source,
        displayDestination: destination
      }));

      console.log('✅ Route loaded successfully');
    } catch (error) {
      console.error('❌ Error loading route:', error);
    }
  };

  const handleSOS = async () => {
    try {
      if (!currentLocation) {
        alert('Unable to get your current location. Please enable GPS and try again.');
        return;
      }

      setSosActive(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication error. Please login again.');
        return;
      }

      const tripInfo = selectedTrip ? {
        tripId: selectedTrip._id,
        destination: selectedTrip.destination,
        source: selectedTrip.transport?.from || selectedTrip.transportFrom || selectedTrip.location,
        transportType: selectedTrip.transport?.type || selectedTrip.transportType,
        provider: selectedTrip.transport?.provider || selectedTrip.transportProvider
      } : null;

      console.log('🚨 Triggering SOS with location:', currentLocation);

      const response = await fetch(`${API_URL}/sos/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            accuracy: currentLocation.accuracy
          },
          tripInfo,
          deviceInfo: {
            battery: deviceStatus.battery,
            connection: deviceStatus.connection.effectiveType,
            online: deviceStatus.online
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to trigger SOS');
      }

      console.log('✅ SOS triggered:', data);
      setSosAlertId(data.alertId);

      alert('🚨 SOS ACTIVATED!\n\nEmergency contacts have been notified.\nYour location is being shared with our support team.\nHelp is on the way!');

      const intervalId = setInterval(async () => {
        if (currentLocation && sosActive) {
          try {
            await fetch(`${API_URL}/sos/${data.alertId}/location`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                location: {
                  lat: currentLocation.lat,
                  lng: currentLocation.lng,
                  accuracy: currentLocation.accuracy
                }
              })
            });
            console.log('📍 SOS location updated');
          } catch (err) {
            console.error('❌ Failed to update SOS location:', err);
          }
        }
      }, 30000);

      setLocationUpdateInterval(intervalId);

    } catch (error) {
      console.error('❌ SOS error:', error);
      setSosActive(false);
      alert('Failed to trigger SOS. Please call emergency services directly at 999.');
    }
  };

  const deactivateSOS = async () => {
    if (locationUpdateInterval) {
      clearInterval(locationUpdateInterval);
      setLocationUpdateInterval(null);
    }
    setSosActive(false);
    setSosAlertId(null);
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
    const displaySource = selectedTrip.displaySource || 
                         selectedTrip.transport?.from || 
                         selectedTrip.transportFrom || 
                         selectedTrip.location || 
                         'Dhaka';
    
    const displayDestination = selectedTrip.displayDestination || 
                              selectedTrip.destination || 
                              selectedTrip.transport?.to || 
                              selectedTrip.transportTo || 
                              "Cox's Bazar";
    
    const displayProvider = selectedTrip.displayProvider || 
                           selectedTrip.transport?.provider || 
                           selectedTrip.transportProvider || 
                           selectedTrip.provider || 
                           'Transport Provider';
    
    const displayType = selectedTrip.displayType || 
                       selectedTrip.transport?.type || 
                       selectedTrip.transportType || 
                       selectedTrip.type || 
                       'Transport';

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedTrip(null);
            setCurrentLocation(null);
            deactivateSOS();
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
            {displaySource} → {displayDestination}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {displayType} • {displayProvider}
          </p>
          {selectedTrip.bookingId && (
            <p className="text-xs text-gray-400 mt-1">
              Booking ID: {selectedTrip.bookingId}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Journey Status */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">Journey to {displayDestination}</h3>
                  <p className="text-white/90 text-sm">
                    Transport: {displayType} • {displayProvider}
                  </p>
                  <p className="text-white/80 text-xs mt-1">
                    From: {displaySource}
                  </p>
                  {selectedTrip.bookingId && (
                    <p className="text-white/80 text-xs mt-1">
                      Booking ID: {selectedTrip.bookingId}
                    </p>
                  )}
                </div>
                <Navigation className="w-8 h-8" />
              </div>
              
              <div className="flex items-center justify-between text-sm mt-4">
                <span>Date: {new Date(selectedTrip.date || selectedTrip.journeyDate || selectedTrip.startDate).toLocaleDateString()}</span>
                {currentLocation && (
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    📍 Tracking Active
                  </span>
                )}
              </div>

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
                  
                  {routeCoordinates.length === 2 && (
                    <Polyline
                      positions={routeCoordinates}
                      color="blue"
                      weight={3}
                      opacity={0.7}
                      dashArray="5, 10"
                    />
                  )}

                  {routeCoordinates[0] && (
                    <Marker position={routeCoordinates[0]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>Start: {displaySource}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {routeCoordinates[1] && (
                    <Marker position={routeCoordinates[1]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>Destination: {displayDestination}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  )}

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
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Device Status */}
            <DeviceStatusWidget deviceStatus={deviceStatus} />

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
                  <p className="text-sm text-red-800 font-semibold mb-2">🚨 SOS ACTIVE</p>
                  <p className="text-sm text-red-800">
                    ✓ Emergency contacts notified
                    <br />
                    ✓ Location being shared
                    <br />
                    ✓ Support team alerted
                  </p>
                  <button
                    onClick={deactivateSOS}
                    className="w-full mt-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                  >
                    Deactivate SOS
                  </button>
                </div>
              )}
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
                source: selectedTrip.transport?.from || selectedTrip.transportFrom || selectedTrip.location || 'Dhaka'
              }}
              onCompleted={(data) => {
                setShowTripCompletion(false);
                setSelectedTrip(null);
                fetchUpcomingTrips();
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

      {/* Device Status Summary (List View) */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Battery className={`w-5 h-5 ${getBatteryColor(deviceStatus.battery?.level)}`} />
              <span className="text-sm text-gray-700">
                {deviceStatus.battery?.level}% • {deviceStatus.battery?.charging ? '🔌' : '🔋'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-700">
                {deviceStatus.connection?.effectiveType?.toUpperCase()} • {deviceStatus.connection?.downlink}Mbps
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  deviceStatus.online ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-700">
                {deviceStatus.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            Last updated: {new Date(deviceStatus.timestamp).toLocaleTimeString()}
          </span>
        </div>
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
                    {getSource(upcomingTrips[0])} → {getDestination(upcomingTrips[0])}
                  </h4>
                  <p className="text-blue-100">
                    {getTransportType(upcomingTrips[0])} • {getProvider(upcomingTrips[0])}
                  </p>
                </div>
                <Navigation className="w-8 h-8" />
              </div>

              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Travel Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(upcomingTrips[0].date || upcomingTrips[0].journeyDate || upcomingTrips[0].startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Booking ID</p>
                    <p className="text-lg font-semibold">
                      {upcomingTrips[0].bookingId || upcomingTrips[0].ticketInfo?.bookingId || 'N/A'}
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
                          {getSource(trip)} → {getDestination(trip)}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          🚌 {getTransportType(trip)} • {getProvider(trip)}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          📅 {new Date(trip.date || trip.journeyDate || trip.startDate).toLocaleDateString()}
                        </p>
                        {(trip.bookingId || trip.ticketInfo?.bookingId) && (
                          <p className="text-gray-500 text-xs mt-1">
                            Booking: {trip.bookingId || trip.ticketInfo?.bookingId}
                          </p>
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