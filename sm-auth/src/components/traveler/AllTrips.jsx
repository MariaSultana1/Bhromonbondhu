import React, { useState } from 'react';
import { Calendar, MapPin, ArrowLeft, Search, Cloud } from 'lucide-react';
import { TripDetails } from './TripDetails';
const allTrips = [
  {
    id: 1,
    destination: "Cox's Bazar",
    date: 'Dec 20, 2024',
    endDate: 'Dec 23, 2024',
    host: 'Fatima Khan',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    weather: '28°C, Sunny',
    status: 'upcoming',
    services: ['Local Guide', 'Meals']
  },
  {
    id: 2,
    destination: 'Sylhet',
    date: 'Jan 5, 2025',
    endDate: 'Jan 8, 2025',
    host: 'Rafiq Ahmed',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
    image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    weather: '18°C, Cloudy',
    status: 'upcoming',
    services: ['Local Guide', 'Photography']
  },
  {
    id: 3,
    destination: 'Dhaka City Tour',
    date: 'Nov 15, 2024',
    endDate: 'Nov 16, 2024',
    host: 'Shahana Begum',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shahana',
    image: 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc2NTQ3NTIxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    weather: '32°C, Clear',
    status: 'completed',
    services: ['City Tour', 'Food Tour']
  },
  {
    id: 4,
    destination: 'Sundarbans',
    date: 'Oct 10, 2024',
    endDate: 'Oct 13, 2024',
    host: 'Karim Hassan',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim',
    image: 'https://images.unsplash.com/photo-1708943081020-2082b47e21ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5nbGFkZXNoJTIwdHJhdmVsfGVufDF8fHx8MTc2NTUxNTMyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    weather: '29°C, Humid',
    status: 'completed',
    services: ['Boat Tour', 'Wildlife Guide']
  },
  {
    id: 5,
    destination: 'Bandarban',
    date: 'Sep 5, 2024',
    endDate: 'Sep 8, 2024',
    host: 'Nusrat Jahan',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
    image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    weather: '25°C, Pleasant',
    status: 'completed',
    services: ['Trekking', 'Local Guide', 'Meals']
  },
  {
    id: 6,
    destination: 'Rangamati',
    date: 'Aug 20, 2024',
    endDate: 'Aug 22, 2024',
    host: 'Arif Hasan',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arif',
    image: 'https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjU0MzQwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    weather: '27°C, Rainy',
    status: 'completed',
    services: ['Boat Tour', 'Meals']
  }
];
export function AllTrips({ onBack }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Enhanced trip data with default values for TripDetails
 const enhancedTrips = allTrips.map(trip => ({
  ...trip,
  bookingId: `BK202400${trip.id}`,
  checkIn: '2:00 PM',
  checkOut: '11:00 AM',
  guests: 2,
  nights: 3,
  totalAmount: 12500,
  location: trip.destination,
  hostRating: 4.5,
  description: `Enjoy your stay at ${trip.destination}`
}));

  const filteredTrips = enhancedTrips.filter(trip => {
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    const matchesSearch = trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trip.host.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (selectedTrip) {
    return <TripDetails trip={selectedTrip} onBack={() => setSelectedTrip(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-3xl mb-2">All Trips</h2>
        <p className="text-blue-100">Your complete travel history</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by destination or host..."
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all','upcoming','completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-3 rounded-xl transition-all ${
                  filterStatus === status
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({status==='all'? enhancedTrips.length : enhancedTrips.filter(t => t.status===status).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="relative h-56 overflow-hidden">
              <img
                src={trip.image}
                alt={trip.destination}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-full text-xs backdrop-blur-md shadow-lg ${
                  trip.status === 'upcoming'
                    ? 'bg-green-500/90 text-white'
                    : 'bg-gray-800/90 text-white'
                }`}>
                  {trip.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </span>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white text-xl mb-1">{trip.destination}</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={trip.hostAvatar}
                  alt={trip.host}
                  className="w-10 h-10 rounded-full border-2 border-blue-100"
                />
                <div>
                  <div className="text-sm text-gray-500">Hosted by</div>
                  <div className="text-sm">{trip.host}</div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.date} - {trip.endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Cloud className="w-4 h-4" />
                  <span>{trip.weather}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {trip.services.map((service, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg">
                    {service}
                  </span>
                ))}
              </div>
              <button
                className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md"
                onClick={() => setSelectedTrip(trip)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl mb-2">No trips found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}