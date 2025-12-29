import { Heart, MapPin, DollarSign, Calendar, ArrowLeft, Plus, Trash2, ExternalLink, Sun, Star } from 'lucide-react';
import { useState } from 'react';

const wishlistItems = [
  {
    id: 1,
    destination: 'Bandarban',
    image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    estimatedCost: '৳15,000',
    duration: '3-4 days',
    bestTime: 'Nov - Feb',
    description: 'Experience the hills, tribal culture, and breathtaking mountain views',
    activities: ['Trekking', 'Hiking', 'Photography', 'Cultural Tour'],
    rating: 4.8,
    difficulty: 'Moderate'
  },
  {
    id: 2,
    destination: 'Kuakata',
    image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    estimatedCost: '৳8,000',
    duration: '2-3 days',
    bestTime: 'Oct - Mar',
    description: 'Panoramic sea beach where you can see both sunrise and sunset',
    activities: ['Beach', 'Photography', 'Relaxation', 'Seafood'],
    rating: 4.6,
    difficulty: 'Easy'
  },
  {
    id: 3,
    destination: 'Sajek Valley',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    estimatedCost: '৳12,000',
    duration: '2-3 days',
    bestTime: 'Oct - Apr',
    description: 'Queen of hills with spectacular cloud views and tribal villages',
    activities: ['Cloud Watching', 'Camping', 'Trekking', 'Sunrise View'],
    rating: 4.9,
    difficulty: 'Moderate'
  },
  {
    id: 4,
    destination: 'Saint Martin',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    estimatedCost: '৳18,000',
    duration: '3-4 days',
    bestTime: 'Nov - Mar',
    description: 'Only coral island in Bangladesh with crystal clear water',
    activities: ['Swimming', 'Snorkeling', 'Beach', 'Island Tour'],
    rating: 4.7,
    difficulty: 'Easy'
  },
  {
    id: 5,
    destination: 'Sreemangal',
    image: 'https://images.unsplash.com/photo-1564890109542-586e1beb7461?w=800',
    estimatedCost: '৳10,000',
    duration: '2-3 days',
    bestTime: 'Oct - Mar',
    description: 'Tea capital with lush green gardens and serene natural beauty',
    activities: ['Tea Garden Tour', 'Wildlife', 'Nature Walk', 'Bird Watching'],
    rating: 4.5,
    difficulty: 'Easy'
  },
  {
    id: 6,
    destination: 'Paharpur',
    image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800',
    estimatedCost: '৳7,000',
    duration: '1-2 days',
    bestTime: 'Oct - Feb',
    description: 'Ancient Buddhist monastery and UNESCO World Heritage Site',
    activities: ['History', 'Architecture', 'Photography', 'Cultural Tour'],
    rating: 4.4,
    difficulty: 'Easy'
  }
];

export function Wishlist({ onBack }) {
  const [items, setItems] = useState(wishlistItems);
  const [showAddModal, setShowAddModal] = useState(false);

  const removeFromWishlist = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalEstimatedCost = items.reduce((sum, item) => {
    const cost = parseInt(item.estimatedCost.replace(/[৳,]/g, ''));
    return sum + cost;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
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

      {/* Wishlist Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group">
            <div className="relative h-56 overflow-hidden">
              <img
                src={item.image}
                alt={item.destination}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <button
                onClick={() => removeFromWishlist(item.id)}
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
                  <span className="text-green-600">{item.estimatedCost}</span>
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
                  {item.activities.slice(0, 3).map((activity, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                      {activity}
                    </span>
                  ))}
                  {item.activities.length > 3 && (
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

      {/* Trip Planning Helper */}
      {items.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6">
          <h4 className="text-blue-900 mb-3">Trip Planning Helper</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/50 p-4 rounded-xl">
              <div className="text-xs text-gray-600 mb-1">Budget Range</div>
              <div className="text-lg text-blue-600">৳7K - ৳18K</div>
            </div>
            <div className="bg-white/50 p-4 rounded-xl">
              <div className="text-xs text-gray-600 mb-1">Avg Duration</div>
              <div className="text-lg text-blue-600">2-3 days</div>
            </div>
            <div className="bg-white/50 p-4 rounded-xl">
              <div className="text-xs text-gray-600 mb-1">Best Season</div>
              <div className="text-lg text-blue-600">Nov - Mar</div>
            </div>
          </div>
          <p className="text-sm text-blue-800 mt-4">
            Based on your wishlist, we recommend planning 3-4 trips to cover all destinations. Start with easier destinations during the best season!
          </p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl">Add Destination</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Destination name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <textarea
                placeholder="Why do you want to visit?"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
              <button className="w-full py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md transition-all">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}