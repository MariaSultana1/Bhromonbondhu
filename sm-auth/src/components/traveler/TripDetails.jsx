// TripDetails.jsx
import React from 'react';
import { ArrowLeft, Calendar, MapPin, Home, Ticket, Users, Star } from 'lucide-react';

export function TripDetails({ trip, onBack, onMarkComplete }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-4 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Trips</span>
      </button>

      <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <div className="relative h-96">
          <img
            src={trip.image}
            alt={trip.destination}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80';
            }}
          />
          <div className="absolute top-4 right-4">
            <span className={`px-4 py-2 rounded-full text-sm backdrop-blur-md shadow-lg ${
              trip.status === 'confirmed' ? 'bg-green-500/90 text-white' :
              trip.status === 'completed' ? 'bg-blue-500/90 text-white' :
              trip.status === 'pending' ? 'bg-yellow-500/90 text-white' :
              'bg-red-500/90 text-white'
            }`}>
              {trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-3xl mb-2">{trip.destination}</h2>
          <p className="text-gray-500 mb-6">Booking ID: {trip.bookingId}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Trip Details</h3>
              
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>{trip.date} - {trip.endDate}</span>
              </div>

              {trip.ticketInfo && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Ticket className="w-5 h-5" />
                  <span>{trip.ticketInfo.from} → {trip.ticketInfo.to}</span>
                </div>
              )}

              {trip.hostInfo && (
                <>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Home className="w-5 h-5" />
                    <span>{trip.hostInfo.checkIn} - {trip.hostInfo.checkOut}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>{trip.hostInfo.guests} guests • {trip.hostInfo.nights} nights</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Payment Summary</h3>
              <div className="text-3xl text-blue-600">৳{trip.totalAmount?.toLocaleString()}</div>
              {trip.hostInfo && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{trip.hostInfo.rating}</span>
                  <span className="text-gray-500">• {trip.hostName}</span>
                </div>
              )}
            </div>
          </div>

          {trip.hostInfo && trip.hostInfo.services?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Included Services</h3>
              <div className="flex flex-wrap gap-2">
                {trip.hostInfo.services.map((service, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {trip.status === 'upcoming' && !trip.journeyEnded && (
            <button
              onClick={() => onMarkComplete(trip._id)}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
            >
              Mark as Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}