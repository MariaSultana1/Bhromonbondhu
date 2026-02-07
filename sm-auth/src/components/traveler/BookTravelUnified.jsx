//BookTravelUnified.jsx
import { useState } from 'react';
import { Home, Plane, Ticket } from 'lucide-react';
import { BookTravel as HostBooking } from './BookTravel';
import { TransportBookingFlow } from './TransportBookingFlow';
import { MyTickets } from './MyTickets';

export function BookTravelUnified() {
  const [activeCategory, setActiveCategory] = useState('hosts');

  const categories = [
    { id: 'hosts', label: 'Local Hosts', icon: Home },
    { id: 'transport', label: 'Transport Booking', icon: Plane },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
  ];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 inline-flex gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-lg transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span>{category.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeCategory === 'hosts' && <HostBooking />}
        {activeCategory === 'transport' && <TransportBookingFlow />}
        {activeCategory === 'tickets' && <MyTickets />}
      </div>
    </div>
  );
}