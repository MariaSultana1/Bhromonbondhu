import { Plus, Edit, Trash2, Calendar as CalendarIcon, DollarSign, Users, MapPin, X, Clock, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';

// ============ API SERVICE ============

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class HostServiceAPI {
  constructor(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Hosts
  async getHosts() {
    return this.request('/hosts');
  }

  async createHost(data) {
    return this.request('/hosts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Trips
  async getTrips() {
    return this.request('/trips');
  }

  async createTrip(data) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTrip(id, data) {
    return this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // User
  async getCurrentUser() {
    return this.request('/auth/me');
  }
}

// ============ MODAL COMPONENTS ============

const AddServiceModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    maxGuests: '',
    propertyImage: '',
    services: [],
    description: ''
  });

  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleToggleService = (service) => {
    const updatedServices = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Add New Service</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Service Name *</label>
            <input
              type="text"
              placeholder="e.g., Local Guide Service"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Location *</label>
            <input
              type="text"
              placeholder="e.g., Cox's Bazar"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Price (৳/day) *</label>
              <input
                type="number"
                placeholder="2500"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Max Guests *</label>
              <input
                type="number"
                placeholder="4"
                value={formData.maxGuests}
                onChange={(e) => handleChange('maxGuests', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Property Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.propertyImage}
              onChange={(e) => handleChange('propertyImage', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
            <textarea
              placeholder="Describe your service..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">Services Offered</label>
            <div className="grid grid-cols-2 gap-2">
              {['Local Guide', 'Transportation', 'Meals', 'Photography', 'Activities', 'Accommodation'].map(service => (
                <label key={service} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={() => handleToggleService(service)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Service'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============ CALENDAR MODAL ============

const CalendarModal = ({ isOpen, onClose, trips }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-500 text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Calendar & Trips</h3>
            <p className="text-purple-100 text-sm">View your bookings and trips</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <h4 className="font-semibold mb-4">Upcoming Trips ({trips.length})</h4>
          
          {trips.length > 0 ? (
            <div className="space-y-3">
              {trips
                .filter(trip => trip.status === 'upcoming')
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((trip) => (
                  <div key={trip._id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-800">{trip.destination}</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          📅 {new Date(trip.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}`}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          👤 {trip.guests} guest(s) • ৳{trip.totalAmount?.toLocaleString('en-BD')}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {trip.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No trips scheduled yet</p>
          )}

          <div className="mt-8">
            <h4 className="font-semibold mb-4">Trip Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{trips.filter(t => t.status === 'upcoming').length}</p>
                <p className="text-xs text-gray-600 mt-1">Upcoming</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{trips.filter(t => t.status === 'completed').length}</p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">
                  ৳{trips.reduce((sum, t) => sum + (t.totalAmount || 0), 0).toLocaleString('en-BD')}
                </p>
                <p className="text-xs text-gray-600 mt-1">Total Value</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ SERVICE CARD ============

const ServiceCard = ({ service, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Delete "${service.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(service._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-5 border-2 border-green-200 bg-green-50 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-lg">{service.name}</h4>
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3">{service.description || 'Professional service'}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{service.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>৳{service.price?.toLocaleString('en-BD') || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Max {service.maxGuests} guests</span>
            </div>
          </div>

          {service.services && service.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {service.services.map((svc, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {svc}
                </span>
              ))}
            </div>
          )}
        </div>

        {service.propertyImage && (
          <img
            src={service.propertyImage}
            alt={service.name}
            className="w-24 h-24 object-cover rounded-lg ml-4"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => onEdit(service)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 text-sm transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm transition-colors disabled:opacity-50"
        >
          {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </div>
  );
};

// ============ STATISTICS WIDGET ============

const StatisticsWidget = ({ services, trips }) => {
  const activeCount = services.length;
  const totalGuests = services.reduce((sum, s) => sum + (s.totalGuests || 0), 0);
  const completedTrips = trips.filter(t => t.status === 'completed').length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Service Stats</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Active Services</span>
          <span className="text-green-600 font-semibold text-lg">{activeCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Guests Hosted</span>
          <span className="text-blue-600 font-semibold text-lg">{totalGuests}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Completed Trips</span>
          <span className="text-purple-600 font-semibold text-lg">{completedTrips}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Revenue</span>
          <span className="text-orange-600 font-semibold text-lg">
            ৳{trips.reduce((sum, t) => sum + (t.totalAmount || 0), 0).toLocaleString('en-BD')}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============ TIPS WIDGET ============

const TipsWidget = () => {
  const tips = [
    'Add detailed descriptions to get more bookings',
    'Update availability regularly',
    'Price competitively based on your area'
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h4 className="font-semibold mb-3">💡 Service Tips</h4>
      <ul className="space-y-2 text-sm text-gray-700">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5 font-bold">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ============ MAIN COMPONENT ============

export function HostServicesComplete() {
  const [services, setServices] = useState([]);
  const [trips, setTrips] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [showAddService, setShowAddService] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [api, setApi] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in');
      setIsLoading(false);
      return;
    }

    const apiInstance = new HostServiceAPI(token);
    setApi(apiInstance);
    fetchData(apiInstance);
  }, []);

  const fetchData = async (apiInstance) => {
    setIsLoading(true);
    setError('');

    try {
      const userData = await apiInstance.getCurrentUser();
      setCurrentUser(userData.user);

      try {
        const hostsData = await apiInstance.getHosts();
        setServices(hostsData.hosts || []);
      } catch (err) {
        setServices([]);
      }

      try {
        const tripsData = await apiInstance.getTrips();
        setTrips(tripsData.trips || []);
      } catch (err) {
        setTrips([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (formData) => {
    if (!api) return;

    setIsCreating(true);
    setError('');

    try {
      await api.createHost(formData);
      setSuccessMessage('Service created successfully!');
      setShowAddService(false);
      await fetchData(api);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create service');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    setServices(services.filter(s => s._id !== serviceId));
    setSuccessMessage('Service deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ✕ {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Services</h1>
          <p className="text-gray-600">Manage your offerings and availability</p>
        </div>
        <button
          onClick={() => setShowAddService(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">
              Services ({services.length})
            </h2>

            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onEdit={() => console.log('Edit:', service)}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No services yet</p>
                <button
                  onClick={() => setShowAddService(true)}
                  className="text-green-500 hover:underline font-medium"
                >
                  Create your first service
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Calendar</h3>
              <button
                onClick={() => setShowCalendar(true)}
                className="text-sm text-blue-500 hover:underline font-medium"
              >
                View Calendar
              </button>
            </div>
            <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg text-center">
              {trips.filter(t => t.status === 'upcoming').length} upcoming trips
            </div>
          </div>

          <StatisticsWidget services={services} trips={trips} />
          <TipsWidget />
        </div>
      </div>

      <AddServiceModal
        isOpen={showAddService}
        onClose={() => setShowAddService(false)}
        onSubmit={handleAddService}
        isLoading={isCreating}
      />

      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        trips={trips}
      />
    </div>
  );
}

export default HostServicesComplete;