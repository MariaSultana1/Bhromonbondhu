import { Calendar, Cloud, Camera, Heart, TrendingUp, Star, MapPin, RefreshCw, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AllTrips } from './AllTrips';
import { MagicMemoryAlbum } from './MagicMemoryAlbum';
import { Community } from './Community';
import { Wishlist } from './Wishlist';

// API Service Layer (Replace with your actual API endpoints)
const apiService = {
  // Upcoming Trips
  getUpcomingTrips: async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/trips?status=upcoming`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch trips');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },

  // Memory Albums
  getMemoryAlbums: async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/albums`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch albums');
      return await response.json();
    } catch (error) {
      console.error('Error fetching albums:', error);
      throw error;
    }
  },

  // Community Posts
  getCommunityPosts: async (userId, limit = 2) => {
    try {
      const response = await fetch(`/api/community/posts?userId=${userId}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch community posts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching community posts:', error);
      throw error;
    }
  },

  // Wishlist
  getWishlist: async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      return await response.json();
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // User Stats
  getUserStats: async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Trending Destinations
  getTrendingDestinations: async () => {
    try {
      const response = await fetch('/api/destinations/trending');
      if (!response.ok) throw new Error('Failed to fetch trending destinations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching trending destinations:', error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId, userId) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId })
      });
      if (!response.ok) throw new Error('Failed to like post');
      return await response.json();
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  // Add to wishlist
  addToWishlist: async (userId, destinationData) => {
    try {
      const response = await fetch(`/api/users/${userId}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(destinationData)
      });
      if (!response.ok) throw new Error('Failed to add to wishlist');
      return await response.json();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }
};

// Database schema examples
/*
Users: {
  id: string,
  name: string,
  email: string,
  profileImage: string,
  joinedAt: Date
}

Trips: {
  id: string,
  userId: string,
  destination: string,
  date: Date,
  host: string,
  imageUrl: string,
  weather: string,
  checkIn: string,
  checkOut: string,
  nights: number,
  guests: number,
  totalAmount: number,
  services: string[],
  status: 'confirmed' | 'pending' | 'cancelled',
  bookingId: string,
  createdAt: Date
}

Albums: {
  id: string,
  userId: string,
  title: string,
  photos: number,
  date: string,
  coverImage: string,
  tripId: string,
  createdAt: Date
}

CommunityPosts: {
  id: string,
  userId: string,
  author: string,
  avatar: string,
  content: string,
  likes: number,
  comments: number,
  time: string,
  image: string,
  location: string,
  createdAt: Date
}

Wishlist: {
  id: string,
  userId: string,
  destination: string,
  image: string,
  estimatedCost: string,
  bestTime: string,
  notes: string,
  priority: number,
  createdAt: Date
}

TrendingDestinations: {
  id: string,
  name: string,
  rating: number,
  visits: number,
  image: string,
  location: string,
  updatedAt: Date
}
*/

