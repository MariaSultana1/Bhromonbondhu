import { ArrowLeft, Star, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

/**
 * MINIMAL TRULY DYNAMIC AllReviews Component
 * 
 * This component ONLY fetches from GET /api/reviews endpoint
 * Everything is dynamic from your database
 * 
 * Props:
 * - onBack: function to call when user clicks back
 * - token: JWT token (from props or localStorage)
 * - apiUrl: API base URL (default: http://localhost:5000)
 */
export function AllReviews({ onBack, token = null, apiUrl = 'http://localhost:5000' }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState('all');

  // Get auth token
  const authToken = token || localStorage.getItem('token');

  /**
   * FETCH REVIEWS FROM API
   * This is the ONLY API call made by this component
   */
  const fetchReviews = useCallback(async () => {
    if (!authToken) {
      setError('No authentication token. Please login first.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching reviews from:', `${apiUrl}/api/reviews`);

      const response = await fetch(`${apiUrl}/api/reviews`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response Status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Token may have expired.');
        }
        if (response.status === 404) {
          throw new Error('Reviews endpoint not found. Check API server.');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ Reviews received from API:', data.count || data.reviews?.length, 'reviews');
      console.log('📋 Sample review:', data.reviews?.[0]);

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }

      // ALL data comes from API response - NO processing, NO assumptions
      setReviews(data.reviews || []);
      setError(null);

    } catch (err) {
      console.error('❌ Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [authToken, apiUrl]);

  /**
   * LOAD REVIEWS ON COMPONENT MOUNT
   */
  useEffect(() => {
    console.log('🚀 AllReviews component mounted');
    console.log('🔑 Auth token present:', !!authToken);
    console.log('🌐 API URL:', apiUrl);
    
    if (authToken) {
      fetchReviews();
    } else {
      setError('No authentication token found. Please login first.');
      setLoading(false);
    }
  }, [authToken, fetchReviews, apiUrl]);

  // Filter reviews based on selected rating
  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filterRating));

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading reviews from database...</p>
          <p className="text-gray-400 text-sm mt-2">API: {apiUrl}/api/reviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">All Reviews</h2>
            <p className="text-yellow-100">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''} from guests
            </p>
          </div>
          <button
            onClick={() => fetchReviews()}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Reviews</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => fetchReviews()}
              className="text-red-600 hover:text-red-900 text-sm font-medium mt-2 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* STATS SECTION */}
      {totalReviews > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-gray-600">Average Rating</span>
            </div>
            <div className="text-3xl font-bold">{averageRating}</div>
            <p className="text-xs text-gray-500 mt-1">Based on {totalReviews} reviews</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-600 mb-3">Rating Distribution</div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs font-medium w-6">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${totalReviews > 0 ? (ratingCounts[rating] / totalReviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8 text-right">{ratingCounts[rating]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-600 mb-3">Review Stats</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">5-Star Reviews</span>
                <span className="font-bold text-green-600">{ratingCounts[5]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">4-Star Reviews</span>
                <span className="font-bold text-blue-600">{ratingCounts[4]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Below 4-Star</span>
                <span className="font-bold text-orange-600">{ratingCounts[3] + ratingCounts[2] + ratingCounts[1]}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER BUTTONS */}
      {reviews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {['all', 5, 4, 3, 2, 1].map((rating) => {
            const count = rating === 'all' 
              ? reviews.length 
              : reviews.filter(r => r.rating === rating).length;

            return (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterRating === rating || (typeof filterRating === 'string' && filterRating === String(rating))
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {rating === 'all' ? 'All Reviews' : `${rating}★`} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* NO REVIEWS */}
      {filteredReviews.length === 0 && !error && (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Reviews Found</h3>
          <p className="text-gray-500">
            {reviews.length === 0 
              ? "You don't have any reviews yet" 
              : `No ${filterRating}-star reviews found`}
          </p>
        </div>
      )}

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all p-6"
          >
            {/* REVIEW HEADER */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4 flex-1">
                {review.avatar && (
                  <img
                    src={review.avatar}
                    alt={review.travelerName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                )}
                {!review.avatar && (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xl font-bold">
                    {review.travelerName?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">
                    {review.travelerName || 'Anonymous'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (review.rating || 0)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300 fill-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Date unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* REVIEW CONTENT */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.comment || review.text || 'No comment provided'}
              </p>
            </div>

            {/* REVIEW METADATA */}
            {(review.bookingId || review.bookingDate) && (
              <div className="text-xs text-gray-500 space-y-1">
                {review.bookingId && (
                  <div>Booking ID: {review.bookingId}</div>
                )}
                {review.bookingDate && (
                  <div>Booking Date: {new Date(review.bookingDate).toLocaleDateString()}</div>
                )}
              </div>
            )}

            {/* RAW DATA (for debugging) */}
            <details className="mt-4 pt-4 border-t border-gray-200">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Raw Data (Debug)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-48 text-gray-700">
                {JSON.stringify(review, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>

      {/* DEBUG INFO */}
      <div className="bg-gray-200 rounded-2xl p-6 text-sm text-gray-700">
        <h4 className="font-bold mb-2">Debug Information</h4>
        <div className="space-y-1 font-mono text-xs">
          <div>API URL: {apiUrl}</div>
          <div>Endpoint: GET /api/reviews</div>
          <div>Auth Token: {authToken ? '✅ Present' : '❌ Missing'}</div>
          <div>Total Reviews: {reviews.length}</div>
          <div>Filtered Reviews: {filteredReviews.length}</div>
          <div>Filter Rating: {filterRating}</div>
          <div>Component Status: {loading ? 'Loading' : error ? 'Error' : 'Ready'}</div>
        </div>
      </div>
    </div>
  );
}