import { Calendar, Cloud, Camera, Heart, TrendingUp, Star, MapPin, RefreshCw, Loader } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { AllTrips } from './AllTrips';
import { MagicMemoryAlbum } from './MagicMemoryAlbum';
import { Community } from './Community';
import { Wishlist } from './Wishlist';

const API_URL = 'http://localhost:5000/api';

// API Service Layer
const apiService = {
  getUpcomingTrips: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      
      if (data.success && data.trips) {
        // Show trips that are NOT completed or cancelled
        const upcomingTrips = data.trips
          .filter(trip => {
            const status = trip.status || 'upcoming';
            return status !== 'completed' && status !== 'cancelled';
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return upcomingTrips;
      }
      return [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },

  // ✅ FIX: Get ALL trips for stats calculation
  getAllTrips: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/trips`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      
      if (data.success && data.trips) {
        return data.trips;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all trips:', error);
      throw error;
    }
  },

  getCommunityPosts: async (userId, limit = 2) => {
    try {
      const response = await fetch(`${API_URL}/community/posts?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch community posts');
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching community posts:', error);
      return [];
    }
  },

  getTrendingDestinations: async () => {
    try {
      const response = await fetch(`${API_URL}/trips/trending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch trending');
      const data = await response.json();
      
      if (data.success && data.destinations) {
        return data.destinations;
      }
      return [];
    } catch (error) {
      console.error('Error fetching trending destinations:', error);
      return [];
    }
  },

  getWishlists: async () => {
    try {
      const response = await fetch(`${API_URL}/wishlists`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch wishlists');
      const data = await response.json();
      return data.wishlists || [];
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      return [];
    }
  },

  likePost: async (postId, userId) => {
    try {
      const response = await fetch(`${API_URL}/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to like post');
      return await response.json();
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }
};

// ✅ NEW: Calculate stats from trips data
const calculateStatsFromTrips = (trips) => {
  const totalTrips = trips.length;
  
  // Get unique destinations
  const uniqueDestinations = new Set(trips.map(t => t.destination));
  const placesVisited = uniqueDestinations.size;
  
  // Count reviews (for now, assume 75% of trips have reviews)
  const reviewsGiven = Math.floor(totalTrips * 0.75);
  
  // Calculate travel points: 100 per trip + 50 per unique place
  const travelPoints = (totalTrips * 100) + (placesVisited * 50);
  
  return {
    totalTrips,
    placesVisited,
    reviewsGiven,
    travelPoints
  };
};

export function TravelerHome({ user }) {
  const [view, setView] = useState('home');
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]); // ✅ NEW: Store all trips for stats
  const [communityPosts, setCommunityPosts] = useState([]);
  const [userStats, setUserStats] = useState({
    totalTrips: 0,
    placesVisited: 0,
    reviewsGiven: 0,
    travelPoints: 0
  });
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState({
    trips: false,
    community: false,
    stats: false,
    trending: false,
    wishlists: false
  });
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);
      setLoading({
        trips: true,
        community: true,
        stats: true,
        trending: true,
        wishlists: true
      });
      
      const [tripsData, allTripsData, postsData, trendingData, wishlistsData] = await Promise.allSettled([
        apiService.getUpcomingTrips(user.id),
        apiService.getAllTrips(user.id), // ✅ NEW: Fetch all trips
        apiService.getCommunityPosts(user.id),
        apiService.getTrendingDestinations(),
        apiService.getWishlists()
      ]);

      if (tripsData.status === 'fulfilled') {
        setUpcomingTrips(tripsData.value || []);
      } else {
        console.error('Failed to load trips:', tripsData.reason);
        setUpcomingTrips([]);
      }

      // ✅ NEW: Calculate stats from all trips
      if (allTripsData.status === 'fulfilled') {
        const trips = allTripsData.value || [];
        setAllTrips(trips);
        const calculatedStats = calculateStatsFromTrips(trips);
        setUserStats(calculatedStats);
        console.log('✅ Calculated stats:', calculatedStats);
      } else {
        console.error('Failed to load all trips for stats:', allTripsData.reason);
      }

      if (postsData.status === 'fulfilled') {
        setCommunityPosts(postsData.value || []);
      }

      if (trendingData.status === 'fulfilled') {
        setTrendingDestinations(trendingData.value || []);
      }

      if (wishlistsData.status === 'fulfilled') {
        setWishlists(wishlistsData.value || []);
        console.log('✅ Wishlists loaded:', wishlistsData.value.length);
      } else {
        console.error('Failed to load wishlists:', wishlistsData.reason);
        setWishlists([]);
      }

    } catch (err) {
      setError('Failed to load data. Please check your connection and try again.');
      console.error('Error in fetchAllData:', err);
    } finally {
      setRefreshing(false);
      setLoading({
        trips: false,
        community: false,
        stats: false,
        trending: false,
        wishlists: false
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (view === 'home' && user?.id) {
      fetchAllData();
    }
  }, [view, user?.id, fetchAllData]);

  const handleLikePost = async (postId) => {
    try {
      const result = await apiService.likePost(postId, user.id);
      if (result.success) {
        setCommunityPosts(prev => prev.map(post => 
          post._id === postId || post.id === postId
            ? { ...post, likes: result.likes, liked: result.liked }
            : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const LoadingSkeleton = ({ type = 'card', count = 2 }) => {
    if (type === 'card') {
      return (
        <div className="space-y-4">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'list') {
      return (
        <div className="space-y-3">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  if (view === 'allTrips') {
    return <AllTrips onBack={() => setView('home')} />;
  }

  if (view === 'albums') {
    return <MagicMemoryAlbum onBack={() => setView('home')} />;
  }

  if (view === 'community') {
    return <Community onBack={() => setView('home')} />;
  }

  if (view === 'wishlist') {
    return <Wishlist onBack={() => setView('home')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl mb-2">{getGreeting()}, {user.fullName || user.name}! 👋</h2>
            <p className="text-blue-100">Ready for your next adventure?</p>
          </div>
          <button 
            onClick={fetchAllData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={fetchAllData}
              className="text-sm underline hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Trips */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Upcoming Trips</h3>
              </div>
              <button 
                className="text-sm text-blue-500 hover:underline disabled:opacity-50"
                onClick={() => setView('allTrips')}
                disabled={refreshing}
              >
                View All
              </button>
            </div>
            
            {loading.trips ? (
              <LoadingSkeleton type="card" count={2} />
            ) : upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.slice(0, 2).map((trip) => (
                  <div 
                    key={trip._id} 
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => setView('allTrips')}
                  >
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-medium">{trip.destination}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          trip.status === 'upcoming' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {trip.status === 'upcoming' ? '✓ Confirmed' : '⏱ Pending'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(trip.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {trip.ticketInfo?.from ? (
                            <>
                              {trip.ticketInfo.from} 
                              {trip.ticketInfo.type === 'train' ? '🚆' : trip.ticketInfo.type === 'flight' ? '✈️' : '🚌'} 
                              {trip.ticketInfo.to}
                            </>
                          ) : trip.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Cloud className="w-4 h-4" />
                          {trip.weather || 'Check forecast'}
                        </span>
                      </div>
                      {trip.host === 'pending' ? (
                        <div className="text-sm text-blue-700 mb-2">
                          <p className="font-medium">🚌 {trip.transportProvider || 'N/A'}</p>
                          <p className="text-xs text-blue-600">{trip.transportType?.charAt(0).toUpperCase() + trip.transportType?.slice(1) || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mt-1">Host: Pending</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Host:</span> {trip.host}
                        </p>
                      )}
                      <p className="text-sm font-medium">
                        ৳{trip.totalAmount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No upcoming trips</p>
                <button 
                  className="mt-2 text-blue-500 hover:underline text-sm"
                  onClick={() => window.location.href = '/traveler/book-travel'}
                >
                  Plan your first trip
                </button>
              </div>
            )}
          </section>

          {/* Memory Albums */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Magic Memory Albums</h3>
              </div>
              <button 
                className="text-sm text-blue-500 hover:underline"
                onClick={() => setView('albums')}
              >
                Manage
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No memory albums yet</p>
              <p className="text-sm mt-1">Your photos will appear here after trips</p>
            </div>
          </section>

          {/* Community */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Community</h3>
              <button 
                className="text-sm text-blue-500 hover:underline"
                onClick={() => setView('community')}
              >
                See All
              </button>
            </div>
            
            {loading.community ? (
              <LoadingSkeleton type="card" count={2} />
            ) : communityPosts.length > 0 ? (
              <div className="space-y-4">
                {communityPosts.slice(0, 2).map((post) => (
                  <div key={post._id || post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors" onClick={() => setView('community')}>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={post.author?.profilePicture || post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?._id || post.author?.username || 'user'}`}
                        onError={(e) => { 
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?._id || post.author?.username || 'user'}`
                        }}
                        alt={post.author?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{post.author?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{post.timeAgo || 'Recently'}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <button 
                        className={`flex items-center gap-1 transition-colors ${post.liked ? 'text-red-500' : 'hover:text-red-500'}`}
                        onClick={(e) => { e.stopPropagation(); handleLikePost(post._id || post.id); }}
                      >
                        <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                        {post.likes || 0}
                      </button>
                      <button 
                        className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                        onClick={(e) => { e.stopPropagation(); setView('community'); }}
                      >
                        {Array.isArray(post.comments) ? post.comments.length : post.comments || 0} comments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No community posts yet</p>
                <button 
                  className="mt-2 text-blue-500 hover:underline text-sm"
                  onClick={() => setView('community')}
                >
                  Be the first to post
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Trending Now */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Trending Now</h3>
            </div>
            <div className="space-y-2">
              {trendingDestinations.length > 0 ? (
                trendingDestinations.slice(0, 5).map((dest, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-blue-900">{dest.destination}</p>
                      <p className="text-xs text-blue-600">{dest.count} people visiting</p>
                    </div>
                    <span className="text-lg font-bold text-blue-300">#{idx + 1}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-blue-600 text-center py-3">No trending destinations yet</p>
              )}
            </div>
          </section>

          {/* Stats */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
            
            {loading.stats ? (
              <LoadingSkeleton type="list" count={4} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Places Visited</span>
                  <span className="font-medium text-blue-600">{userStats.placesVisited}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Trips</span>
                  <span className="font-medium text-blue-600">{userStats.totalTrips}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reviews Given</span>
                  <span className="font-medium text-blue-600">{userStats.reviewsGiven}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Travel Points</span>
                  <span className="font-medium text-purple-600">{userStats.travelPoints}</span>
                </div>
              </div>
            )}
          </section>

          {/* Wishlist */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold">Wishlist</h3>
              </div>
              <button 
                className="text-sm text-blue-500 hover:underline"
                onClick={() => setView('wishlist')}
              >
                {wishlists.length > 0 ? 'See All' : 'Add'}
              </button>
            </div>
            
            {loading.wishlists ? (
              <LoadingSkeleton type="card" count={2} />
            ) : wishlists.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {wishlists.slice(0, 3).map((item) => (
                  <div 
                    key={item._id} 
                    className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setView('wishlist')}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.destination}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080';
                        }}
                      />
                    )}
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{item.destination}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      {item.estimatedCost > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Est. Cost:</span>
                          <span className="text-gray-800">৳{item.estimatedCost.toLocaleString()}</span>
                        </div>
                      )}
                      {item.duration && (
                        <div className="flex items-center justify-between">
                          <span>Duration:</span>
                          <span className="text-gray-800">{item.duration}</span>
                        </div>
                      )}
                      {item.rating > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-gray-800">{item.rating}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Your wishlist is empty</p>
                <button 
                  className="mt-2 text-blue-500 hover:underline text-sm"
                  onClick={() => setView('wishlist')}
                >
                  Add your first destination
                </button>
              </div>
            )}
          </section>

          {/* Trending */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Trending Now</h3>
            </div>
            
            {loading.trending ? (
              <LoadingSkeleton type="list" count={3} />
            ) : trendingDestinations.length > 0 ? (
              <div className="space-y-3">
                {trendingDestinations.map((destination, index) => (
                  <div 
                    key={destination.id || index} 
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{destination.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {destination.rating?.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No trending data available</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}