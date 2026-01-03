import { useState, useEffect } from 'react';
import { Calendar, MapPin, Star, MessageSquare, Phone, CheckCircle, Plane, Train, Bus, Ticket, Users, Clock, Download, XCircle, Mail, ArrowRight } from 'lucide-react';

export function MyHosts() {
  const [activeTab, setActiveTab] = useState('hosts');
  const [hostBookings, setHostBookings] = useState([]);
  const [ticketBookings, setTicketBookings] = useState([]);

  useEffect(() => {
    const storedHostBookings = JSON.parse(localStorage.getItem('hostBookings') || '[]');
    const storedTicketBookings = JSON.parse(localStorage.getItem('ticketBookings') || '[]');
    setHostBookings(storedHostBookings);
    setTicketBookings(storedTicketBookings);
  }, []);

  const getBookingStatus = (dateString) => {
    const bookingDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate > today) {
      return 'upcoming';
    } else if (bookingDate.toDateString() === today.toDateString()) {
      return 'today';
    } else {
      return 'completed';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getTransportIcon = (type) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'train':
        return <Train className="w-5 h-5" />;
      case 'bus':
        return <Bus className="w-5 h-5" />;
      default:
        return <Ticket className="w-5 h-5" />;
    }
  };

  const clearAllBookings = () => {
    if (window.confirm('Are you sure you want to clear all bookings? This action cannot be undone.')) {
      localStorage.removeItem('hostBookings');
      localStorage.removeItem('ticketBookings');
      setHostBookings([]);
      setTicketBookings([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">My Bookings</h2>
            <p className="text-blue-100">Manage your experiences and travel tickets</p>
          </div>
          {(hostBookings.length > 0 || ticketBookings.length > 0) && (
            <button
              onClick={clearAllBookings}
              className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all border border-white/30"
            >
              Clear All Bookings
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-2">
        <button
          onClick={() => setActiveTab('hosts')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'hosts'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span>Host Experiences</span>
            {hostBookings.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {hostBookings.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-6 py-3 rounded-lg transition-all ${
            activeTab === 'tickets'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            <span>Travel Tickets</span>
            {ticketBookings.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {ticketBookings.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Host Bookings */}
      {activeTab === 'hosts' && (
        <div className="space-y-4">
          {hostBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 shadow-sm text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl mb-3">No Host Bookings Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Start exploring authentic local experiences with verified hosts across Bangladesh</p>
              <button className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all">
                Discover Hosts
              </button>
            </div>
          ) : (
            hostBookings.map((booking, index) => {
              const status = getBookingStatus(booking.checkIn);
              return (
                <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="md:flex">
                    <div className="md:w-72 h-56 md:h-auto relative overflow-hidden">
                      <img
                        src={booking.propertyImage}
                        alt={booking.location}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-4 right-4 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg ${
                        status === 'upcoming' ? 'bg-green-500/90 text-white' :
                        status === 'today' ? 'bg-blue-500/90 text-white' :
                        'bg-gray-800/90 text-white'
                      }`}>
                        <div className="text-sm">
                          {status === 'upcoming' ? 'Upcoming' : status === 'today' ? 'Today' : 'Completed'}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={booking.hostAvatar}
                              alt={booking.hostName}
                              className="w-14 h-14 rounded-full border-2 border-blue-100"
                            />
                            <div>
                              <h3 className="text-xl mb-1">{booking.hostName}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="text-xs text-gray-500">Check-in</div>
                                <div className="text-sm">{formatDate(booking.checkIn)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl">
                              <Calendar className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="text-xs text-gray-500">Check-out</div>
                                <div className="text-sm">{formatDate(booking.checkOut)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                            </div>
                            {booking.services && booking.services.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {booking.services.map((service, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100"
                                  >
                                    {service}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-3xl text-blue-600 mb-1">৳{booking.totalPrice}</div>
                          <div className="text-xs text-gray-500">Total amount</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                        {status === 'upcoming' || status === 'today' ? (
                          <>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-sm">
                              <MessageSquare className="w-4 h-4" />
                              <span>Message Host</span>
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                              <Phone className="w-4 h-4" />
                              <span>Call</span>
                            </button>
                            <button className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                              View Details
                            </button>
                            <button className="ml-auto px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200 transition-all">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all shadow-sm">
                              <Star className="w-4 h-4" />
                              <span>Write Review</span>
                            </button>
                            <button className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                              View Receipt
                            </button>
                            <button className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                              Book Again
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Ticket Bookings */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {ticketBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 shadow-sm text-center border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl mb-3">No Travel Tickets Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Book flights, trains, or buses for your next adventure across Bangladesh</p>
              <button className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all">
                Browse Tickets
              </button>
            </div>
          ) : (
            ticketBookings.map((booking, index) => {
              const status = getBookingStatus(booking.date);
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        booking.type === 'flight' ? 'bg-blue-100 text-blue-600' :
                        booking.type === 'train' ? 'bg-green-100 text-green-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {getTransportIcon(booking.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl capitalize">{booking.type} Ticket</h3>
                          <span className={`px-3 py-1 rounded-lg text-xs ${
                            status === 'upcoming' ? 'bg-green-100 text-green-700' :
                            status === 'today' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {status === 'upcoming' ? 'Upcoming' : status === 'today' ? 'Today' : 'Completed'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{booking.operator}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl text-blue-600 mb-1">৳{booking.totalPrice}</div>
                      <div className="text-xs text-gray-500">{booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mb-5 border border-blue-100">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs text-gray-500 mb-2">Departure</div>
                        <div className="mb-2">{booking.from}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{booking.departure}</span>
                        </div>
                      </div>
                      <div className="text-center flex flex-col justify-center">
                        <div className="text-xs text-gray-500 mb-2">Travel Date</div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        {booking.type === 'flight' && (
                          <div className="text-xs bg-white px-3 py-1 rounded-full inline-block mx-auto">{booking.seatClass}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-2">Arrival</div>
                        <div className="mb-2">{booking.to}</div>
                        <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{booking.arrival}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {status === 'upcoming' || status === 'today' ? (
                      <>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-sm">
                          <Ticket className="w-4 h-4" />
                          <span>View E-Ticket</span>
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                          <Download className="w-4 h-4" />
                          <span>Download PDF</span>
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                          <Calendar className="w-4 h-4" />
                          <span>Add to Calendar</span>
                        </button>
                        <button className="ml-auto px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl border-2 border-red-200 transition-all">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                          View Receipt
                        </button>
                        <button className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                          Book Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Info Box */}
      {(hostBookings.length > 0 || ticketBookings.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-blue-900">Need Assistance?</h4>
              <p className="text-sm text-blue-800 leading-relaxed mb-4">
                Having issues with your booking or need to make changes? Our 24/7 support team is ready to help you.
              </p>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-sm transition-all">
                  <Mail className="w-4 h-4" />
                  <span>Contact Support</span>
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