export function TravelerHome({ user }) {
  const [view, setView] = useState('home');
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [memoryAlbums, setMemoryAlbums] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [loading, setLoading] = useState({
    trips: false,
    albums: false,
    community: false,
    wishlist: false,
    stats: false,
    trending: false
  });
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    if (view === 'home' && user?.id) {
      fetchAllData();
    }
  }, [view, user?.id]);

  const fetchAllData = async () => {
    try {
      setError(null);
      setRefreshing(true);
      
      // Fetch all data in parallel
      const [
        tripsData,
        albumsData,
        postsData,
        wishlistData,
        statsData,
        trendingData
      ] = await Promise.allSettled([
        apiService.getUpcomingTrips(user.id),
        apiService.getMemoryAlbums(user.id),
        apiService.getCommunityPosts(user.id),
        apiService.getWishlist(user.id),
        apiService.getUserStats(user.id),
        apiService.getTrendingDestinations()
      ]);

      // Handle each response
      if (tripsData.status === 'fulfilled') {
        setUpcomingTrips(tripsData.value || []);
      } else {
        console.error('Failed to load trips:', tripsData.reason);
      }

      if (albumsData.status === 'fulfilled') {
        setMemoryAlbums(albumsData.value || []);
      } else {
        console.error('Failed to load albums:', albumsData.reason);
      }

      if (postsData.status === 'fulfilled') {
        setCommunityPosts(postsData.value || []);
      } else {
        console.error('Failed to load community posts:', postsData.reason);
      }

      if (wishlistData.status === 'fulfilled') {
        setWishlistItems(wishlistData.value || []);
      } else {
        console.error('Failed to load wishlist:', wishlistData.reason);
      }

      if (statsData.status === 'fulfilled') {
        setUserStats(statsData.value || {});
      } else {
        console.error('Failed to load stats:', statsData.reason);
      }

      if (trendingData.status === 'fulfilled') {
        setTrendingDestinations(trendingData.value || []);
      } else {
        console.error('Failed to load trending:', trendingData.reason);
      }

    } catch (err) {
      setError('Failed to load data. Please check your connection and try again.');
      console.error('Error in fetchAllData:', err);
    } finally {
      setRefreshing(false);
      setLoading({
        trips: false,
        albums: false,
        community: false,
        wishlist: false,
        stats: false,
        trending: false
      });
    }
  };

  const handleAddDestination = async () => {
    // In a real app, this would open a modal or form
    // For now, we'll add a placeholder
    try {
      const newDestination = {
        destination: 'Add your dream destination...',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080',
        estimatedCost: '৳0',
        bestTime: 'Click to edit'
      };

      const result = await apiService.addToWishlist(user.id, newDestination);
      if (result.success) {
        setWishlistItems(prev => [...prev, result.data]);
      }
    } catch (err) {
      console.error('Error adding destination:', err);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const result = await apiService.likePost(postId, user.id);
      if (result.success) {
        setCommunityPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: result.likes, likedByUser: true }
            : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Loading Component
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

    if (type === 'grid') {
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
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

  // If user is not available
  if (!user?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  // Handle different views
  if (view === 'allTrips') {
    return <AllTrips 
      trips={upcomingTrips} 
      onBack={() => setView('home')} 
      userId={user.id}
      onTripsUpdate={setUpcomingTrips}
    />;
  }

  if (view === 'albums') {
    return <MagicMemoryAlbum 
      albums={memoryAlbums} 
      onBack={() => setView('home')}
      userId={user.id}
      onAlbumsUpdate={setMemoryAlbums}
    />;
  }

  if (view === 'community') {
    return <Community 
      posts={communityPosts} 
      onBack={() => setView('home')}
      userId={user.id}
      onLike={handleLikePost}
      onPostsUpdate={setCommunityPosts}
    />;
  }

  if (view === 'wishlist') {
    return <Wishlist 
      items={wishlistItems} 
      onBack={() => setView('home')}
      userId={user.id}
      onWishlistUpdate={setWishlistItems}
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl mb-2">{getGreeting()}, {user.name}! 👋</h2>
            <p className="text-blue-100">Ready for your next adventure?</p>
          </div>
          <button 
            onClick={handleRefresh}
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
              onClick={handleRefresh}
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
            
            {loading.trips || refreshing ? (
              <LoadingSkeleton type="card" count={2} />
            ) : upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.slice(0, 2).map((trip) => (
                  <div 
                    key={trip.id} 
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => setView('allTrips')}
                  >
                    <img
                      src={trip.imageUrl || trip.image}
                      alt={trip.destination}
                      className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-medium mb-1">{trip.destination}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trip.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : trip.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {trip.status}
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
                          <Cloud className="w-4 h-4" />
                          {trip.weather || 'Check forecast'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Host: {trip.host}</p>
                      <p className="text-sm font-medium mt-2">
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
                <button className="mt-2 text-blue-500 hover:underline text-sm">
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
                className="text-sm text-blue-500 hover:underline disabled:opacity-50"
                onClick={() => setView('albums')}
                disabled={refreshing}
              >
                Manage
              </button>
            </div>
            
            {loading.albums || refreshing ? (
              <LoadingSkeleton type="grid" count={2} />
            ) : memoryAlbums.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  {memoryAlbums.slice(0, 2).map((album) => (
                    <div 
                      key={album.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setView('albums')}
                    >
                      <img
                        src={album.coverImage || album.cover}
                        alt={album.title}
                        className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-4">
                        <h4 className="text-white font-medium mb-1">{album.title}</h4>
                        <p className="text-white/80 text-sm">
                          {album.photos} photos • {album.date || new Date(album.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {memoryAlbums.some(album => album.aiGenerated) && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      ✨ AI automatically organized new photos from your recent trips
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No memory albums yet</p>
                <p className="text-sm mt-1">Your photos will appear here after trips</p>
              </div>
            )}
          </section>

          {/* Community */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Community</h3>
              <button 
                className="text-sm text-blue-500 hover:underline disabled:opacity-50"
                onClick={() => setView('community')}
                disabled={refreshing}
              >
                See All
              </button>
            </div>
            
            {loading.community || refreshing ? (
              <LoadingSkeleton type="card" count={2} />
            ) : communityPosts.length > 0 ? (
              <div className="space-y-4">
                {communityPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`;
                        }}
                      />
                      <div>
                        <p className="font-medium">{post.author}</p>
                        <p className="text-xs text-gray-500">
                          {post.time || new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-48 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <button 
                        className={`flex items-center gap-1 transition-colors ${post.likedByUser ? 'text-red-500' : 'hover:text-red-500'}`}
                        onClick={() => handleLikePost(post.id)}
                        disabled={refreshing}
                      >
                        <Heart className={`w-4 h-4 ${post.likedByUser ? 'fill-current' : ''}`} />
                        {post.likes || 0}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <span>{post.comments || 0} comments</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No community posts yet</p>
                <button className="mt-2 text-blue-500 hover:underline text-sm">
                  Be the first to post
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stats */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
            
            {loading.stats || refreshing ? (
              <LoadingSkeleton type="list" count={4} />
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Places Visited', value: userStats.placesVisited || 0, color: 'text-blue-600' },
                  { label: 'Total Trips', value: userStats.totalTrips || 0, color: 'text-blue-600' },
                  { label: 'Reviews Given', value: userStats.reviewsGiven || 0, color: 'text-blue-600' },
                  { label: 'Travel Points', value: userStats.travelPoints || 0, color: 'text-purple-600' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{stat.label}</span>
                    <span className={`font-medium ${stat.color}`}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </span>
                  </div>
                ))}
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
                className="text-sm text-blue-500 hover:underline disabled:opacity-50"
                onClick={() => setView('wishlist')}
                disabled={refreshing}
              >
                Edit
              </button>
            </div>
            
            {loading.wishlist || refreshing ? (
              <LoadingSkeleton type="grid" count={2} />
            ) : wishlistItems.length > 0 ? (
              <>
                <div className="space-y-3">
                  {wishlistItems.slice(0, 2).map((item) => (
                    <div 
                      key={item.id} 
                      className="relative group cursor-pointer"
                      onClick={() => setView('wishlist')}
                    >
                      <img
                        src={item.image}
                        alt={item.destination}
                        className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-3">
                        <h4 className="text-white text-sm font-medium mb-1">{item.destination}</h4>
                        <div className="flex items-center justify-between text-xs text-white/90">
                          <span>{item.estimatedCost}</span>
                          <span>{item.bestTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="w-full mt-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors disabled:opacity-50"
                  onClick={handleAddDestination}
                  disabled={refreshing}
                >
                  Add Destination
                </button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Your wishlist is empty</p>
                <button 
                  className="mt-2 text-blue-500 hover:underline text-sm"
                  onClick={handleAddDestination}
                  disabled={refreshing}
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
            
            {loading.trending || refreshing ? (
              <LoadingSkeleton type="list" count={3} />
            ) : trendingDestinations.length > 0 ? (
              <div className="space-y-3">
                {trendingDestinations.slice(0, 3).map((destination, index) => (
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
                      {destination.rating?.toFixed(1) || 'N/A'}
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