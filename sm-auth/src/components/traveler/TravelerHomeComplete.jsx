import { Calendar, Cloud, Camera, Heart, TrendingUp, Star, MapPin, Clock, X, MessageCircle, Edit, XCircle, User as UserIcon, DollarSign, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { AllTrips } from './AllTrips';
import { MagicMemoryAlbum } from './MagicMemoryAlbum';
import { Community } from './Community';
import { Wishlist } from './Wishlist';

const upcomingTrips = [
  {
    id: 1,
    destination: 'Cox\'s Bazar',
    date: 'Dec 20, 2024',
    dateRange: 'Dec 20-23, 2024',
    host: 'Fatima Khan',
    hostAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    hostRating: 4.9,
    image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    weather: '28°C, Sunny',
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    nights: 3,
    guests: 2,
    totalAmount: 12500,
    services: ['Accommodation', 'Local Guide', 'Meals'],
    status: 'confirmed',
    bookingId: 'BK2024001',
    location: 'Marine Drive, Cox\'s Bazar',
    description: 'Beautiful beachfront property with amazing sunset views'
  },
  {
    id: 2,
    destination: 'Sylhet',
    date: 'Jan 5, 2025',
    dateRange: 'Jan 5-7, 2025',
    host: 'Pending',
    hostAvatar: '',
    hostRating: 0,
    image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    weather: '18°C, Cloudy',
    checkIn: '3:00 PM',
    checkOut: '10:00 AM',
    nights: 2,
    guests: 1,
    totalAmount: 8000,
    services: ['Accommodation', 'Transportation'],
    status: 'pending',
    bookingId: 'BK2024002',
    location: 'Ratargul Swamp Forest Area',
    description: 'Peaceful retreat near natural attractions'
  }
];

const memoryAlbums = [
  {
    id: 1,
    title: 'Dhaka Adventures',
    photos: 24,
    date: 'Nov 2024',
    cover: 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc2NTQ3NTIxMXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 2,
    title: 'Sundarbans Trip',
    photos: 42,
    date: 'Oct 2024',
    cover: 'https://images.unsplash.com/photo-1708943081020-2082b47e21ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5nbGFkZXNoJTIwdHJhdmVsfGVufDF8fHx8MTc2NTUxNTMyMHww&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

const communityPosts = [
  {
    id: 1,
    author: 'Aisha Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
    content: 'Just had the most amazing experience in Rangamati! The lake views are breathtaking 🌊',
    likes: 45,
    comments: 12,
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjU0MzQwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 2,
    author: 'Mehedi Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi',
    content: 'Pro tip: Visit Ratargul in the monsoon season. The swamp forest is magical! ⭐️',
    likes: 67,
    comments: 23,
    time: '5h ago'
  }
];

const wishlistItems = [
  {
    id: 1,
    destination: 'Bandarban',
    image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    estimatedCost: '৳15,000',
    bestTime: 'Nov - Feb'
  },
  {
    id: 2,
    destination: 'Kuakata',
    image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    estimatedCost: '৳8,000',
    bestTime: 'Oct - Mar'
  }
];

export function TravelerHomeComplete({ user }) {
  const [view, setView] = useState('home');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showModifyBooking, setShowModifyBooking] = useState(false);
  const [showCancelBooking, setShowCancelBooking] = useState(false);
  const [showContactHost, setShowContactHost] = useState(false);

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
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl mb-2">Welcome back, {user.name}! 👋</h2>
        <p>Ready for your next adventure?</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3>Upcoming Trips</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('allTrips')}>View All</button>
            </div>
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="mb-1">{trip.destination}</h4>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          trip.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {trip.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {trip.date}
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
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      View Details
                    </button>
                    {trip.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          setSelectedTrip(trip);
                          setShowContactHost(true);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Contact Host
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-500" />
                <h3>Magic Memory Albums</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('albums')}>Manage</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {memoryAlbums.map((album) => (
                <div key={album.id} className="relative group cursor-pointer" onClick={() => setView('albums')}>
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-4">
                    <h4 className="text-white mb-1">{album.title}</h4>
                    <p className="text-white/80 text-sm">{album.photos} photos • {album.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                ✨ AI automatically organized 18 new photos from your last trip
              </p>
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>Community</h3>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('community')}>See All</button>
            </div>
            <div className="space-y-4">
              {communityPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p>{post.author}</p>
                      <p className="text-xs text-gray-500">{post.time}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <button className="flex items-center gap-1 hover:text-red-500">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500">
                      <span>{post.comments} comments</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Places Visited</span>
                <span className="text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Trips</span>
                <span className="text-blue-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reviews Given</span>
                <span className="text-blue-600">6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Travel Points</span>
                <span className="text-purple-600">2,450</span>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h3>Wishlist</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('wishlist')}>Edit</button>
            </div>
            <div className="space-y-3">
              {wishlistItems.map((item) => (
                <div key={item.id} className="relative group cursor-pointer">
                  <img
                    src={item.image}
                    alt={item.destination}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-3">
                    <h4 className="text-white text-sm mb-1">{item.destination}</h4>
                    <div className="flex items-center justify-between text-xs text-white/90">
                      <span>{item.estimatedCost}</span>
                      <span>{item.bestTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Add Destination
            </button>
          </section>

          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3>Trending Now</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Sajek Valley</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  4.8
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Saint Martin</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  4.9
                </div>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Sreemangal</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  4.7
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showTripDetails && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              <img
                src={selectedTrip.image}
                alt={selectedTrip.destination}
                className="w-full h-64 object-cover rounded-t-2xl"
              />
              <button 
                onClick={() => setShowTripDetails(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className={`px-4 py-2 rounded-full text-sm ${
                  selectedTrip.status === 'confirmed' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
                }`}>
                  {selectedTrip.status === 'confirmed' ? '✓ Confirmed' : '⏱ Pending'}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-3xl mb-2">{selectedTrip.destination}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedTrip.location}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                  <div>{selectedTrip.bookingId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Weather Forecast</div>
                  <div className="flex items-center gap-1">
                    <Cloud className="w-4 h-4" />
                    {selectedTrip.weather}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border-2 border-gray-200 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Check-in</div>
                  <div className="mb-1">{selectedTrip.dateRange.split('-')[0]}</div>
                  <div className="text-sm text-gray-500">{selectedTrip.checkIn}</div>
                </div>
                <div className="p-4 border-2 border-gray-200 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Check-out</div>
                  <div className="mb-1">{selectedTrip.dateRange.split('-')[1]}</div>
                  <div className="text-sm text-gray-500">{selectedTrip.checkOut}</div>
                </div>
                <div className="p-4 border-2 border-gray-200 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Duration</div>
                  <div className="mb-1">{selectedTrip.nights} nights</div>
                  <div className="text-sm text-gray-500">{selectedTrip.guests} guest(s)</div>
                </div>
              </div>

              {selectedTrip.host !== 'Pending' && (
                <div className="p-4 border-2 border-gray-200 rounded-xl">
                  <h3 className="mb-3">Host Information</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedTrip.hostAvatar}
                      alt={selectedTrip.host}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="mb-1">{selectedTrip.host}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{selectedTrip.hostRating} rating</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowTripDetails(false);
                        setShowContactHost(true);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3">Services Included</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTrip.services.map((service, idx) => (
                    <span key={idx} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="mb-3">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price ({selectedTrip.nights} nights)</span>
                    <span>৳{Math.floor(selectedTrip.totalAmount * 0.7)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Services</span>
                    <span>৳{Math.floor(selectedTrip.totalAmount * 0.2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (15%)</span>
                    <span>৳{Math.floor(selectedTrip.totalAmount * 0.1)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span>Total Amount</span>
                    <span className="text-blue-600">৳{selectedTrip.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedTrip.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        setShowTripDetails(false);
                        setShowModifyBooking(true);
                      }}
                      className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Modify Booking
                    </button>
                    <button
                      onClick={() => {
                        setShowTripDetails(false);
                        setShowCancelBooking(true);
                      }}
                      className="flex-1 px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Cancel Trip
                    </button>
                  </>
                )}
                {selectedTrip.status === 'pending' && (
                  <button className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600">
                    Waiting for Host Confirmation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModifyBooking && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-2xl">Modify Booking</h3>
              <button onClick={() => setShowModifyBooking(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
                ⚠️ Changes may require host approval and could affect pricing
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Check-in Date</label>
                <input
                  type="date"
                  defaultValue="2024-12-20"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Check-out Date</label>
                <input
                  type="date"
                  defaultValue="2024-12-23"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Number of Guests</label>
                <select 
                  defaultValue={selectedTrip.guests}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Reason for Modification</label>
                <textarea
                  placeholder="Optional: Let the host know why you're making changes..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <button className="w-full py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md">
                Submit Modification Request
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelBooking && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-2xl">Cancel Trip</h3>
              <button onClick={() => setShowCancelBooking(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <h4 className="mb-2 text-red-900">⚠️ Cancellation Policy</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Cancel 7+ days before: 100% refund</li>
                  <li>• Cancel 3-7 days before: 50% refund</li>
                  <li>• Cancel less than 3 days: No refund</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm mb-2 text-gray-600">Expected Refund</div>
                <div className="text-2xl text-green-600">৳{selectedTrip.totalAmount}</div>
                <div className="text-xs text-gray-500 mt-1">Processed within 5-7 business days</div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Reason for Cancellation</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-2">
                  <option>Change of plans</option>
                  <option>Emergency</option>
                  <option>Found better option</option>
                  <option>Weather concerns</option>
                  <option>Other</option>
                </select>
                <textarea
                  placeholder="Additional details (optional)..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                />
              </div>

              <button className="w-full py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md">
                Confirm Cancellation
              </button>
              <button 
                onClick={() => setShowCancelBooking(false)}
                className="w-full py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Keep My Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {showContactHost && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-2xl">Contact Host</h3>
              <button onClick={() => setShowContactHost(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedTrip.host !== 'Pending' && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={selectedTrip.hostAvatar}
                    alt={selectedTrip.host}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <div className="mb-1">{selectedTrip.host}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{selectedTrip.hostRating} rating</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 text-gray-700">Message</label>
                <textarea
                  placeholder="Hi! I have some questions about..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  rows={5}
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                💡 Tip: Be clear and specific in your questions for faster responses
              </div>

              <button className="w-full py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}