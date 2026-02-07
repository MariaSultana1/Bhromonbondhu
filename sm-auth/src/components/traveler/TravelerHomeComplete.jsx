import { Calendar, Cloud, Camera, Heart, TrendingUp, Star, MapPin, Clock, X, MessageCircle, Edit, XCircle, User as UserIcon, DollarSign, CheckCircle, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AllTrips } from './AllTrips';
import { MagicMemoryAlbum } from './MagicMemoryAlbum';
import { Community } from './Community';
import { Wishlist } from './Wishlist';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function TravelerHomeComplete({ user }) {
  const [view, setView] = useState('home');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showModifyBooking, setShowModifyBooking] = useState(false);
  const [showCancelBooking, setShowCancelBooking] = useState(false);
  const [showContactHost, setShowContactHost] = useState(false);

  // State for dynamic data
  const [trips, setTrips] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  
  // Stats state
  const [stats, setStats] = useState({
    placesVisited: 0,
    totalTrips: 0,
    reviewsGiven: 0,
    travelPoints: 0,
  });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modifyData, setModifyData] = useState({
    date: '',
    endDate: '',
    guests: 2,
    reason: ''
  });
  
  const [cancelData, setCancelData] = useState({
    reason: '',
    details: ''
  });

  const [contactMessage, setContactMessage] = useState('');

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();

      // Fetch trips
      const tripsRes = await fetch(`${API_URL}/trips`, { 
        method: 'GET', 
        headers 
      });
      const tripsData = await tripsRes.json();
      if (tripsData.success && tripsData.trips) {
        setTrips(tripsData.trips);
      }

      // Fetch albums
      const albumsRes = await fetch(`${API_URL}/albums`, { 
        method: 'GET', 
        headers 
      });
      const albumsData = await albumsRes.json();
      if (albumsData.success && albumsData.albums) {
        setAlbums(albumsData.albums);
      }

      // Fetch community posts
      const postsRes = await fetch(`${API_URL}/community/posts?limit=3&page=1`, { 
        method: 'GET', 
        headers 
      });
      const postsData = await postsRes.json();
      if (postsData.success && postsData.posts) {
        setCommunityPosts(postsData.posts);
      }

      // Fetch wishlist
      const wishlistRes = await fetch(`${API_URL}/wishlist`, { 
        method: 'GET', 
        headers 
      });
      const wishlistData = await wishlistRes.json();
      if (wishlistData.success && wishlistData.wishlist) {
        setWishlistItems(wishlistData.wishlist);
      }

      // Fetch trending topics
      const trendingRes = await fetch(`${API_URL}/community/trending`, { 
        method: 'GET', 
        headers 
      });
      const trendingData = await trendingRes.json();
      if (trendingData.success && trendingData.trendingTopics) {
        // Map trending topics to display format
        const destinations = trendingData.trendingTopics.slice(0, 3).map((topic, idx) => ({
          id: idx + 1,
          name: topic.tag.replace('#', ''),
          rating: (4.5 + Math.random() * 0.5)
        }));
        setTrendingDestinations(destinations);
      }

      // Calculate stats from trips
      if (tripsData.trips && tripsData.trips.length > 0) {
        const uniquePlaces = new Set(tripsData.trips.map(t => t.destination)).size;
        const totalTrips = tripsData.trips.length;
        const reviewsGiven = Math.floor(totalTrips * 0.75);
        const travelPoints = Math.floor(totalTrips * 500 + uniquePlaces * 250);

        setStats({
          placesVisited: uniquePlaces,
          totalTrips: totalTrips,
          reviewsGiven: reviewsGiven,
          travelPoints: travelPoints
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyBooking = async () => {
    try {
      if (!selectedTrip || !modifyData.date || !modifyData.endDate) {
        alert('Please fill in all required fields');
        return;
      }

      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/trips/${selectedTrip._id || selectedTrip.id}/modify-request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          newCheckIn: modifyData.date,
          newCheckOut: modifyData.endDate,
          newGuests: modifyData.guests,
          reason: modifyData.reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Modification request submitted successfully!');
        setShowModifyBooking(false);
        setShowTripDetails(false);
        setModifyData({ date: '', endDate: '', guests: 2, reason: '' });
        await fetchAllData();
      } else {
        alert(data.message || 'Failed to submit modification');
      }
    } catch (err) {
      console.error('Error modifying booking:', err);
      alert('Failed to submit modification');
    }
  };

  const handleCancelTrip = async () => {
    try {
      if (!selectedTrip || !cancelData.reason) {
        alert('Please select a cancellation reason');
        return;
      }

      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/trips/${selectedTrip._id || selectedTrip.id}/cancel-request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          reason: cancelData.reason,
          details: cancelData.details
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Trip cancelled successfully!');
        setShowCancelBooking(false);
        setShowTripDetails(false);
        setCancelData({ reason: '', details: '' });
        await fetchAllData();
      } else {
        alert(data.message || 'Failed to cancel trip');
      }
    } catch (err) {
      console.error('Error cancelling trip:', err);
      alert('Failed to cancel trip');
    }
  };

  const handleContactHost = async () => {
    try {
      if (!selectedTrip || !contactMessage.trim()) {
        alert('Please enter a message');
        return;
      }

      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          receiverId: selectedTrip.userId || null,
          content: contactMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Message sent successfully!');
        setShowContactHost(false);
        setContactMessage('');
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl mb-2">Welcome back, {user?.fullName || 'Traveler'}! 👋</h2>
        <p>Ready for your next adventure?</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Trips Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-lg">Upcoming Trips</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline font-medium" onClick={() => setView('allTrips')}>
                View All
              </button>
            </div>
            <div className="space-y-4">
              {trips.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming trips. Start planning your adventure!</p>
              ) : (
                trips.slice(0, 2).map((trip) => (
                  <div key={trip._id} className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      <img
                        src={trip.image}
                        alt={trip.destination}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-lg">{trip.destination}</h4>
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            trip.status === 'confirmed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {trip.status === 'confirmed' ? '✓ Confirmed' : '⏱ Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(trip.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Cloud className="w-4 h-4" />
                            {trip.weather}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Host: {trip.host}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedTrip(trip);
                          setShowTripDetails(true);
                          setModifyData({
                            date: trip.date,
                            endDate: trip.endDate,
                            guests: trip.guests,
                            reason: ''
                          });
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                      >
                        View Details
                      </button>
                      {trip.status === 'confirmed' && (
                        <button
                          onClick={() => {
                            setSelectedTrip(trip);
                            setShowContactHost(true);
                            setContactMessage('');
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                          Contact Host
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Magic Memory Albums Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-lg">Magic Memory Albums</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline font-medium" onClick={() => setView('albums')}>
                Manage
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {albums.length === 0 ? (
                <p className="text-gray-500 text-center col-span-2 py-8">No albums yet</p>
              ) : (
                albums.slice(0, 2).map((album) => (
                  <div key={album._id} className="relative group cursor-pointer" onClick={() => setView('albums')}>
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold mb-1">{album.title}</h4>
                      <p className="text-white/80 text-sm">{album.photos?.length || 0} photos • {new Date(album.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                ✨ AI automatically organized your photos from recent trips
              </p>
            </div>
          </section>

          {/* Community Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Community</h3>
              <button className="text-sm text-blue-500 hover:underline font-medium" onClick={() => setView('community')}>
                See All
              </button>
            </div>
            <div className="space-y-4">
              {communityPosts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No community posts yet</p>
              ) : (
                communityPosts.map((post) => (
                  <div key={post._id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
                        alt={post.author?.name}
                        className="w-10 h-10 rounded-full"
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
                      <button className="flex items-center gap-1 hover:text-red-500 font-medium">
                        <Heart className="w-4 h-4" />
                        {post.likes || 0}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 font-medium">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments || 0}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Stats Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Places Visited</span>
                <span className="text-blue-600 font-bold">{stats.placesVisited}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Trips</span>
                <span className="text-blue-600 font-bold">{stats.totalTrips}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reviews Given</span>
                <span className="text-blue-600 font-bold">{stats.reviewsGiven}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Travel Points</span>
                <span className="text-purple-600 font-bold">{stats.travelPoints}</span>
              </div>
            </div>
          </section>

          {/* Wishlist Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h3 className="font-bold">Wishlist</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline font-medium" onClick={() => setView('wishlist')}>
                Edit
              </button>
            </div>
            <div className="space-y-3">
              {wishlistItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">No wishlist items yet</p>
              ) : (
                wishlistItems.slice(0, 2).map((item) => (
                  <div key={item._id} className="relative group cursor-pointer">
                    <img
                      src={item.image}
                      alt={item.destination}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-3">
                      <h4 className="text-white text-sm font-bold mb-1">{item.destination}</h4>
                      <div className="flex items-center justify-between text-xs text-white/90">
                        <span>{item.estimatedCost}</span>
                        <span>{item.bestTime}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              Add Destination
            </button>
          </section>

          {/* Trending Section */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-bold">Trending Now</h3>
            </div>
            <div className="space-y-3">
              {trendingDestinations.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">No trending destinations</p>
              ) : (
                trendingDestinations.map((dest) => (
                  <div key={dest.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{dest.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {dest.rating.toFixed(1)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Trip Details Modal */}
      {showTripDetails && selectedTrip && (
        <TripDetailsModal
          trip={selectedTrip}
          onClose={() => setShowTripDetails(false)}
          onModify={() => {
            setShowTripDetails(false);
            setShowModifyBooking(true);
          }}
          onCancel={() => {
            setShowTripDetails(false);
            setShowCancelBooking(true);
          }}
          onContact={() => {
            setShowTripDetails(false);
            setShowContactHost(true);
          }}
        />
      )}

      {/* Modify Booking Modal */}
      {showModifyBooking && selectedTrip && (
        <ModifyBookingModal
          trip={selectedTrip}
          modifyData={modifyData}
          setModifyData={setModifyData}
          onClose={() => setShowModifyBooking(false)}
          onSubmit={handleModifyBooking}
        />
      )}

      {/* Cancel Booking Modal */}
      {showCancelBooking && selectedTrip && (
        <CancelBookingModal
          trip={selectedTrip}
          cancelData={cancelData}
          setCancelData={setCancelData}
          onClose={() => setShowCancelBooking(false)}
          onSubmit={handleCancelTrip}
        />
      )}

      {/* Contact Host Modal */}
      {showContactHost && selectedTrip && (
        <ContactHostModal
          trip={selectedTrip}
          contactMessage={contactMessage}
          setContactMessage={setContactMessage}
          onClose={() => setShowContactHost(false)}
          onSubmit={handleContactHost}
        />
      )}
    </div>
  );
}

// Trip Details Modal Component
function TripDetailsModal({ trip, onClose, onModify, onCancel, onContact }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative">
          <img
            src={trip.image}
            alt={trip.destination}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              trip.status === 'confirmed' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {trip.status === 'confirmed' ? '✓ Confirmed' : '⏱ Pending'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{trip.destination}</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{trip.location || trip.destination}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div>
              <div className="text-sm text-gray-600 mb-1">Booking ID</div>
              <div className="font-semibold">{trip.bookingId || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Weather</div>
              <div className="flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                {trip.weather}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-gray-200 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Check-in</div>
              <div className="font-semibold mb-1">{new Date(trip.date).toLocaleDateString()}</div>
              <div className="text-sm text-gray-500">{trip.checkIn}</div>
            </div>
            <div className="p-4 border-2 border-gray-200 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Check-out</div>
              <div className="font-semibold mb-1">{new Date(trip.endDate).toLocaleDateString()}</div>
              <div className="text-sm text-gray-500">{trip.checkOut}</div>
            </div>
            <div className="p-4 border-2 border-gray-200 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Duration</div>
              <div className="font-semibold mb-1">{trip.nights} nights</div>
              <div className="text-sm text-gray-500">{trip.guests} guest(s)</div>
            </div>
          </div>

          {trip.host && trip.host !== 'Pending' && (
            <div className="p-4 border-2 border-gray-200 rounded-xl">
              <h3 className="font-bold mb-3">Host Information</h3>
              <div className="flex items-center gap-4">
                <img
                  src={trip.hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.host}`}
                  alt={trip.host}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold mb-1">{trip.host}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{trip.hostRating} rating</span>
                  </div>
                </div>
                <button 
                  onClick={onContact}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-bold mb-3">Services Included</h3>
            <div className="flex flex-wrap gap-2">
              {(trip.services || []).map((service, idx) => (
                <span key={idx} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  {service}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="font-bold mb-3">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price ({trip.nights} nights)</span>
                <span>৳{Math.floor((trip.totalAmount || 0) * 0.7)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Services</span>
                <span>৳{Math.floor((trip.totalAmount || 0) * 0.2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (15%)</span>
                <span>৳{Math.floor((trip.totalAmount || 0) * 0.1)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300 font-bold">
                <span>Total Amount</span>
                <span className="text-blue-600">৳{trip.totalAmount || 0}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {trip.status === 'confirmed' && (
              <>
                <button
                  onClick={onModify}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Modify Booking
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 font-medium flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Trip
                </button>
              </>
            )}
            {trip.status === 'pending' && (
              <button className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-medium">
                Waiting for Host Confirmation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modify Booking Modal Component
function ModifyBookingModal({ trip, modifyData, setModifyData, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold">Modify Booking</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
            ⚠️ Changes may require host approval and could affect pricing
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Check-in Date</label>
            <input
              type="date"
              value={modifyData.date}
              onChange={(e) => setModifyData({...modifyData, date: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Check-out Date</label>
            <input
              type="date"
              value={modifyData.endDate}
              onChange={(e) => setModifyData({...modifyData, endDate: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Number of Guests</label>
            <select 
              value={modifyData.guests}
              onChange={(e) => setModifyData({...modifyData, guests: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Reason for Modification</label>
            <textarea
              placeholder="Optional: Let the host know why you're making changes..."
              value={modifyData.reason}
              onChange={(e) => setModifyData({...modifyData, reason: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <button 
            onClick={onSubmit}
            className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold shadow-md"
          >
            Submit Modification Request
          </button>
        </div>
      </div>
    </div>
  );
}

// Cancel Booking Modal Component
function CancelBookingModal({ trip, cancelData, setCancelData, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold">Cancel Trip</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="mb-2 text-red-900 font-bold">⚠️ Cancellation Policy</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Cancel 7+ days before: 100% refund</li>
              <li>• Cancel 3-7 days before: 50% refund</li>
              <li>• Cancel less than 3 days: No refund</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-sm mb-2 text-gray-600">Expected Refund</div>
            <div className="text-2xl text-green-600 font-bold">৳{trip.totalAmount || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Processed within 5-7 business days</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Reason for Cancellation</label>
            <select 
              value={cancelData.reason}
              onChange={(e) => setCancelData({...cancelData, reason: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
            >
              <option value="">Select a reason...</option>
              <option value="change_of_plans">Change of plans</option>
              <option value="emergency">Emergency</option>
              <option value="better_option">Found better option</option>
              <option value="weather">Weather concerns</option>
              <option value="other">Other</option>
            </select>
            <textarea
              placeholder="Additional details (optional)..."
              value={cancelData.details}
              onChange={(e) => setCancelData({...cancelData, details: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
            />
          </div>

          <button 
            onClick={onSubmit}
            className="w-full py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold shadow-md"
          >
            Confirm Cancellation
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
          >
            Keep My Booking
          </button>
        </div>
      </div>
    </div>
  );
}

// Contact Host Modal Component
function ContactHostModal({ trip, contactMessage, setContactMessage, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold">Contact Host</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {trip.host && trip.host !== 'Pending' && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <img
                src={trip.hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.host}`}
                alt={trip.host}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <div className="font-bold">{trip.host}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{trip.hostRating} rating</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Message</label>
            <textarea
              placeholder="Hi! I have some questions about..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={5}
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            💡 Tip: Be clear and specific in your questions for faster responses
          </div>

          <button 
            onClick={onSubmit}
            className="w-full py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 font-bold shadow-md"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}