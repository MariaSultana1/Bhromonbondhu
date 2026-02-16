// src/components/host/HostServicesComplete.jsx - FIXED VERSION

import { Plus, Edit, Trash2, Calendar as CalendarIcon, DollarSign, Users, MapPin, X, Clock, Loader, AlertCircle } from 'lucide-react';
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

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ✅ FIX: All methods now use /host-services endpoints
  async getMyServices() {
    return this.request('/host-services/my-services');
  }

  async createService(data) {
    return this.request('/host-services', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateService(id, data) {
    return this.request(`/host-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteService(id) {
    return this.request(`/host-services/${id}`, {
      method: 'DELETE'
    });
  }

  async getServiceStats() {
    // ✅ FIX: Removed stray 'z' character that caused syntax error
    return this.request('/host-services/stats/my-stats');
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }
}

// ============ EDIT SERVICE MODAL ============

const EditServiceModal = ({ isOpen, onClose, service, onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    maxGuests: '',
    propertyImage: '',
    services: [],
    description: '',
    experience: 'Beginner',
    responseTime: 'Within 1 hour',
    cancellationPolicy: 'Flexible',
    minStay: 1,
    availableFromDate: '',
    availableToDate: '',
    available: true
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (service && isOpen) {
      setFormData({
        name: service.name || '',
        location: service.location || '',
        price: service.price || '',
        maxGuests: service.maxGuests || '',
        propertyImage: service.propertyImage || '',
        services: service.serviceType || [],
        description: service.description || '',
        experience: service.experience || 'Beginner',
        responseTime: service.responseTime || 'Within 1 hour',
        cancellationPolicy: service.cancellationPolicy || 'Flexible',
        minStay: service.minStay || 1,
        availableFromDate: service.availableFromDate
          ? new Date(service.availableFromDate).toISOString().split('T')[0]
          : '',
        availableToDate: service.availableToDate
          ? new Date(service.availableToDate).toISOString().split('T')[0]
          : '',
        available: service.available !== undefined ? service.available : true
      });
      setValidationErrors({});
    }
  }, [service, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleToggleService = (serviceType) => {
    const updatedServices = formData.services.includes(serviceType)
      ? formData.services.filter(s => s !== serviceType)
      : [...formData.services, serviceType];
    setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const offersAccommodation = formData.services.includes('Accommodation');

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Service name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Price must be a positive number';
    if (!formData.maxGuests || parseInt(formData.maxGuests) < 1) errors.maxGuests = 'Maximum guests must be at least 1';
    if (offersAccommodation && !formData.propertyImage.trim()) errors.propertyImage = 'Property image is required when offering accommodation';
    if (formData.propertyImage && formData.propertyImage.trim() !== '') {
      try { new URL(formData.propertyImage); } catch { errors.propertyImage = 'Please enter a valid URL'; }
    }
    if (formData.services.length === 0) errors.services = 'Please select at least one service';
    if (!formData.availableFromDate) errors.availableFromDate = 'Available from date is required';
    if (!formData.availableToDate) errors.availableToDate = 'Available to date is required';
    if (formData.availableFromDate && formData.availableToDate) {
      if (new Date(formData.availableFromDate) > new Date(formData.availableToDate)) {
        errors.availableToDate = 'Available to date must be after available from date';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Edit Service</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 text-sm">
                <p className="font-medium">Error updating service</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Service Name *
                  {validationErrors.name && <span className="text-red-600 ml-1 text-xs">{validationErrors.name}</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Local Guide Service"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.name ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Location *
                  {validationErrors.location && <span className="text-red-600 ml-1 text-xs">{validationErrors.location}</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cox's Bazar, Bangladesh"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.location ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                <textarea
                  placeholder="Describe your service..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Pricing & Capacity</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Price (৳/day) *
                  {validationErrors.price && <span className="text-red-600 ml-1 text-xs">{validationErrors.price}</span>}
                </label>
                <input
                  type="number"
                  placeholder="2500"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.price ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                  min="1" step="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Max Guests *
                  {validationErrors.maxGuests && <span className="text-red-600 ml-1 text-xs">{validationErrors.maxGuests}</span>}
                </label>
                <input
                  type="number"
                  placeholder="4"
                  value={formData.maxGuests}
                  onChange={(e) => handleChange('maxGuests', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.maxGuests ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                  min="1"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Minimum Stay (nights)</label>
                <input
                  type="number"
                  value={formData.minStay}
                  onChange={(e) => handleChange('minStay', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Response Time</label>
                <select
                  value={formData.responseTime}
                  onChange={(e) => handleChange('responseTime', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Within 30 minutes</option>
                  <option>Within 1 hour</option>
                  <option>Within 2 hours</option>
                  <option>Within 24 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Services Offered *</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Local Guide', 'Transportation', 'Meals', 'Photography', 'Activities', 'Accommodation'].map(serviceType => (
                <label key={serviceType} className={`flex items-center gap-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors ${formData.services.includes(serviceType) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="checkbox"
                    checked={formData.services.includes(serviceType)}
                    onChange={() => handleToggleService(serviceType)}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <span className="text-sm font-medium">{serviceType}</span>
                </label>
              ))}
            </div>
            {validationErrors.services && <span className="text-red-600 text-xs mt-1 block">{validationErrors.services}</span>}
          </div>

          {/* Availability Dates */}
          <div className="border-b pb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              📅 Service Availability Dates *
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Available From *
                  {validationErrors.availableFromDate && <span className="text-red-600 ml-1 text-xs">{validationErrors.availableFromDate}</span>}
                </label>
                <input
                  type="date"
                  value={formData.availableFromDate}
                  onChange={(e) => handleChange('availableFromDate', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.availableFromDate ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Available To *
                  {validationErrors.availableToDate && <span className="text-red-600 ml-1 text-xs">{validationErrors.availableToDate}</span>}
                </label>
                <input
                  type="date"
                  value={formData.availableToDate}
                  onChange={(e) => handleChange('availableToDate', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.availableToDate ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                  min={formData.availableFromDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Property Image (conditional) */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Property Image {offersAccommodation ? '*' : '(Optional)'}
            </h4>
            {offersAccommodation && (
              <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs text-yellow-900"><strong>📸 Required:</strong> Since you're offering accommodation, please provide a property image.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {offersAccommodation ? 'Property Image URL *' : 'Property Image URL (Optional)'}
                {validationErrors.propertyImage && <span className="text-red-600 ml-1 text-xs">{validationErrors.propertyImage}</span>}
              </label>
              <input
                type="url"
                placeholder="https://example.com/property-image.jpg"
                value={formData.propertyImage}
                onChange={(e) => handleChange('propertyImage', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.propertyImage ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
              />
            </div>
            {formData.propertyImage && formData.propertyImage.trim() !== '' && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <img
                  src={formData.propertyImage}
                  alt="Property preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Additional Details</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Experience Level</label>
                <select value={formData.experience} onChange={(e) => handleChange('experience', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Cancellation Policy</label>
                <select value={formData.cancellationPolicy} onChange={(e) => handleChange('cancellationPolicy', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Flexible</option>
                  <option>Moderate</option>
                  <option>Strict</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => handleChange('available', e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Service is currently available for booking</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (<><Loader className="w-4 h-4 animate-spin" />Updating Service...</>) : (<><Edit className="w-4 h-4" />Update Service</>)}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============ ADD SERVICE MODAL ============

const AddServiceModal = ({ isOpen, onClose, onSubmit, isLoading, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    maxGuests: 4,
    propertyImage: '',
    services: [],
    description: '',
    experience: 'Beginner',
    responseTime: 'Within 1 hour',
    cancellationPolicy: 'Flexible',
    minStay: 1,
    availableFromDate: '',
    availableToDate: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '', location: '', price: '', maxGuests: 4, propertyImage: '',
        services: [], description: '', experience: 'Beginner',
        responseTime: 'Within 1 hour', cancellationPolicy: 'Flexible',
        minStay: 1, availableFromDate: '', availableToDate: ''
      });
      setValidationErrors({});
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleToggleService = (service) => {
    const updatedServices = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const offersAccommodation = formData.services.includes('Accommodation');

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Service name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Price must be a positive number';
    if (!formData.maxGuests || parseInt(formData.maxGuests) < 1) errors.maxGuests = 'Maximum guests must be at least 1';
    if (offersAccommodation && !formData.propertyImage.trim()) errors.propertyImage = 'Property image is required when offering accommodation';
    if (formData.propertyImage && formData.propertyImage.trim() !== '') {
      try { new URL(formData.propertyImage); } catch { errors.propertyImage = 'Please enter a valid URL'; }
    }
    if (formData.services.length === 0) errors.services = 'Please select at least one service';
    if (!formData.availableFromDate) errors.availableFromDate = 'Available from date is required';
    if (!formData.availableToDate) errors.availableToDate = 'Available to date is required';
    if (formData.availableFromDate && formData.availableToDate) {
      if (new Date(formData.availableFromDate) > new Date(formData.availableToDate)) {
        errors.availableToDate = 'Available to date must be after available from date';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Add New Service</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-700 text-sm">
                <p className="font-medium">Error creating service</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Basic Information</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Service Name *
                  {validationErrors.name && <span className="text-red-600 ml-1 text-xs">{validationErrors.name}</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Local Guide Service"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.name ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-green-500'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Location *
                  {validationErrors.location && <span className="text-red-600 ml-1 text-xs">{validationErrors.location}</span>}
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cox's Bazar, Bangladesh"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.location ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-green-500'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                <textarea
                  placeholder="Describe your service..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Pricing & Capacity</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Price (৳/day) *
                  {validationErrors.price && <span className="text-red-600 ml-1 text-xs">{validationErrors.price}</span>}
                </label>
                <input
                  type="number"
                  placeholder="2500"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.price ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-green-500'}`}
                  min="1" step="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Max Guests *
                  {validationErrors.maxGuests && <span className="text-red-600 ml-1 text-xs">{validationErrors.maxGuests}</span>}
                </label>
                <input
                  type="number"
                  placeholder="4"
                  value={formData.maxGuests}
                  onChange={(e) => handleChange('maxGuests', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.maxGuests ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-green-500'}`}
                  min="1"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Minimum Stay (nights)</label>
                <input
                  type="number"
                  value={formData.minStay}
                  onChange={(e) => handleChange('minStay', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Response Time</label>
                <select
                  value={formData.responseTime}
                  onChange={(e) => handleChange('responseTime', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Within 30 minutes</option>
                  <option>Within 1 hour</option>
                  <option>Within 2 hours</option>
                  <option>Within 24 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Services Offered *</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Local Guide', 'Transportation', 'Meals', 'Photography', 'Activities', 'Accommodation'].map(service => (
                <label key={service} className={`flex items-center gap-2 p-3 border rounded-lg hover:bg-green-50 cursor-pointer transition-colors ${formData.services.includes(service) ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={() => handleToggleService(service)}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <span className="text-sm font-medium">{service}</span>
                </label>
              ))}
            </div>
            {validationErrors.services && <span className="text-red-600 text-xs mt-1 block">{validationErrors.services}</span>}
          </div>

          {/* Availability Dates */}
          <div className="border-b pb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              📅 Service Availability Dates *
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Available From *
                  {validationErrors.availableFromDate && <span className="text-red-600 ml-1 text-xs">{validationErrors.availableFromDate}</span>}
                </label>
                <input
                  type="date"
                  value={formData.availableFromDate}
                  onChange={(e) => handleChange('availableFromDate', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.availableFromDate ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-600 mt-1">When do you start offering this service?</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Available To *
                  {validationErrors.availableToDate && <span className="text-red-600 ml-1 text-xs">{validationErrors.availableToDate}</span>}
                </label>
                <input
                  type="date"
                  value={formData.availableToDate}
                  onChange={(e) => handleChange('availableToDate', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.availableToDate ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'}`}
                  min={formData.availableFromDate || new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-600 mt-1">Until when will you offer this service?</p>
              </div>
            </div>
          </div>

          {/* Property Image (conditional) */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              Property Image {offersAccommodation ? '*' : '(Optional)'}
            </h4>
            {offersAccommodation && (
              <div className="mb-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs text-yellow-900"><strong>📸 Required:</strong> Since you're offering accommodation, please provide a property image.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                {offersAccommodation ? 'Property Image URL *' : 'Property Image URL (Optional)'}
                {validationErrors.propertyImage && <span className="text-red-600 ml-1 text-xs">{validationErrors.propertyImage}</span>}
              </label>
              <input
                type="url"
                placeholder="https://example.com/property-image.jpg"
                value={formData.propertyImage}
                onChange={(e) => handleChange('propertyImage', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${validationErrors.propertyImage ? 'border-red-300 focus:ring-2 focus:ring-red-500' : 'border-gray-200 focus:ring-2 focus:ring-green-500'}`}
              />
              <p className="text-xs text-gray-600 mt-1">
                {offersAccommodation ? 'Show guests your property (required for accommodation)' : 'Optional: Add an image to showcase your service'}
              </p>
            </div>
            {formData.propertyImage && formData.propertyImage.trim() !== '' && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <img
                  src={formData.propertyImage}
                  alt="Property preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-gray-800 mb-3">Additional Details</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Experience Level</label>
                <select value={formData.experience} onChange={(e) => handleChange('experience', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Cancellation Policy</label>
                <select value={formData.cancellationPolicy} onChange={(e) => handleChange('cancellationPolicy', e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>Flexible</option>
                  <option>Moderate</option>
                  <option>Strict</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (<><Loader className="w-4 h-4 animate-spin" />Creating Service...</>) : (<><Plus className="w-4 h-4" />Create Service</>)}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============ SERVICE CARD ============

const ServiceCard = ({ service, onEdit, onDelete, onRefresh }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const offersAccommodation = service.serviceType?.includes('Accommodation');

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(service._id);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateString; }
  };

  return (
    <div className="p-5 border-2 border-green-200 bg-green-50 rounded-xl transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h4 className="font-semibold text-lg">{service.name}</h4>
            {service.available && service.active && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">Active</span>
            )}
            {!service.available && (
              <span className="px-2 py-1 bg-gray-400 text-white text-xs font-medium rounded-full">Unavailable</span>
            )}
            {!service.active && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full">Inactive</span>
            )}
            {offersAccommodation && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">🏠 Accommodation</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-3">{service.description || 'Professional service'}</p>

          {(service.availableFromDate || service.availableToDate) && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 flex items-center gap-2 mb-1">
                <CalendarIcon className="w-4 h-4" />📅 Availability Period
              </p>
              <p className="text-sm text-blue-800">
                {formatDate(service.availableFromDate)} → {formatDate(service.availableToDate)}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{service.location}</span></div>
            <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" /><span>৳{service.price?.toLocaleString('en-BD') || 'N/A'}</span></div>
            <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>Max {service.maxGuests} guests</span></div>
          </div>

          {service.serviceType && service.serviceType.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {service.serviceType.map((type, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{type}</span>
              ))}
            </div>
          )}

          {(service.totalBookings > 0 || service.rating > 0) && (
            <div className="mt-3 flex gap-4 text-xs text-gray-600">
              {service.totalBookings > 0 && <span>📊 {service.totalBookings} bookings</span>}
              {service.rating > 0 && <span>⭐ {service.rating.toFixed(1)} ({service.reviews} reviews)</span>}
            </div>
          )}
        </div>

        {service.propertyImage && (
          <img
            src={service.propertyImage}
            alt={service.name}
            className="w-24 h-24 object-cover rounded-lg ml-4 flex-shrink-0"
            onError={(e) => e.target.style.display = 'none'}
          />
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-200 flex-wrap">
        <button
          onClick={() => onEdit(service)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          <Edit className="w-4 h-4" />Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (<><Loader className="w-4 h-4 animate-spin" />Deleting...</>) : (<><Trash2 className="w-4 h-4" />Delete</>)}
        </button>
      </div>
    </div>
  );
};

// ============ STATISTICS WIDGET ============

const StatisticsWidget = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Service Statistics</h3>
      <div className="space-y-4">
        {[
          { label: 'Total Services', value: stats.totalServices, color: 'blue' },
          { label: 'Active Services', value: stats.activeServices, color: 'green' },
          { label: 'Total Bookings', value: stats.totalBookings, color: 'purple' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`flex items-center justify-between p-3 bg-${color}-50 rounded-lg`}>
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className={`text-2xl font-bold text-${color}-600`}>{value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Avg. Rating</span>
          <span className="text-2xl font-bold text-yellow-600">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'} ⭐
          </span>
        </div>
      </div>
    </div>
  );
};

// ============ TIPS WIDGET ============

const TipsWidget = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
    <h4 className="font-semibold mb-3">💡 Hosting Tips</h4>
    <ul className="space-y-2 text-sm text-gray-700">
      {[
        'Set clear availability dates so guests know when you can host',
        'Add property images if offering accommodation',
        'Offer multiple services to attract more bookings',
        'Respond quickly to inquiries to increase bookings',
        'Update your prices seasonally to maximize earnings'
      ].map((tip, i) => (
        <li key={i} className="flex items-start gap-2"><span className="mt-0.5">•</span><span>{tip}</span></li>
      ))}
    </ul>
  </div>
);

// ============ MAIN COMPONENT ============

export function HostServicesComplete() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [showAddService, setShowAddService] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [createError, setCreateError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [api, setApi] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your services');
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

      if (userData.user.role !== 'host') {
        setError('Only hosts can access this page');
        setIsLoading(false);
        return;
      }

      try {
        const servicesData = await apiInstance.getMyServices();
        setServices(servicesData.services || []);
      } catch (err) {
        console.log('No services yet or error:', err.message);
        setServices([]);
      }

      try {
        const statsData = await apiInstance.getServiceStats();
        setStats(statsData.stats || null);
      } catch (err) {
        console.log('Stats not available:', err.message);
        setStats(null);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIX: Submits to /host-services with correct field mapping
  const handleAddService = async (formData) => {
    if (!api) return;
    setIsCreating(true);
    setCreateError('');
    try {
      const submissionData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        serviceType: formData.services,      // ✅ maps 'services' array → 'serviceType'
        location: formData.location,
        maxGuests: parseInt(formData.maxGuests),
        minStay: parseInt(formData.minStay),
        propertyImage: formData.propertyImage || '',
        experience: formData.experience,
        responseTime: formData.responseTime,
        cancellationPolicy: formData.cancellationPolicy,
        availableFromDate: formData.availableFromDate
          ? new Date(formData.availableFromDate).toISOString()
          : null,
        availableToDate: formData.availableToDate
          ? new Date(formData.availableToDate).toISOString()
          : null
      };

      console.log('Submitting to /host-services:', submissionData);
      await api.createService(submissionData);

      setSuccessMessage('✓ Service created successfully!');
      setShowAddService(false);
      await fetchData(api);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error creating service:', err);
      setCreateError(err.message || 'Failed to create service. Please check all fields and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setShowEditService(true);
    setUpdateError('');
  };

  const handleUpdateService = async (formData) => {
    if (!api || !selectedService) return;
    setIsUpdating(true);
    setUpdateError('');
    try {
      const submissionData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        serviceType: formData.services,      // ✅ maps 'services' array → 'serviceType'
        location: formData.location,
        maxGuests: parseInt(formData.maxGuests),
        minStay: parseInt(formData.minStay),
        propertyImage: formData.propertyImage || '',
        experience: formData.experience,
        responseTime: formData.responseTime,
        cancellationPolicy: formData.cancellationPolicy,
        availableFromDate: formData.availableFromDate
          ? new Date(formData.availableFromDate).toISOString()
          : null,
        availableToDate: formData.availableToDate
          ? new Date(formData.availableToDate).toISOString()
          : null,
        available: formData.available
      };

      await api.updateService(selectedService._id, submissionData);
      setSuccessMessage('✓ Service updated successfully!');
      setShowEditService(false);
      setSelectedService(null);
      await fetchData(api);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating service:', err);
      setUpdateError(err.message || 'Failed to update service. Please check all fields and try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!api) return;
    try {
      await api.deleteService(serviceId);
      setServices(services.filter(s => s._id !== serviceId));
      setSuccessMessage('✓ Service deleted successfully!');
      await fetchData(api);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.message || 'Failed to delete service');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{successMessage}</div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 text-sm">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Services</h1>
          <p className="text-gray-600">Manage your hosting services</p>
        </div>
        <button
          onClick={() => setShowAddService(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />Add Service
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Your Services ({services.length})</h2>
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                    onRefresh={() => fetchData(api)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4 text-lg">No services yet</p>
                <p className="text-gray-400 text-sm mb-6">Create your first service to start hosting!</p>
                <button
                  onClick={() => setShowAddService(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />Create Your First Service
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <StatisticsWidget stats={stats} />
          <TipsWidget />
        </div>
      </div>

      <AddServiceModal
        isOpen={showAddService}
        onClose={() => { setShowAddService(false); setCreateError(''); }}
        onSubmit={handleAddService}
        isLoading={isCreating}
        error={createError}
      />

      <EditServiceModal
        isOpen={showEditService}
        onClose={() => { setShowEditService(false); setSelectedService(null); setUpdateError(''); }}
        service={selectedService}
        onSubmit={handleUpdateService}
        isLoading={isUpdating}
        error={updateError}
      />
    </div>
  );
}

export default HostServicesComplete;