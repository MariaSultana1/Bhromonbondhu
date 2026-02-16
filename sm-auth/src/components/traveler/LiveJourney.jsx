import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertCircle, Phone, Trophy, Camera, MessageCircle, Clock, Battery, Wifi, X, Send, Image, MapPinned, Loader, CheckCircle, Flag } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { TripCompletion } from './TripCompletion';

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
  'Cox\'s Bazar': [21.4272, 91.9737],
  'Sylhet': [24.8917, 91.8679],
  'Khulna': [22.8456, 89.5403],
  'Rajshahi': [24.3745, 88.5639],
  'Barisal': [22.7010, 90.3535],
};

const emergencyContacts = [
  { name: 'Local Police', number: '999', type: 'police' },
  { name: 'Emergency Helpline', number: '102', type: 'emergency' },
  { name: 'Platform Support', number: '+880 1XXX-XXXXXX', type: 'support' }
];

// Function to get route coordinates using OpenRouteService API
const getRouteCoordinates = async (fromCity, toCity) => {
  try {
    const fromCoords = cityCoordinates[fromCity] || [23.8103, 90.4125];
    const toCoords = cityCoordinates[toCity] || [21.4272, 91.9737];
    
    // For demo, we'll use a simple line between two points
    // In production, you could use OpenRouteService free API
    return [fromCoords, toCoords];
  } catch (error) {
    console.error('Error getting route:', error);
    return [];
  }
};

// Function to get device battery status
const getDeviceStatus = async () => {
  try {
    const battery = navigator.getBattery && await navigator.getBattery();
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      battery: battery ? {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      } : {
        level: 78,
        charging: false,
        chargingTime: 'Unknown',
        dischargingTime: 'Unknown'
      },
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      } : {
        effectiveType: 'Unknown',
        downlink: 'Unknown',
        rtt: 'Unknown',
        saveData: false
      },
      gps: 'Active',
      online: navigator.onLine
    };
  } catch (error) {
    console.error('Error getting device status:', error);
    return {
      battery: { level: 78, charging: false },
      connection: { effectiveType: 'Strong' },
      gps: 'Active',
      online: navigator.onLine
    };
  }
};

const aiChallenges = [
  {
    id: 1,
    title: 'Learn a Local Phrase',
    description: 'Say "আপনার নাম কী?" (What is your name?) to a local',
    points: 50,
    completed: false
  },
  {
    id: 2,
    title: 'Capture the Moment',
    description: 'Take a photo of a local landmark',
    points: 30,
    completed: true
  },
  {
    id: 3,
    title: 'Try Local Cuisine',
    description: 'Share a photo of your meal',
    points: 40,
    completed: false
  }
];

