import { Heart, MessageCircle, Share2, ArrowLeft, Send, Image as ImageIcon, MapPin, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const communityPosts = [
  {
    id: 1,
    author: 'Aisha Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
    location: 'Rangamati',
    content: 'Just had the most amazing experience in Rangamati! The lake views are breathtaking and the local culture is so rich. Highly recommend staying with a local host to get the authentic experience 🌊✨',
    likes: 145,
    comments: 32,
    shares: 12,
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjU0MzQwNzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: false
  },
  {
    id: 2,
    author: 'Mehedi Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi',
    location: 'Ratargul',
    content: 'Pro tip: Visit Ratargul in the monsoon season. The swamp forest is magical! Don\'t forget to bring waterproof bags for your electronics. The boat ride through the forest is unforgettable ⭐️🚣',
    likes: 267,
    comments: 45,
    shares: 28,
    time: '5h ago',
    liked: true
  },
  {
    id: 3,
    author: 'Nusrat Jahan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
    location: 'Cox\'s Bazar',
    content: 'Sunset at Cox\'s Bazar never gets old! 🌅 Best time to visit is early morning or evening to avoid crowds. The seafood here is incredible - try the grilled prawns at the beach market!',
    likes: 198,
    comments: 21,
    shares: 15,
    time: '8h ago',
    image: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: false
  },
  {
    id: 4,
    author: 'Rafiq Ahmed',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
    location: 'Bandarban',
    content: 'The trek to Nilgiri Hills was challenging but SO worth it! The views from the top are absolutely stunning. Make sure you\'re physically prepared and hire a local guide. Started at 5 AM and reached by 11 AM 🏔️',
    likes: 312,
    comments: 56,
    shares: 34,
    time: '1d ago',
    image: 'https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZ3xlbnwxfHx8fDE3NjU0MzkxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    liked: true
  },
  {
    id: 5,
    author: 'Fatima Khan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    location: 'Sylhet',
    content: 'Tea gardens of Sylhet in the morning mist = pure magic! ☕️ Spent the day learning about tea processing from local farmers. The hospitality here is incredible. Don\'t miss the seven-layer tea!',
    likes: 223,
    comments: 38,
    shares: 19,
    time: '1d ago',
    image: 'https://images.unsplash.com/photo-1564890109542-586e1beb7461?w=800',
    liked: false
  },
  {
    id: 6,
    author: 'Karim Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim',
    location: 'Sundarbans',
    content: 'Wildlife spotting in Sundarbans - saw deer, crocodiles, and if you\'re lucky, you might spot a Bengal tiger! The mangrove ecosystem is fascinating. Boat tours are the best way to explore 🐯🌿',
    likes: 445,
    comments: 67,
    shares: 52,
    time: '2d ago',
    image: 'https://images.unsplash.com/photo-1708943081020-2082b47e21ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5nbGFkZXNoJTIwdHJhdmVsfGVufDF8fHx8MTc2NTUxNTMyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    liked: true
  }
];

const trendingTopics = [
  { tag: '#CoxsBazar', posts: 1234 },
  { tag: '#Sundarbans', posts: 892 },
  { tag: '#Bandarban', posts: 756 },
  { tag: '#Sylhet', posts: 654 },
  { tag: '#LocalFood', posts: 543 }
];

export function Community({ onBack }) {
  const [posts, setPosts] = useState(communityPosts);
  const [newPost, setNewPost] = useState('');

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-3xl mb-2">Community</h2>
        <p className="text-green-100">Share experiences and connect with fellow travelers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                alt="You"
                className="w-12 h-12 rounded-full border-2 border-gray-200"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your travel story..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Add Photo</span>
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md transition-all">
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.avatar}
                    alt={post.author}
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <h4>{post.author}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location}</span>
                      <span>•</span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
              </div>
              
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-96 object-cover"
                />
              )}

              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-all ${
                      post.liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.liked ? 'fill-red-500' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-all">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-all">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3>Trending Topics</h3>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
                >
                  <div>
                    <div className="text-blue-600 mb-1">{topic.tag}</div>
                    <div className="text-xs text-gray-500">{topic.posts} posts</div>
                  </div>
                  <div className="text-2xl">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl p-6">
            <h4 className="text-green-900 mb-3">Community Guidelines</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Be respectful and kind to fellow travelers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Share authentic travel experiences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>No spam or promotional content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Help others with travel tips</span>
              </li>
            </ul>
          </div>

          {/* Suggested Travelers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">Suggested Travelers</h3>
            <div className="space-y-3">
              {[
                { name: 'Arif Hasan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arif2', trips: 24 },
                { name: 'Tasneem Ahmed', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tasneem', trips: 18 },
                { name: 'Shakib Rahman', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shakib', trips: 15 }
              ].map((traveler, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={traveler.avatar} alt={traveler.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="text-sm">{traveler.name}</div>
                      <div className="text-xs text-gray-500">{traveler.trips} trips</div>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}