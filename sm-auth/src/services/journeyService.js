// Journey Service - Fetch real journey data from API

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const journeyService = {
  // Get current active journey from ticket booking
  getActiveJourney: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/trips?status=upcoming`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch journey');
      
      const data = await response.json();
      
      if (data.success && data.trips && data.trips.length > 0) {
        const trip = data.trips[0]; // Get first upcoming trip
        
        return {
          destination: trip.destination,
          source: trip.transportFrom || 'Dhaka',
          host: trip.host === 'pending' ? 'Pending' : trip.host,
          startTime: trip.date ? new Date(trip.date).toLocaleTimeString() : '8:00 AM',
          estimatedArrival: trip.date ? new Date(new Date(trip.date).getTime() + 6*60*60*1000).toLocaleTimeString() : '2:30 PM',
          progress: 65,
          route: buildRoute(trip.transportFrom || 'Dhaka', trip.destination),
          tripId: trip._id,
          transportProvider: trip.transportProvider,
          transportType: trip.transportType
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching active journey:', error);
      return null;
    }
  },

  // Generate route based on source and destination
  buildRoute: (source, destination) => {
    // This is a simplified route - in production, use Google Maps Directions API
    const routeMap = {
      'Dhaka-Cox\'s Bazar': ['Dhaka', 'Comilla', 'Feni', 'Chittagong', 'Cox\'s Bazar'],
      'Dhaka-Sylhet': ['Dhaka', 'Mymensingh', 'Sherpur', 'Sylhet'],
      'Dhaka-Khulna': ['Dhaka', 'Jashore', 'Khulna'],
      'Dhaka-Rajshahi': ['Dhaka', 'Naogaon', 'Rajshahi'],
      'Dhaka-Chittagong': ['Dhaka', 'Comilla', 'Feni', 'Chittagong'],
    };
    
    const key = `${source}-${destination}`;
    return routeMap[key] || [source, destination];
  }
};

// Helper function to build route
const buildRoute = (source, destination) => {
  const routeMap = {
    'Dhaka-Cox\'s Bazar': ['Dhaka', 'Comilla', 'Feni', 'Chittagong', 'Cox\'s Bazar'],
    'Dhaka-Sylhet': ['Dhaka', 'Mymensingh', 'Sherpur', 'Sylhet'],
    'Dhaka-Khulna': ['Dhaka', 'Jashore', 'Khulna'],
    'Dhaka-Rajshahi': ['Dhaka', 'Naogaon', 'Rajshahi'],
    'Dhaka-Chittagong': ['Dhaka', 'Comilla', 'Feni', 'Chittagong'],
  };
  
  const key = `${source}-${destination}`;
  return routeMap[key] || [source, destination];
};
