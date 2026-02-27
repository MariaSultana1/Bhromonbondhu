import { Calendar, Cloud, Camera, Heart, TrendingUp, Star, MapPin, RefreshCw, Loader, AlertCircle, Plus, Upload } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { AllTrips } from './AllTrips';
import { MagicMemoryAlbum } from './MagicMemoryAlbum';
import { Community } from './Community';
import { Wishlist } from './Wishlist';
import { BookTravel } from './BookTravel';

const API_URL = 'http://localhost:5000/api';

// ─── helpers shared with MagicMemoryAlbum ─────────────────────────────────────
const DEST_IMG_MAP = {
  "cox's bazar": 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?w=600',
  sylhet:        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600',
  dhaka:         'https://images.unsplash.com/photo-1513563326940-e76e4641069e?w=600',
  sundarbans:    'https://images.unsplash.com/photo-1708943081020-2082b47e21ba?w=600',
  chittagong:    'https://images.unsplash.com/photo-1594736797933-d1dec6b7262f?w=600',
  bandarban:     'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=600',
  rangamati:     'https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?w=600',
};
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600';

function getDestCover(dest = '', tripImage) {
  if (tripImage) return tripImage;
  const key = dest.toLowerCase();
  for (const [k, img] of Object.entries(DEST_IMG_MAP)) {
    if (key.includes(k)) return img;
  }
  return DEFAULT_COVER;
}

function fmtMonth(d) {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt) ? '' : dt.toLocaleString('default', { month: 'short', year: 'numeric' });
}

function authHdr() {
  const t = localStorage.getItem('token') || sessionStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ─── Weather Service ──────────────────────────────────────────────────────────
const weatherService = {
  getWeatherForDestination: async (destination) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
      );
      const geoData = await response.json();
      if (!geoData.results?.length) return null;
      const { latitude, longitude } = geoData.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`
      );
      const weatherData = await weatherResponse.json();
      if (!weatherData.current) return null;
      const weatherCodes = { 0:'Clear',1:'Mostly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',48:'Foggy',51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',80:'Light Showers',81:'Showers',82:'Heavy Showers',95:'Thunderstorm',96:'Thunderstorm w/Hail',99:'Thunderstorm w/Hail' };
      const temp = Math.round(weatherData.current.temperature_2m);
      return `${weatherCodes[weatherData.current.weather_code] || 'Clear'}, ${temp}°C`;
    } catch { return null; }
  }
};

// ─── API Service ──────────────────────────────────────────────────────────────
const apiService = {
  getUpcomingTrips: async () => {
    const r = await fetch(`${API_URL}/trips`, { headers: authHdr() });
    if (!r.ok) throw new Error('Failed to fetch trips');
    const data = await r.json();
    if (!data.success || !data.trips) return [];
    const upcoming = data.trips
      .filter(t => { const s = t.status || t.bookingStatus || 'upcoming'; return s !== 'completed' && s !== 'cancelled'; })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return Promise.all(upcoming.map(async t => ({
      ...t,
      weather: (await weatherService.getWeatherForDestination(t.destination)) || t.weather || 'Check forecast'
    })));
  },

  getAllTrips: async () => {
    const r = await fetch(`${API_URL}/trips`, { headers: authHdr() });
    if (!r.ok) throw new Error('Failed to fetch trips');
    const data = await r.json();
    return data.trips || [];
  },

  getAlbumPreview: async () => {
    // Fetch trips + uploaded photos in parallel, build album summaries
    const [tripsRes, photosRes] = await Promise.all([
      fetch(`${API_URL}/trips`, { headers: authHdr() }),
      fetch(`${API_URL}/album-photos`, { headers: authHdr() }),
    ]);
    const tripsData  = tripsRes.ok  ? await tripsRes.json()  : {};
    const photosData = photosRes.ok ? await photosRes.json() : {};

    const trips  = tripsData.trips   || [];
    const photos = photosData.photos || [];

    // Group by destination
    const groups = {};
    trips.forEach(t => {
      const d = t.destination || t.location || 'Unknown';
      (groups[d] = groups[d] || { trips: [], photos: [] }).trips.push(t);
    });
    photos.forEach(p => {
      (groups[p.destination] = groups[p.destination] || { trips: [], photos: [] }).photos.push(p);
    });

    return Object.entries(groups)
      .map(([dest, { trips: gTrips, photos: gPhotos }]) => {
        const cover = gPhotos[0]?.imageData || getDestCover(dest, gTrips[0]?.image);
        const count = gPhotos.length + Math.min(gTrips.length * 2, 6);
        const date  = fmtMonth(gTrips[0]?.date || gPhotos[0]?.createdAt);
        return { dest, cover, count, date, uploadedCount: gPhotos.length };
      })
      .filter(a => a.count > 0)
      .slice(0, 2); // show 2 in the preview
  },

  getCommunityPosts: async (limit = 2) => {
    const r = await fetch(`${API_URL}/community/posts?limit=${limit}`, { headers: authHdr() });
    if (!r.ok) throw new Error('Failed to fetch community posts');
    const data = await r.json();
    return data.posts || [];
  },

  getTrendingDestinations: async () => {
    const r = await fetch(`${API_URL}/trips/trending`, { headers: authHdr() });
    if (!r.ok) throw new Error('Failed to fetch trending');
    const data = await r.json();
    return data.destinations || [];
  },

  getWishlists: async () => {
    const r = await fetch(`${API_URL}/wishlists`, { headers: authHdr() });
    if (!r.ok) throw new Error('Failed to fetch wishlists');
    const data = await r.json();
    return data.wishlists || [];
  },

  likePost: async (postId) => {
    const r = await fetch(`${API_URL}/community/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() }
    });
    if (!r.ok) throw new Error('Failed to like post');
    return r.json();
  }
};

