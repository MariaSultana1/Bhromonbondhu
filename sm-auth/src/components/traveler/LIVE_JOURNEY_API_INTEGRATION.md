// Example: How to Integrate with Your Trip API
// This shows how to modify LiveJourney.jsx to fetch real data

import { journeyService } from '../services/journeyService';

// In your useEffect, replace the mock data initialization:

useEffect(() => {
  const initializeJourney = async () => {
    try {
      setLoading(true);

      // Get the current logged-in user ID
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        setLoading(false);
        return;
      }

      // Fetch actual journey from your trip API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/trips?status=upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch journey');
      }

      const data = await response.json();

      if (!data.success || !data.trips || data.trips.length === 0) {
        console.log('No active trips');
        setLoading(false);
        return;
      }

      // Get the first upcoming trip
      const trip = data.trips[0];

      // Determine route based on source and destination
      const buildRoute = (source, destination) => {
        const routeMap = {
          'Dhaka-Cox\'s Bazar': ['Dhaka', 'Comilla', 'Feni', 'Chittagong', 'Cox\'s Bazar'],
          'Dhaka-Sylhet': ['Dhaka', 'Mymensingh', 'Sherpur', 'Sylhet'],
          'Dhaka-Khulna': ['Dhaka', 'Jashore', 'Khulna'],
          'Dhaka-Rajshahi': ['Dhaka', 'Naogaon', 'Rajshahi'],
          'Dhaka-Chittagong': ['Dhaka', 'Comilla', 'Feni', 'Chittagong'],
          'Cox\'s Bazar-Dhaka': ['Cox\'s Bazar', 'Chittagong', 'Feni', 'Comilla', 'Dhaka'],
          'Sylhet-Dhaka': ['Sylhet', 'Sherpur', 'Mymensingh', 'Dhaka'],
          'Khulna-Dhaka': ['Khulna', 'Jashore', 'Dhaka'],
          'Rajshahi-Dhaka': ['Rajshahi', 'Naogaon', 'Dhaka'],
          'Chittagong-Dhaka': ['Chittagong', 'Feni', 'Comilla', 'Dhaka'],
        };
        
        const key = `${source}-${destination}`;
        return routeMap[key] || [source, destination];
      };

      const source = trip.transportFrom || 'Dhaka';
      const destination = trip.destination || 'Cox\'s Bazar';
      const route = buildRoute(source, destination);

      // Create journey object from trip data
      const mockJourney = {
        destination: destination,
        source: source,
        host: trip.host === 'pending' ? 'Pending Host' : trip.host,
        startTime: trip.transportDate ? new Date(trip.transportDate).toLocaleTimeString() : '8:00 AM',
        estimatedArrival: trip.date ? new Date(new Date(trip.date).getTime() + 6*60*60*1000).toLocaleTimeString() : '2:30 PM',
        progress: calculateProgress(trip.transportDate, trip.date),
        route: route,
        tripId: trip._id,
        transportProvider: trip.transportProvider || 'Bus Company',
        transportType: trip.transportType || 'Bus'
      };

      // Generate dynamic checkpoints
      const newCheckpoints = route.map((city, index) => {
        const totalCities = route.length;
        const hoursPerCity = 6 / (totalCities - 1); // Total 6 hours divided by number of segments
        const startDate = new Date(trip.transportDate || new Date());
        
        const checkpointTime = new Date(startDate.getTime() + (index * hoursPerCity * 60 * 60 * 1000));
        
        return {
          name: `${city}${index === 0 ? ' - Start' : index === route.length - 1 ? ' - End' : ''}`,
          city: city,
          coordinates: cityCoordinates[city] || [23.8103, 90.4125],
          time: checkpointTime.toLocaleTimeString(),
          completed: index <= Math.floor(mockJourney.progress / (100 / (totalCities - 1))),
          current: index === Math.floor(mockJourney.progress / (100 / (totalCities - 1)))
        };
      });

      setCurrentJourney(mockJourney);
      setCheckpoints(newCheckpoints);

      // Get route coordinates
      const routePath = newCheckpoints.map(cp => cp.coordinates);
      setRouteCoordinates(routePath);

      // Set map center
      const centerLat = (routePath[0][0] + routePath[routePath.length - 1][0]) / 2;
      const centerLng = (routePath[0][1] + routePath[routePath.length - 1][1]) / 2;
      setMapCenter([centerLat, centerLng]);

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

// Helper function to calculate progress
const calculateProgress = (startDate, endDate) => {
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  } catch {
    return 65; // Default progress
  }
};
