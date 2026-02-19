import { Heart, MapPin, DollarSign, Calendar, ArrowLeft, Plus, Trash2, ExternalLink, Sun, Star, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Wishlist({ onBack }) {
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    description: '',
    image: '',
    estimatedCost: '',
    duration: '',
    bestTime: '',
    activities: [],
    difficulty: 'Moderate',
    rating: 5
  });

  const API_URL = 'http://localhost:5000/api';

  // Fetch wishlists on mount
  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/wishlists`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      setItems(data.wishlists || []);
    } catch (err) {
      console.error('Error fetching wishlists:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (e) => {
    e.preventDefault();
    if (!formData.destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/wishlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      const data = await response.json();
      setItems([...items, data.wishlist]);
      setFormData({
        destination: '',
        description: '',
        image: '',
        estimatedCost: '',
        duration: '',
        bestTime: '',
        activities: [],
        difficulty: 'Moderate',
        rating: 5
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/wishlists/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert(err.message);
    }
  };

  const totalEstimatedCost = items.reduce((sum, item) => {
    const costStr = typeof item.estimatedCost === 'number' ? item.estimatedCost : parseInt(String(item.estimatedCost).replace(/[৳,]/g, '')) || 0;
    return sum + (costStr || 0);
  }, 0);

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-red-600 to-pink-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">My Wishlist</h2>
            <p className="text-red-100">Dream destinations to explore</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all border border-white/30"
          >
            <Plus className="w-5 h-5" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

 
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600 fill-red-600" />
            </div>
          </div>
          <div className="text-3xl mb-1">{items.length}</div>
          <p className="text-sm text-gray-600">Destinations</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl mb-1">৳{(totalEstimatedCost / 1000).toFixed(0)}K</div>
          <p className="text-sm text-gray-600">Total Estimated</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl mb-1">{items.reduce((sum, item) => sum + parseInt(item.duration.split('-')[0]), 0)}</div>
          <p className="text-sm text-gray-600">Min Days</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl mb-1">{(items.reduce((sum, item) => sum + item.rating, 0) / items.length).toFixed(1)}</div>
          <p className="text-sm text-gray-600">Avg Rating</p>
        </div>
      </div>


      {loading && (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
          <button
            onClick={fetchWishlists}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
            <div className="relative h-56 overflow-hidden">
              <img
                src={item.image}
                alt={item.destination}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <button
                onClick={() => removeFromWishlist(item._id)}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition-all"
              >
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white text-xl mb-1">{item.destination}</h3>
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <Star className="w-4 h-4 fill-white/90" />
                  <span>{item.rating}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Estimated Cost</span>
                  </div>
                  <span className="text-green-600">৳{typeof item.estimatedCost === 'number' ? item.estimatedCost.toLocaleString() : item.estimatedCost}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Duration</span>
                  </div>
                  <span className="text-blue-600">{item.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Sun className="w-4 h-4" />
                    <span>Best Time</span>
                  </div>
                  <span className="text-orange-600">{item.bestTime}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Activities</div>
                <div className="flex flex-wrap gap-2">
                  {(item.activities || []).slice(0, 3).map((activity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                      {activity}
                    </span>
                  ))}
                  {(item.activities || []).length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                      +{item.activities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md">
                  Plan Trip
                </button>
                <button className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl mb-2">No destinations in wishlist</h3>
          <p className="text-gray-600 mb-6">Start adding places you dream of visiting!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-8 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md transition-all"
          >
            Add Your First Destination
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6">
          <h4 className="text-blue-900 mb-3">Trip Planning Helper</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 p-4 rounded-xl">
              <div className="text-xs text-gray-600 mb-1">Total Budget</div>
              <div className="text-lg text-blue-600">৳{(totalEstimatedCost / 1000).toFixed(0)}K</div>
            </div>
            <div className="bg-white/50 p-4 rounded-xl">
              <div className="text-xs text-gray-600 mb-1">Destinations Count</div>
              <div className="text-lg text-blue-600">{items.length}</div>
            </div>
            <div className="bg-white/50 p-4 rounded-xl">
              <div className="text-xs text-gray-600 mb-1">Avg Rating</div>
              <div className="text-lg text-blue-600">{(items.reduce((sum, item) => sum + (item.rating || 0), 0) / items.length).toFixed(1)}</div>
            </div>
          </div>
          <p className="text-sm text-blue-800 mt-4">
            Based on your wishlist, we recommend starting with your highest-rated destinations during their best seasons!
          </p>
        </div>
      )}

 
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Add to Wishlist</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={addToWishlist} className="space-y-4">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
                <input
                  type="text"
                  placeholder="e.g., Cox's Bazar, Sylhet"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Why do you want to visit? What interests you about this place?"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Estimated Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Est. Cost (৳)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({...formData, estimatedCost: parseInt(e.target.value) || ''})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 2-3 days"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Best Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Best Time</label>
                  <input
                    type="text"
                    placeholder="e.g., Oct - Mar"
                    value={formData.bestTime}
                    onChange={(e) => setFormData({...formData, bestTime: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option>Easy</option>
                    <option>Moderate</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 5})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activities (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Trekking, Photography, Cultural Tour"
                  value={formData.activities.join(', ')}
                  onChange={(e) => setFormData({...formData, activities: e.target.value.split(',').map(a => a.trim()).filter(a => a)})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
                {submitting ? 'Adding...' : 'Add to Wishlist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}