const calculateStatsFromTrips = (trips) => {
  const totalTrips = trips.length;
  const placesVisited = new Set(trips.map(t => t.destination)).size;
  const reviewsGiven = Math.floor(totalTrips * 0.75);
  const travelPoints = totalTrips * 100 + placesVisited * 50;
  return { totalTrips, placesVisited, reviewsGiven, travelPoints };
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = ({ type = 'card', count = 2 }) => {
  if (type === 'card') return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 p-4 border border-gray-200 rounded-lg">
          <div className="w-24 h-24 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
  if (type === 'list') return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse h-10 bg-gray-200 rounded" />
      ))}
    </div>
  );
  if (type === 'album') return (
    <div className="grid grid-cols-2 gap-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl overflow-hidden">
          <div className="h-28 bg-gray-200" />
          <div className="p-2 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-2.5 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
  return null;
};

// ─── Album preview card ────────────────────────────────────────────────────────
function AlbumPreviewCard({ album, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200"
    >
      <div className="relative h-28 overflow-hidden bg-gray-100">
        <img
          src={album.cover}
          alt={album.dest}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = DEFAULT_COVER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {album.uploadedCount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500/90 text-white text-[10px] font-semibold rounded-full">
            📤 {album.uploadedCount}
          </span>
        )}
      </div>
      <div className="p-2.5 bg-white">
        <p className="font-semibold text-gray-800 text-sm truncate">{album.dest}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-gray-400">{album.count} photos</p>
          {album.date && <p className="text-xs text-gray-400">{album.date}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function TravelerHome({ user }) {
  const [view, setView] = useState('home');
  const [hostBookingParams, setHostBookingParams] = useState(null);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [userStats, setUserStats] = useState({ totalTrips:0, placesVisited:0, reviewsGiven:0, travelPoints:0 });
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [albumPreview, setAlbumPreview] = useState([]);   // ← new
  const [loading, setLoading] = useState({ trips:false, community:false, stats:false, trending:false, wishlists:false, albums:false });
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);
      setLoading({ trips:true, community:true, stats:true, trending:true, wishlists:true, albums:true });

      const [tripsData, allTripsData, postsData, trendingData, wishlistsData, albumData] = await Promise.allSettled([
        apiService.getUpcomingTrips(),
        apiService.getAllTrips(),
        apiService.getCommunityPosts(),
        apiService.getTrendingDestinations(),
        apiService.getWishlists(),
        apiService.getAlbumPreview(),
      ]);

      if (tripsData.status === 'fulfilled')    setUpcomingTrips(tripsData.value || []);
      else setUpcomingTrips([]);

      if (allTripsData.status === 'fulfilled') {
        const trips = allTripsData.value || [];
        setUserStats(calculateStatsFromTrips(trips));
      }

      if (postsData.status === 'fulfilled')    setCommunityPosts(postsData.value || []);
      if (trendingData.status === 'fulfilled') setTrendingDestinations(trendingData.value || []);
      if (wishlistsData.status === 'fulfilled') setWishlists(wishlistsData.value || []);
      else setWishlists([]);

      if (albumData.status === 'fulfilled')    setAlbumPreview(albumData.value || []);
      else setAlbumPreview([]);

    } catch (err) {
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setRefreshing(false);
      setLoading({ trips:false, community:false, stats:false, trending:false, wishlists:false, albums:false });
    }
  }, [user?.id]);

  useEffect(() => {
    if (view === 'home' && user?.id) fetchAllData();
  }, [view, user?.id, fetchAllData]);

  const handleLikePost = async (postId) => {
    try {
      const result = await apiService.likePost(postId);
      if (result.success) {
        setCommunityPosts(prev => prev.map(p =>
          (p._id === postId || p.id === postId) ? { ...p, likes: result.likes, liked: result.liked } : p
        ));
      }
    } catch {}
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusDisplay = (trip) => {
    const status = trip.status || trip.bookingStatus || 'pending';
    const pay    = trip.paymentStatus;
    if (status === 'completed')                          return { label:'✓ Completed',         color:'bg-blue-100 text-blue-700'   };
    if (status === 'cancelled')                          return { label:'✗ Cancelled',          color:'bg-red-100 text-red-700'     };
    if (status === 'confirmed' && pay === 'paid')        return { label:'✓ Confirmed',          color:'bg-green-100 text-green-700' };
    if (status === 'confirmed' && pay === 'pending')     return { label:'💳 Awaiting Payment',  color:'bg-amber-100 text-amber-700' };
    if (status === 'pending')                            return { label:'⏳ Awaiting Host',     color:'bg-yellow-100 text-yellow-700'};
    return { label:'Upcoming', color:'bg-gray-100 text-gray-700' };
  };

  const getHostName = (trip) => {
    if (trip.hostName && !['Host','Pending'].includes(trip.hostName)) return trip.hostName;
    if (trip.host   && typeof trip.host === 'string' && !['pending','Pending'].includes(trip.host)) return trip.host;
    if (trip.hostInfo?.name) return trip.hostInfo.name;
    if (trip.hostId?.name)   return trip.hostId.name;
    return null;
  };

  if (!user?.id) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Please log in to view your dashboard</p>
    </div>
  );

  if (view === 'allTrips')  return <AllTrips onBack={() => setView('home')} onAddHost={p => { setHostBookingParams(p); setView('bookHost'); }} />;
  if (view === 'bookHost')  return <BookTravel tripParams={hostBookingParams} onBack={() => setView('allTrips')} />;
  if (view === 'albums')    return <MagicMemoryAlbum onBack={() => setView('home')} />;
  if (view === 'community') return <Community onBack={() => setView('home')} />;
  if (view === 'wishlist')  return <Wishlist onBack={() => setView('home')} />;

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
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
          >
            {refreshing ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <button onClick={fetchAllData} className="text-sm underline hover:text-red-800 mt-1">Try Again</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Upcoming Trips */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Upcoming Trips</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('allTrips')}>
                View All
              </button>
            </div>

            {loading.trips ? <LoadingSkeleton type="card" count={2} /> : upcomingTrips.length > 0 ? (
              <div className="space-y-4">
                {upcomingTrips.slice(0, 2).map(trip => {
                  const statusInfo = getStatusDisplay(trip);
                  const hostName   = getHostName(trip);
                  const fmtDate    = new Date(trip.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
                  return (
                    <div
                      key={trip._id}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => setView('allTrips')}
                    >
                      <img
                        src={trip.image}
                        alt={trip.destination}
                        className="w-24 h-24 rounded-lg object-cover group-hover:scale-105 transition-transform"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080'; }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-medium">{trip.destination}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{fmtDate}</span>
                          {trip.ticketInfo?.from ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {trip.ticketInfo.from}
                              {trip.ticketInfo.type === 'train' ? '🚆' : trip.ticketInfo.type === 'flight' ? '✈️' : '🚌'}
                              {trip.ticketInfo.to}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{trip.destination}</span>
                          )}
                          <span className="flex items-center gap-1"><Cloud className="w-4 h-4" />{trip.weather}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                          <div>
                            {hostName
                              ? <p className="text-gray-700"><span className="font-medium">🏠 Host:</span> {hostName}</p>
                              : <p className="text-amber-600"><span className="font-medium">⏳ Host:</span> Pending</p>
                            }
                          </div>
                          {trip.ticketInfo?.provider && (
                            <p className="text-gray-700"><span className="font-medium">🚌</span> {trip.ticketInfo.provider}</p>
                          )}
                        </div>
                        <p className="text-sm font-medium text-blue-600">৳{trip.totalAmount?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No upcoming trips</p>
                <button className="mt-2 text-blue-500 hover:underline text-sm" onClick={() => setView('allTrips')}>
                  Plan your first trip
                </button>
              </div>
            )}
          </section>

          {/* ── Magic Memory Albums – LIVE PREVIEW ───────────────────────── */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Magic Memory Albums</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('albums')}>
                Manage
              </button>
            </div>

            {loading.albums ? (
              <LoadingSkeleton type="album" />
            ) : albumPreview.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {albumPreview.map(album => (
                    <AlbumPreviewCard
                      key={album.dest}
                      album={album}
                      onClick={() => setView('albums')}
                    />
                  ))}
                </div>

                {/* CTA row */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {albumPreview.reduce((s, a) => s + a.count, 0)} total photos across {albumPreview.length} album{albumPreview.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => setView('albums')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-semibold rounded-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Photos
                  </button>
                </div>
              </>
            ) : (
              /* Empty state – identical style to original but with Upload CTA */
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-8 h-8 text-purple-200" />
                </div>
                <p className="font-medium text-gray-600">No memory albums yet</p>
                <p className="text-sm text-gray-400 mt-1">Your photos will appear here after trips</p>
                <button
                  onClick={() => setView('albums')}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:to-fuchsia-600 transition-all shadow-md shadow-purple-100 mx-auto"
                >
                  <Upload className="w-4 h-4" /> Upload First Photo
                </button>
              </div>
            )}
          </section>

          {/* Community */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Community</h3>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('community')}>See All</button>
            </div>

            {loading.community ? <LoadingSkeleton type="card" count={2} /> : communityPosts.length > 0 ? (
              <div className="space-y-4">
                {communityPosts.slice(0, 2).map(post => (
                  <div
                    key={post._id || post.id}
                    className="border-b border-gray-100 last:border-0 pb-4 last:pb-0 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    onClick={() => setView('community')}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={post.author?.profilePicture || post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?._id || 'user'}`}
                        onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=user`; }}
                        alt={post.author?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{post.author?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{post.timeAgo || 'Recently'}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>
                    {post.image && <img src={post.image} alt="Post" className="w-full h-48 object-cover rounded-lg mb-3" />}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <button
                        className={`flex items-center gap-1 transition-colors ${post.liked ? 'text-red-500' : 'hover:text-red-500'}`}
                        onClick={e => { e.stopPropagation(); handleLikePost(post._id || post.id); }}
                      >
                        <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                        {post.likes || 0}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors" onClick={e => { e.stopPropagation(); setView('community'); }}>
                        {Array.isArray(post.comments) ? post.comments.length : post.comments || 0} comments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No community posts yet</p>
                <button className="mt-2 text-blue-500 hover:underline text-sm" onClick={() => setView('community')}>Be the first to post</button>
              </div>
            )}
          </section>
        </div>

        {/* ── Right Column ─────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Stats */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
            {loading.stats ? <LoadingSkeleton type="list" count={4} /> : (
              <div className="space-y-3">
                {[
                  { label:'Places Visited', val:userStats.placesVisited, color:'text-blue-600'   },
                  { label:'Total Trips',    val:userStats.totalTrips,    color:'text-blue-600'   },
                  { label:'Reviews Given',  val:userStats.reviewsGiven,  color:'text-blue-600'   },
                  { label:'Travel Points',  val:userStats.travelPoints,  color:'text-purple-600' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-gray-600">{s.label}</span>
                    <span className={`font-medium ${s.color}`}>{s.val}</span>
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
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('wishlist')}>
                {wishlists.length > 0 ? 'See All' : 'Add'}
              </button>
            </div>

            {loading.wishlists ? <LoadingSkeleton type="card" count={2} /> : wishlists.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {wishlists.slice(0, 3).map(item => (
                  <div key={item._id} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => setView('wishlist')}>
                    {item.image && (
                      <img src={item.image} alt={item.destination} className="w-full h-32 object-cover rounded-lg mb-2" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080'; }} />
                    )}
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{item.destination}</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      {item.estimatedCost > 0 && (
                        <div className="flex items-center justify-between"><span>Est. Cost:</span><span className="text-gray-800">৳{item.estimatedCost.toLocaleString()}</span></div>
                      )}
                      {item.duration && (
                        <div className="flex items-center justify-between"><span>Duration:</span><span className="text-gray-800">{item.duration}</span></div>
                      )}
                      {item.rating > 0 && (
                        <div className="flex items-center justify-between">
                          <span>Rating:</span>
                          <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-gray-800">{item.rating}</span></div>
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
                <button className="mt-2 text-blue-500 hover:underline text-sm" onClick={() => setView('wishlist')}>Add your first destination</button>
              </div>
            )}
          </section>

          {/* Trending */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Trending Now</h3>
            </div>
            {loading.trending ? <LoadingSkeleton type="list" count={3} /> : trendingDestinations.length > 0 ? (
              <div className="space-y-3">
                {trendingDestinations.slice(0, 5).map((dest, i) => (
                  <div key={dest.id || i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{dest.destination || dest.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {(dest.rating || dest.count || (Math.random() * 2 + 3)).toFixed(1)}
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