import { useState } from 'react';
import { Star, MessageSquare, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

export function TripCompletion({ tripId, tripData, onCompleted, onClose }) {
  const [step, setStep] = useState('confirmation'); // confirmation, review, success
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(prev => [...prev, event.target.result]);
        setPhotos(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteTrip = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/trips/${tripId}/complete`,
        {
          rating: rating > 0 ? rating : null,
          review: review.trim() || null,
          photos: photos
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStep('success');
        
        // Call the callback if provided
        if (onCompleted) {
          setTimeout(() => {
            onCompleted(response.data);
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error completing trip:', err);
      setError(err.response?.data?.message || 'Failed to complete trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Trip Completed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for completing your journey. Your trip has been recorded and stats updated.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">📍 {tripData?.destination || 'Your Destination'}</p>
            <p className="text-lg font-semibold text-blue-600">Status: Completed</p>
          </div>
          <button
            onClick={onClose}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirmation') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Complete Trip?</h2>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">📍 Destination</p>
            <p className="text-lg font-semibold text-blue-600">{tripData?.destination || 'Unknown'}</p>
            <p className="text-sm text-gray-600 mt-2">📅 Date: {tripData?.date || 'N/A'}</p>
          </div>

          <p className="text-gray-600 mb-6">
            Mark this trip as completed? You can optionally add a review and photos.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-red-600 inline mr-2" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep('review')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review step
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
        <h2 className="text-2xl font-bold mb-4">Share Your Experience</h2>
        
        {/* Star Rating */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-3">Rate Your Trip</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {rating === 1 && 'Poor Experience'}
              {rating === 2 && 'Fair Experience'}
              {rating === 3 && 'Good Experience'}
              {rating === 4 && 'Great Experience'}
              {rating === 5 && 'Excellent Experience'}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Write a Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience, highlights, recommendations..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="4"
          />
          <p className="text-sm text-gray-600 mt-1">{review.length}/500 characters</p>
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            <Upload className="w-4 h-4 inline mr-2" />
            Upload Photos (Optional)
          </label>
          
          {/* Photo Preview */}
          {photoPreview.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photoPreview.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="text-sm text-gray-600 mt-1">{photoPreview.length} photos uploaded</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-600 inline mr-2" />
            <span className="text-red-600 text-sm">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setStep('confirmation')}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleCompleteTrip}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Complete Trip
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
