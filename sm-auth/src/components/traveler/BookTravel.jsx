import { useState, useEffect } from 'react';
import { 
  Home, Search, Filter, Star, MapPin, Languages, Shield, Calendar, X, Check, 
  CreditCard, Users, CheckCircle2, Lock, Loader, Send, AlertCircle, Clock, 
  Users2, ChevronDown, Eye, EyeOff
} from 'lucide-react';

// ==================== API CONFIGURATION ====================
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// ==================== HELPER FUNCTIONS ====================

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateToInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getColorFromName = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Avatar component
const AvatarWithInitials = ({ image, name, className = 'w-12 h-12' }) => {
  const [imageError, setImageError] = useState(false);

  if (image && !imageError) {
    return (
      <img 
        src={image} 
        alt={name}
        className={`${className} rounded-full border-2 border-blue-100 object-cover`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${className} rounded-full border-2 border-blue-100 flex items-center justify-center font-bold text-white text-lg ${getColorFromName(name)}`}>
      {getInitials(name)}
    </div>
  );
};

// Default location images
const getLocationImage = (location) => {
  const defaultImages = {
    "Cox's Bazar": 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    'Sajek Valley': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'Sylhet': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    'Bandarban': 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=800&q=80',
    'Rangamati': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    'Sundarbans': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    'Dhaka': 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?w=800&q=80',
    'Chittagong': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  };
  
  return defaultImages[location] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80';
};

// ==================== MAIN COMPONENT ====================

export function BookTravel() {
  // ========== STATE MANAGEMENT ==========
  
  // Hosts and loading
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    verified: false,
    minRating: 0,
    languages: []
  });

  // Modal states
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBookingRequestModal, setShowBookingRequestModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);

  // Message form
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('General Inquiry');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');

  // Booking request form
  const [bookingRequestForm, setBookingRequestForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    selectedServices: [],
    specialRequests: ''
  });
  const [dateValidationError, setDateValidationError] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // ========== FETCH HOSTS ==========

  useEffect(() => {
    fetchHosts();
  }, [searchTerm, selectedFilters]);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall('/host-services');
      
      const mappedHosts = data.services
        .filter(service => service.available !== undefined ? service.available : true)
        .map(service => {
          const hostInfo = service.hostId || {};
          
          return {
            id: service._id,
            serviceId: service._id,
            name: service.name,
            location: service.location,
            rating: service.rating || 4.5,
            reviews: service.reviews || 0,
            verified: hostInfo.verified || false,
            languages: hostInfo.languages || ['English', 'Bengali'],
            price: service.price,
            image: hostInfo.image || null,
            propertyImage: service.propertyImage || null,
            services: service.serviceType || [],
            available: service.available !== undefined ? service.available : true,
            availableFromDate: service.availableFromDate,
            availableToDate: service.availableToDate,
            description: service.description || `Experience ${service.location}`,
            experience: service.experience || 'Intermediate',
            responseTime: service.responseTime || 'Within 1 hour',
            cancellationPolicy: service.cancellationPolicy || 'Flexible',
            maxGuests: service.maxGuests || 4,
            minStay: service.minStay || 1,
            hostId: hostInfo._id || service.hostId,
            hostName: hostInfo.name || 'Host',
            hostEmail: hostInfo.email,
            hostPhone: hostInfo.phone,
            totalBookings: service.totalBookings || 0,
            responseRate: hostInfo.responseRate || 95
          };
        });
      
      let filtered = mappedHosts;
      
      if (searchTerm) {
        filtered = filtered.filter(host => 
          host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          host.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedFilters.minRating > 0) {
        filtered = filtered.filter(host => host.rating >= selectedFilters.minRating);
      }
      
      if (selectedFilters.verified) {
        filtered = filtered.filter(host => host.verified);
      }
      
      setHosts(filtered);
    } catch (err) {
      console.error('Error fetching hosts:', err);
      setError(err.message || 'Failed to fetch hosts');
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  // ========== BOOKING REQUEST HANDLERS ==========

  const openBookingRequest = (host) => {
    setSelectedHost(host);
    setShowBookingRequestModal(true);
    setDateValidationError('');
    
    let defaultCheckIn = getTodayDate();
    if (host.availableFromDate) {
      const availFrom = new Date(host.availableFromDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (availFrom > today) {
        defaultCheckIn = formatDateToInput(availFrom);
      }
    }
    
    setBookingRequestForm({
      checkIn: defaultCheckIn,
      checkOut: '',
      guests: 1,
      selectedServices: [],
      specialRequests: ''
    });
  };

  const isDateRangeValid = () => {
    if (!selectedHost || !bookingRequestForm.checkIn || !bookingRequestForm.checkOut) {
      return false;
    }

    const checkIn = new Date(bookingRequestForm.checkIn);
    const checkOut = new Date(bookingRequestForm.checkOut);
    const availFrom = new Date(selectedHost.availableFromDate);
    const availTo = new Date(selectedHost.availableToDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return checkIn >= availFrom && checkOut <= availTo && checkIn >= today && checkIn < checkOut;
  };

  const getDateValidationError = () => {
    if (!selectedHost) return '';
    if (!bookingRequestForm.checkIn || !bookingRequestForm.checkOut) {
      return '';
    }

    const checkIn = new Date(bookingRequestForm.checkIn);
    const checkOut = new Date(bookingRequestForm.checkOut);
    const availFrom = new Date(selectedHost.availableFromDate);
    const availTo = new Date(selectedHost.availableToDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return 'Check-in date cannot be in the past';
    }
    if (checkIn < availFrom) {
      return `Check-in date cannot be before ${formatDate(selectedHost.availableFromDate)}`;
    }
    if (checkOut > availTo) {
      return `Check-out date cannot be after ${formatDate(selectedHost.availableToDate)}`;
    }
    if (checkIn >= checkOut) {
      return 'Check-out date must be after check-in date';
    }

    return '';
  };

  const submitBookingRequest = async () => {
    const error = getDateValidationError();
    if (error) {
      setDateValidationError(error);
      return;
    }

    if (!isDateRangeValid()) {
      setDateValidationError('Invalid booking dates');
      return;
    }

    setSubmittingRequest(true);

    try {
      const requestData = {
        bookingType: 'host',
        serviceId: selectedHost.serviceId,
        hostId: selectedHost.hostId,
        checkIn: bookingRequestForm.checkIn,
        checkOut: bookingRequestForm.checkOut,
        guests: bookingRequestForm.guests,
        selectedServices: bookingRequestForm.selectedServices,
        notes: bookingRequestForm.specialRequests || `Booking request for ${selectedHost.name}`
      };

      const response = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      console.log('✅ Booking request sent:', response);
      
      setRequestSuccess(true);
      setShowBookingRequestModal(false);

      // Show success message for 3 seconds
      setTimeout(() => {
        setRequestSuccess(false);
        fetchHosts(); // Refresh the list
      }, 3000);

    } catch (err) {
      console.error('Error submitting booking request:', err);
      setDateValidationError(err.message || 'Failed to send booking request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // ========== MESSAGE HANDLERS ==========

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setMessageError('Message cannot be empty');
      return;
    }

    setSendingMessage(true);
    setMessageError('');
    
    try {
      // In production, this would send to your backend
      console.log('Message sent:', {
        to: selectedHost.hostId,
        subject: messageSubject,
        content: messageContent
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`Message sent to ${selectedHost.hostName}! They typically respond within ${selectedHost.responseTime}.`);
      
      setMessageContent('');
      setMessageSubject('General Inquiry');
      setShowMessageModal(false);
    } catch (err) {
      setMessageError(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const toggleService = (service) => {
    setBookingRequestForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  const calculateNights = () => {
    if (!bookingRequestForm.checkIn || !bookingRequestForm.checkOut) return 0;
    const checkIn = new Date(bookingRequestForm.checkIn);
    const checkOut = new Date(bookingRequestForm.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  // ========== RENDER ==========

  const filteredHosts = hosts.filter(host => {
    const matchesSearch = !searchTerm || 
      host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerified = !selectedFilters.verified || host.verified;
    const matchesRating = host.rating >= selectedFilters.minRating;
    
    return matchesSearch && matchesVerified && matchesRating;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-300 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Discover Local Hosts</h2>
        <p className="text-blue-100">Book authentic experiences with verified local hosts across Bangladesh</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3 flex-wrap md:flex-nowrap">
        <div className="flex-1 min-w-xs relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service names or locations..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-4 rounded-xl flex items-center gap-2 border-2 transition-all whitespace-nowrap ${
            showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFilters.verified}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, verified: e.target.checked })}
                  className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Verified Hosts Only</span>
              </label>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700 font-medium">Minimum Rating</label>
              <select
                value={selectedFilters.minRating}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, minRating: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-800">
          <p className="font-medium">Error loading services</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Loading host services...</span>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && filteredHosts.length === 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">No host services found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedFilters({ verified: false, minRating: 0, languages: [] });
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Hosts List */}
      {!loading && !error && filteredHosts.length > 0 && (
        <div className="space-y-4">
          {filteredHosts.map((host) => (
            <div 
              key={host.id} 
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="md:flex">
                {/* Image */}
                <div className="md:w-80 h-64 md:h-auto relative overflow-hidden bg-gray-100">
                  <img
                    src={host.propertyImage || getLocationImage(host.location)}
                    alt={host.location}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = getLocationImage(host.location);
                    }}
                  />
                  
                  {host.verified && (
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold">Verified</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col">
                  {/* Host Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <AvatarWithInitials 
                          image={host.image} 
                          name={host.hostName}
                          className="w-14 h-14"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{host.hostName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span>{host.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users2 className="w-3 h-3" />
                            <span>{host.totalBookings} completed bookings</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl text-blue-600 font-bold">৳{host.price}</div>
                          <div className="text-xs text-gray-500">per day</div>
                        </div>
                      </div>

                      {/* Service Name and Description */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">{host.name}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                          {host.description}
                        </p>
                      </div>

                      {/* Availability */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-sm text-blue-900">Available Period</span>
                        </div>
                        <div className="text-sm text-blue-800">
                          <span className="font-medium">{formatDate(host.availableFromDate)}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium">{formatDate(host.availableToDate)}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{host.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-600">({host.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Responds in {host.responseTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{host.responseRate}% response</span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span>Max {host.maxGuests} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>Min {host.minStay} night(s)</span>
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex items-center gap-2 mb-4">
                        <Languages className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{host.languages.join(', ')}</span>
                      </div>

                      {/* Services Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {host.services.map((service, index) => (
                          <span 
                            key={index} 
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 flex-wrap">
                    <button
                      disabled={!host.available}
                      onClick={() => openBookingRequest(host)}
                      className={`px-6 py-3 rounded-xl transition-all font-medium ${
                        host.available
                          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {host.available ? 'Request Booking' : 'Unavailable'}
                    </button>
                    <button 
                      className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700" 
                      onClick={() => {
                        setSelectedHost(host);
                        setShowHostProfile(true);
                      }}
                    >
                      View Profile
                    </button>
                    <button 
                      className="px-5 py-3 border-2 border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium flex items-center gap-2" 
                      onClick={() => {
                        setSelectedHost(host);
                        setShowMessageModal(true);
                        setMessageError('');
                      }}
                    >
                      <Send className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="mb-2 text-blue-900 font-semibold">Request-Based Booking with Host Approval</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              📌 Send a booking request → Host reviews and accepts → Payment after acceptance. 
              A 15% platform fee applies. Full refund available if the host declines.
            </p>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Host Profile Modal */}
      {showHostProfile && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AvatarWithInitials 
                  image={selectedHost.image} 
                  name={selectedHost.hostName}
                  className="w-16 h-16"
                />
                <div>
                  <h3 className="text-2xl font-bold">{selectedHost.hostName}</h3>
                  <p className="text-blue-100 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedHost.location}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowHostProfile(false)} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Property Image */}
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={selectedHost.propertyImage || getLocationImage(selectedHost.location)} 
                  alt={selectedHost.location} 
                  className="w-full h-80 object-cover" 
                  onError={(e) => {
                    e.target.src = getLocationImage(selectedHost.location);
                  }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-yellow-700">{selectedHost.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{selectedHost.reviews}</div>
                  <div className="text-xs text-gray-600">Reviews</div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">{selectedHost.totalBookings}</div>
                  <div className="text-xs text-gray-600">Bookings</div>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{selectedHost.responseRate}%</div>
                  <div className="text-xs text-gray-600">Response</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-lg mb-3 text-gray-800">{selectedHost.name}</h4>
                <p className="text-gray-700 leading-relaxed">{selectedHost.description}</p>
              </div>

              {/* Availability */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-900">Availability Period</span>
                </div>
                <div className="text-blue-800">
                  <p className="text-sm">
                    <span className="font-semibold">{formatDate(selectedHost.availableFromDate)}</span>
                    <span className="mx-2">→</span>
                    <span className="font-semibold">{formatDate(selectedHost.availableToDate)}</span>
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 block mb-2">Experience Level</span>
                  <span className="text-lg text-gray-900">{selectedHost.experience}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 block mb-2">Response Time</span>
                  <span className="text-lg text-gray-900">{selectedHost.responseTime}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 block mb-2">Cancellation</span>
                  <span className="text-lg text-gray-900">{selectedHost.cancellationPolicy}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 block mb-2">Price</span>
                  <span className="text-lg text-blue-600 font-bold">৳{selectedHost.price}/day</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 block mb-2">Max Guests</span>
                  <span className="text-lg text-gray-900">{selectedHost.maxGuests}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700 block mb-2">Min Stay</span>
                  <span className="text-lg text-gray-900">{selectedHost.minStay} night(s)</span>
                </div>
              </div>

              {/* Languages */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Languages Spoken</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHost.languages.map((lang, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Services Offered</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedHost.services.map((service, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close and Book Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowHostProfile(false)}
                  className="py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowHostProfile(false);
                    openBookingRequest(selectedHost);
                  }}
                  className="py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium"
                >
                  Request Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">Message Host</h3>
                <p className="text-green-100 text-sm">Send a message to {selectedHost.hostName}</p>
              </div>
              <button 
                onClick={() => setShowMessageModal(false)} 
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Host Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <AvatarWithInitials 
                  image={selectedHost.image} 
                  name={selectedHost.hostName}
                  className="w-12 h-12"
                />
                <div>
                  <div className="font-bold text-gray-900">{selectedHost.hostName}</div>
                  <div className="text-sm text-gray-600">{selectedHost.location}</div>
                </div>
              </div>

              {messageError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{messageError}</p>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
                <select 
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>General Inquiry</option>
                  <option>Booking Question</option>
                  <option>Service Details</option>
                  <option>Availability Check</option>
                  <option>Custom Request</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Your Message</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={5}
                />
              </div>

              {/* Response Time Hint */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                💡 {selectedHost.hostName} responds within {selectedHost.responseTime}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageContent('');
                    setMessageSubject('General Inquiry');
                  }}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageContent.trim()}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2"
                >
                  {sendingMessage ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Request Modal */}
      {showBookingRequestModal && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-1">Request Booking</h3>
                <p className="text-blue-100 text-sm">Request a booking from {selectedHost.hostName} in {selectedHost.location}</p>
              </div>
              <button 
                onClick={() => setShowBookingRequestModal(false)} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
              <div className="p-6 space-y-6">
                {/* Host Summary */}
                <div className="flex gap-5 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <img 
                    src={selectedHost.propertyImage || getLocationImage(selectedHost.location)} 
                    alt={selectedHost.location} 
                    className="w-32 h-32 object-cover rounded-xl shadow-md" 
                    onError={(e) => {
                      e.target.src = getLocationImage(selectedHost.location);
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AvatarWithInitials 
                        image={selectedHost.image} 
                        name={selectedHost.hostName}
                        className="w-10 h-10"
                      />
                      <div>
                        <h4 className="text-lg font-bold">{selectedHost.hostName}</h4>
                        <p className="text-sm text-gray-600">{selectedHost.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{selectedHost.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-2xl text-blue-600 font-bold">৳{selectedHost.price}<span className="text-sm text-gray-500">/day</span></div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {dateValidationError && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{dateValidationError}</p>
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700 font-semibold">Select Your Dates</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-2 text-gray-500">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={bookingRequestForm.checkIn}
                          onChange={(e) => {
                            setBookingRequestForm({ ...bookingRequestForm, checkIn: e.target.value });
                            setDateValidationError('');
                          }}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={formatDateToInput(new Date(selectedHost.availableFromDate))}
                          max={formatDateToInput(new Date(selectedHost.availableToDate))}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Available: {formatDate(selectedHost.availableFromDate)} to {formatDate(selectedHost.availableToDate)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs mb-2 text-gray-500">Check-out</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={bookingRequestForm.checkOut}
                          onChange={(e) => {
                            setBookingRequestForm({ ...bookingRequestForm, checkOut: e.target.value });
                            setDateValidationError('');
                          }}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={bookingRequestForm.checkIn || formatDateToInput(new Date(selectedHost.availableFromDate))}
                          max={formatDateToInput(new Date(selectedHost.availableToDate))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700 font-semibold">Number of Guests</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <Users className="w-5 h-5 text-gray-400" />
                    <button
                      onClick={() => setBookingRequestForm({ ...bookingRequestForm, guests: Math.max(1, bookingRequestForm.guests - 1) })}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xl w-16 text-center font-bold">{bookingRequestForm.guests}</span>
                    <button
                      onClick={() => setBookingRequestForm({ ...bookingRequestForm, guests: Math.min(selectedHost.maxGuests || 10, bookingRequestForm.guests + 1) })}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white font-bold transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600">guests (max {selectedHost.maxGuests || 10})</span>
                  </div>
                </div>

                {/* Services Selection */}
                {selectedHost.services.length > 0 && (
                  <div>
                    <label className="block text-sm mb-3 text-gray-700 font-semibold">Select Services (Optional)</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedHost.services.map((service) => (
                        <label 
                          key={service} 
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            bookingRequestForm.selectedServices.includes(service) 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={bookingRequestForm.selectedServices.includes(service)}
                            onChange={() => toggleService(service)}
                            className="w-5 h-5 text-blue-500 rounded border-gray-300 cursor-pointer"
                          />
                          <span className="flex-1 font-medium text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700 font-semibold">Special Requests (Optional)</label>
                  <textarea
                    value={bookingRequestForm.specialRequests}
                    onChange={(e) => setBookingRequestForm({ ...bookingRequestForm, specialRequests: e.target.value })}
                    placeholder="Any special requests or notes for the host..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* Price Summary */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="mb-4 font-bold text-gray-800">Booking Summary</h4>
                  <div className="space-y-3 mb-5 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nights: {calculateNights()}</span>
                      <span className="font-medium">
                        ৳{selectedHost.price} × {calculateNights()} = ৳{selectedHost.price * calculateNights()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform fee (15%)</span>
                      <span className="font-medium">৳{Math.round(selectedHost.price * calculateNights() * 0.15)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                      <span className="text-lg font-bold text-gray-800">Estimated Total</span>
                      <span className="text-3xl text-blue-600 font-bold">
                        ৳{selectedHost.price * calculateNights() + Math.round(selectedHost.price * calculateNights() * 0.15)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-5">
                    <p className="text-sm text-blue-800">
                      <strong>💡 How it works:</strong> Send a request to the host. They'll review and accept or decline. 
                      Payment is processed only after the host accepts your request.
                    </p>
                  </div>

                  <button
                    onClick={submitBookingRequest}
                    disabled={!isDateRangeValid() || submittingRequest}
                    className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold transition-all"
                  >
                    {submittingRequest ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Booking Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {requestSuccess && (
        <div className="fixed bottom-8 right-8 bg-white border-2 border-green-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 max-w-md">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900">Request Sent! 🎉</div>
            <div className="text-sm text-gray-600">The host will review your request shortly.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookTravel;