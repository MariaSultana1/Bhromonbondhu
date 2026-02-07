//BookTickets.jsx
import React, { useState } from 'react';
import { Search, Calendar, MapPin, Users, ArrowRight, Bus, Train, Plane, SlidersHorizontal, Sparkles } from 'lucide-react';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Cities with airports in Bangladesh
const CITIES_WITH_AIRPORTS = [
  'Dhaka',
  'Chittagong',
  "Cox's Bazar",
  'Sylhet',
  'Jessore',
  'Rajshahi',
  'Barisal',
  'Saidpur'
];

// All major cities/stations in Bangladesh (for bus and train)
const ALL_LOCATIONS = [
  'Dhaka', 'Chittagong', "Cox's Bazar", 'Sylhet', 'Rangamati', 
  'Khulna', 'Rajshahi', 'Jessore', 'Bogra', 'Mymensingh',
  'Comilla', 'Barisal', 'Rangpur', 'Dinajpur', 'Kushtia',
  'Srimangal', "Saint Martin's Island", 'Bandarban', 'Paharpur'
];

// Popular routes in Bangladesh
const POPULAR_ROUTES = {
  bus: [
    { from: 'Dhaka', to: 'Chittagong', icon: '🌊' },
    { from: 'Dhaka', to: "Cox's Bazar", icon: '🏖️' },
    { from: 'Dhaka', to: 'Sylhet', icon: '🌿' },
    { from: 'Dhaka', to: 'Rangamati', icon: '⛰️' },
    { from: 'Chittagong', to: "Cox's Bazar", icon: '🏝️' },
    { from: 'Dhaka', to: 'Khulna', icon: '🐯' }
  ],
  train: [
    { from: 'Dhaka', to: 'Chittagong', icon: '🌊' },
    { from: 'Dhaka', to: 'Sylhet', icon: '🌿' },
    { from: 'Dhaka', to: 'Rajshahi', icon: '🏛️' },
    { from: 'Dhaka', to: 'Khulna', icon: '🐯' },
    { from: 'Chittagong', to: 'Sylhet', icon: '🚂' },
    { from: 'Dhaka', to: 'Rangpur', icon: '🌾' }
  ],
  flight: [
    { from: 'Dhaka', to: "Cox's Bazar", icon: '🏖️' },
    { from: 'Dhaka', to: 'Chittagong', icon: '🌊' },
    { from: 'Dhaka', to: 'Sylhet', icon: '🌿' },
    { from: 'Dhaka', to: 'Jessore', icon: '✈️' }
  ]
};

const TRAVEL_CLASSES = {
  bus: ['AC', 'Non-AC', 'Sleeper', 'Business Class'],
  train: ['Shovan', 'Shovan Chair', 'First Class', 'Snigdha', 'AC Chair', 'AC Berth'],
  flight: ['Economy', 'Business Class']
};

