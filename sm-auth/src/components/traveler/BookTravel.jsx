import { useState, useEffect } from 'react';
import { 
  Home, Search, Filter, Star, MapPin, Languages, Shield, Calendar, X, Check, 
  CreditCard, Users, CheckCircle2, Lock, Loader, Send, AlertCircle, Clock, 
  Users2, ChevronDown, Eye, EyeOff
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => localStorage.getItem('token');

const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

const getTodayDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const formatDateToInput = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateString; }
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
};

const getColorFromName = (name) => {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const AvatarWithInitials = ({ image, name, className = 'w-12 h-12' }) => {
  const [imageError, setImageError] = useState(false);
  if (image && !imageError) {
    return <img src={image} alt={name} className={`${className} rounded-full border-2 border-blue-100 object-cover`} onError={() => setImageError(true)} />;
  }
  return (
    <div className={`${className} rounded-full border-2 border-blue-100 flex items-center justify-center font-bold text-white text-lg ${getColorFromName(name)}`}>
      {getInitials(name)}
    </div>
  );
};

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

// ==================== SUCCESS TOAST COMPONENT ====================
const SuccessToast = ({ message, subMessage, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 z-[9999] animate-in slide-in-from-bottom-4">
      <div className="bg-white border-2 border-green-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
          <Check className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">{message}</div>
          {subMessage && <div className="text-sm text-gray-600 mt-0.5">{subMessage}</div>}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

// ==================== ERROR TOAST COMPONENT ====================
const ErrorToast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <div className="bg-white border-2 border-red-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">Booking Failed</div>
          <div className="text-sm text-gray-600 mt-0.5">{message}</div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export function BookTravel({ tripParams = null, onBack = null }) {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({ verified: false, minRating: 0 });

  const [showHostProfile, setShowHostProfile] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showBookingRequestModal, setShowBookingRequestModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);

  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('General Inquiry');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');

  const [bookingRequestForm, setBookingRequestForm] = useState({
    checkIn: '', checkOut: '', guests: 1, selectedServices: [], specialRequests: ''
  });
  const [dateValidationError, setDateValidationError] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message, subMessage }

  // ✅ URL params - read transportTicketId and trip info from AllTrips navigation
  const [urlParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      transportTicketId: params.get('transportTicketId') || '',
      fromTrips: params.get('fromTrips') === 'true',
      tripId: params.get('tripId') || '',
      checkIn: params.get('checkIn') || '',
      checkOut: params.get('checkOut') || '',
      guests: parseInt(params.get('guests') || '1', 10),
      destination: params.get('destination') || ''
    };
  });

  // ✅ Merge tripParams prop with urlParams (tripParams takes precedence)
  const effectiveParams = (() => {
    if (tripParams) {
      return {
        transportTicketId: tripParams.transportTicketId || urlParams.transportTicketId,
        fromTrips: true,
        tripId: tripParams.tripId || urlParams.tripId,
        checkIn: tripParams.checkIn || urlParams.checkIn,
        checkOut: tripParams.checkOut || urlParams.checkOut,
        guests: tripParams.guests || urlParams.guests,
        destination: tripParams.destination || urlParams.destination
      };
    }
    return urlParams;
  })();

  const showToast = (type, message, subMessage = '') => {
    setToast({ type, message, subMessage });
  };

  const hideToast = () => setToast(null);

  useEffect(() => { fetchHosts(); }, [searchTerm, selectedFilters]);

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
            totalBookings: service.totalBookings || 0,
            responseRate: hostInfo.responseRate || 95
          };
        });

      let filtered = mappedHosts;
      if (searchTerm) filtered = filtered.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.location.toLowerCase().includes(searchTerm.toLowerCase()));
      if (selectedFilters.minRating > 0) filtered = filtered.filter(h => h.rating >= selectedFilters.minRating);
      if (selectedFilters.verified) filtered = filtered.filter(h => h.verified);
      setHosts(filtered);
    } catch (err) {
      setError(err.message || 'Failed to fetch hosts');
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  const openBookingRequest = (host) => {
    setSelectedHost(host);
    setDateValidationError('');
    // ✅ Pre-fill dates from params if coming from AllTrips
    let defaultCheckIn = effectiveParams.checkIn || getTodayDate();
    let defaultCheckOut = effectiveParams.checkOut || '';
    let defaultGuests = effectiveParams.guests || 1;

    if (!effectiveParams.checkIn && host.availableFromDate) {
      const availFrom = new Date(host.availableFromDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (availFrom > today) defaultCheckIn = formatDateToInput(availFrom);
    }
    setBookingRequestForm({ checkIn: defaultCheckIn, checkOut: defaultCheckOut, guests: defaultGuests, selectedServices: [], specialRequests: '' });
    setShowBookingRequestModal(true);
  };

  const isDateRangeValid = () => {
    if (!selectedHost || !bookingRequestForm.checkIn || !bookingRequestForm.checkOut) return false;
    const checkIn = new Date(bookingRequestForm.checkIn);
    const checkOut = new Date(bookingRequestForm.checkOut);
    const availFrom = new Date(selectedHost.availableFromDate);
    const availTo = new Date(selectedHost.availableToDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return checkIn >= availFrom && checkOut <= availTo && checkIn >= today && checkIn < checkOut;
  };

  const getDateValidationError = () => {
    if (!selectedHost || !bookingRequestForm.checkIn || !bookingRequestForm.checkOut) return '';
    const checkIn = new Date(bookingRequestForm.checkIn);
    const checkOut = new Date(bookingRequestForm.checkOut);
    const availFrom = new Date(selectedHost.availableFromDate);
    const availTo = new Date(selectedHost.availableToDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (checkIn < today) return 'Check-in date cannot be in the past';
    if (checkIn < availFrom) return `Check-in date cannot be before ${formatDate(selectedHost.availableFromDate)}`;
    if (checkOut > availTo) return `Check-out date cannot be after ${formatDate(selectedHost.availableToDate)}`;
    if (checkIn >= checkOut) return 'Check-out date must be after check-in date';
    return '';
  };

  const submitBookingRequest = async () => {
    const validationError = getDateValidationError();
    if (validationError) { setDateValidationError(validationError); return; }
    if (!isDateRangeValid()) { setDateValidationError('Invalid booking dates'); return; }

    // ✅ If coming from AllTrips, require a transport ticket
    if (effectiveParams.fromTrips && !effectiveParams.transportTicketId) {
      setDateValidationError('A transport ticket is required to book a host. Please book a transport ticket first.');
      return;
    }

    setSubmittingRequest(true);
    setDateValidationError('');

    try {
      const requestData = {
        bookingType: 'host',
        serviceId: selectedHost.serviceId,
        hostId: selectedHost.hostId,
        checkIn: bookingRequestForm.checkIn,
        checkOut: bookingRequestForm.checkOut,
        guests: bookingRequestForm.guests,
        selectedServices: bookingRequestForm.selectedServices,
        notes: bookingRequestForm.specialRequests || `Booking request for ${selectedHost.name}`,
        // ✅ Include transportTicketId and fromTrips flag
        ...(effectiveParams.transportTicketId && { transportTicketId: effectiveParams.transportTicketId }),
        ...(effectiveParams.tripId && { tripId: effectiveParams.tripId }),
        ...(effectiveParams.fromTrips && { fromTrips: true })
      };

      const response = await apiCall('/bookings', { method: 'POST', body: JSON.stringify(requestData) });
      console.log('✅ Booking request sent:', response);

      // ✅ Close modal FIRST, then show toast
      setShowBookingRequestModal(false);
      setBookingRequestForm({ checkIn: '', checkOut: '', guests: 1, selectedServices: [], specialRequests: '' });

      // ✅ Show success toast
      showToast('success', 'Booking Request Sent! 🎉', `${selectedHost.hostName} will review and respond to your request.`);

      // Refresh the list
      fetchHosts();

    } catch (err) {
      console.error('Error submitting booking request:', err);
      // ✅ Show error inline AND as toast
      setDateValidationError(err.message || 'Failed to send booking request');
      showToast('error', err.message || 'Failed to send booking request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) { setMessageError('Message cannot be empty'); return; }
    setSendingMessage(true);
    setMessageError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMessageContent('');
      setMessageSubject('General Inquiry');
      setShowMessageModal(false);
      showToast('success', 'Message Sent!', `${selectedHost.hostName} will respond within ${selectedHost.responseTime}.`);
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
    return Math.ceil((new Date(bookingRequestForm.checkOut) - new Date(bookingRequestForm.checkIn)) / (1000 * 60 * 60 * 24));
  };

  const filteredHosts = hosts.filter(host => {
    const matchesSearch = !searchTerm || host.name.toLowerCase().includes(searchTerm.toLowerCase()) || host.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerified = !selectedFilters.verified || host.verified;
    const matchesRating = host.rating >= selectedFilters.minRating;
    return matchesSearch && matchesVerified && matchesRating;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notifications */}
      {toast && toast.type === 'success' && (
        <SuccessToast message={toast.message} subMessage={toast.subMessage} onClose={hideToast} />
      )}
      {toast && toast.type === 'error' && (
        <ErrorToast message={toast.message} onClose={hideToast} />
      )}

      {/* ✅ Trip context banner - shown when coming from AllTrips */}
      {effectiveParams.fromTrips && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-800">Adding Host to Your Trip</p>
            <p className="text-sm text-green-700 mt-0.5">
              {effectiveParams.destination && <span>Destination: <strong>{effectiveParams.destination}</strong> • </span>}
              {effectiveParams.checkIn && <span>Check-in: <strong>{formatDate(effectiveParams.checkIn)}</strong> • </span>}
              {effectiveParams.checkOut && <span>Check-out: <strong>{formatDate(effectiveParams.checkOut)}</strong></span>}
            </p>
            {effectiveParams.transportTicketId ? (
              <p className="text-xs text-green-600 mt-1">✅ Transport ticket linked: {effectiveParams.transportTicketId}</p>
            ) : (
              <p className="text-xs text-red-600 mt-1">⚠️ No transport ticket found. Please book a transport ticket first from My Tickets.</p>
            )}
          </div>
        </div>
      )}

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
          className={`px-6 py-4 rounded-xl flex items-center gap-2 border-2 transition-all whitespace-nowrap ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={selectedFilters.verified} onChange={(e) => setSelectedFilters({ ...selectedFilters, verified: e.target.checked })} className="w-5 h-5 text-blue-500 rounded" />
                <span className="text-sm font-medium">Verified Hosts Only</span>
              </label>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700 font-medium">Minimum Rating</label>
              <select value={selectedFilters.minRating} onChange={(e) => setSelectedFilters({ ...selectedFilters, minRating: Number(e.target.value) })} className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-800">
          <p className="font-medium">Error loading services</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Loading host services...</span>
        </div>
      )}

      {!loading && !error && filteredHosts.length === 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600 mb-4">No host services found matching your criteria.</p>
          <button onClick={() => { setSearchTerm(''); setSelectedFilters({ verified: false, minRating: 0 }); }} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
            Clear Filters
          </button>
        </div>
      )}

      {!loading && !error && filteredHosts.length > 0 && (
        <div className="space-y-4">
          {filteredHosts.map((host) => (
            <div key={host.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-80 h-64 md:h-auto relative overflow-hidden bg-gray-100">
                  <img src={host.propertyImage || getLocationImage(host.location)} alt={host.location}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = getLocationImage(host.location); }}
                  />
                  {host.verified && (
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold">Verified</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <AvatarWithInitials image={host.image} name={host.hostName} className="w-14 h-14" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-1">{host.hostName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <MapPin className="w-4 h-4" /><span>{host.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users2 className="w-3 h-3" /><span>{host.totalBookings} completed bookings</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl text-blue-600 font-bold">৳{host.price}</div>
                          <div className="text-xs text-gray-500">per day</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">{host.name}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{host.description}</p>
                      </div>

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

                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{host.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-600">({host.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" /><span>Responds in {host.responseTime}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4 text-gray-500" /><span>Max {host.maxGuests} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-500" /><span>Min {host.minStay} night(s)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Languages className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{host.languages.join(', ')}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {host.services.map((service, index) => (
                          <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200">{service}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 flex-wrap">
                    <button
                      disabled={!host.available}
                      onClick={() => openBookingRequest(host)}
                      className={`px-6 py-3 rounded-xl transition-all font-medium ${host.available ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {host.available ? 'Request Booking' : 'Unavailable'}
                    </button>
                    <button className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700"
                      onClick={() => { setSelectedHost(host); setShowHostProfile(true); }}>
                      View Profile
                    </button>
                    <button className="px-5 py-3 border-2 border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium flex items-center gap-2"
                      onClick={() => { setSelectedHost(host); setShowMessageModal(true); setMessageError(''); }}>
                      <Send className="w-4 h-4" />Message
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
              📌 Send a booking request → Host reviews and accepts → Payment after acceptance. A 15% platform fee applies. Full refund if host declines.
            </p>
          </div>
        </div>
      </div>

      {/* Host Profile Modal */}
      {showHostProfile && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AvatarWithInitials image={selectedHost.image} name={selectedHost.hostName} className="w-16 h-16" />
                <div>
                  <h3 className="text-2xl font-bold">{selectedHost.hostName}</h3>
                  <p className="text-blue-100 text-sm flex items-center gap-2"><MapPin className="w-4 h-4" />{selectedHost.location}</p>
                </div>
              </div>
              <button onClick={() => setShowHostProfile(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img src={selectedHost.propertyImage || getLocationImage(selectedHost.location)} alt={selectedHost.location}
                  className="w-full h-80 object-cover" onError={(e) => { e.target.src = getLocationImage(selectedHost.location); }} />
              </div>
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
              <div>
                <h4 className="font-bold text-lg mb-3 text-gray-800">{selectedHost.name}</h4>
                <p className="text-gray-700 leading-relaxed">{selectedHost.description}</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-900">Availability Period</span>
                </div>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{formatDate(selectedHost.availableFromDate)}</span>
                  <span className="mx-2">→</span>
                  <span className="font-semibold">{formatDate(selectedHost.availableToDate)}</span>
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[['Experience Level', selectedHost.experience], ['Response Time', selectedHost.responseTime], ['Cancellation', selectedHost.cancellationPolicy], ['Price', `৳${selectedHost.price}/day`], ['Max Guests', selectedHost.maxGuests], ['Min Stay', `${selectedHost.minStay} night(s)`]].map(([label, val]) => (
                  <div key={label} className="p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700 block mb-2">{label}</span>
                    <span className={`text-lg ${label === 'Price' ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>{val}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Languages Spoken</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHost.languages.map((lang, i) => <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{lang}</span>)}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Services Offered</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedHost.services.map((service, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => setShowHostProfile(false)} className="py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">Close</button>
                <button onClick={() => { setShowHostProfile(false); openBookingRequest(selectedHost); }} className="py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium">Request Booking</button>
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
              <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <AvatarWithInitials image={selectedHost.image} name={selectedHost.hostName} className="w-12 h-12" />
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
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Subject</label>
                <select value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>General Inquiry</option>
                  <option>Booking Question</option>
                  <option>Service Details</option>
                  <option>Availability Check</option>
                  <option>Custom Request</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Your Message</label>
                <textarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Type your message here..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" rows={5} />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                💡 {selectedHost.hostName} responds within {selectedHost.responseTime}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowMessageModal(false); setMessageContent(''); setMessageSubject('General Inquiry'); }} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
                <button onClick={handleSendMessage} disabled={sendingMessage || !messageContent.trim()} className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2">
                  {sendingMessage ? <><Loader className="w-4 h-4 animate-spin" />Sending...</> : <><Send className="w-4 h-4" />Send Message</>}
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
                <p className="text-blue-100 text-sm">Request from {selectedHost.hostName} in {selectedHost.location}</p>
              </div>
              <button onClick={() => setShowBookingRequestModal(false)} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-6 h-6" /></button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
              <div className="p-6 space-y-6">
                {/* Host Summary */}
                <div className="flex gap-5 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <img src={selectedHost.propertyImage || getLocationImage(selectedHost.location)} alt={selectedHost.location}
                    className="w-32 h-32 object-cover rounded-xl shadow-md"
                    onError={(e) => { e.target.src = getLocationImage(selectedHost.location); }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AvatarWithInitials image={selectedHost.image} name={selectedHost.hostName} className="w-10 h-10" />
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

                {/* Error */}
                {dateValidationError && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{dateValidationError}</p>
                  </div>
                )}

                {/* Dates */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700 font-semibold">Select Your Dates</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-2 text-gray-500">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="date" value={bookingRequestForm.checkIn}
                          onChange={(e) => { setBookingRequestForm({ ...bookingRequestForm, checkIn: e.target.value }); setDateValidationError(''); }}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={formatDateToInput(new Date(selectedHost.availableFromDate))}
                          max={formatDateToInput(new Date(selectedHost.availableToDate))} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Available: {formatDate(selectedHost.availableFromDate)} to {formatDate(selectedHost.availableToDate)}</p>
                    </div>
                    <div>
                      <label className="block text-xs mb-2 text-gray-500">Check-out</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="date" value={bookingRequestForm.checkOut}
                          onChange={(e) => { setBookingRequestForm({ ...bookingRequestForm, checkOut: e.target.value }); setDateValidationError(''); }}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={bookingRequestForm.checkIn || formatDateToInput(new Date(selectedHost.availableFromDate))}
                          max={formatDateToInput(new Date(selectedHost.availableToDate))} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700 font-semibold">Number of Guests</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <Users className="w-5 h-5 text-gray-400" />
                    <button onClick={() => setBookingRequestForm({ ...bookingRequestForm, guests: Math.max(1, bookingRequestForm.guests - 1) })} className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white font-bold transition-colors">−</button>
                    <span className="text-xl w-16 text-center font-bold">{bookingRequestForm.guests}</span>
                    <button onClick={() => setBookingRequestForm({ ...bookingRequestForm, guests: Math.min(selectedHost.maxGuests || 10, bookingRequestForm.guests + 1) })} className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white font-bold transition-colors">+</button>
                    <span className="text-sm text-gray-600">guests (max {selectedHost.maxGuests || 10})</span>
                  </div>
                </div>

                {/* Services */}
                {selectedHost.services.length > 0 && (
                  <div>
                    <label className="block text-sm mb-3 text-gray-700 font-semibold">Select Services (Optional)</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedHost.services.map((service) => (
                        <label key={service} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${bookingRequestForm.selectedServices.includes(service) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="checkbox" checked={bookingRequestForm.selectedServices.includes(service)} onChange={() => toggleService(service)} className="w-5 h-5 text-blue-500 rounded border-gray-300 cursor-pointer" />
                          <span className="flex-1 font-medium text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700 font-semibold">Special Requests (Optional)</label>
                  <textarea value={bookingRequestForm.specialRequests} onChange={(e) => setBookingRequestForm({ ...bookingRequestForm, specialRequests: e.target.value })}
                    placeholder="Any special requests or notes for the host..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={4} />
                </div>

                {/* Price Summary */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="mb-4 font-bold text-gray-800">Booking Summary</h4>
                  <div className="space-y-3 mb-5 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nights: {calculateNights()}</span>
                      <span className="font-medium">৳{selectedHost.price} × {calculateNights()} = ৳{selectedHost.price * calculateNights()}</span>
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
                      <strong>💡 How it works:</strong> Send a request → Host accepts → You pay. No payment now.
                    </p>
                  </div>

                  <button onClick={submitBookingRequest} disabled={!isDateRangeValid() || submittingRequest}
                    className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold transition-all text-lg">
                    {submittingRequest ? (
                      <><Loader className="w-5 h-5 animate-spin" /><span>Sending Request...</span></>
                    ) : (
                      <><Send className="w-5 h-5" /><span>Send Booking Request</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookTravel;