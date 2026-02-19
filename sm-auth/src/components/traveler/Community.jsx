import { Heart, MessageCircle, Share2, ArrowLeft, Send, Image as ImageIcon, MapPin, TrendingUp, Loader2, AlertCircle, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';

// Helper to get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Generate color based on name
const getColorFromName = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Avatar component with fallbacks
const AvatarDisplay = ({ profilePicture, name, username, className = 'w-12 h-12' }) => {
  const [imageError, setImageError] = useState(false);
  const [useInitials, setUseInitials] = useState(!profilePicture);

  if (profilePicture && !imageError && !useInitials) {
    return (
      <img
        src={profilePicture}
        alt={name}
        className={`${className} rounded-full object-cover border-2 border-gray-200`}
        onError={() => setImageError(true)}
      />
    );
  }

  if (!useInitials) {
    return (
      <img
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
        alt={name}
        className={`${className} rounded-full object-cover border-2 border-gray-200`}
        onError={() => setUseInitials(true)}
      />
    );
  }

  // Fallback: Show initials or user icon
  const initials = getInitials(name);
  if (initials && initials !== '?') {
    return (
      <div className={`${className} rounded-full ${getColorFromName(name)} flex items-center justify-center text-white font-bold text-sm border-2 border-gray-200`}>
        {initials}
      </div>
    );
  }

  // Final fallback: User icon
  return (
    <div className={`${className} rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200`}>
      <User className="w-6 h-6 text-gray-600" />
    </div>
  );
};

export function Community({ onBack }) {
  const [user, setUser] = useState(null);
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
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [followingLoading, setFollowingLoading] = useState({});
  const [commentPostId, setCommentPostId] = useState(null);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Fetch community data
  useEffect(() => {
    fetchUserProfile();
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

  const handleFollow = async (userId) => {
    try {
      setFollowingLoading(prev => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/community/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update suggested users
        setSuggestedUsers(suggestedUsers.map(user => 
          user.id === userId 
            ? { ...user, following: true }
            : user
        ));
      } else {
        setError(data.message || 'Error following user');
      }
    } catch (err) {
      console.error('Error following user:', err);
      setError(err.message);
    } finally {
      setFollowingLoading(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      setFollowingLoading(prev => ({ ...prev, [userId]: true }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/community/users/${userId}/follow`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update suggested users
        setSuggestedUsers(suggestedUsers.map(user => 
          user.id === userId 
            ? { ...user, following: false }
            : user
        ));
      } else {
        setError(data.message || 'Error unfollowing user');
      }
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError(err.message);
    } finally {
      setFollowingLoading(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  // Fetch full post with comments array
  const fetchPostWithComments = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/full`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        return data.post;
      }
    } catch (err) {
      console.error('Error fetching post with comments:', err);
    }
    return null;
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentPostId) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/community/posts/${commentPostId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment
        })
      });

      const data = await response.json();
      if (data.success) {
        // Ensure comments array exists and is an array
        const commentsArray = Array.isArray(selectedPostForComments?.comments) 
          ? selectedPostForComments.comments 
          : [];
        
        // Update the selected post with new comment
        const updatedPost = {
          ...selectedPostForComments,
          comments: [data.comment, ...commentsArray]
        };
        
        // Update posts list
        setPosts(posts.map(post => 
          post._id === commentPostId 
            ? { ...post, comments: updatedPost.comments.length }
            : post
        ));
        
        setSelectedPostForComments(updatedPost);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.message);
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
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`; }}
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`}
                  alt={user?.fullName}
                  className="w-12 h-12 rounded-full border-2 border-gray-200"
                />
              )}
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
                  <AvatarDisplay
                    profilePicture={post.author.profilePicture}
                    name={post.author.name}
                    username={post.author.username}
                    className="w-12 h-12"
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
                  <button 
                    onClick={async () => {
                      // Fetch full post with comments array
                      const fullPost = await fetchPostWithComments(post._id);
                      if (fullPost) {
                        setSelectedPostForComments(fullPost);
                      } else {
                        // Fallback: use current post but ensure comments is an array
                        setSelectedPostForComments({ ...post, comments: Array.isArray(post.comments) ? post.comments : [] });
                      }
                      setCommentPostId(post._id);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{typeof post.comments === 'number' ? post.comments : (post.comments?.length || 0)}</span>
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
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full" 
                      onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}` }}
                    />
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.trips} trips • {user.joined}</div>
                    </div>
                  </div>
                  {user.following ? (
                    <button 
                      onClick={() => handleUnfollow(user.id)}
                      disabled={followingLoading[user.id]}
                      className="px-4 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm transition-colors disabled:opacity-50"
                    >
                      {followingLoading[user.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Following'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleFollow(user.id)}
                      disabled={followingLoading[user.id]}
                      className="px-4 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors disabled:opacity-50"
                    >
                      {followingLoading[user.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {selectedPostForComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button
                onClick={() => {
                  setSelectedPostForComments(null);
                  setCommentPostId(null);
                  setNewComment('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Comments List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Array.isArray(selectedPostForComments.comments) && selectedPostForComments.comments.length > 0 ? (
                  selectedPostForComments.comments.map((comment, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AvatarDisplay
                          profilePicture={comment.author?.profilePicture}
                          name={comment.author?.name || 'User'}
                          username={comment.author?.username}
                          className="w-6 h-6"
                        />
                        <span className="text-sm font-medium">{comment.author?.name || 'User'}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 text-sm py-4">No comments yet. Be the first!</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}