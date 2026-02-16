import { ArrowLeft, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const allReviews = [
  {
    id: 1,
    traveler: 'Mehedi Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehedi',
    rating: 5,
    comment: 'Excellent host! Made our trip unforgettable with local insights. The food was amazing and the hospitality was top-notch. Highly recommended for anyone visiting Cox\'s Bazar!',
    date: '2 days ago',
    bookingDate: 'Nov 15-18, 2024',
    helpful: 12,
    response: null
  },
  {
    id: 2,
    traveler: 'Aisha Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha',
    rating: 5,
    comment: 'Very welcoming and helpful. Highly recommended! The local guide service was exceptional and we learned so much about the area.',
    date: '1 week ago',
    bookingDate: 'Nov 8-10, 2024',
    helpful: 8,
    response: 'Thank you so much for your kind words! It was a pleasure hosting you.'
  },
  {
    id: 3,
    traveler: 'Rafiq Ahmed',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
    rating: 4,
    comment: 'Great experience overall. The transportation service was very convenient and the host was very accommodating with our schedule.',
    date: '2 weeks ago',
    bookingDate: 'Oct 25-27, 2024',
    helpful: 5,
    response: null
  },
  {
    id: 4,
    traveler: 'Nusrat Jahan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat',
    rating: 5,
    comment: 'Perfect host! Everything was well organized and the meals were delicious. Would definitely book again!',
    date: '3 weeks ago',
    bookingDate: 'Oct 15-18, 2024',
    helpful: 15,
    response: 'Thank you! Looking forward to hosting you again soon!'
  },
  {
    id: 5,
    traveler: 'Karim Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim',
    rating: 5,
    comment: 'Amazing local knowledge and great recommendations. Made our trip very special.',
    date: '1 month ago',
    bookingDate: 'Sep 20-23, 2024',
    helpful: 10,
    response: null
  },
  {
    id: 6,
    traveler: 'Fatima Khan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
    rating: 4,
    comment: 'Good service and friendly host. The beach tour was fantastic!',
    date: '1 month ago',
    bookingDate: 'Sep 10-12, 2024',
    helpful: 6,
    response: 'Thanks for the great review! Glad you enjoyed the beach tour.'
  }
];

export function AllReviews({ onBack }) {
  const [reviews, setReviews] = useState(allReviews);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const handleReply = (reviewId) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, response: replyText }
        : review
    ));
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
     
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-3xl mb-2">All Reviews</h2>
        <p className="text-yellow-100">What guests are saying about you</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-2 space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={review.avatar}
                  alt={review.traveler}
                  className="w-14 h-14 rounded-full border-2 border-yellow-100"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg">{review.traveler}</h4>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">• {review.bookingDate}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
                  
                  {review.response && (
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                      <div className="text-sm text-blue-900 mb-1">Your Response:</div>
                      <p className="text-sm text-gray-700">{review.response}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-all">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    {!review.response && (
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Reply</span>
                      </button>
                    )}
                  </div>

                  {replyingTo === review.id && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your response..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(review.id)}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                        >
                          Post Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-6 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

       
        <div className="space-y-6">
         
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">Overall Rating</h3>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">{reviews.length} reviews</div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${(ratingDistribution[rating] / reviews.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-8">{ratingDistribution[rating]}</div>
                </div>
              ))}
            </div>
          </div>

          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">Response Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm">Response Rate</span>
                <span className="text-green-600">
                  {Math.round((reviews.filter(r => r.response).length / reviews.length) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm">Responded To</span>
                <span className="text-blue-600">{reviews.filter(r => r.response).length}/{reviews.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-purple-600">1.5 days</span>
              </div>
            </div>
          </div>

         
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-100 rounded-2xl p-6">
            <h4 className="text-yellow-900 mb-3">💡 Review Tips</h4>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Respond to all reviews within 48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Thank guests for positive feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Address concerns professionally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Maintain a 4.5+ rating for visibility</span>
              </li>
            </ul>
          </div>

         
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="mb-4">Common Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {['Excellent', 'Helpful', 'Recommended', 'Amazing', 'Friendly', 'Professional', 'Knowledgeable'].map((keyword, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}