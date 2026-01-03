import { Plus, Edit, Trash2, Calendar as CalendarIcon, DollarSign, Users, MapPin } from 'lucide-react';

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

export function HostServices() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-2">Services & Availability</h2>
        <p className="text-gray-600">Manage your offerings and calendar</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Services List */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>My Services</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border-2 rounded-lg ${
                    service.active ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4>{service.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            service.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {service.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ৳{service.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {service.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Max {service.maxGuests} guests
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      className={`px-3 py-1 rounded-lg text-sm ${
                        service.active
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {service.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      Edit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="mb-3">Service Guidelines</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Clearly describe what's included in each service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Set realistic pricing based on market rates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Update availability regularly to avoid conflicts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Respond promptly to service inquiries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar/Availability */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>Availability</h3>
              <button className="text-sm text-blue-500 hover:underline">
                Edit Calendar
              </button>
            </div>
            <div className="space-y-2">
              {availability.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    item.status === 'booked'
                      ? 'border-yellow-200 bg-yellow-50'
                      : item.status === 'available'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.date}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'booked'
                          ? 'bg-yellow-200 text-yellow-800'
                          : item.status === 'available'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  {item.guest && (
                    <p className="text-xs text-gray-600">{item.guest}</p>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              View Full Calendar
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Service Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Services</span>
                <span className="text-green-600">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Bookings</span>
                <span className="text-blue-600">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Availability Rate</span>
                <span className="text-purple-600">68%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Price</span>
                <span className="text-orange-600">৳1,750</span>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Service Location</h3>
            <div className="flex items-start gap-2 mb-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm mb-1">Cox's Bazar</p>
                <p className="text-xs text-gray-600">Primary service area</p>
              </div>
            </div>
            <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Update Location
            </button>
          </div>

          {/* Popular Services */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="mb-3">💡 Tips</h4>
            <p className="text-sm text-gray-700 mb-2">
              Most booked services in your area:
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Local food tours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Photography sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Beach activities</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}