export function BookTickets({ onSearch }) {
  const [transportType, setTransportType] = useState('bus');
  const [tripType, setTripType] = useState('oneWay');
  const [showFilters, setShowFilters] = useState(false);
  
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: getTodayDate(),
    returnDate: '',
    transportType: 'bus',
    passengers: 1,
    class: ''
  });

  const getAvailableLocations = () => {
    return transportType === 'flight' ? CITIES_WITH_AIRPORTS : ALL_LOCATIONS;
  };

  const getCurrentPopularRoutes = () => {
    return POPULAR_ROUTES[transportType] || POPULAR_ROUTES.bus;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      alert('Please fill in all required fields');
      return;
    }

    onSearch({
      ...searchParams,
      transportType
    });
  };

  const handleQuickRoute = (from, to) => {
    setSearchParams(prev => ({ ...prev, from, to }));
  };

  const handleTransportTypeChange = (type) => {
    setTransportType(type);
    // Reset from/to if current selection is not valid for flights
    if (type === 'flight') {
      if (!CITIES_WITH_AIRPORTS.includes(searchParams.from)) {
        setSearchParams(prev => ({ ...prev, from: '', to: '', class: '' }));
      } else if (!CITIES_WITH_AIRPORTS.includes(searchParams.to)) {
        setSearchParams(prev => ({ ...prev, to: '', class: '' }));
      } else {
        setSearchParams(prev => ({ ...prev, class: '' }));
      }
    } else {
      setSearchParams(prev => ({ ...prev, class: '' }));
    }
  };

  const transportOptions = [
    { type: 'bus', icon: Bus, label: 'Bus', color: 'blue' },
    { type: 'train', icon: Train, label: 'Train', color: 'green' },
    { type: 'flight', icon: Plane, label: 'Flight', color: 'purple' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-400 rounded-2xl p-8 text-white">
        <h2 className="text-2xl mb-2">Book Your Journey</h2>
        <p className="text-purple-100">Find and book bus, train, and flight tickets across Bangladesh</p>
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {/* Transport Type Selector */}
        <div className="flex gap-3 mb-8">
          {transportOptions.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => handleTransportTypeChange(type)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                transportType === type
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Trip Type */}
        <div className="flex gap-3 mb-8 p-2 bg-gray-50 rounded-xl inline-flex">
          <button
            onClick={() => setTripType('oneWay')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              tripType === 'oneWay'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            One Way
          </button>
          <button
            onClick={() => setTripType('roundTrip')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              tripType === 'roundTrip'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Round Trip
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* From */}
            <div className="relative">
              <label className="block text-sm mb-2 text-gray-700">
                From {transportType === 'flight' && <span className="text-xs text-purple-600">(Airports only)</span>}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={searchParams.from}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  required
                >
                  <option value="">Select origin</option>
                  {getAvailableLocations().map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* To */}
            <div className="relative">
              <label className="block text-sm mb-2 text-gray-700">
                To {transportType === 'flight' && <span className="text-xs text-purple-600">(Airports only)</span>}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={searchParams.to}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  required
                >
                  <option value="">Select destination</option>
                  {getAvailableLocations()
                    .filter(location => location !== searchParams.from)
                    .map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="relative">
              <label className="block text-sm mb-2 text-gray-700">
                Journey Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                  min={getTodayDate()}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Return Date */}
            {tripType === 'roundTrip' && (
              <div className="relative">
                <label className="block text-sm mb-2 text-gray-700">
                  Return Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchParams.returnDate}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                    min={searchParams.date || getTodayDate()}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Passengers */}
            <div className="relative">
              <label className="block text-sm mb-2 text-gray-700">
                Passengers
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={searchParams.passengers}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 1 && value <= 9) {
                      setSearchParams(prev => ({ ...prev, passengers: value }));
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Class */}
            <div className="relative">
              <label className="block text-sm mb-2 text-gray-700">
                Class (Optional)
              </label>
              <select
                value={searchParams.class}
                onChange={(e) => setSearchParams(prev => ({ ...prev, class: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Any Class</option>
                {TRAVEL_CLASSES[transportType].map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Search className="w-5 h-5" />
            <span className="text-lg">Search {transportType === 'bus' ? 'Buses' : transportType === 'train' ? 'Trains' : 'Flights'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Popular Routes */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl">Popular {transportType === 'bus' ? 'Bus' : transportType === 'train' ? 'Train' : 'Flight'} Routes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getCurrentPopularRoutes().map((route, index) => (
            <button
              key={index}
              onClick={() => handleQuickRoute(route.from, route.to)}
              className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{route.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{route.from}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    <span className="font-medium text-gray-900">{route.to}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="mb-2 text-blue-900">Book with Confidence</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Compare prices from trusted operators, get instant booking confirmations, and enjoy secure payment with escrow protection. 
              {transportType === 'flight' && ' Limited airports available: Dhaka, Chittagong, Cox\'s Bazar, Sylhet, Jessore, Rajshahi, Barisal, and Saidpur.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}