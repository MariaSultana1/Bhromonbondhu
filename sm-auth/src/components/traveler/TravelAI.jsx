import { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar as CalendarIcon, AlertTriangle, Brain, TrendingUp, Cloud, DollarSign, Loader2, Search, Users, Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

// Base URL for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// AI Service URLs (Configure these in your environment)
const AI_SERVICES = {
  moodAnalysis: process.env.REACT_APP_AI_MOOD_SERVICE || 'https://api.openai.com/v1/chat/completions',
  itineraryPlanning: process.env.REACT_APP_AI_ITINERARY_SERVICE || 'https://api.openai.com/v1/chat/completions',
  riskAnalysis: process.env.REACT_APP_AI_RISK_SERVICE || 'https://api.cohere.ai/v1/generate',
  destinationRecommendation: process.env.REACT_APP_AI_DESTINATION_SERVICE || 'https://api.openai.com/v1/chat/completions'
};

export function TravelAI() {
  const { user, token } = useAuth();
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

  // Fetch user's travel history for personalization
  useEffect(() => {
    fetchUserTrips();
    fetchPopularDestinations();
  }, []);

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

  const fetchPopularDestinations = async () => {
    try {
      // Fetch from your database or external API
      const response = await axios.get(`${API_BASE_URL}/destinations/popular`);
      if (response.data.success) {
        // Process and set popular destinations
      }
    } catch (err) {
      console.error('Error fetching destinations:', err);
    }
  };

  // AI Mood Analysis Integration
  const analyzeMoodAndRecommend = async () => {
    if (!selectedMood) {
      setError('Please select a travel mood');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Prepare AI request
      const aiRequest = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a travel expert specializing in Bangladesh tourism. Recommend specific destinations based on user mood and preferences.'
          },
          {
            role: 'user',
            content: `I'm looking for travel destinations in Bangladesh that match a ${selectedMood} mood. Consider my travel history: ${userTrips.map(t => t.destination).join(', ')}. Recommend 4 destinations with specific details.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      };

      // Call AI service (using OpenAI as example)
      const response = await axios.post(AI_SERVICES.moodAnalysis, aiRequest, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Parse AI response and update state
      const recommendations = parseAIResponse(response.data);
      setMoodDestinations(recommendations);

      // Also save to database for personalization
      await saveMoodAnalysis({
        userId: user?.id,
        mood: selectedMood,
        recommendations: recommendations,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('AI Mood Analysis Error:', err);
      setError('Failed to get recommendations. Please try again.');
      
      // Fallback to sample data
      setMoodDestinations(getSampleDestinations(selectedMood));
    } finally {
      setGenerating(false);
    }
  };

  // AI Itinerary Generation
  const generateItinerary = async () => {
    const { destination, duration, budget, travelers, preferences } = formData;
    
    if (!destination || !duration || !budget) {
      setError('Please fill in destination, duration, and budget');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Fetch real-time data
      const [weatherData, transportData, accommodationData] = await Promise.all([
        fetchWeatherData(destination),
        fetchTransportOptions(destination),
        fetchAccommodationOptions(destination, budget)
      ]);

      // Prepare AI request for itinerary
      const aiRequest = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional travel planner. Create detailed day-by-day itineraries with specific times, activities, and practical information.'
          },
          {
            role: 'user',
            content: `Create a ${duration} itinerary for ${destination} with a budget of ${budget} BDT for ${travelers} traveler(s). 
            Preferences: ${preferences}. 
            Weather forecast: ${JSON.stringify(weatherData)}.
            Available transport: ${JSON.stringify(transportData)}.
            Available accommodations: ${JSON.stringify(accommodationData)}.`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      };

      // Call AI service
      const response = await axios.post(AI_SERVICES.itineraryPlanning, aiRequest, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Parse and structure itinerary
      const itinerary = parseItineraryResponse(response.data, {
        destination,
        duration,
        budget,
        travelers,
        weatherData,
        transportData,
        accommodationData
      });

      setItineraryData(itinerary);

      // Save to database
      await saveGeneratedItinerary({
        userId: user?.id,
        ...itinerary,
        generatedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error('AI Itinerary Error:', err);
      setError('Failed to generate itinerary. Please try again.');
      
      // Fallback to sample itinerary
      setItineraryData(getSampleItinerary(destination));
    } finally {
      setGenerating(false);
    }
  };

  // AI Risk Analysis
  const analyzeRisk = async () => {
    const { destination, travelDate } = formData;
    
    if (!destination || !travelDate) {
      setError('Please enter destination and travel date');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // Fetch real-time risk data from multiple sources
      const [weatherRisk, safetyData, healthAlerts, politicalClimate] = await Promise.all([
        fetchWeatherRisk(destination, travelDate),
        fetchSafetyData(destination),
        fetchHealthAlerts(destination),
        fetchPoliticalClimate(destination)
      ]);

      // Prepare AI risk analysis request
      const aiRequest = {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a travel risk assessment expert. Analyze multiple risk factors and provide comprehensive safety recommendations.'
          },
          {
            role: 'user',
            content: `Analyze travel risk for ${destination} on ${travelDate}.
            Weather data: ${JSON.stringify(weatherRisk)}.
            Safety data: ${JSON.stringify(safetyData)}.
            Health alerts: ${JSON.stringify(healthAlerts)}.
            Political climate: ${JSON.stringify(politicalClimate)}.
            Provide risk level (low/medium/high) and specific recommendations.`
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      };

      // Call AI service
      const response = await axios.post(AI_SERVICES.riskAnalysis, aiRequest, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Parse risk analysis
      const riskAnalysis = parseRiskResponse(response.data, {
        destination,
        travelDate,
        weatherRisk,
        safetyData,
        healthAlerts,
        politicalClimate
      });

      setRiskData(riskAnalysis);

      // Save risk analysis
      await saveRiskAnalysis({
        userId: user?.id,
        ...riskAnalysis,
        analyzedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error('AI Risk Analysis Error:', err);
      setError('Failed to analyze risk. Please try again.');
      
      // Fallback to sample risk data
      setRiskData(getSampleRiskData(destination));
    } finally {
      setGenerating(false);
    }
  };

  // Real-time Data Fetching Functions
  const fetchWeatherData = async (destination) => {
    try {
      // Use OpenWeatherMap or similar service
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${destination},BD&appid=${process.env.REACT_APP_WEATHER_API_KEY}&units=metric`
      );
      return response.data;
    } catch (err) {
      console.error('Weather data error:', err);
      return getFallbackWeather(destination);
    }
  };

  const fetchWeatherRisk = async (destination, date) => {
    try {
      // Historical weather data for risk assessment
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${destination},BD&appid=${process.env.REACT_APP_WEATHER_API_KEY}`
      );
      return analyzeWeatherRisk(response.data, date);
    } catch (err) {
      console.error('Weather risk error:', err);
      return { risk: 'Medium', factors: ['Limited weather data available'] };
    }
  };

  const fetchTransportOptions = async (destination) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transportation`, {
        params: { to: destination, availableSeats: { $gt: 0 } }
      });
      return response.data.transportation || [];
    } catch (err) {
      console.error('Transport data error:', err);
      return [];
    }
  };

  const fetchAccommodationOptions = async (destination, budget) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hosts`, {
        params: { 
          location: destination,
          price: { $lte: parseInt(budget) || 10000 },
          available: true
        }
      });
      return response.data.hosts || [];
    } catch (err) {
      console.error('Accommodation data error:', err);
      return [];
    }
  };

  const fetchSafetyData = async (destination) => {
    try {
      // Use government travel advisory or safety API
      const response = await axios.get(
        `https://travel-advisory.info/api/v1?countrycode=BD&placename=${destination}`
      );
      return response.data;
    } catch (err) {
      console.error('Safety data error:', err);
      return { advisory: 'Exercise normal precautions', level: 1 };
    }
  };

  const fetchHealthAlerts = async (destination) => {
    try {
      // World Health Organization or local health department API
      const response = await axios.get(
        `https://disease.sh/v3/covid-19/countries/BD`
      );
      return response.data;
    } catch (err) {
      console.error('Health data error:', err);
      return { alerts: [], status: 'Normal' };
    }
  };

  const fetchPoliticalClimate = async (destination) => {
    try {
      // News API or political stability index
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${destination}+Bangladesh+stability&apiKey=${process.env.REACT_APP_NEWS_API_KEY}`
      );
      return { articles: response.data.articles || [], stability: 'Stable' };
    } catch (err) {
      console.error('Political data error:', err);
      return { stability: 'Generally stable', updates: [] };
    }
  };

  // Database Save Functions
  const saveMoodAnalysis = async (data) => {
    try {
      await axios.post(`${API_BASE_URL}/ai/mood-analysis`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Save mood analysis error:', err);
    }
  };

  const saveGeneratedItinerary = async (data) => {
    try {
      await axios.post(`${API_BASE_URL}/ai/itineraries`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Save itinerary error:', err);
    }
  };

  const saveRiskAnalysis = async (data) => {
    try {
      await axios.post(`${API_BASE_URL}/ai/risk-analyses`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Save risk analysis error:', err);
    }
  };

  // Response Parsing Functions
  const parseAIResponse = (aiResponse) => {
    try {
      const content = aiResponse.choices[0]?.message?.content;
      if (!content) return getSampleDestinations(selectedMood);

      // Parse JSON or structured text from AI
      const lines = content.split('\n').filter(line => line.trim());
      const destinations = lines.slice(0, 4).map((line, index) => {
        const match = line.match(/(.+?):\s*(.+)/);
        return {
          id: index + 1,
          name: match ? match[1].trim() : `Destination ${index + 1}`,
          description: match ? match[2].trim() : 'Great destination for your mood',
          match: 85 + Math.random() * 15,
          image: getDestinationImage(match ? match[1].trim() : 'Bangladesh'),
          highlights: ['Local experience', 'Beautiful scenery', 'Cultural richness'],
          estimatedCost: `৳${Math.floor(5000 + Math.random() * 15000)}`,
          bestTime: 'Year-round'
        };
      });
      return destinations;
    } catch (err) {
      console.error('Parse AI response error:', err);
      return getSampleDestinations(selectedMood);
    }
  };

  const parseItineraryResponse = (aiResponse, context) => {
    try {
      const content = aiResponse.choices[0]?.message?.content;
      if (!content) return getSampleItinerary(context.destination);

      // Parse itinerary from AI response
      const days = [];
      const sections = content.split('Day');
      
      sections.forEach((section, index) => {
        if (index === 0 || !section.trim()) return;
        
        const lines = section.split('\n').filter(line => line.trim());
        const dayTitle = lines[0]?.split(':')[1]?.trim() || `Day ${index} activities`;
        
        const activities = lines.slice(1).map(line => {
          const timeMatch = line.match(/(\d{1,2}[:.]\d{2}\s*(?:AM|PM|am|pm)?)/);
          const activity = timeMatch ? line.replace(timeMatch[0], '').trim() : line.trim();
          return {
            time: timeMatch ? timeMatch[0] : `${index + 8}:00 AM`,
            activity: activity,
            icon: getActivityIcon(activity)
          };
        });

        days.push({
          day: index,
          title: dayTitle,
          activities: activities.slice(0, 5)
        });
      });

      return {
        destination: context.destination,
        duration: context.duration,
        budget: context.budget,
        travelers: context.travelers,
        days: days.slice(0, parseInt(context.duration.split(' ')[0]) || 3),
        totalCost: context.budget,
        includes: ['Accommodation', 'Transportation', 'Activities', 'Meals'],
        recommendations: ['Book in advance', 'Carry local currency', 'Learn basic phrases']
      };
    } catch (err) {
      console.error('Parse itinerary error:', err);
      return getSampleItinerary(context.destination);
    }
  };

  const parseRiskResponse = (aiResponse, context) => {
    try {
      const content = aiResponse.choices[0]?.message?.content;
      if (!content) return getSampleRiskData(context.destination);

      // Parse risk analysis
      const riskLevelMatch = content.match(/Risk Level:\s*(Low|Medium|High)/i);
      const riskLevel = riskLevelMatch ? riskLevelMatch[1] : 'Medium';
      
      const factors = [];
      const factorRegex = /[-•*]\s*(.+?):\s*(.+?)(?=\n[-•*]|$)/g;
      let match;
      while ((match = factorRegex.exec(content)) !== null) {
        factors.push({
          category: match[1].trim(),
          description: match[2].trim(),
          risk: getRiskLevelFromText(match[2])
        });
      }

      const recommendations = [];
      const recRegex = /Recommendations?:\s*\n((?:[-•*].+\n?)+)/i;
      const recMatch = recRegex.exec(content);
      if (recMatch) {
        recMatch[1].split('\n').forEach(line => {
          if (line.trim().match(/^[-•*]/)) {
            recommendations.push(line.replace(/^[-•*]\s*/, '').trim());
          }
        });
      }

      return {
        overall: riskLevel + ' Risk',
        riskLevel: riskLevel === 'High' ? 75 : riskLevel === 'Medium' ? 50 : 25,
        destination: context.destination,
        travelDate: context.travelDate,
        factors: factors.slice(0, 4).map(factor => ({
          ...factor,
          icon: getRiskIcon(factor.category)
        })),
        recommendations: recommendations.slice(0, 5)
      };
    } catch (err) {
      console.error('Parse risk analysis error:', err);
      return getSampleRiskData(context.destination);
    }
  };

  // Helper functions
  const getDestinationImage = (destination) => {
    const images = {
      'Cox\'s Bazar': 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?w=1080&q=80',
      'Sajek Valley': 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=1080&q=80',
      'Sylhet': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80',
      'Bandarban': 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=1080&q=80',
      'Rangamati': 'https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?w=1080&q=80',
      'Sundarbans': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1080&q=80'
    };
    return images[destination] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80';
  };

  const getActivityIcon = (activity) => {
    if (activity.toLowerCase().includes('breakfast') || activity.toLowerCase().includes('lunch') || activity.toLowerCase().includes('dinner')) return 'food';
    if (activity.toLowerCase().includes('beach')) return 'beach';
    if (activity.toLowerCase().includes('check')) return 'home';
    if (activity.toLowerCase().includes('visit') || activity.toLowerCase().includes('tour')) return 'map';
    if (activity.toLowerCase().includes('sunset') || activity.toLowerCase().includes('sunrise')) return 'sun';
    return 'map';
  };

  const getRiskIcon = (category) => {
    const icons = {
      'Weather': Cloud,
      'Health': AlertTriangle,
      'Safety': AlertTriangle,
      'Political': Users,
      'Transportation': TrendingUp,
      'Budget': DollarSign
    };
    return icons[category] || AlertTriangle;
  };

  const getRiskLevelFromText = (text) => {
    if (text.toLowerCase().includes('low') || text.toLowerCase().includes('safe') || text.toLowerCase().includes('good')) return 'Low';
    if (text.toLowerCase().includes('high') || text.toLowerCase().includes('danger') || text.toLowerCase().includes('avoid')) return 'High';
    return 'Medium';
  };

  // Sample data fallbacks
  const getSampleDestinations = (mood) => {
    const sampleData = {
      adventure: [
        { id: 1, name: 'Sajek Valley', match: 95, image: getDestinationImage('Sajek Valley'), highlights: ['Trekking', 'Cloud views', 'Indigenous culture'], estimatedCost: '৳8,000 - ৳12,000', bestTime: 'October-March' },
        { id: 2, name: 'Bandarban', match: 92, image: getDestinationImage('Bandarban'), highlights: ['Mountain hiking', 'Waterfalls', 'Tribal villages'], estimatedCost: '৳7,000 - ৳15,000', bestTime: 'November-February' }
      ],
      relaxation: [
        { id: 1, name: 'Cox\'s Bazar', match: 98, image: getDestinationImage('Cox\'s Bazar'), highlights: ['Longest beach', 'Sunset views', 'Seafood'], estimatedCost: '৳10,000 - ৳20,000', bestTime: 'November-March' },
        { id: 2, name: 'Kuakata', match: 94, image: getDestinationImage('Kuakata'), highlights: ['Sunrise & sunset', 'Beach activities', 'Fishing villages'], estimatedCost: '৳6,000 - ৳12,000', bestTime: 'October-April' }
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
      },
      {
        day: 2,
        title: 'Exploration Day',
        activities: [
          { time: '8:00 AM', activity: 'Breakfast with host', icon: 'food' },
          { time: '10:00 AM', activity: 'Visit main attractions', icon: 'map' },
          { time: '1:00 PM', activity: 'Lunch at traditional spot', icon: 'food' },
          { time: '3:00 PM', activity: 'Cultural activities', icon: 'map' },
          { time: '7:00 PM', activity: 'Local cuisine dinner', icon: 'food' }
        ]
      },
      {
        day: 3,
        title: 'Departure',
        activities: [
          { time: '9:00 AM', activity: 'Final exploration', icon: 'map' },
          { time: '11:00 AM', activity: 'Checkout and departure', icon: 'home' }
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

  const getFallbackWeather = (destination) => ({
    temp: 25,
    condition: 'Clear',
    humidity: 65,
    forecast: 'Sunny with clear skies'
  });

  const analyzeWeatherRisk = (weatherData, date) => {
    // Simple weather risk analysis
    if (weatherData.list && weatherData.list[0]) {
      const main = weatherData.list[0].weather[0].main;
      if (main.includes('Rain') || main.includes('Storm')) {
        return { risk: 'High', factors: ['Heavy rainfall expected', 'Possible flooding'] };
      } else if (main.includes('Cloud')) {
        return { risk: 'Medium', factors: ['Cloudy conditions', 'Possible light showers'] };
      }
    }
    return { risk: 'Low', factors: ['Clear conditions', 'Good visibility'] };
  };

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
                                style={{ width: `${dest.match}%` }}
                              ></div>
                            </div>
                            <span className="text-white text-sm font-medium">{dest.match}% match</span>
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
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-2 font-medium">Travelers</label>
                  <input
                    type="number"
                    name="travelers"
                    value={formData.travelers}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-2 font-medium">Preferences (Optional)</label>
                  <input
                    type="text"
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleFormChange}
                    placeholder="e.g., cultural sites, adventure activities, food tours..."
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-semibold mb-1">{itineraryData.destination} Itinerary</h4>
                    <p className="text-sm text-gray-600">
                      {itineraryData.duration} • {itineraryData.budget} BDT • {itineraryData.travelers} traveler(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      Export PDF
                    </button>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                      Save Plan
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {itineraryData.days.map((day) => (
                    <div key={day.day} className="border-l-4 border-purple-500 pl-4 bg-gray-50 rounded-r-lg p-4">
                      <h4 className="text-lg font-semibold mb-3">Day {day.day}: {day.title}</h4>
                      <div className="space-y-3">
                        {day.activities.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
                            <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-sm font-medium">
                              {activity.time}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.activity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold mb-2">What's Included</h5>
                    <ul className="space-y-1">
                      {itineraryData.includes.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <span className="text-blue-500 mr-2">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-semibold mb-2">Recommendations</h5>
                    <ul className="space-y-1">
                      {itineraryData.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <span className="text-green-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
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
                      <p className="text-sm text-gray-600">For {riskData.destination} on {riskData.travelDate}</p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full font-semibold ${
                        riskData.riskLevel < 40
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : riskData.riskLevel < 70
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {riskData.overall}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-1000 ${
                        riskData.riskLevel < 40
                          ? 'bg-green-500'
                          : riskData.riskLevel < 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${riskData.riskLevel}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Low Risk</span>
                    <span>Medium Risk</span>
                    <span>High Risk</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <h5 className="font-semibold">Risk Factors Analysis</h5>
                  {riskData.factors.map((factor, index) => {
                    const Icon = factor.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{factor.category}</h4>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium ${
                                factor.risk === 'Low'
                                  ? 'bg-green-100 text-green-700'
                                  : factor.risk === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {factor.risk} Risk
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{factor.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold mb-3">Safety Recommendations</h5>
                  <ul className="space-y-2">
                    {riskData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>Note: Risk analysis is generated using real-time data and AI algorithms. Always check official travel advisories before your trip.</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Recent AI Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent AI Activity</h3>
        <div className="space-y-3">
          {userTrips.slice(0, 3).map((trip, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-medium">{trip.destination}</p>
                <p className="text-sm text-gray-600">{trip.date} • {trip.status}</p>
              </div>
              <button className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                Re-analyze
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TravelAI;