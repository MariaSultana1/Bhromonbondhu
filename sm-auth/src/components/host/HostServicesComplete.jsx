import { Plus, Edit, Trash2, Calendar as CalendarIcon, DollarSign, Users, MapPin, X, Check, Clock } from 'lucide-react';
import { useState } from 'react';

const services = [
  {
    id: 1,
    name: 'Local Guide Service',
    description: 'Full-day guided tour of local attractions',
    price: 2500,
    duration: '8 hours',
    maxGuests: 4,
    active: true
  },
  {
    id: 2,
    name: 'Traditional Meals',
    description: 'Authentic local cuisine breakfast, lunch, and dinner',
    price: 1500,
    duration: 'Per day',
    maxGuests: 6,
    active: true
  },
  {
    id: 3,
    name: 'Airport Transportation',
    description: 'Pick-up and drop-off service',
    price: 1000,
    duration: 'One-way',
    maxGuests: 3,
    active: true
  },
  {
    id: 4,
    name: 'Photography Tour',
    description: 'Guided photo walk to best spots',
    price: 2000,
    duration: '4 hours',
    maxGuests: 2,
    active: false
  }
];

const availability = [
  { date: 'Dec 20-23', status: 'booked', guest: 'Riya Rahman' },
  { date: 'Dec 24', status: 'available' },
  { date: 'Dec 25-27', status: 'booked', guest: 'Arif Hasan' },
  { date: 'Dec 28-31', status: 'available' },
  { date: 'Jan 1', status: 'blocked' },
  { date: 'Jan 2-5', status: 'booked', guest: 'Nusrat Jahan' }
];

export function HostServicesComplete() {
  const [showAddService, setShowAddService] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">My Services</h2>
          <p className="text-gray-600">Manage your offerings and availability</p>
        </div>
        <button
          onClick={() => setShowAddService(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Active Services</h3>
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-5 border-2 rounded-xl ${
                    service.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4>{service.name}</h4>
                        {service.active ? (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Active</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{service.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>৳{service.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Max {service.maxGuests} guests</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedService(service);
                        setShowEditService(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm">
                      {service.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      
        <div className="space-y-6">
         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>Availability</h3>
              <button
                onClick={() => setShowCalendar(true)}
                className="text-sm text-blue-500 hover:underline"
              >
                View Calendar
              </button>
            </div>
            <div className="space-y-2">
              {availability.slice(0, 4).map((slot, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                  <span>{slot.date}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      slot.status === 'booked'
                        ? 'bg-red-100 text-red-700'
                        : slot.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

         
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Service Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Total Services</span>
                  <span className="text-blue-600">4</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Active Services</span>
                  <span className="text-green-600">3</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-purple-600">24</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Avg. Rating</span>
                  <span className="text-yellow-600">4.9 ⭐</span>
                </div>
              </div>
            </div>
          </div>

         
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="mb-3">💡 Service Tips</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Add detailed descriptions to get more bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Update availability regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Price competitively based on your area</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      
      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Add New Service</h3>
              <button onClick={() => setShowAddService(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g., Local Food Tour"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Description</label>
                <textarea
                  placeholder="Describe what's included in this service..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Price (৳)</label>
                  <input
                    type="number"
                    placeholder="2500"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Duration</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>2 hours</option>
                    <option>4 hours</option>
                    <option>8 hours</option>
                    <option>Full day</option>
                    <option>Per day</option>
                    <option>One-way</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Maximum Guests</label>
                  <input
                    type="number"
                    placeholder="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Category</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Tours & Activities</option>
                    <option>Food & Dining</option>
                    <option>Transportation</option>
                    <option>Accommodation</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Location/Meeting Point</label>
                <input
                  type="text"
                  placeholder="e.g., Hotel Lobby, City Center"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">What's Included</label>
                <textarea
                  placeholder="List what's included (one per line)..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input type="checkbox" defaultChecked className="w-5 h-5" />
                <div className="text-sm">
                  <div>Make service active immediately</div>
                  <div className="text-xs text-gray-500">Service will be visible to travelers</div>
                </div>
              </div>

              <button className="w-full py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md">
                Create Service
              </button>
            </div>
          </div>
        </div>
      )}

     
      {showEditService && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
              <h3 className="text-2xl">Edit Service</h3>
              <button onClick={() => setShowEditService(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Service Name</label>
                <input
                  type="text"
                  defaultValue={selectedService.name}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Description</label>
                <textarea
                  defaultValue={selectedService.description}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Price (৳)</label>
                  <input
                    type="number"
                    defaultValue={selectedService.price}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Duration</label>
                  <input
                    type="text"
                    defaultValue={selectedService.duration}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Maximum Guests</label>
                <input
                  type="number"
                  defaultValue={selectedService.maxGuests}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl mb-1">Availability Calendar</h3>
                <p className="text-purple-100 text-sm">Manage your schedule</p>
              </div>
              <button onClick={() => setShowCalendar(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4>December 2024</h4>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      className={`aspect-square p-2 text-sm rounded-lg border-2 ${
                        day >= 20 && day <= 23
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : day === 24 || (day >= 28 && day <= 31)
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : day >= 25 && day <= 27
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="mb-4">Legend</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">Booked</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span className="text-sm">Blocked</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4>Upcoming Bookings</h4>
                {availability.filter(a => a.status === 'booked').map((slot, idx) => (
                  <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="mb-1">{slot.date}</div>
                        <div className="text-sm text-gray-600">{slot.guest}</div>
                      </div>
                      <button className="text-sm text-blue-500 hover:underline">View Details</button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600">
                Block Selected Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}