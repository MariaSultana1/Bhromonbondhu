import { useState, useEffect } from 'react';
import { Home, Search, Filter, Star, MapPin, Languages, Shield, Calendar, X, Check, CreditCard, Users, CheckCircle2, Lock, Loader } from 'lucide-react';

// API configuration
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

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function BookTravel() {
  // State for hosts
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    verified: false,
    minRating: 0,
    languages: []
  });

  // Booking modal states
  const [showHostModal, setShowHostModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  
  // New modal states
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  // Payment simulation
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');

  // Host booking form
  const [hostBookingForm, setHostBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    selectedServices: []
  });

  // Fetch hosts from database
  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('location', searchTerm);
      if (selectedFilters.minRating > 0) params.append('minRating', selectedFilters.minRating);
      if (selectedFilters.verified) params.append('verified', 'true');
      
      const data = await apiCall(`/hosts?${params.toString()}`);
      
      // Map database hosts to component format
      const mappedHosts = data.hosts.map(host => ({
        id: host._id,
        name: host.name,
        location: host.location,
        rating: host.rating,
        reviews: host.reviews,
        verified: host.verified,
        languages: host.languages,
        price: host.price,
        image: host.image,
        propertyImage: host.propertyImage,
        services: host.services,
        available: host.available,
        description: host.description,
        experience: host.experience,
        responseTime: host.responseTime,
        maxGuests: host.maxGuests,
        minStay: host.minStay,
        offersAccommodation: host.services?.includes('Accommodation')
      }));
      
      setHosts(mappedHosts);
    } catch (err) {
      console.error('Error fetching hosts:', err);
      setError(err.message || 'Failed to fetch hosts');
      setHosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchHosts();
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchTerm, selectedFilters]);

  const handleHostBooking = (host) => {
    setSelectedHost(host);
    setShowHostModal(true);
    setHostBookingForm({
      checkIn: '',
      checkOut: '',
      guests: 1,
      selectedServices: []
    });
  };

  const calculateHostTotal = () => {
    if (!selectedHost) return 0;
    const checkIn = new Date(hostBookingForm.checkIn);
    const checkOut = new Date(hostBookingForm.checkOut);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? selectedHost.price * days : 0;
  };

  const proceedToPayment = () => {
    if (!hostBookingForm.checkIn || !hostBookingForm.checkOut) return;
    setShowHostModal(false);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setPaymentProcessing(true);
    
    try {
      // Validate payment details before processing
      if (paymentMethod === 'card') {
        const cleanedCard = cardNumber.replace(/\s+/g, '');
        if (!/^\d{16}$/.test(cleanedCard)) {
          alert('Card number must be exactly 16 digits');
          setPaymentProcessing(false);
          return;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
          alert('Expiry date must be in MM/YY format');
          setPaymentProcessing(false);
          return;
        }

        const [month, year] = cardExpiry.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiry < new Date()) {
          alert('Card has expired');
          setPaymentProcessing(false);
          return;
        }

        if (!/^\d{3}$/.test(cardCVV)) {
          alert('CVV must be exactly 3 digits');
          setPaymentProcessing(false);
          return;
        }
      } else if (paymentMethod === 'bkash') {
        if (!/^01[3-9]\d{8}$/.test(bkashNumber)) {
          alert('bKash number must be 11 digits starting with 01');
          setPaymentProcessing(false);
          return;
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (!selectedHost) return;

      const totalAmount = calculateHostTotal();
      const platformFee = Math.round(totalAmount * 0.15);
      const grandTotal = totalAmount + platformFee;

      // Prepare payment details
      const paymentDetails = {};
      if (paymentMethod === 'card') {
        paymentDetails.cardNumber = cardNumber;
        paymentDetails.cardholderName = 'Card Holder';
      } else if (paymentMethod === 'bkash') {
        paymentDetails.bkashNumber = bkashNumber;
      }

      // Create booking in database
      const bookingData = {
        bookingType: 'host',
        hostId: selectedHost.id,
        checkIn: hostBookingForm.checkIn,
        checkOut: hostBookingForm.checkOut,
        guests: hostBookingForm.guests,
        selectedServices: hostBookingForm.selectedServices,
        notes: `Booking for ${selectedHost.name} in ${selectedHost.location}`,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails
      };

      const response = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });

      console.log('✅ Booking created:', response.booking);

      // Also create a trip record
      const tripData = {
        destination: selectedHost.location,
        date: hostBookingForm.checkIn,
        endDate: hostBookingForm.checkOut,
        host: selectedHost.name,
        hostAvatar: selectedHost.image,
        image: selectedHost.propertyImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80',
        services: hostBookingForm.selectedServices,
        guests: hostBookingForm.guests,
        totalAmount: grandTotal,
        hostRating: selectedHost.rating,
        description: `Experience ${selectedHost.location} with ${selectedHost.name}`
      };

      await apiCall('/trips', {
        method: 'POST',
        body: JSON.stringify(tripData)
      });

      setPaymentProcessing(false);
      setShowPaymentModal(false);
      setShowConfirmation(true);
      
      // Reset form
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setBkashNumber('');
      
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);

    } catch (err) {
      console.error('Booking error:', err);
      alert(`Booking failed: ${err.message}`);
      setPaymentProcessing(false);
    }
  };

  const toggleService = (service) => {
    setHostBookingForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  // Filter hosts based on search and filters
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-300 rounded-2xl p-8 text-white">
        <h2 className="text-2xl mb-2">Discover Local Hosts</h2>
        <p className="text-blue-60">Book authentic experiences with verified local hosts across Bangladesh</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destinations or host names..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-4 rounded-xl flex items-center gap-2 border-2 transition-all ${
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
                <span className="text-sm">Verified Hosts Only</span>
              </label>
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Minimum Rating</label>
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
            <div>
              <label className="block text-sm mb-2 text-gray-700">Languages</label>
              <select className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Any Language</option>
                <option>Bengali</option>
                <option>English</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-800">
          <p className="font-medium">Error loading hosts</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600">Loading hosts...</span>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && filteredHosts.length === 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600">No hosts found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedFilters({ verified: false, minRating: 0, languages: [] });
            }}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Hosts List */}
      {!loading && !error && filteredHosts.length > 0 && (
        <div className="space-y-4">
          {filteredHosts.map((host) => (
            <div key={host.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="md:flex">
                {/* Property Image or Placeholder */}
                <div className="md:w-80 h-64 md:h-auto relative overflow-hidden bg-gray-100">
                  {host.propertyImage ? (
                    <img
                      src={host.propertyImage}
                      alt={host.location}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center text-gray-400';
                        placeholder.innerHTML = `
                          <div class="text-center">
                            <svg class="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            <p class="text-sm">No property image</p>
                          </div>
                        `;
                        e.target.parentElement.appendChild(placeholder);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Home className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Service Provider</p>
                        {host.offersAccommodation && (
                          <p className="text-xs text-gray-400 mt-1">(Accommodation available)</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {host.verified && (
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-xs">Verified</span>
                    </div>
                  )}
                </div>

                {/* Host Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={host.image} alt={host.name} className="w-12 h-12 rounded-full border-2 border-blue-100" />
                        <div>
                          <h3 className="text-xl mb-1">{host.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{host.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{host.rating}</span>
                          <span className="text-xs text-gray-500">({host.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Languages className="w-4 h-4" />
                          <span>{host.languages.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {host.services.map((service, index) => (
                          <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100">
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-3xl text-blue-600 mb-1">৳{host.price}</div>
                      <div className="text-sm text-gray-500">per day</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button
                      disabled={!host.available}
                      onClick={() => handleHostBooking(host)}
                      className={`px-6 py-3 rounded-xl transition-all ${
                        host.available
                          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {host.available ? 'Book Experience' : 'Unavailable'}
                    </button>
                    <button 
                      className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all" 
                      onClick={() => {
                        setSelectedHost(host);
                        setShowHostProfile(true);
                      }}
                    >
                      View Profile
                    </button>
                    <button 
                      className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all" 
                      onClick={() => {
                        setSelectedHost(host);
                        setShowMessageModal(true);
                      }}
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="mb-2 text-blue-900">Secure Booking with Escrow Protection</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Your payment is held securely in escrow until you confirm the service. A 15% platform fee applies. 
              Full refund available through our dispute resolution system if anything goes wrong.
            </p>
          </div>
        </div>
      </div>

      {/* Host Booking Modal */}
      {showHostModal && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Complete Your Booking</h3>
                <p className="text-blue-100 text-sm">Book your experience with {selectedHost.name}</p>
              </div>
              <button onClick={() => setShowHostModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
              <div className="p-6 space-y-6">
                {/* Host Info */}
                <div className="flex gap-5 p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  {selectedHost.propertyImage ? (
                    <img src={selectedHost.propertyImage} alt={selectedHost.location} className="w-32 h-32 object-cover rounded-xl shadow-md" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-xl shadow-md flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={selectedHost.image} alt={selectedHost.name} className="w-10 h-10 rounded-full border-2 border-blue-200" />
                      <div>
                        <h4 className="text-lg">{selectedHost.name}</h4>
                        <p className="text-sm text-gray-600">{selectedHost.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">{selectedHost.rating}</span>
                      </div>
                      <div className="text-2xl text-blue-600">৳{selectedHost.price}<span className="text-sm text-gray-500">/day</span></div>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700">Select Your Dates</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-2 text-gray-500">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={hostBookingForm.checkIn}
                          onChange={(e) => setHostBookingForm({ ...hostBookingForm, checkIn: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={getTodayDate()}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-2 text-gray-500">Check-out</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={hostBookingForm.checkOut}
                          onChange={(e) => setHostBookingForm({ ...hostBookingForm, checkOut: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={hostBookingForm.checkIn || getTodayDate()}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-3 text-gray-700">Number of Guests</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <Users className="w-5 h-5 text-gray-400" />
                    <button
                      onClick={() => setHostBookingForm({ ...hostBookingForm, guests: Math.max(1, hostBookingForm.guests - 1) })}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl w-16 text-center">{hostBookingForm.guests}</span>
                    <button
                      onClick={() => setHostBookingForm({ ...hostBookingForm, guests: Math.min(selectedHost.maxGuests || 10, hostBookingForm.guests + 1) })}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600">guests (max {selectedHost.maxGuests || 10})</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-3 text-gray-700">Select Services (Optional)</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {selectedHost.services.map((service) => (
                      <label key={service} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        hostBookingForm.selectedServices.includes(service) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="checkbox"
                          checked={hostBookingForm.selectedServices.includes(service)}
                          onChange={() => toggleService(service)}
                          className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="flex-1">{service}</span>
                        {hostBookingForm.selectedServices.includes(service) && (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="mb-4">Price Breakdown</h4>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">৳{selectedHost.price} × {Math.ceil((new Date(hostBookingForm.checkOut).getTime() - new Date(hostBookingForm.checkIn).getTime()) / (1000 * 60 * 60 * 24)) || 0} days</span>
                      <span>৳{calculateHostTotal()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform fee (15%)</span>
                      <span>৳{Math.round(calculateHostTotal() * 0.15)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                      <span className="text-lg">Total Amount</span>
                      <span className="text-3xl text-blue-600">৳{calculateHostTotal() + Math.round(calculateHostTotal() * 0.15)}</span>
                    </div>
                  </div>

                  <button
                    onClick={proceedToPayment}
                    disabled={!hostBookingForm.checkIn || !hostBookingForm.checkOut}
                    className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:shadow-none"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Payment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Secure Payment</h3>
                <p className="text-green-100 text-sm">Complete your booking payment</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
              <div className="p-6 space-y-6">
                {/* Payment Amount Summary */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-5 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700">Booking Total</span>
                    <span className="text-2xl text-green-600">৳{calculateHostTotal() + Math.round(calculateHostTotal() * 0.15)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>Payment secured with escrow protection</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm">Credit / Debit Card</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">💳</div>
                      <div className="text-sm">bKash</div>
                    </button>
                  </div>
                </div>

                {/* Payment Forms */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 16) {
                            setCardNumber(value.replace(/(\d{4})/g, '$1 ').trim());
                          }
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 4) {
                              setCardExpiry(value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value);
                            }
                          }}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-gray-700">CVV</label>
                        <input
                          type="text"
                          value={cardCVV}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 3) setCardCVV(value);
                          }}
                          placeholder="123"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bkash' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">bKash Number</label>
                      <input
                        type="text"
                        value={bkashNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) setBkashNumber(value);
                        }}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                        maxLength={11}
                      />
                    </div>
                    <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg text-sm text-pink-800">
                      You will receive a payment request on your bKash app. Please approve to complete the booking.
                    </div>
                  </div>
                )}

                {/* Security Note */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>100% Secure Transaction:</strong> Your payment is encrypted and held in escrow. 
                      Funds are only released to the host after you confirm the service.
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={processPayment}
                  disabled={paymentProcessing || (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCVV)) || (paymentMethod === 'bkash' && !bkashNumber)}
                  className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:shadow-none"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay ৳{calculateHostTotal() + Math.round(calculateHostTotal() * 0.15)} Securely</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  Payment will be stored in the database and synced with your bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Host Profile Modal */}
      {showHostProfile && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between sticky top-0">
              <div className="flex items-center gap-4">
                <img src={selectedHost.image} alt={selectedHost.name} className="w-16 h-16 rounded-full border-4 border-white" />
                <div>
                  <h3 className="text-2xl mb-1">{selectedHost.name}</h3>
                  <p className="text-blue-100 text-sm">{selectedHost.location}</p>
                </div>
              </div>
              <button onClick={() => setShowHostProfile(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Image */}
              {selectedHost.propertyImage ? (
                <div className="rounded-xl overflow-hidden">
                  <img src={selectedHost.propertyImage} alt={selectedHost.location} className="w-full h-64 object-cover" />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden bg-gray-100 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Home className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">No property image available</p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl text-yellow-700">{selectedHost.rating}</span>
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <div className="text-2xl text-blue-600 mb-2">{selectedHost.reviews}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Verified</span>
                  </div>
                  <div className="text-sm text-gray-600">Host Status</div>
                </div>
              </div>

              {/* About */}
              <div>
                <h4 className="mb-3">About {selectedHost.name}</h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedHost.description || `Experienced local host providing authentic experiences in ${selectedHost.location}. 
                  Passionate about sharing the beauty and culture of Bangladesh with travelers from around the world.`}
                </p>
              </div>

              {/* Languages */}
              <div>
                <h4 className="mb-3">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHost.languages.map((lang, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="mb-3">Services Offered</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedHost.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Starting from</div>
                    <div className="text-3xl text-blue-600">৳{selectedHost.price}<span className="text-lg text-gray-500">/day</span></div>
                  </div>
                  <button
                    onClick={() => {
                      setShowHostProfile(false);
                      handleHostBooking(selectedHost);
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowHostProfile(false)}
                className="w-full py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Message Host</h3>
                <p className="text-green-100 text-sm">Send a message to {selectedHost.name}</p>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Host Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img src={selectedHost.image} alt={selectedHost.name} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="mb-1">{selectedHost.name}</div>
                  <div className="text-sm text-gray-600">{selectedHost.location}</div>
                </div>
              </div>

              {/* Message Subject */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Subject</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>General Inquiry</option>
                  <option>Booking Question</option>
                  <option>Service Details</option>
                  <option>Availability Check</option>
                  <option>Custom Request</option>
                </select>
              </div>

              {/* Message Text */}
              <div>
                <label className="block text-sm mb-2 text-gray-700">Your Message</label>
                <textarea
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={6}
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                💡 The host will receive your message and can respond within 24 hours
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    alert('Message sent successfully!');
                  }}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Toast */}
      {showConfirmation && (
        <div className="fixed bottom-8 right-8 bg-white border-2 border-green-200 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-slide-up max-w-md">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="mb-1">Payment Successful!</div>
            <div className="text-sm text-gray-600">Your booking has been saved to the database.</div>
          </div>
        </div>
      )}
    </div>
  );
}