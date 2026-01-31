import { Heart, MessageCircle, Share2, ArrowLeft, Send, Image as ImageIcon, MapPin, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Community({ onBack }) {
  const [posts, setPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch community data
  useEffect(() => {
    fetchCommunityData();
    fetchTrendingTopics();
    fetchSuggestedUsers();
  }, []);

  const fetchCommunityData = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      const response = await fetch(`http://localhost:5000/api/community/posts?page=${pageNum}&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (pageNum === 1) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.pagination.hasMore);
        setPage(pageNum);
      } else {
        throw new Error(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching community posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/community/trending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setTrendingTopics(data.trendingTopics.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching trending topics:', err);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/community/suggested-users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSuggestedUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching suggested users:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !imagePreview) {
      setError('Please add some content or an image');
      return;
    }

    try {
      setPosting(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login.');
      }

      // Extract hashtags from content
      const tags = newPost.match(/#\w+/g)?.map(tag => tag.slice(1).toLowerCase()) || [];

      const postData = {
        content: newPost,
        image: imagePreview,
        location: location,
        tags: tags
      };

      const response = await fetch('http://localhost:5000/api/community/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Add new post to the beginning of the list
        setPosts(prev => [data.post, ...prev]);
        setNewPost('');
        setImagePreview(null);
        setLocation('');
        
        // Refresh trending topics
        fetchTrendingTopics();
      } else {
        throw new Error(data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, likes: data.likes, liked: data.liked }
            : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleShare = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, shares: data.shares }
            : post
        ));
      }
    } catch (err) {
      console.error('Error sharing post:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const seedSamplePosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/community/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchCommunityData(); // Refresh posts
        fetchTrendingTopics(); // Refresh trending topics
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to seed posts');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore) {
      fetchCommunityData(page + 1);
    }
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
        {/* Main Content */}
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
                  placeholder="Share your travel story... (Use #hashtags for topics)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={posting}
                />
                
                {imagePreview && (
                  <div className="mt-3 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-sm">Add Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={posting}
                      />
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="📍 Add location"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      disabled={posting}
                    />
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={posting || (!newPost.trim() && !imagePreview)}
                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {posting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{posting ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && posts.length === 0 && (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading community posts...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && posts.length === 0 && (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to share your travel experience!</p>
              <button
                onClick={seedSamplePosts}
                className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md"
              >
                Add Sample Posts
              </button>
            </div>
          )}

          {/* Posts List */}
          {!loading && posts.map((post) => (
            <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{post.author.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location || 'Unknown location'}</span>
                      <span>•</span>
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 5).map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
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
                    onClick={() => handleLike(post._id)}
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
                  <button
                    onClick={() => handleShare(post._id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && !loading && posts.length > 0 && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Trending Topics</h3>
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
                  <div className="text-2xl font-bold text-gray-300">#{index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 rounded-2xl p-6">
            <h4 className="text-green-900 font-semibold mb-3">Community Guidelines</h4>
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
            <h3 className="font-semibold mb-4">Suggested Travelers</h3>
            <div className="space-y-3">
              {suggestedUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.trips} trips • {user.joined}</div>
                    </div>
                  </div>
                  <button className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors">
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