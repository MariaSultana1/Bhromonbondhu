import { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader, AlertCircle, RefreshCw, Search } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getAuthToken = () => localStorage.getItem('token');

const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

function StarRating({ rating, size = 'sm' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sz} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      // ✅ FIX: Use the correct protected endpoint for the authenticated host
      const data = await apiCall('/hosts/reviews');
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews
    .filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.reviewer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating =
        filterRating === 'all' || r.rating === parseInt(filterRating);
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading reviews...</span>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Error loading reviews</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchReviews}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );

  const avgRating = stats?.averageRating || (reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0);
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">My Reviews</h2>
          <p className="text-gray-600">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} from guests
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-800">{avgRating.toFixed(1)}</div>
                <StarRating rating={Math.round(avgRating)} size="md" />
                <p className="text-sm text-gray-500 mt-1">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratingCounts.map(({ rating, count }) => (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-4">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Reviews', value: reviews.length },
                { label: 'Avg Rating', value: avgRating.toFixed(1) + ' / 5' },
                { label: '5 Star Reviews', value: ratingCounts[0].count },
                { label: 'Response Rate', value: stats?.responseRate ? `${stats.responseRate}%` : 'N/A' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-gray-800">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl p-16 shadow-sm border border-gray-100 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filters'}
          </h3>
          <p className="text-sm text-gray-500">
            {reviews.length === 0
              ? 'Reviews from guests will appear here once they complete their stay.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.reviewer?.avatar ? (
                    <img
                      src={review.reviewer.avatar}
                      alt={review.reviewer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                      {review.reviewer?.name?.[0]?.toUpperCase() || 'G'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {review.reviewer?.name || 'Guest'}
                      </p>
                      {review.listing?.title && (
                        <p className="text-sm text-blue-600 mt-0.5">{review.listing.title}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-500">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {review.comment && (
                    <p className="mt-3 text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                  )}

                  {/* Sub-ratings */}
                  {review.subRatings && Object.keys(review.subRatings).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {Object.entries(review.subRatings).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-1 text-xs text-gray-600">
                          <span className="capitalize">{key}:</span>
                          <StarRating rating={val} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Host response */}
                  {review.hostResponse && (
                    <div className="mt-4 pl-4 border-l-4 border-blue-200 bg-blue-50 rounded-r-lg p-3">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Your Response</p>
                      <p className="text-sm text-gray-700">{review.hostResponse}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllReviews;