// @ts-nocheck
//TicketSearchResults.jsx
import React, { useState } from 'react';
import { Clock, MapPin, Star, ChevronDown, ChevronUp, Filter, ArrowRight, Wifi, Coffee, Zap, Shield } from 'lucide-react';

export function TicketSearchResults({ tickets, loading, onSelectTicket, searchParams }) {
  const [sortBy, setSortBy] = useState('price');
  const [filterClass, setFilterClass] = useState('all');
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  // Get unique classes from tickets
  const availableClasses = Array.from(new Set(tickets.map(t => t.class)));

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter(ticket => 
      (filterClass === 'all' || ticket.class === filterClass) &&
      ticket.price >= priceRange[0] && ticket.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'departure':
          return a.departureTime.localeCompare(b.departureTime);
        case 'duration':
          return a.duration.localeCompare(b.duration);
        default:
          return 0;
      }
    });

  const amenityIcons = {
    'WiFi': Wifi,
    'AC': Zap,
    'Meal': Coffee,
    'Insurance': Shield
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for best {searchParams.transportType}es...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {searchParams.from} → {searchParams.to}
              </h1>
              <p className="text-gray-600">
                {new Date(searchParams.date).toLocaleDateString('en-BD', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Found</p>
              <p className="text-2xl font-bold text-blue-600">{filteredTickets.length} options</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>

              {/* Sort By */}
              <div className="mb-6">
                <label htmlFor="sort-by-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort-by-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="price">Price (Low to High)</option>
                  <option value="departure">Departure Time</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              {/* Class Filter */}
              {availableClasses.length > 0 && (
                <div className="mb-6">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-2">
                      Class
                    </legend>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="class"
                          value="all"
                          checked={filterClass === 'all'}
                          onChange={(e) => setFilterClass(e.target.value)}
                          className="mr-2"
                        />
                        All Classes
                      </label>
                      {availableClasses.map(cls => (
                        <label key={cls} className="flex items-center">
                          <input
                            type="radio"
                            name="class"
                            value={cls}
                            checked={filterClass === cls}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="mr-2"
                          />
                          {cls}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <label htmlFor="price-range-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <input
                    id="price-range-input"
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                    aria-label="Maximum price range"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>৳0</span>
                    <span>৳{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setFilterClass('all');
                  setPriceRange([0, 10000]);
                  setSortBy('price');
                }}
                className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg">No tickets found matching your criteria</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  {/* Main Ticket Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Provider Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img
                            src={ticket.providerLogo}
                            alt={ticket.provider}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3E%3Cpath d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"%3E%3C/path%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{ticket.provider}</h3>
                            {ticket.vehicleNumber && (
                              <span className="text-sm text-gray-500">• {ticket.vehicleNumber}</span>
                            )}
                            {ticket.trainNumber && (
                              <span className="text-sm text-gray-500">• Train {ticket.trainNumber}</span>
                            )}
                            {ticket.flightNumber && (
                              <span className="text-sm text-gray-500">• Flight {ticket.flightNumber}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{ticket.class}</span>
                            <span className="text-gray-400">•</span>
                            <span>{ticket.availableSeats} seats available</span>
                          </div>

                          {/* Time and Duration */}
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-2xl font-bold text-gray-900">
                                {new Date(`2000-01-01T${ticket.departureTime}`).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </p>
                              <p className="text-sm text-gray-600">{searchParams.from}</p>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                              <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{ticket.duration}</span>
                              </div>
                              <div className="w-full h-px bg-gray-300 my-2 relative">
                                <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white text-gray-400" />
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                {new Date(`2000-01-01T${ticket.arrivalTime}`).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </p>
                              <p className="text-sm text-gray-600">{searchParams.to}</p>
                            </div>
                          </div>

                          {/* Amenities */}
                          {ticket.amenities && ticket.amenities.length > 0 && (
                            <div className="flex items-center gap-3 mt-4">
                              {ticket.amenities.slice(0, 4).map((amenity, index) => {
                                const Icon = amenityIcons[amenity] || Star;
                                return (
                                  <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                                    <Icon className="w-4 h-4" />
                                    <span>{amenity}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price and Book Button */}
                      <div className="text-right ml-6">
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Starting from</p>
                          <p className="text-3xl font-bold text-gray-900">৳{ticket.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">per person</p>
                        </div>
                        <button
                          onClick={() => onSelectTicket(ticket)}
                          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Book Now
                        </button>
                        {ticket.route && ticket.route.length > 0 && (
                          <button
                            onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                            className="w-full mt-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1"
                          >
                            View Route
                            {expandedTicket === ticket.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Route Info */}
                  {expandedTicket === ticket.id && ticket.route && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-3">Route & Stops</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ticket.route.map((stop, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{stop}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}