import { Calendar, Cloud, Camera, Heart, TrendingUp, Star, MapPin } from 'lucide-react';
import { useState } from 'react';
import { AllTrips } from './AllTrips';
import { MagicMemoryAlbum } from './MagicMemoryAlbum';
import { Community } from './Community';
import { Wishlist } from './Wishlist';

export function TravelerHome({ user }) {
  const [view, setView] = useState('home');

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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl mb-2">Welcome back, {user.name}! 👋</h2>
        <p>Ready for your next adventure?</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Smart Calendar */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3>Upcoming Trips</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('allTrips')}>View All</button>
            </div>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  destination: 'Cox\'s Bazar',
                  date: 'Dec 20, 2024',
                  host: 'Fatima Khan',
                  image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
                  weather: '28°C, Sunny'
                },
                {
                  id: 2,
                  destination: 'Sylhet',
                  date: 'Jan 5, 2025',
                  host: 'Pending',
                  image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
                  weather: '18°C, Cloudy'
                }
              ].map((trip) => (
                <div key={trip.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <img
                    src={trip.image}
                    alt={trip.destination}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="mb-1">{trip.destination}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {trip.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cloud className="w-4 h-4" />
                        {trip.weather}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Host: {trip.host}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Magic Memory Album */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-500" />
                <h3>Magic Memory Albums</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('albums')}>Manage</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
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
              ].map((album) => (
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

          {/* Community Posts */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3>Community</h3>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('community')}>See All</button>
            </div>
            <div className="space-y-4">
              {[
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
              ].map((post) => (
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
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

          {/* Wishlist */}
          <section className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h3>Wishlist</h3>
              </div>
              <button className="text-sm text-blue-500 hover:underline" onClick={() => setView('wishlist')}>Edit</button>
            </div>
            <div className="space-y-3">
              {[
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
              ].map((item) => (
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

          {/* Trending Destinations */}
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
    </div>
  );
}