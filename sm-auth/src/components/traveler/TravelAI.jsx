import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar as CalendarIcon, AlertTriangle, Brain, TrendingUp, Cloud, DollarSign, Loader2, Search, Users, Star } from 'lucide-react';
import axios from 'axios';

// Use backend API - NOT external AI services
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function TravelAI() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTool, setActiveTool] = useState('mood');
  const [selectedMood, setSelectedMood] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moodDestinations, setMoodDestinations] = useState([]);
  const [itineraryData, setItineraryData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    travelDate: '',
    preferences: '',
    travelers: 1
  });

  // Initialize with sample data
  const sampleMoods = [
    { id: 'adventure', name: 'Adventure', icon: '🧗', description: 'Thrilling activities, exploration' },
    { id: 'relaxation', name: 'Relaxation', icon: '🏖️', description: 'Peaceful, rejuvenating experiences' },
    { id: 'cultural', name: 'Cultural', icon: '🏛️', description: 'Historical sites, local traditions' },
    { id: 'nature', name: 'Nature', icon: '🌳', description: 'Parks, wildlife, natural beauty' },
    { id: 'food', name: 'Food', icon: '🍜', description: 'Culinary experiences, local cuisine' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', description: 'Markets, souvenirs, local products' },
    { id: 'luxury', name: 'Luxury', icon: '🌟', description: 'Premium experiences, comfort' },
    { id: 'budget', name: 'Budget', icon: '💰', description: 'Affordable options, value deals' }
  ];

  // Initialize token and user from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔍 Checking token on mount...');
    console.log('Token from localStorage:', storedToken ? 'Found ✓' : 'Not found ✗');
    console.log('User from localStorage:', storedUser ? 'Found ✓' : 'Not found ✗');
    
    if (storedToken) {
      setToken(storedToken);
      console.log('✓ Token set in state:', storedToken.substring(0, 20) + '...');
    }
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Fetch user's travel history for personalization
  useEffect(() => {
    if (token) {
      fetchUserTrips();
    }
  }, [token]);

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserTrips(response.data.trips || []);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  // AI Mood Analysis Integration - NOW USES BACKEND
  const analyzeMoodAndRecommend = async () => {
    if (!selectedMood) {
      setError('Please select a travel mood');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Call your BACKEND endpoint - this is the correct way!
      const response = await axios.post(
        `${API_BASE_URL}/ai/mood-analysis`,
        {
          mood: selectedMood,
          preferences: '',
          budget: '',
          duration: ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMoodDestinations(response.data.destinations);
      } else {
        setError(response.data.message || 'Failed to get recommendations');
        setMoodDestinations(getSampleDestinations(selectedMood));
      }

    } catch (err) {
      console.error('AI Mood Analysis Error:', err);
      setError(err.response?.data?.message || 'Failed to get recommendations. Please try again.');
      
      // Fallback to sample data
      setMoodDestinations(getSampleDestinations(selectedMood));
    } finally {
      setGenerating(false);
    }
  };

  // AI Itinerary Generation - NOW USES BACKEND
  const generateItinerary = async () => {
    const { destination, duration, budget, travelers, preferences } = formData;
    
    if (!destination || !duration || !budget) {
      setError('Please fill in destination, duration, and budget');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Call your BACKEND endpoint
      const response = await axios.post(
        `${API_BASE_URL}/ai/itineraries`,
        {
          destination,
          duration,
          budget,
          travelers,
          preferences
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setItineraryData(response.data.itinerary);
      } else {
        setError(response.data.message || 'Failed to generate itinerary');
        setItineraryData(getSampleItinerary(destination));
      }

    } catch (err) {
      console.error('AI Itinerary Error:', err);
      setError(err.response?.data?.message || 'Failed to generate itinerary. Please try again.');
      
      // Fallback to sample itinerary
      setItineraryData(getSampleItinerary(destination));
    } finally {
      setGenerating(false);
    }
  };

  // AI Risk Analysis - NOW USES BACKEND
  const analyzeRisk = async () => {
    const { destination, travelDate } = formData;
    
    if (!destination || !travelDate) {
      setError('Please enter destination and travel date');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Call your BACKEND endpoint
      const response = await axios.post(
        `${API_BASE_URL}/ai/risk-analyses`,
        {
          destination,
          travelDate,
          duration: formData.duration,
          travelers: formData.travelers
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setRiskData({
          overall: response.data.overall,
          riskLevel: response.data.overallRisk?.score || 50,
          destination: response.data.destination,
          travelDate: response.data.travelDate,
          factors: response.data.riskFactors,
          recommendations: response.data.recommendations
        });
      } else {
        setError(response.data.message || 'Failed to analyze risk');
        setRiskData(getSampleRiskData(destination));
      }

    } catch (err) {
      console.error('AI Risk Analysis Error:', err);
      setError(err.response?.data?.message || 'Failed to analyze risk. Please try again.');
      
      // Fallback to sample risk data
      setRiskData(getSampleRiskData(destination));
    } finally {
      setGenerating(false);
    }
  };

  // Sample data fallbacks (same as before)
  const getSampleDestinations = (mood) => {
    const sampleData = {
      adventure: [
        { id: 1, name: 'Sajek Valley', matchScore: 95, image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=1080&q=80', highlights: ['Trekking', 'Cloud views', 'Indigenous culture'], estimatedCost: '৳8,000 - ৳12,000', bestTime: 'October-March' },
        { id: 2, name: 'Bandarban', matchScore: 92, image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=1080&q=80', highlights: ['Mountain hiking', 'Waterfalls', 'Tribal villages'], estimatedCost: '৳7,000 - ৳15,000', bestTime: 'November-February' }
      ],
      relaxation: [
        { id: 1, name: 'Cox\'s Bazar', matchScore: 98, image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?w=1080&q=80', highlights: ['Longest beach', 'Sunset views', 'Seafood'], estimatedCost: '৳10,000 - ৳20,000', bestTime: 'November-March' },
        { id: 2, name: 'Kuakata', matchScore: 94, image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?w=1080&q=80', highlights: ['Sunrise & sunset', 'Beach activities', 'Fishing villages'], estimatedCost: '৳6,000 - ৳12,000', bestTime: 'October-April' }
      ]
    };
    return sampleData[mood.toLowerCase()] || sampleData.adventure;
  };

  const getSampleItinerary = (destination) => ({
    destination,
    duration: '3 days',
    budget: '৳15,000',
    travelers: 2,
    days: [
      {
        day: 1,
        title: 'Arrival & First Impressions',
        activities: [
          { time: '2:00 PM', activity: 'Arrive and check-in with host', icon: 'home' },
          { time: '4:00 PM', activity: 'Explore local market', icon: 'map' },
          { time: '6:00 PM', activity: 'Sunset watching', icon: 'sun' },
          { time: '8:00 PM', activity: 'Dinner at local restaurant', icon: 'food' }
        ]
      }
    ],
    includes: ['Accommodation', 'Local guide', 'Some meals', 'Transportation'],
    recommendations: ['Book activities in advance', 'Carry cash', 'Respect local customs']
  });

  const getSampleRiskData = (destination) => ({
    overall: 'Low Risk',
    riskLevel: 25,
    destination,
    travelDate: formData.travelDate || new Date().toISOString().split('T')[0],
    factors: [
      { category: 'Weather', risk: 'Low', description: 'Clear skies expected, pleasant temperatures', icon: Cloud },
      { category: 'Health', risk: 'Low', description: 'No major health alerts in the area', icon: AlertTriangle },
      { category: 'Safety', risk: 'Low', description: 'Generally safe with normal precautions', icon: AlertTriangle },
      { category: 'Transportation', risk: 'Medium', description: 'Transport availability varies by season', icon: TrendingUp }
    ],
    recommendations: [
      'Carry necessary medications',
      'Keep emergency contacts handy',
      'Check weather updates regularly',
      'Purchase travel insurance'
    ]
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Travel AI Assistant</h2>
            <p className="text-sm opacity-90">Powered by AI & Real-time Data Analysis</p>
          </div>
        </div>
        <p className="text-sm">Intelligent travel planning with real-time weather, safety data, and personalized recommendations</p>
        
        {userTrips.length > 0 && (
          <div className="mt-4 p-3 bg-white/20 rounded-lg">
            <p className="text-sm">
              <span className="font-semibold">Personalized for you:</span> Based on your {userTrips.length} previous trips
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Tool Selection */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTool('mood')}
          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            activeTool === 'mood'
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
          }`}
        >
          <Brain className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="mb-1 font-semibold">Mood-Based Suggestions</h3>
          <p className="text-sm text-gray-600">AI-powered destination matching</p>
        </button>
        <button
          onClick={() => setActiveTool('itinerary')}
          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            activeTool === 'itinerary'
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
          }`}
        >
          <CalendarIcon className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="mb-1 font-semibold">Smart Itinerary</h3>
          <p className="text-sm text-gray-600">Real-time optimized plans</p>
        </button>
        <button
          onClick={() => setActiveTool('risk')}
          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            activeTool === 'risk'
              ? 'border-purple-500 bg-purple-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
          }`}
        >
          <AlertTriangle className="w-8 h-8 text-orange-500 mb-2" />
          <h3 className="mb-1 font-semibold">Risk Predictor</h3>
          <p className="text-sm text-gray-600">Live safety & weather analysis</p>
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-600">Loading AI assistant...</span>
          </div>
        ) : activeTool === 'mood' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">What's your travel mood?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sampleMoods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.name)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${
                      selectedMood === mood.name
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-2xl mb-2">{mood.icon}</span>
                    <span className="font-medium">{mood.name}</span>
                    <span className="text-xs text-gray-500 mt-1">{mood.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={analyzeMoodAndRecommend}
              disabled={generating || !selectedMood}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
            >
              {generating ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Analyzing with AI...
                </span>
              ) : (
                'Find Perfect Destinations'
              )}
            </button>

            {moodDestinations.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Top matches for {selectedMood}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {moodDestinations.map((dest) => (
                    <div key={dest.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="relative h-48">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                          <h4 className="text-white text-lg font-semibold mb-1">{dest.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/30 rounded-full h-2">
                              <div
                                className="bg-green-400 rounded-full h-2 transition-all duration-1000"
                                style={{ width: `${dest.matchScore || dest.match}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-sm font-medium">{dest.matchScore || dest.match}% match</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {dest.highlights?.map((highlight, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              {highlight}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <div>
                            <DollarSign className="w-4 h-4 inline mr-1" />
                            <span>{dest.estimatedCost}</span>
                          </div>
                          <div>
                            <CalendarIcon className="w-4 h-4 inline mr-1" />
                            <span>{dest.bestTime}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{dest.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTool === 'itinerary' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Generate Smart Itinerary</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2 font-medium">Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleFormChange}
                    placeholder="Where to?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">Duration</label>
                  <select 
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select duration</option>
                    <option value="2 days">2 days</option>
                    <option value="3 days">3 days</option>
                    <option value="5 days">5 days</option>
                    <option value="7 days">1 week</option>
                    <option value="9 days">9 days</option>
                    <option value="10 days">10 days</option>
                    <option value="14 days">2 weeks</option>
                    <option value="21 days">3 weeks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">Budget (BDT)</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleFormChange}
                    placeholder="৳10,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button
                onClick={generateItinerary}
                disabled={generating || !formData.destination || !formData.duration || !formData.budget}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
              >
                {generating ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating with AI...
                  </span>
                ) : (
                  'Generate Itinerary'
                )}
              </button>
            </div>

            {itineraryData && (
              <div className="border-t pt-6">
                <h4 className="text-xl font-semibold mb-4">{itineraryData.destination} Itinerary</h4>
                <div className="space-y-4">
                  {itineraryData.days?.slice(0, 3).map((day) => (
                    <div key={day.day} className="border-l-4 border-purple-500 pl-4 bg-gray-50 rounded-r-lg p-4">
                      <h5 className="text-lg font-semibold mb-3">Day {day.day}: {day.title}</h5>
                      <div className="space-y-2">
                        {day.activities?.map((activity, idx) => (
                          <div key={idx} className="flex gap-3">
                            <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                              {activity.time}
                            </span>
                            <p>{activity.activity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTool === 'risk' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Travel Risk Analysis</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2 font-medium">Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleFormChange}
                    placeholder="Enter destination"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 font-medium">Travel Date</label>
                  <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <button
                onClick={analyzeRisk}
                disabled={generating || !formData.destination || !formData.travelDate}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
              >
                {generating ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Analyzing with AI...
                  </span>
                ) : (
                  'Analyze Risk'
                )}
              </button>
            </div>

            {riskData && (
              <div className="border-t pt-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">Overall Risk Level</h4>
                      <p className="text-sm text-gray-600">For {riskData.destination}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${
                      riskData.riskLevel < 40
                        ? 'bg-green-100 text-green-700'
                        : riskData.riskLevel < 70
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {riskData.overall}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${
                        riskData.riskLevel < 40 ? 'bg-green-500'
                        : riskData.riskLevel < 70 ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`}
                      style={{ width: `${riskData.riskLevel}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <h5 className="font-semibold">Risk Factors</h5>
                  {riskData.factors?.map((factor, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="font-medium">{factor.category}</h6>
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          factor.risk === 'Low' ? 'bg-green-100 text-green-700'
                          : factor.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {factor.risk} Risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{factor.description}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold mb-3">Recommendations</h5>
                  <ul className="space-y-2">
                    {riskData.recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-blue-500">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TravelAI;