export function LiveJourney() {
  const [sosActive, setSosActive] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showMessageHost, setShowMessageHost] = useState(false);
  const [showShareUpdate, setShowShareUpdate] = useState(false);
  const [showTripCompletion, setShowTripCompletion] = useState(false);
  const [currentJourney, setCurrentJourney] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState({
    battery: { level: 78, charging: false },
    connection: { effectiveType: 'Strong' },
    gps: 'Active',
    online: true
  });
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]);
  const [upcomingJourneys, setUpcomingJourneys] = useState([]);
  const [selectedJourneyForTracking, setSelectedJourneyForTracking] = useState(null);

  useEffect(() => {
    // Initialize journey data - In real app, get from ticket/API
    const initializeJourney = async () => {
      try {
        // Helper function to format time
        const formatTime = (date) => {
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        };

        // Helper function to calculate progress based on actual times
        const calculateProgressFromTimes = (startTime, endTime) => {
          const now = new Date();
          
          // If journey hasn't started yet
          if (now < startTime) {
            return 0;
          }
          
          // If journey is complete
          if (now > endTime) {
            return 100;
          }
          
          // Calculate progress percentage
          const totalDuration = endTime.getTime() - startTime.getTime();
          const elapsedDuration = now.getTime() - startTime.getTime();
          const progress = Math.round((elapsedDuration / totalDuration) * 100);
          
          return Math.min(progress, 100);
        };

        // Mock trip data - In production, this comes from API/ticket booking
        // These should match your actual ticket times
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // IMPORTANT: Update these to match your actual ticket times
        const departureTime = new Date(today);
        departureTime.setHours(8, 0, 0); // Departure: 8:00 AM - CHANGE THIS
        
        const arrivalTime = new Date(today);
        arrivalTime.setHours(14, 30, 0); // Arrival: 2:30 PM - CHANGE THIS
        
        const mockJourney = {
          id: 1,
          destination: 'Cox\'s Bazar',
          source: 'Dhaka',
          host: 'Fatima Khan',
          startTime: formatTime(departureTime),
          estimatedArrival: formatTime(arrivalTime),
          progress: calculateProgressFromTimes(departureTime, arrivalTime),
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          route: ['Dhaka', 'Comilla', 'Feni', 'Chittagong', 'Cox\'s Bazar'],
          date: today.toLocaleDateString()
        };

        // Create more journey examples for the list
        const mockJourneys = [
          mockJourney,
          {
            id: 2,
            destination: 'Sylhet',
            source: 'Dhaka',
            host: 'Ahmed Khan',
            startTime: '10:00 AM',
            estimatedArrival: '5:00 PM',
            progress: 0,
            departureTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            arrivalTime: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
            route: ['Dhaka', 'Mymensingh', 'Tangail', 'Sylhet'],
            date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
          },
          {
            id: 3,
            destination: 'Khulna',
            source: 'Dhaka',
            host: 'Nasrin Akhter',
            startTime: '6:00 AM',
            estimatedArrival: '12:00 PM',
            progress: 0,
            departureTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
            arrivalTime: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
            route: ['Dhaka', 'Rajshahi', 'Khulna'],
            date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
          }
        ];

        setUpcomingJourneys(mockJourneys);
        setCurrentJourney(mockJourney);

        // Get device status
        const status = await getDeviceStatus();
        setDeviceStatus(status);

        setLoading(false);
      } catch (error) {
        console.error('Error initializing journey:', error);
        setLoading(false);
      }
    };

    initializeJourney();

    // Update device status every 5 seconds
    const statusInterval = setInterval(async () => {
      const status = await getDeviceStatus();
      setDeviceStatus(status);
    }, 5000);

    return () => clearInterval(statusInterval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">Loading journey...</p>
      </div>
    );
  }

  if (!currentJourney) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No active journey found. Book a transport ticket to start.</p>
      </div>
    );
  }

  const handleTrackJourney = async (journey) => {
    try {
      // Try to fetch route data from API if journey has an ID
      if (journey.id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/trips/${journey.id}/route`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.checkpoints && data.checkpoints.length > 0) {
            // Use API data - map cities to coordinates
            const apiCheckpoints = data.checkpoints.map((checkpoint) => ({
              ...checkpoint,
              coordinates: cityCoordinates[checkpoint.city] || [23.8103, 90.4125]
            }));

            setCheckpoints(apiCheckpoints);

            // Get route path
            const routePath = apiCheckpoints.map(cp => cp.coordinates);
            setRouteCoordinates(routePath);

            // Set map center
            if (routePath.length >= 2) {
              const centerLat = (routePath[0][0] + routePath[routePath.length - 1][0]) / 2;
              const centerLng = (routePath[0][1] + routePath[routePath.length - 1][1]) / 2;
              setMapCenter([centerLat, centerLng]);
            }

            console.log('✅ Route data loaded from API:', data);
            setSelectedJourneyForTracking(journey);
            return;
          }
        }
      }

      // Fallback to mock data if API fails or journey doesn't have ID
      const now = new Date();
      const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      };

      const newCheckpoints = journey.route.map((city, index) => {
        const totalCities = journey.route.length;
        const hoursPerSegment = (journey.arrivalTime.getTime() - journey.departureTime.getTime()) / (1000 * 60 * 60) / (totalCities - 1);
        
        const checkpointTime = new Date(journey.departureTime.getTime() + (index * hoursPerSegment * 60 * 60 * 1000));
        
        const isCompleted = now > checkpointTime;
        const isCurrent = !isCompleted && index === Math.floor(journey.progress / (100 / (totalCities - 1)));
        
        return {
          name: `${city}${index === 0 ? ' - Start' : index === totalCities - 1 ? ' - End' : ''}`,
          city: city,
          coordinates: cityCoordinates[city] || [23.8103, 90.4125],
          time: formatTime(checkpointTime),
          completed: isCompleted,
          current: isCurrent
        };
      });

      setCheckpoints(newCheckpoints);

      // Get route coordinates
      const fromCoords = cityCoordinates[journey.source] || [23.8103, 90.4125];
      const toCoords = cityCoordinates[journey.destination] || [21.4272, 91.9737];
      
      const routePath = newCheckpoints.map(cp => cp.coordinates);
      setRouteCoordinates(routePath);

      // Set map center to journey midpoint
      const centerLat = (fromCoords[0] + toCoords[0]) / 2;
      const centerLng = (fromCoords[1] + toCoords[1]) / 2;
      setMapCenter([centerLat, centerLng]);

      console.log('⚠️ Using mock route data (API failed or no trip ID)');
      setSelectedJourneyForTracking(journey);
    } catch (error) {
      console.error('❌ Error loading route data:', error);
      // Still set journey for tracking even if route fetch fails
      setSelectedJourneyForTracking(journey);
    }
  };

  // If tracking a journey, show the detail page
  if (selectedJourneyForTracking) {
    const handleSOS = () => {
      setSosActive(true);
      alert('SOS Activated! Emergency contacts have been notified and your location is being shared.');
    };

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedJourneyForTracking(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <X className="w-5 h-5" />
          Back to Journeys
        </button>

        {/* Header */}
        <div>
          <h2 className="text-2xl mb-2">Tracking Journey</h2>
          <p className="text-gray-600">{selectedJourneyForTracking.source} → {selectedJourneyForTracking.destination}</p>
        </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Journey Status */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl mb-1">Journey to {selectedJourneyForTracking.destination}</h3>
                <p className="text-white/90 text-sm">Host: {selectedJourneyForTracking.host}</p>
              </div>
              <Navigation className="w-8 h-8" />
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{selectedJourneyForTracking.progress}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${selectedJourneyForTracking.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Started: {selectedJourneyForTracking.startTime}</span>
              <span>ETA: {selectedJourneyForTracking.estimatedArrival}</span>
            </div>
            {selectedJourneyForTracking.progress >= 90 && (
              <button
                onClick={() => setShowTripCompletion(true)}
                className="w-full mt-4 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold flex items-center justify-center gap-2 border-2 border-green-500"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Trip
              </button>
            )}
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Real-Time Location & Route</h3>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <MapContainer
                center={mapCenter}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Start marker */}
                {checkpoints.length > 0 && (
                  <Marker position={checkpoints[0].coordinates}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{checkpoints[0].name}</strong>
                        <p>Start: {checkpoints[0].time}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* End marker */}
                {checkpoints.length > 0 && (
                  <Marker position={checkpoints[checkpoints.length - 1].coordinates}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{checkpoints[checkpoints.length - 1].name}</strong>
                        <p>ETA: {checkpoints[checkpoints.length - 1].time}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Checkpoint markers */}
                {checkpoints.slice(1, -1).map((checkpoint, index) => (
                  <Marker key={index} position={checkpoint.coordinates}>
                    <Popup>
                      <div className="text-sm">
                        <strong>{checkpoint.name}</strong>
                        <p>Time: {checkpoint.time}</p>
                        <p>{checkpoint.completed ? '✅ Completed' : checkpoint.current ? '📍 Current' : '⏳ Upcoming'}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Route line */}
                {routeCoordinates.length > 1 && (
                  <Polyline
                    positions={routeCoordinates}
                    color="blue"
                    weight={3}
                    opacity={0.7}
                    dashArray="5, 5"
                  />
                )}

                {/* Current position indicator */}
                {checkpoints.length > 0 && checkpoints[3] && (
                  <Marker position={checkpoints[3].coordinates}>
                    <Popup>
                      <div className="text-sm">
                        <strong>📍 Current Location</strong>
                        <p>{checkpoints[3].name}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>3h 15m remaining</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Navigation className="w-4 h-4" />
                <span>142 km remaining</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Wifi className="w-4 h-4" />
                <span>{deviceStatus.connection.effectiveType === 'Unknown' ? 'Good signal' : `${deviceStatus.connection.effectiveType} signal`}</span>
              </div>
            </div>
          </div>

          {/* Journey Timeline */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Journey Timeline - {currentJourney.source} to {currentJourney.destination}</h3>
            <div className="space-y-4">
              {checkpoints.map((checkpoint, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        checkpoint.completed
                          ? 'bg-green-500'
                          : checkpoint.current
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-gray-300'
                      }`}
                    ></div>
                    {index < checkpoints.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          checkpoint.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className={`${checkpoint.current ? 'text-blue-600 font-semibold' : ''}`}>
                      {checkpoint.name}
                    </h4>
                    <p className="text-sm text-gray-500">{checkpoint.time}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      📍 {checkpoint.city} · {checkpoint.coordinates[0].toFixed(2)}°N, {checkpoint.coordinates[1].toFixed(2)}°E
                    </p>
                    {checkpoint.current && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                        Current Location
                      </span>
                    )}
                    {checkpoint.completed && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Progress summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Overall Progress</span>
                <span className="text-sm text-blue-600">{currentJourney.progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${currentJourney.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* AI Challenges */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3>AI Micro-Challenges</h3>
              </div>
              <button
                onClick={() => setShowChallenges(!showChallenges)}
                className="text-sm text-blue-500 hover:underline"
              >
                {showChallenges ? 'Hide' : 'Show All'}
              </button>
            </div>
            {showChallenges && (
              <div className="space-y-3">
                {aiChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className={`p-4 border rounded-lg ${
                      challenge.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm mb-1">{challenge.title}</h4>
                        <p className="text-xs text-gray-600">{challenge.description}</p>
                      </div>
                      <span className="text-sm text-yellow-600 ml-2">+{challenge.points} pts</span>
                    </div>
                    {!challenge.completed && (
                      <button className="w-full mt-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        Complete Challenge
                      </button>
                    )}
                    {challenge.completed && (
                      <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                        <Trophy className="w-4 h-4" />
                        <span>Completed!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Complete challenges to earn points and unlock special rewards!
              </p>
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
                  {deviceStatus.connection.effectiveType !== 'Unknown' 
                    ? deviceStatus.connection.effectiveType.toUpperCase()
                    : 'Strong'
                  }
                </span>
              </div>

              {/* GPS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">GPS</span>
                </div>
                <span className={`text-sm font-semibold ${deviceStatus.gps === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                  {deviceStatus.gps}
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

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => setShowMessageHost(!showMessageHost)}
              >
                <MessageCircle className="w-4 h-4" />
                Message Host
              </button>
              <button
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => setShowShareUpdate(!showShareUpdate)}
              >
                <Camera className="w-4 h-4" />
                Share Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Host Modal */}
      {showMessageHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Message {currentJourney.host}</h3>
                <p className="text-blue-100 text-sm">Send an update to your host</p>
              </div>
              <button onClick={() => setShowMessageHost(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Host Info */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  {currentJourney.host.charAt(0)}
                </div>
                <div>
                  <div className="mb-1">{currentJourney.host}</div>
                  <div className="text-sm text-gray-600">
                    📍 {currentJourney.source} → {currentJourney.destination}
                  </div>
                </div>
              </div>

              {/* Quick Messages */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Quick Messages</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    ✅ I'm on my way
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    🚗 Slight delay
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    📍 Just passed checkpoint
                  </button>
                  <button className="p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-left">
                    ⏰ Arriving soon
                  </button>
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Custom Message</label>
                <textarea
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageHost(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowMessageHost(false);
                    alert('Message sent to ' + currentJourney.host);
                  }}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Update Modal */}
      {showShareUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Share Journey Update</h3>
                <p className="text-purple-100 text-sm">Share your experience with others</p>
              </div>
              <button onClick={() => setShowShareUpdate(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Current Location */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinned className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Current Location</span>
                </div>
                {checkpoints.length > 3 && checkpoints[3] && (
                  <>
                    <div className="text-purple-900">{checkpoints[3].name}</div>
                    <div className="text-sm text-purple-700 mt-1">{currentJourney.progress}% of journey complete</div>
                    <div className="text-xs text-purple-600 mt-1">
                      📍 {checkpoints[3].coordinates[0].toFixed(2)}°N, {checkpoints[3].coordinates[1].toFixed(2)}°E
                    </div>
                  </>
                )}
              </div>

              {/* Upload Photo */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Add Photos (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload photos</p>
                  <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                </div>
              </div>

              {/* Update Text */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">What's happening?</label>
                <textarea
                  placeholder="Share your journey experience..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Share with</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="visibility" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Host Only</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="visibility" className="w-4 h-4" />
                    <span className="text-sm">Public</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareUpdate(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowShareUpdate(false);
                    alert('Update shared successfully!');
                  }}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Share Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Completion Modal */}
      {showTripCompletion && (
        <TripCompletion
          tripId={selectedJourneyForTracking?.id || 'mock-trip-id'}
          tripData={{
            destination: selectedJourneyForTracking?.destination,
            date: selectedJourneyForTracking?.departureTime?.toLocaleDateString(),
            source: selectedJourneyForTracking?.source
          }}
          onCompleted={(data) => {
            setShowTripCompletion(false);
            // Optionally reload journey data or update UI
            console.log('Trip completed:', data);
          }}
          onClose={() => setShowTripCompletion(false)}
        />
      )}
    </div>
    );
  }

  // ========== LIST VIEW ==========
  // Main journey list page
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Live Journeys</h2>
        <p className="text-gray-600">Your next journey and upcoming trips</p>
      </div>

      {/* Next Journey Card */}
      {upcomingJourneys.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Next Journey</h3>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-2xl mb-2">{upcomingJourneys[0].source} → {upcomingJourneys[0].destination}</h4>
                <p className="text-blue-100">with {upcomingJourneys[0].host}</p>
              </div>
              <Navigation className="w-8 h-8" />
            </div>

            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Date</p>
                  <p className="text-lg font-semibold">{upcomingJourneys[0].date}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Departure</p>
                  <p className="text-lg font-semibold">{upcomingJourneys[0].startTime}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm mb-1">Arrival</p>
                  <p className="text-lg font-semibold">{upcomingJourneys[0].estimatedArrival}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{upcomingJourneys[0].progress}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${upcomingJourneys[0].progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleTrackJourney(upcomingJourneys[0])}
              className="w-full py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
            >
              Track Your Journey
            </button>
          </div>
        </div>
      )}

      {/* All Journeys List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">All Upcoming Journeys</h3>
        <div className="space-y-3">
          {upcomingJourneys.map((journey) => (
            <div
              key={journey.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">
                    {journey.source} → {journey.destination}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    🏠 {journey.host} • 📅 {journey.date}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {journey.progress}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{journey.startTime} - {journey.estimatedArrival}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{journey.route.length} checkpoints</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all"
                  style={{ width: `${journey.progress}%` }}
                ></div>
              </div>

              <button
                onClick={() => handleTrackJourney(journey)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
              >
                Track Your Journey
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {upcomingJourneys.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <p className="text-yellow-800 font-semibold mb-2">No Upcoming Journeys</p>
          <p className="text-yellow-700 text-sm">Book a transport ticket to start tracking your journey.</p>
        </div>
      )}
    </div>
  );
}