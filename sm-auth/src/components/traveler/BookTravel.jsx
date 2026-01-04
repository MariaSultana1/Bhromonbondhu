import { useState } from 'react';
import { Plane, Train, Bus, Home, Search, Filter, Star, MapPin, Languages, Shield, Calendar, X, Check, CreditCard, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

<<<<<<< Updated upstream
=======
const hosts = [
  {
    id: 1,
    name: 'Fatima Khan',
    location: 'Cox\'s Bazar',
    rating: 4.9,
    reviews: 124,
    verified: true,
    languages: ['Bengali', 'English'],
    price: 2500,
    image: "./images/Ellipse 11.png",
    propertyImage: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    services: ['Local Guide', 'Meals', 'Transportation'],
    available: true
  },
  {
    id: 2,
    name: 'Rafiq Ahmed',
    location: 'Sylhet',
    rating: 4.8,
    reviews: 98,
    verified: true,
    languages: ['Bengali', 'English', 'Hindi'],
    price: 2000,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
    propertyImage: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    services: ['Local Guide', 'Photography', 'Trekking'],
    available: true
  },
  {
    id: 3,
    name: 'Shahana Begum',
    location: 'Dhaka',
    rating: 4.7,
    reviews: 156,
    verified: true,
    languages: ['Bengali', 'English'],
    price: 1800,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shahana',
    propertyImage: 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc2NTQ3NTIxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    services: ['City Tour', 'Shopping Guide', 'Food Tour'],
    available: true
  }
];

const tickets = {
  flight: [
    {
      id: 1,
      from: 'Dhaka',
      to: 'Cox\'s Bazar',
      airline: 'Biman Bangladesh',
      departure: '10:00 AM',
      arrival: '11:15 AM',
      duration: '1h 15m',
      price: 4500,
      seats: 12
    },
    {
      id: 2,
      from: 'Dhaka',
      to: 'Sylhet',
      airline: 'US-Bangla',
      departure: '2:30 PM',
      arrival: '3:30 PM',
      duration: '1h',
      price: 3800,
      seats: 8
    }
  ],
  train: [
    {
      id: 1,
      from: 'Dhaka',
      to: 'Chittagong',
      train: 'Suborno Express',
      departure: '7:00 AM',
      arrival: '1:30 PM',
      duration: '6h 30m',
      price: 800,
      seats: 25
    },
    {
      id: 2,
      from: 'Dhaka',
      to: 'Sylhet',
      train: 'Parabat Express',
      departure: '9:00 PM',
      arrival: '5:30 AM',
      duration: '8h 30m',
      price: 650,
      seats: 18
    }
  ],
  bus: [
    {
      id: 1,
      from: 'Dhaka',
      to: 'Cox\'s Bazar',
      operator: 'Green Line',
      departure: '11:00 PM',
      arrival: '8:00 AM',
      duration: '9h',
      price: 1200,
      seats: 15
    },
    {
      id: 2,
      from: 'Dhaka',
      to: 'Bandarban',
      operator: 'Shyamoli',
      departure: '10:30 PM',
      arrival: '7:00 AM',
      duration: '8h 30m',
      price: 1000,
      seats: 20
    }
  ]
};

>>>>>>> Stashed changes
export function BookTravel() {
  const [bookingType, setBookingType] = useState('hosts');
  const [ticketType, setTicketType] = useState('flight');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    verified: false,
    minRating: 0,
    languages: []
  });

  // Booking modal states
  const [showHostModal, setShowHostModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Host booking form
  const [hostBookingForm, setHostBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    selectedServices: []
  });

  // Ticket booking form
  const [ticketBookingForm, setTicketBookingForm] = useState({
    date: '',
    passengers: 1,
    seatClass: 'Economy'
  });

  const hosts = [
    {
      id: 1,
      name: 'Fatima Khan',
      location: 'Cox\'s Bazar',
      rating: 4.9,
      reviews: 124,
      verified: true,
      languages: ['Bengali', 'English'],
      price: 2500,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
      propertyImage: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      services: ['Local Guide', 'Meals', 'Transportation'],
      available: true
    },
    {
      id: 2,
      name: 'Rafiq Ahmed',
      location: 'Sylhet',
      rating: 4.8,
      reviews: 98,
      verified: true,
      languages: ['Bengali', 'English', 'Hindi'],
      price: 2000,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
      propertyImage: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      services: ['Local Guide', 'Photography', 'Trekking'],
      available: true
    },
    {
      id: 3,
      name: 'Shahana Begum',
      location: 'Dhaka',
      rating: 4.7,
      reviews: 156,
      verified: true,
      languages: ['Bengali', 'English'],
      price: 1800,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shahana',
      propertyImage: 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc2NTQ3NTIxMXww&ixlib=rb-4.1.0&q=80&w=1080',
      services: ['City Tour', 'Shopping Guide', 'Food Tour'],
      available: true
    }
  ];

  const tickets = {
    flight: [
      {
        id: 1,
        from: 'Dhaka',
        to: 'Cox\'s Bazar',
        airline: 'Biman Bangladesh',
        departure: '10:00 AM',
        arrival: '11:15 AM',
        duration: '1h 15m',
        price: 4500,
        seats: 12
      },
      {
        id: 2,
        from: 'Dhaka',
        to: 'Sylhet',
        airline: 'US-Bangla',
        departure: '2:30 PM',
        arrival: '3:30 PM',
        duration: '1h',
        price: 3800,
        seats: 8
      }
    ],
    train: [
      {
        id: 1,
        from: 'Dhaka',
        to: 'Chittagong',
        train: 'Suborno Express',
        departure: '7:00 AM',
        arrival: '1:30 PM',
        duration: '6h 30m',
        price: 800,
        seats: 25
      },
      {
        id: 2,
        from: 'Dhaka',
        to: 'Sylhet',
        train: 'Parabat Express',
        departure: '9:00 PM',
        arrival: '5:30 AM',
        duration: '8h 30m',
        price: 650,
        seats: 18
      }
    ],
    bus: [
      {
        id: 1,
        from: 'Dhaka',
        to: 'Cox\'s Bazar',
        operator: 'Green Line',
        departure: '11:00 PM',
        arrival: '8:00 AM',
        duration: '9h',
        price: 1200,
        seats: 15
      },
      {
        id: 2,
        from: 'Dhaka',
        to: 'Bandarban',
        operator: 'Shyamoli',
        departure: '10:30 PM',
        arrival: '7:00 AM',
        duration: '8h 30m',
        price: 1000,
        seats: 20
      }
    ]
  };

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

  const handleTicketBooking = (ticket, type) => {
    setSelectedTicket({ ...ticket, type });
    setShowTicketModal(true);
    setTicketBookingForm({
      date: '',
      passengers: 1,
      seatClass: 'Economy'
    });
  };

  const calculateHostTotal = () => {
    if (!selectedHost) return 0;
    const checkIn = new Date(hostBookingForm.checkIn);
    const checkOut = new Date(hostBookingForm.checkOut);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? selectedHost.price * days : 0;
  };

  const calculateTicketTotal = () => {
    if (!selectedTicket) return 0;
    const basePrice = selectedTicket.price;
    const classMultiplier = ticketBookingForm.seatClass === 'Business' ? 2 : 1;
    return basePrice * ticketBookingForm.passengers * classMultiplier;
  };

  const confirmHostBooking = () => {
    if (!selectedHost) return;

    const booking = {
      hostId: selectedHost.id,
      hostName: selectedHost.name,
      location: selectedHost.location,
      checkIn: hostBookingForm.checkIn,
      checkOut: hostBookingForm.checkOut,
      guests: hostBookingForm.guests,
      services: hostBookingForm.selectedServices,
      totalPrice: calculateHostTotal(),
      propertyImage: selectedHost.propertyImage,
      hostAvatar: selectedHost.image
    };

    const existingBookings = JSON.parse(localStorage.getItem('hostBookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('hostBookings', JSON.stringify(existingBookings));

    setShowHostModal(false);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const confirmTicketBooking = () => {
    if (!selectedTicket) return;

    const booking = {
      ticketId: selectedTicket.id,
      type: selectedTicket.type,
      from: selectedTicket.from,
      to: selectedTicket.to,
      date: ticketBookingForm.date,
      passengers: ticketBookingForm.passengers,
      seatClass: ticketBookingForm.seatClass,
      totalPrice: calculateTicketTotal(),
      departure: selectedTicket.departure,
      arrival: selectedTicket.arrival,
      operator: selectedTicket.type === 'flight' ? selectedTicket.airline : 
                selectedTicket.type === 'train' ? selectedTicket.train : selectedTicket.operator
    };

    const existingBookings = JSON.parse(localStorage.getItem('ticketBookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('ticketBookings', JSON.stringify(existingBookings));

    setShowTicketModal(false);
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 3000);
  };

  const toggleService = (service) => {
    setHostBookingForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(service)
        ? prev.selectedServices.filter(s => s !== service)
        : [...prev.selectedServices, service]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <h2 className="text-3xl mb-2">Discover Bangladesh</h2>
        <p className="text-blue-100">Book authentic experiences with verified local hosts and convenient travel tickets</p>
      </div>

      {/* Booking Type Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-2">
        <button
          onClick={() => setBookingType('hosts')}
          className={`px-6 py-3 rounded-lg transition-all ${
            bookingType === 'hosts'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            <span>Local Hosts</span>
          </div>
        </button>
        <button
          onClick={() => setBookingType('tickets')}
          className={`px-6 py-3 rounded-lg transition-all ${
            bookingType === 'tickets'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            <span>Travel Tickets</span>
          </div>
        </button>
      </div>

      {bookingType === 'tickets' && (
        <div className="flex gap-3">
          <button
            onClick={() => setTicketType('flight')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
              ticketType === 'flight'
                ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Plane className="w-5 h-5" />
            <span>Flights</span>
          </button>
          <button
            onClick={() => setTicketType('train')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
              ticketType === 'train'
                ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Train className="w-5 h-5" />
            <span>Trains</span>
          </button>
          <button
            onClick={() => setTicketType('bus')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
              ticketType === 'bus'
                ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            <Bus className="w-5 h-5" />
            <span>Buses</span>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={bookingType === 'hosts' ? 'Search destinations or host names...' : 'Search routes...'}
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
      {showFilters && bookingType === 'hosts' && (
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

      {/* Results */}
      <div className="space-y-4">
        {bookingType === 'hosts' ? (
          <>
            {hosts.map((host) => (
              <div key={host.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="md:flex">
                  <div className="md:w-80 h-64 md:h-auto relative overflow-hidden">
                    <img
                      src={host.propertyImage}
                      alt={host.location}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {host.verified && (
                      <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-xs">Verified</span>
                      </div>
                    )}
                  </div>
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
                      <button className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        View Profile
                      </button>
                      <button className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {tickets[ticketType].map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-8 mb-4">
                      <div className="text-center">
                        <div className="text-3xl mb-2">{ticket.departure}</div>
                        <div className="text-gray-600">{ticket.from}</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-sm text-gray-500 mb-2">{ticket.duration}</div>
                        <div className="w-full relative">
                          <div className="w-full h-0.5 bg-gray-300"></div>
                          <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 bg-white" />
                        </div>
                        <div className="text-sm text-gray-700 mt-2">
                          {'airline' in ticket ? ticket.airline : 'train' in ticket ? ticket.train : ticket.operator}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl mb-2">{ticket.arrival}</div>
                        <div className="text-gray-600">{ticket.to}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100">
                        {ticket.seats} seats available
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-8">
                    <div className="text-3xl text-blue-600 mb-3">৳{ticket.price}</div>
                    <button 
                      onClick={() => handleTicketBooking(ticket, ticketType)}
                      className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

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
                  <img src={selectedHost.propertyImage} alt={selectedHost.location} className="w-32 h-32 object-cover rounded-xl shadow-md" />
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
                          min={new Date().toISOString().split('T')[0]}
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
                          min={hostBookingForm.checkIn || new Date().toISOString().split('T')[0]}
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
                      onClick={() => setHostBookingForm({ ...hostBookingForm, guests: hostBookingForm.guests + 1 })}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600">guests</span>
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
                    onClick={confirmHostBooking}
                    disabled={!hostBookingForm.checkIn || !hostBookingForm.checkOut}
                    className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:shadow-none"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Confirm Booking & Pay</span>
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-3">Payment held in escrow until service confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Booking Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Complete Your Booking</h3>
                <p className="text-blue-100 text-sm capitalize">Book your {selectedTicket.type} ticket</p>
              </div>
              <button onClick={() => setShowTicketModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
              <div className="p-6 space-y-6">
                {/* Ticket Info */}
                <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedTicket.type === 'flight' ? 'bg-blue-100 text-blue-600' :
                        selectedTicket.type === 'train' ? 'bg-green-100 text-green-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {selectedTicket.type === 'flight' ? <Plane className="w-6 h-6" /> :
                         selectedTicket.type === 'train' ? <Train className="w-6 h-6" /> :
                         <Bus className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="text-lg">{selectedTicket.from} → {selectedTicket.to}</h4>
                        <p className="text-sm text-gray-600">
                          {selectedTicket.type === 'flight' ? selectedTicket.airline : 
                           selectedTicket.type === 'train' ? selectedTicket.train : selectedTicket.operator}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Duration</div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{selectedTicket.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Departure</div>
                      <div className="text-lg">{selectedTicket.departure}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Arrival</div>
                      <div className="text-lg">{selectedTicket.arrival}</div>
                    </div>
                  </div>
                </div>

                {/* Booking Form */}
                <div>
                  <label className="block text-sm mb-3 text-gray-700">Travel Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={ticketBookingForm.date}
                      onChange={(e) => setTicketBookingForm({ ...ticketBookingForm, date: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-3 text-gray-700">Number of Passengers</label>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <Users className="w-5 h-5 text-gray-400" />
                    <button
                      onClick={() => setTicketBookingForm({ ...ticketBookingForm, passengers: Math.max(1, ticketBookingForm.passengers - 1) })}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl w-16 text-center">{ticketBookingForm.passengers}</span>
                    <button
                      onClick={() => setTicketBookingForm({ ...ticketBookingForm, passengers: Math.min(selectedTicket.seats, ticketBookingForm.passengers + 1) })}
                      className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:bg-white transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600">passengers</span>
                  </div>
                </div>

                {selectedTicket.type === 'flight' && (
                  <div>
                    <label className="block text-sm mb-3 text-gray-700">Select Class</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTicketBookingForm({ ...ticketBookingForm, seatClass: 'Economy' })}
                        className={`p-5 border-2 rounded-xl transition-all ${
                          ticketBookingForm.seatClass === 'Economy'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="mb-2">Economy</div>
                        <div className="text-2xl text-blue-600">৳{selectedTicket.price}</div>
                        {ticketBookingForm.seatClass === 'Economy' && (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 mt-2" />
                        )}
                      </button>
                      <button
                        onClick={() => setTicketBookingForm({ ...ticketBookingForm, seatClass: 'Business' })}
                        className={`p-5 border-2 rounded-xl transition-all ${
                          ticketBookingForm.seatClass === 'Business'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="mb-2">Business</div>
                        <div className="text-2xl text-blue-600">৳{selectedTicket.price * 2}</div>
                        {ticketBookingForm.seatClass === 'Business' && (
                          <CheckCircle2 className="w-5 h-5 text-blue-500 mt-2" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="mb-4">Price Breakdown</h4>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base price × {ticketBookingForm.passengers} passenger(s)</span>
                      <span>৳{selectedTicket.price * ticketBookingForm.passengers * (ticketBookingForm.seatClass === 'Business' ? 2 : 1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform fee (15%)</span>
                      <span>৳{Math.round(calculateTicketTotal() * 0.15)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                      <span className="text-lg">Total Amount</span>
                      <span className="text-3xl text-blue-600">৳{calculateTicketTotal() + Math.round(calculateTicketTotal() * 0.15)}</span>
                    </div>
                  </div>

                  <button
                    onClick={confirmTicketBooking}
                    disabled={!ticketBookingForm.date}
                    className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:shadow-none"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Confirm Booking & Pay</span>
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-3">Payment held in escrow until service confirmation</p>
                </div>
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
            <div className="mb-1">Booking Confirmed!</div>
            <div className="text-sm text-gray-600">Check "My Hosts" to view your booking details</div>
          </div>
        </div>
      )}
    </div>
  );
}