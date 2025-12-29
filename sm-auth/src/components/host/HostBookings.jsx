import { Calendar, User, MessageSquare, Check, X, Clock } from 'lucide-react';

const bookings = [
  {
    id: 1,
    traveler: 'Riya Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riya',
    dates: 'Dec 20 - Dec 23, 2024',
    guests: 2,
    amount: 7500,
    status: 'confirmed',
    services: ['Local Guide', 'Meals', 'Transportation'],
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
  },
  {
    id: 2,
    traveler: 'Arif Hasan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arif',
    dates: 'Dec 25 - Dec 27, 2024',
    guests: 1,
    amount: 6000,
    status: 'pending',
    services: ['Local Guide', 'Photography'],
    checkIn: '3:00 PM',
    checkOut: '10:00 AM',
  },
  {
    id: 3,
    traveler: 'Nusrat Jahan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
    dates: 'Jan 2 - Jan 5, 2025',
    guests: 3,
    amount: 8000,
    status: 'confirmed',
    services: ['Local Guide', 'Meals', 'Trekking'],
    checkIn: '1:00 PM',
    checkOut: '12:00 PM',
  },
  {
    id: 4,
    traveler: 'Mehedi Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi',
    dates: 'Nov 15 - Nov 18, 2024',
    guests: 2,
    amount: 6000,
    status: 'completed',
    services: ['Local Guide', 'City Tour'],
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
  },
];

export function HostBookings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Bookings Management</h2>
        <p className="text-gray-600">Manage your guest bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button className="pb-3 px-4 border-b-2 border-green-500 text-green-600">
          All Bookings
        </button>
        <button className="pb-3 px-4 text-gray-600 hover:text-gray-900">
          Pending (1)
        </button>
        <button className="pb-3 px-4 text-gray-600 hover:text-gray-900">
          Confirmed (2)
        </button>
        <button className="pb-3 px-4 text-gray-600 hover:text-gray-900">
          Completed
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between gap-4 mb-4">
              <div className="flex gap-4">
                <img
                  src={booking.avatar}
                  alt={booking.traveler}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3>{booking.traveler}</h3>

                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {booking.dates}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {booking.guests} guest{booking.guests > 1 && 's'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {booking.services.map((service, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm mb-2 ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {booking.status}
                </span>
                <div className="text-2xl">৳{booking.amount}</div>
                <div className="text-xs text-gray-500">Total amount</div>
              </div>
            </div>

            {/* Check-in/out */}
            <div className="grid md:grid-cols-2 gap-4 py-4 border-y border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Check-in</p>
                <p>{booking.checkIn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p>{booking.checkOut}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              {booking.status === 'pending' && (
                <>
                  <button className="flex gap-2 px-4 py-2 bg-green-500 text-white rounded-lg">
                    <Check className="w-4 h-4" /> Accept
                  </button>
                  <button className="flex gap-2 px-4 py-2 bg-red-500 text-white rounded-lg">
                    <X className="w-4 h-4" /> Decline
                  </button>
                </>
              )}

              {booking.status === 'confirmed' && (
                <>
                  <button className="flex gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
                    <MessageSquare className="w-4 h-4" /> Message
                  </button>
                  <button className="px-4 py-2 border rounded-lg">View</button>
                  <button className="px-4 py-2 border rounded-lg">Modify</button>
                </>
              )}

              {booking.status === 'completed' && (
                <>
                  <button className="px-4 py-2 border rounded-lg">
                    View Receipt
                  </button>
                  <button className="px-4 py-2 border rounded-lg">
                    Request Review
                  </button>
                </>
              )}
            </div>

            {booking.status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div className="text-sm text-yellow-800">
                  Respond within 24 hours to maintain acceptance rate
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
